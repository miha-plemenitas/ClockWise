const { db } = require('../utils/firebaseAdmin');
const { generateTimeSlots, initializeSchedule, groupLectures } = require("./utilities");
const { evaluateSchedule } = require("./evaluator");
const { resetCollectionAndFetchSchedule, expandLectureData } = require("./preparer");
const { updateLectureDates, saveGeneratedSchedule } = require("./converter");


async function generateSchedule(facultyId, iterations) {
  const { original_lectures, rooms } = await resetCollectionAndFetchSchedule(facultyId);

  const typeMap = new Map();
  let numberOfMissingCourses = 0;
  let numberOfMissingRooms = 0;
  let numberOfWeekends = 0;
  const daysMap = new Map();

  for (const lecture of original_lectures) {
    if (!lecture.course || lecture.course === "") {
      numberOfMissingCourses++;
    }

    if (!lecture.hasRooms) {
      numberOfMissingRooms++;
    }

    const lectureType = lecture.executionType + " " + lecture.executionTypeId;
    if (typeMap.has(lectureType)) {
      typeMap.set(lectureType, typeMap.get(lectureType) + 1);
    } else {
      typeMap.set(lectureType, 1);
    }
  }

  //console.log(typeMap);
  //console.log(`Number of lecture with missing courses: ${numberOfMissingCourses}, number of missing rooms: ${numberOfMissingRooms}`);
  //console.log(numberOfWeekends);
  //console.log(daysMap);
  //console.log(original_lectures.length);

  const timeSlots = await generateTimeSlots(original_lectures);
  const groupedLectures = groupLectures(original_lectures);
  expandLectureData(groupedLectures, original_lectures);
  console.log(timeSlots.length);

  return groupedLectures;
}


async function generateSchedule2(facultyId, iterations) {
  const { original_lectures, rooms } = await resetCollectionAndFetchTwoWeekSchedule(facultyId);

  const timeSlots = generateTimeSlots();

  let schedule = initializeSchedule(original_lectures, timeSlots, rooms);
  let score = evaluateSchedule(schedule);

  console.log(score);

  schedule = updateLectureDates(schedule);

  await saveGeneratedSchedule(facultyId, schedule);

  return schedule;
}


module.exports = {
  generateSchedule
}