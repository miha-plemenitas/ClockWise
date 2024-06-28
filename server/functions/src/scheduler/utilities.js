const { schedule } = require("firebase-functions/v1/pubsub");
const { getWeekNumber } = require("./preparer");
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");

let globalTimeSlots;
let globalLArooms;
let globalRUrooms;
let globalOtherRooms;
const globalSchedule = [];


/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 *
 * This function randomizes the order of the elements in the provided array.
 *
 * @param {Array} array - The array to be shuffled.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


/**
 * Converts a Unix timestamp to a Date object representing the date (year, month, and day) only.
 *
 * This function takes a Unix timestamp (in seconds) and converts it to a Date object. The time
 * portion of the Date object is set to midnight (00:00:00) of the corresponding date.
 *
 * @param {number} timestamp - The Unix timestamp in seconds.
 * @returns {Date} A Date object representing the year, month, and day of the provided timestamp.
 */
function getDateFromTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};


/**
 * Generates an array of dates within a specified range, excluding weekends and specified free days.
 *
 * This function creates an array of Date objects representing all the dates between the startDate and endDate,
 * excluding weekends (Saturdays and Sundays) and any dates specified in the freeDays array.
 *
 * @param {Date} startDate - The start date of the range.
 * @param {Date} endDate - The end date of the range.
 * @param {Array<string>} freeDays - An array of strings representing dates (in 'YYYY-MM-DD' format) to be excluded.
 * @returns {Array<Date>} An array of Date objects representing the valid dates within the specified range.
 */
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
 * Generates time slots for a faculty based on lecture dates and days off.
 *
 * This function generates an array of time slots for each valid date within the range of lecture dates.
 * It excludes weekends, includes special handling for specific weekdays, and filters out days off.
 *
 * @param {string} facultyId - The ID of the faculty.
 * @param {Array<Object>} lectures - An array of lecture objects, each containing a `startTime` property with a Firestore timestamp.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of time slot objects.
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


/**
 * Splits rooms into categories and sorts them by size.
 *
 * This function splits a list of rooms into three categories: LA rooms, RU rooms, and other rooms.
 * It then sorts each category by room size in ascending order.
 *
 * @param {Array<Object>} rooms - The array of room objects to be split and sorted. Each room object must have a `roomName` and `size` property.
 *
 * @returns {Object} An object containing three arrays: `LArooms`, `RUrooms`, and `otherRooms`, each sorted by room size.
 */
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


/**
 * Gets the date string for the same day of the next week.
 *
 * This function takes a date string, calculates the date for the same day of the next week,
 * and returns it in 'YYYY-MM-DD' format. If the resulting date exceeds a cutoff date, it returns undefined.
 *
 * @param {string} dateString - The input date string in 'YYYY-MM-DD' format.
 * @returns {string|undefined} The date string for the same day of the next week in 'YYYY-MM-DD' format,
 *                             or undefined if the resulting date exceeds the cutoff date.
 */
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


/**
 * Checks if a given date exists in the global time slots.
 *
 * This function checks if the provided date exists in the `globalTimeSlots` array,
 * indicating that the date is not a free day.
 *
 * @param {string} date - The date string in 'YYYY-MM-DD' format to check.
 * @returns {boolean} `true` if the date exists in the `globalTimeSlots` array, otherwise `false`.
 */
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


/**
 * Checks if any dates in the week containing the given date exist in the global time slots.
 *
 * This function checks if the provided date or any weekday in the same week (Monday to Friday)
 * exists in the `globalTimeSlots` array. If no dates are found, it returns an empty array.
 * Otherwise, it returns an array of present dates within the week.
 *
 * @param {string} date - The date string in 'YYYY-MM-DD' format to check.
 * @returns {Array<string>} An array of date strings in 'YYYY-MM-DD' format that are present in the `globalTimeSlots` array.
 *                          If no dates are found, it returns an empty array.
 */
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


/**
 * Schedules the next lecture based on the previous lecture's nextId.
 *
 * This function attempts to schedule the next lecture in the series. It first checks if the previous lecture's nextId is valid.
 * If valid, it finds the next lecture, calculates the date for the same day of the next week, and checks if this date is available in the time slots.
 * Depending on the availability, it either schedules the lecture directly, tries other available slots within the same week,
 * or starts scheduling from the beginning if the next week is beyond the cutoff date.
 *
 * @param {Object} previousLecture - The previous lecture object.
 * @param {Array<Object>} lectures - An array of lecture objects.
 * @param {number} failSafe - A counter to prevent infinite loops in scheduling.
 */
