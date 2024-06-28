const { schedule } = require("firebase-functions/v1/pubsub");
const { getWeekNumber } = require("./preparer");
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");

let globalTimeSlots;
let globalLArooms;
let globalRUrooms;
let globalOtherRooms;
const globalSchedule = [];


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


function getDateFromTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};


function getDatesInRange(startDate, endDate, freeDays) {
  const dateArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const formattedDate = currentDate.toISOString().split('T')[0];
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6 && !freeDays.includes(formattedDate)) {
      dateArray.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateArray;
}

/**
 * 
 * Na koncu generira nekaj takega: 
 *         {
            "date": "2024-06-13",
            "week": 24,
            "hasLecture": true,
            "hours": [
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21
            ]
        }, ...<
 * TODO get daysOff
 */
async function generateTimeSlots(facultyId, lectures) {
  const daysOff = await getAllFacultyCollectionItems(facultyId, "daysOff");

  const dates = lectures.map(lecture => getDateFromTimestamp(lecture.startTime._seconds));

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  const allDates = getDatesInRange(minDate, maxDate, []);

  const result = allDates.map(date => {
    const hasLecture = dates.some(lectureDate => lectureDate.getTime() === date.getTime());
    const week = getWeekNumber(date);

    let startTime = 7;
    if (date.getDay() === 3) {
      startTime = 10;
    }

    let hours = new Array();
    for (let index = startTime; index < 22; index++) {
      hours.push(index);
    }

    return {
      date: date.toISOString().split('T')[0],
      week: week,
      hasLecture: hasLecture,
      hours: hours
    };
  });

  const filteredResult = result.filter(slot => {
    const slotDate = new Date(slot.date);
    return !daysOff.some(dayOff => {
      const startDate = new Date(dayOff.startDate);
      const endDate = dayOff.endDate ? new Date(dayOff.endDate) : null;

      if (endDate) {
        return slotDate >= startDate && slotDate <= endDate;
      } else {
        return slotDate.getTime() === startDate.getTime();
      }
    });
  });

  globalTimeSlots = filteredResult;

  return filteredResult;
}


function splitAndSortRooms(rooms) {
  const LArooms = rooms.filter(room =>
    room.roomName.includes('(') && room.roomName.includes(')') && room.roomName.includes('LA')
  );

  const RUrooms = rooms.filter(room =>
    room.roomName.includes('(') && room.roomName.includes(')') && room.roomName.includes('RU')
  );

  const otherRooms = rooms.filter(room =>
    !(
      (room.roomName.includes('(') && room.roomName.includes(')') && room.roomName.includes('LA')) ||
      (room.roomName.includes('(') && room.roomName.includes(')') && room.roomName.includes('RU'))
    )
  );

  LArooms.sort((a, b) => a.size - b.size);
  RUrooms.sort((a, b) => a.size - b.size);
  otherRooms.sort((a, b) => a.size - b.size);

  globalLArooms = LArooms;
  globalRUrooms = RUrooms;
  globalOtherRooms = otherRooms;

  return {
    LArooms,
    RUrooms,
    otherRooms
  };
}


//gleda za nasljedni tedn (za nextId), ce je po koncanem semetru vrne null, pa se pol od zacetka isce termin
function getNextWeekDate(dateString) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 7);
  const nextWeekDateString = date.toISOString().split('T')[0];

  const cutoffDate = new Date("2024-06-14");
  if (date > cutoffDate) {
    return;
  }

  return nextWeekDateString;
}


// Ce je date sploh not (ce ni prost dan)
function checkTimeSlot(date) {
  if (!date)
    return false;

  for (const timeSlot of globalTimeSlots) {
    if (timeSlot.date === date) {
      return true;
    }
  }
  return false;
}


