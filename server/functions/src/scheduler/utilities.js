const { database } = require("firebase-functions/v1/firestore");
const { getWeekNumber } = require("./preparer");

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
        }, ...
 * 
 */
async function generateTimeSlots(lectures) {
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

  return result;
}


//grupira po tutors, course, execution type.... dobesedno samo za nextId
function groupLectures(lectures) {
  const dataType = new Map();

  for (const lecture of lectures) {
    let data = `C${lecture.courseId} E${lecture.executionTypeId} S${lecture.size} T${lecture.tutor_ids.join(",")} G${lecture.group_ids.join(",")}`;

    let lectureInfo = dataType.get(data);
    if (!lectureInfo) {
      lectureInfo = [];
      dataType.set(data, lectureInfo);
    }

    const lastLecture = lectureInfo[lectureInfo.length - 1];
    const duration = lastLecture ? lastLecture.duration + lecture.duration : lecture.duration;

    lectureInfo.push({ id: lecture.id, weekNo: lecture.week, duration: duration });
  }

  const json = Object.fromEntries(dataType);
  return json;
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
function checkTimeSlot(date, timeSlots) {
  for (const timeSlot of timeSlots) {
    if (timeSlot.date === date) {
      return true;
    }
  }
  return false;
}


//ce date ni not, cekiram ce je cel tedn fry al ne
function checkTimeSlotForWeek(date, timeSlots) {
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
    timeSlots.some(timeSlot => timeSlot.date === day)
  );

  return presentDays.length === 0 ? [] : presentDays;
}


//TODO - nastavi fail save če ne najde ce gre od zacetka
function scheduleNextLecture(previousLecture, timeSlots, LArooms, RUrooms, otherRooms, schedule, lectures, day, failSafe) {
  if (!previousLecture.nextId == "-1") {
    const lecture = lectures.find(element => element.id == previousLecture.nextId);
    const nextWeek = getNextWeekDate(day); //if next week vecji kot 
    let scheduled = false;

    if (checkTimeSlot(date, timeSlots) && nextWeek) { //Timeslot je v timeSlots pa nextWeek ni vecji od konca
      scheduleLecture(lecture, timeSlots, LArooms, RUrooms, otherRooms, schedule, lectures, lecture, nextWeek); //TODO: novo funkcijo scheduleLectureWithPreferedSlot
    } else if (!nextWeek) { //next week je vecji od konca, in grem od zacetka
      scheduleLecture(lecture, timeSlots, LArooms, RUrooms, otherRooms, schedule, lectures, failSafe + 1);
    } else {
      const availableSlots = checkTimeSlotForWeek(nextWeek, timeSlots); //pridobis vse slote v tem tednu

      for (const availableSlot of availableSlots) {
        if (scheduleLecture(lecture, timeSlots, LArooms, RUrooms, otherRooms, schedule, lecture, availableSlot)) { //isto nova funkcija kot zgoraj
          scheduled = true;
          break;
        }
      }

      if (!scheduled) {//dobis naslendji tedn
        scheduleNextLecture(previousLecture, timeSlots, LArooms, RUrooms, otherRooms, schedule, lectures, nextWeek)
      }
    }
  }
}