function scheduleNextLecture(previousLecture, lectures, failSafe) {
  if (previousLecture.nextId == -1) {
    return;
  }

  const lecture = lectures.find(element => element.id == previousLecture.nextId);
  const nextWeek = getNextWeekDate(previousLecture.day);

  if (checkTimeSlot(nextWeek)) {
    scheduleLectureWithPreferedSlot(lecture, lectures, failSafe, nextWeek, previousLecture.start);
  } else if (!nextWeek) {
    scheduleLecture(lecture, lectures, failSafe + 1);
  } else {
    const availableSlots = checkTimeSlotForWeek(nextWeek);

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


/**
 * Schedules a lecture by finding a valid term and updating the global schedule.
 *
 * This function attempts to schedule a lecture by finding a valid term based on the lecture type and room availability.
 * It handles prerequisites by recursively scheduling previous lectures if necessary.
 * If a valid term is found, the lecture is marked as scheduled and the next lecture in the sequence is scheduled.
 * A failSafe mechanism prevents infinite loops in scheduling.
 *
 * @param {Object} lecture - The lecture object to be scheduled.
 * @param {Array<Object>} lectures - An array of lecture objects.
 * @param {number} failSafe - A counter to prevent infinite loops in scheduling.
 * @returns {boolean} Returns true if the lecture was successfully scheduled, otherwise false.
 */
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


/**
 * Initializes the schedule by arranging lectures, giving priority to unschedulable lectures.
 *
 * This function processes lectures by first handling unschedulable lectures, assigning them their original times,
 * and then shuffling and sorting the remaining lectures before attempting to schedule them.
 *
 * @param {Array<Object>} lectures - An array of lecture objects to be scheduled. Each lecture should have properties such as `schedulable`, `prevId`, etc.
 * @returns {Array<Object>} The array of scheduled lectures.
 */
function initializeSchedule(lectures) {
  console.log(`LA: ${globalLArooms.length}, RU ${globalRUrooms.length}, other ${globalOtherRooms.length}`)

  const unschedulables = lectures.filter(lecture => lecture.schedulable === -1);

  let filteredAndSortedLectures = lectures.filter(lecture => lecture.schedulable !== -1);
  shuffleArray(filteredAndSortedLectures);
  filteredAndSortedLectures = filteredAndSortedLectures.sort((a, b) => {
    if (a.prevId !== -1 && b.prevId === -1) {
      return -1;
    }
    if (a.prevId === -1 && b.prevId !== -1) {
      return 1;
    }
    return 0;
  });

  for (const unschedulable of unschedulables) {
    setUnschedulables(unschedulable);
  }

  console.log("Done with unshedulables");

  for (const lecture of filteredAndSortedLectures) {
    scheduleLecture(lecture, filteredAndSortedLectures, 0);
  }

  console.log(`Done with scheduling, number of scheduled lectures: ${globalSchedule.length}`);
  return globalSchedule;
}


/**
 * Sets unschedulable lectures by assigning them their original time slots.
 *
 * This function assigns the original time slots to unschedulable lectures and adds them to the global schedule.
 * It checks the global time slots to find the corresponding date and time for the lecture.
 *
 * @param {Object} lecture - The lecture object to be set as unschedulable.
 * @param {Object} lecture.startTime - The Firestore timestamp representing the start time of the lecture.
 * @param {number} lecture.duration - The duration of the lecture in hours.
 * @param {Array} lecture.rooms - The rooms assigned to the lecture.
 * @param {Array} lecture.room_ids - The IDs of the rooms assigned to the lecture.
 */
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


/**
 * Finds a valid term for a lecture that does not have any conflicts.
 *
 * This function iterates over rooms and time slots to find a valid term (room and time slot) for the lecture
 * that does not have any conflicts. It ensures the room size is adequate, and the lecture duration fits within the time slot.
 *
 * @param {Object} lecture - The lecture object to be scheduled.
 * @param {Array<Object>} rooms - An array of room objects to consider for scheduling the lecture.
 * @returns {Object|null} A lecture object with the assigned room and time slot if a valid term is found, otherwise `null`.
 */
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


/**
 * Schedules a lecture in a preferred time slot if possible.
 *
 * This function attempts to schedule a lecture in a preferred time slot. It prioritizes different room types
 * based on the lecture's execution type. If a valid term is found, it schedules the lecture, marks it as schedulable,
 * and proceeds to schedule the next lecture. If no valid term is found, it logs an error.
 *
 * @param {Object} lecture - The lecture object to be scheduled.
 * @param {Array<Object>} lectures - An array of all lecture objects.
 * @param {number} failSafe - A counter to prevent infinite loops in scheduling.
 * @param {string} day - The preferred day for scheduling the lecture.
 * @param {number} start - The preferred start time for scheduling the lecture.
 * @returns {boolean} `true` if the lecture was successfully scheduled, otherwise `false`.
 */
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


/**
 * Finds a valid term for a lecture with a preferred start time and day.
 *
 * This function attempts to find a valid term for the lecture within the provided rooms, prioritizing
 * the specified day and start time. It ensures the room size is adequate and the lecture duration fits within the time slot.
 *
 * @param {Object} lecture - The lecture object to be scheduled.
 * @param {Array<Object>} rooms - An array of room objects to consider for scheduling the lecture.
 * @param {string} day - The preferred day for scheduling the lecture.
 * @param {number} start - The preferred start time for scheduling the lecture.
 * @returns {Object|null} A lecture object with the assigned room and time slot if a valid term is found, otherwise `null`.
 */
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


/**
 * Creates a new lecture object with the specified room, time slot, and duration.
 *
 * This function creates and returns a new lecture object by combining the provided lecture data
 * with the specified room, time slot, start time, and end time.
 *
 * @param {Object} lecture - The original lecture object.
 * @param {Object} room - The room object to assign to the lecture.
 * @param {Object} timeSlot - The time slot object containing the date and available hours.
 * @param {number} hour - The start time for the lecture.
 * @param {number} timeSlotEnd - The end time for the lecture.
 * @returns {Object} A new lecture object with the specified room, time slot, start time, and end time.
 */
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