//ce date ni not, cekiram ce je cel tedn fry al ne
function checkTimeSlotForWeek(date) {
  const inputDate = new Date(date);
  const startOfWeek = new Date(inputDate);
  startOfWeek.setDate(inputDate.getDate() - inputDate.getDay() + 1); //Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday

  const weekdaysInWeek = [];

  for (let day = new Date(startOfWeek); day <= endOfWeek; day.setDate(day.getDate() + 1)) {
    weekdaysInWeek.push(day.toISOString().split('T')[0]);
  }

  const presentDays = weekdaysInWeek.filter(day =>
    globalTimeSlots.some(timeSlot => timeSlot.date === day)
  );

  return presentDays.length === 0 ? [] : presentDays;
}


function scheduleNextLecture(previousLecture, lectures, failSafe) {
  if (previousLecture.nextId == -1) {
    return;
  }

  const lecture = lectures.find(element => element.id == previousLecture.nextId); //Dobiš nextId
  const nextWeek = getNextWeekDate(previousLecture.day); //datum za +1 teden, ce je preko, returne false

  //console.log(`Got to the next id, with element ${lecture.id} and previous id ${previousLecture.id}`);

  if (checkTimeSlot(nextWeek)) { //Timeslot je v timeSlots pa nextWeek ni vecji od konca
    scheduleLectureWithPreferedSlot(lecture, lectures, failSafe, nextWeek, previousLecture.start);
  } else if (!nextWeek) { //next week je vecji od konca, in grem od zacetka
    scheduleLecture(lecture, lectures, failSafe + 1);
  } else {
    const availableSlots = checkTimeSlotForWeek(nextWeek); //pridobis vse slote v tem tednu

    for (const availableSlot of availableSlots) {
      if (scheduleLectureWithPreferedSlot(lecture, lectures, failSafe, availableSlot, previousLecture.start)) {
        break;
      }
    }

    if (lecture.schedulable == 0) {
      const copyPreviousLecture = previousLecture;
      copyPreviousLecture.day = nextWeek;
      scheduleNextLecture(copyPreviousLecture, lectures, failSafe);
    }
  }
}


function scheduleLecture(lecture, lectures, failSafe) {
  if (failSafe > 1) {
    console.error(`Triggered failSafe, could not schedule lecture: ${lecture.course}`); // failSafe za nextId
    return false;
  }

  if (lecture.schedulable == 0) { // ce je ze (z nextId)
    return;
  }

  if (lecture.prevId != -1) {
    const previousLecture = lectures.find(element => element.id == lecture.prevId);
    if (previousLecture.schedulable != 0) {
      scheduleLecture(previousLecture, lectures, failSafe);
    }
  }

  let validTerm;
  const LAtypes = ["10"];
  const RUtypes = ["35", "22"];

  if (LAtypes.includes(lecture.executionTypeId)) {    // samo razlika je namen lecturjev (racunlaniske, predavanja...)
    validTerm = findValidTerm(lecture, globalLArooms); // Pomembna funkcija
  } else if (RUtypes.includes(lecture.executionTypeId)) {
    validTerm = findValidTerm(lecture, globalRUrooms);
  } else {
    validTerm = findValidTerm(lecture, globalOtherRooms);
  }

  if (validTerm) {
    globalSchedule.push(validTerm);
    lecture.schedulable = 0;
    scheduleNextLecture(validTerm, lectures, failSafe); // Za nextId, pomembna funkcija

    return true;
  } else {
    console.error(`Could not schedule lecture: ${lecture.course}`);
    return false;
  }
}