function scheduleLecture(lecture, timeSlots, LArooms, RUrooms, otherRooms, schedule, lectures, failSafe) {
  if (failSafe > 0){
    console.error(`Triggered failSafe, could not schedule lecture: ${lecture.course}`); // failSafe za nextId
    return false;
  }

  let validTerm;
  if (lecture.schedulable == -1) {  //Diplome n shit
    validTerm = setUnschedulables(lecture, timeSlots); //pustim isti cas izvajanja
  } else if (lecture.schedulable == 0) { // ce je ze (z nextId)
    return;
  } else {
    const LAtypes = ["10", "22"];
    const RUtypes = ["35", "22"];

    if (LAtypes.includes(lecture.executionTypeId)) {    // samo razlika je namen lecturjev (racunlaniske, predavanja...)
      validTerm = findValidTerm(lecture, timeSlots, LArooms, schedule); // Pomembna funkcija
    } else if (RUtypes.includes(lecture.executionTypeId)) {
      validTerm = findValidTerm(lecture, timeSlots, RUrooms, schedule);
    } else {
      validTerm = findValidTerm(lecture, timeSlots, otherRooms, schedule);
    }
  }

  if (validTerm) {
    schedule.push(validTerm);
    scheduleNextLecture(lecture, timeSlots, LArooms, RUrooms, otherRooms, schedule, lectures, validTerm.day, failSafe); // Za nextId, pomembna funkcija

    return true;
  } else {
    console.error(`Could not schedule lecture: ${lecture.course}`);
    return false;
  }
}


// najprej zrihta te diplome, prakse, magistre, in jim da isti čas kot je v originalnem
function initializeSchedule(lectures, timeSlots, rooms) {
  lectures.sort((a, b) => a.schedulable - b.schedulable);

  const { LArooms, RUrooms, otherRooms } = splitAndSortRooms(rooms); //sortira sobe glede na namen

  const schedule = [];

  for (const lecture of lectures) {
    scheduleLecture(lecture, timeSlots, LArooms, RUrooms, otherRooms, schedule, lectures, 0); //HELL, lp
  }

  return schedule;
}


function setUnschedulables(lecture, timeSlots) {
  const start = new Date(lecture.startTime._seconds * 1000);
  const splitDate = start.toISOString().split('T');
  const date = splitDate[0];
  const hour = start.getHours();
  const end = hour + lecture.duration;

  for (const timeSlot of timeSlots) {
    if (timeSlot.date === date) {
      return {
        ...lecture,
        rooms: lecture.rooms,
        room_ids: lecture.room_ids,
        day: timeSlot.date,
        start: hour,
        end: end,
      };
    }
  }
}


// isce term, ki nima konfliktov, za vsako sobo/timeslot/uro
function findValidTerm(lecture, timeSlots, rooms, schedule) {
  for (const room of rooms) {
    if (lecture.size > room.size) continue;

    for (const timeSlot of timeSlots) {
      for (const hour of timeSlot.hours) {
        const timeSlotEnd = hour + lecture.duration;

        if (timeSlotEnd > 21) continue;

        if (!hasConflicts(lecture, room, timeSlot, hour, timeSlotEnd, schedule)) {
          return {
            ...lecture,
            rooms: [room],
            room_ids: [room.id],
            day: timeSlot.date,
            start: hour,
            end: timeSlotEnd,
          };
        }
      }
    }
  }

  return null;
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
function hasConflicts(lecture, room, timeslot, lectureStart, lectureEnd, schedule) {
  // 2nd layer of hell, tu sam cekira ce ima conflikte, glej example pa chatGPT-ja, lp.
  return (
    schedule.some(
      (scheduledLecture) =>
        scheduledLecture.room_ids[0] === room.roomId &&
        scheduledLecture.day === timeslot.date &&
        (
          (scheduledLecture.start < lectureEnd && scheduledLecture.start >= lectureStart) ||
          (scheduledLecture.end > lectureStart && scheduledLecture.end <= lectureEnd) ||
          (lectureStart >= scheduledLecture.start && lectureEnd <= scheduledLecture.end)
        )
    ) ||
    schedule.some(
      (scheduledLecture) =>
        scheduledLecture.tutor_ids.some(tutorId => lecture.tutor_ids.includes(tutorId)) &&
        scheduledLecture.day === timeslot.date &&
        (
          (scheduledLecture.start < lectureEnd && scheduledLecture.start >= lectureStart) ||
          (scheduledLecture.end > lectureStart && scheduledLecture.end <= lectureEnd) ||
          (lectureStart >= scheduledLecture.start && lectureEnd <= scheduledLecture.end)
        )
    ) ||
    schedule.some(
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
  groupLectures
}
