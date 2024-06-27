const { db } = require('../utils/firebaseAdmin');
const {
  generateTimeSlots,
  initializeSchedule,
  splitAndSortRooms
} = require("./utilities");
const { evaluateSchedule } = require("./evaluator");
const { resetCollectionAndFetchSchedule, expandLectureData } = require("./preparer");
const { updateLectureDates, saveGeneratedSchedule } = require("./converter");
const fs = require('fs');
const path = require('path');


//Da nea brezzveze fetcham podatkov cel čas, če obstaja json file vzamem iz jsona, drugače fetch
async function getLecturesAndRooms(facultyId){ 
  const lecturesPath = path.resolve(__dirname, '../data/lectures.json');
  const roomsPath = path.resolve(__dirname, '../data/rooms.json');

  let original_lectures, rooms;

  if (fs.existsSync(lecturesPath) && fs.existsSync(roomsPath)) {
    original_lectures = JSON.parse(fs.readFileSync(lecturesPath, 'utf8'));
    rooms = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));
  } else {
    const schedule = await resetCollectionAndFetchSchedule(facultyId);  //TO GLEJ drugo ni pomembno
    original_lectures = schedule.original_lectures;
    rooms = schedule.rooms;

    fs.writeFileSync(lecturesPath, JSON.stringify(original_lectures, null, 2));
    fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2));
  }

  splitAndSortRooms(rooms);

  return original_lectures;
}



async function generateSchedule(facultyId) {
  const original_lectures = await getLecturesAndRooms(facultyId);

  await generateTimeSlots(original_lectures); //array timeSlotov, vsak ma day:"2024-06-14", pa array hours (od 7-21 oz srede 10-21)
  expandLectureData(original_lectures); //groupira lecturje glede na course, groups, tutors... s tem delam pol nextId

  console.log(original_lectures.length);
  console.log(original_lectures[0]);

  //const selectedLectures = original_lectures.filter(lecture => lecture.course === "MODELIRANJE IN VODENJE ELEKTROMEHANSKIH SISTEMOV"); //samo za testiranje
  //console.log(selectedLectures.length);

  const schedule = initializeSchedule(original_lectures);
  schedule.sort((a, b) => a.id - b.id);

  return schedule;
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