// najprej zrihta te diplome, prakse, magistre, in jim da isti čas kot je v originalnem
function initializeSchedule(lectures) {
  console.log(`LA: ${globalLArooms.length}, RU ${globalRUrooms.length}, other ${globalOtherRooms.length}`)

  const unschedulables = lectures.filter(lecture => lecture.schedulable === -1);

  let filteredAndSortedLectures = lectures.filter(lecture => lecture.schedulable !== -1); //filtrira le tiste ki jim nastavim nov case
  shuffleArray(filteredAndSortedLectures);  // jih randomizira, nato pa se sortira, da so tisti z prevId nazacetku. 
  filteredAndSortedLectures = filteredAndSortedLectures.sort((a, b) => {
    if (a.prevId !== -1 && b.prevId === -1) {
      return -1;
    }
    if (a.prevId === -1 && b.prevId !== -1) {
      return 1;
    }
    return 0;
  });

  for (const unschedulable of unschedulables) { //najprej zrihtam diplome/prakse....
    setUnschedulables(unschedulable);
  }

  console.log("Done with unshedulables");

  for (const lecture of filteredAndSortedLectures) {
    scheduleLecture(lecture, filteredAndSortedLectures, 0); //HELL, lp
  }

  console.log(`Done with scheduling, number of scheduled lectures: ${globalSchedule.length}`);
  return globalSchedule;
}


function setUnschedulables(lecture) {
  const start = new Date(lecture.startTime._seconds * 1000);
  const splitDate = start.toISOString().split('T');
  const date = splitDate[0];
  const hour = start.getHours();
  const end = hour + lecture.duration;

  let scheduled;

  for (const timeSlot of globalTimeSlots) {
    if (timeSlot.date === date) {
      scheduled =  {
        ...lecture,
        rooms: lecture.rooms,
        room_ids: lecture.room_ids,
        day: timeSlot.date,
        start: hour,
        end: end,
      };
    }
  }

  if(schedule){
    globalSchedule.push(scheduled);
  }
}


// isce term, ki nima konfliktov, za vsako sobo/timeslot/uro
function findValidTerm(lecture, rooms) {
  for (const room of rooms) {
    if (lecture.size > room.size) continue;

    for (const timeSlot of globalTimeSlots) {
      for (const hour of timeSlot.hours) {
        const timeSlotEnd = hour + lecture.duration;

        if (timeSlotEnd > 21) continue;

        if (!hasConflicts(lecture, room, timeSlot, hour, timeSlotEnd)) {
          return createLectureObject(lecture, room, timeSlot, hour, timeSlotEnd);
        }
      }
    }
  }

  return null;
}


function scheduleLectureWithPreferedSlot(lecture, lectures, failSafe, day, start) {
  let validTerm;

  const LAtypes = ["10"];
  const RUtypes = ["35", "22"];

  if (LAtypes.includes(lecture.executionTypeId)) {    // samo razlika je namen lecturjev (racunlaniske, predavanja...)
    validTerm = findValidTermWithPrefrence(lecture, globalLArooms, day, start); // Pomembna funkcija
  } else if (RUtypes.includes(lecture.executionTypeId)) {
    validTerm = findValidTermWithPrefrence(lecture, globalRUrooms, day, start);
  } else {
    validTerm = findValidTermWithPrefrence(lecture, globalOtherRooms, day, start);
  }

  if (validTerm) {
    globalSchedule.push(validTerm);
    lecture.schedulable = 0;
    scheduleNextLecture(validTerm, lectures, failSafe); // Za nextId, pomembna funkcija

    return true;
  } else {
    console.error(`Could not schedule lecture: ${lecture.course}`);
    return false;
  }
}


function findValidTermWithPrefrence(lecture, rooms, day, start) {
  for (const room of rooms) {
    if (lecture.size > room.size) continue;

    let startIterating = false;
    for (const timeSlot of globalTimeSlots) {
      if (timeSlot.date === day) {
        startIterating = true;
        for (const hour of timeSlot.hours) {
          if (!startIterating || hour < start) continue;

          const timeSlotEnd = hour + lecture.duration;
          if (timeSlotEnd > 21) continue;

          if (!hasConflicts(lecture, room, timeSlot, hour, timeSlotEnd)) {
            return createLectureObject(lecture, room, timeSlot, hour, timeSlotEnd);
          }
        }
      } else if (startIterating) {
        for (const hour of timeSlot.hours) {
          const timeSlotEnd = hour + lecture.duration;
          if (timeSlotEnd > 21) continue;

          if (!hasConflicts(lecture, room, timeSlot, hour, timeSlotEnd)) {
            return createLectureObject(lecture, room, timeSlot, hour, timeSlotEnd);
          }
        }
      }
    }
  }
}


function createLectureObject(lecture, room, timeSlot, hour, timeSlotEnd) {
  return {
    ...lecture,
    rooms: [room],
    room_ids: [room.id],
    day: timeSlot.date,
    start: hour,
    end: timeSlotEnd,
  };
}


/**
 * Checks if a given lecture conflicts with the existing schedule based on room, tutor, or group.
 *
 * @param {Object} lecture - The lecture to be scheduled.
 * @param {Object} room - The room where the lecture is planned.
 * @param {Object} timeslot - The timeslot for the lecture.
 * @param {number} lectureStart - The start time of the lecture.
 * @param {number} lectureEnd - The end time of the lecture.
 * @param {Array} schedule - The current schedule of lectures.
 * @returns {boolean} - Returns true if there is a conflict; otherwise, false.
 * 
 *  * @example
 *
 * const lecture = {
 *   executionTypeId: '10',
 *   tutor_ids: [751],
 *   group_ids: [178],
 *   startTime: { _seconds: 1713272400 },
 *   duration: 3,
 *   ...
 * };
 *
 * const room = {
 *   roomId: 146,
 *   ...
 * };
 *
 * const timeslot = {
 *   date: '2024-02-26',
 *   ...
 * };
 *
 * const schedule = [
 *   {
 *     room_ids: [146],
 *     day: '2024-02-26',
 *     start: 7,
 *     end: 10,
 *     tutor_ids: [751],
 *     group_ids: [178],
 *     ...
 *   }
 * ];
 *
 * const lectureStart = 7;
 * const lectureEnd = 10;
 *
 * const conflict = hasConflicts(lecture, room, timesl
 * */
function hasConflicts(lecture, room, timeslot, lectureStart, lectureEnd) {
  // 2nd layer of hell, tu sam cekira ce ima conflikte, glej example pa chatGPT-ja, lp.
  return (
    globalSchedule.some(
      (scheduledLecture) =>
        scheduledLecture.room_ids[0] === room.roomId &&
        scheduledLecture.day === timeslot.date &&
        (
          (scheduledLecture.start < lectureEnd && scheduledLecture.start >= lectureStart) ||
          (scheduledLecture.end > lectureStart && scheduledLecture.end <= lectureEnd) ||
          (lectureStart >= scheduledLecture.start && lectureEnd <= scheduledLecture.end)
        )
    ) ||
    globalSchedule.some(
      (scheduledLecture) =>
        scheduledLecture.tutor_ids.some(tutorId => lecture.tutor_ids.includes(tutorId)) &&
        scheduledLecture.day === timeslot.date &&
        (
          (scheduledLecture.start < lectureEnd && scheduledLecture.start >= lectureStart) ||
          (scheduledLecture.end > lectureStart && scheduledLecture.end <= lectureEnd) ||
          (lectureStart >= scheduledLecture.start && lectureEnd <= scheduledLecture.end)
        )
    ) ||
    globalSchedule.some(
      (scheduledLecture) =>
        scheduledLecture.group_ids.some(groupId => lecture.group_ids.includes(groupId)) &&
        scheduledLecture.day === timeslot.date &&
        (
          (scheduledLecture.start < lectureEnd && scheduledLecture.start >= lectureStart) ||
          (scheduledLecture.end > lectureStart && scheduledLecture.end <= lectureEnd) ||
          (lectureStart >= scheduledLecture.start && lectureEnd <= scheduledLecture.end)
        )
    )
  );
}


module.exports = {
  generateTimeSlots,
  initializeSchedule,
  globalTimeSlots,
  splitAndSortRooms
}
