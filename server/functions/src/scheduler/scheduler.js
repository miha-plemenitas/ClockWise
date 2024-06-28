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
const { schedule } = require('firebase-functions/v1/pubsub');


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

  return { original_lectures, rooms};
}



async function generateSchedule(facultyId) {
  const { rooms, original_lectures } = await resetCollectionAndFetchSchedule(facultyId); // IF production

  //const { rooms, original_lectures } = await getLecturesAndRooms(facultyId); //IF working local

  splitAndSortRooms(rooms);

  await generateTimeSlots(facultyId, original_lectures); //array timeSlotov, vsak ma day:"2024-06-14", pa array hours (od 7-21 oz srede 10-21)
  expandLectureData(original_lectures); //groupira lecturje glede na course, groups, tutors... s tem delam pol nextId

  const schedule = initializeSchedule(original_lectures);
  schedule.sort((a, b) => a.id - b.id);

  let index = -1;
  for(const lecture of schedule){
    if(!lecture.id){
      lecture.id = index;
      index--;
    }
  }

  const result = schedule;
  await saveGeneratedSchedule(facultyId, schedule);

  return result;
}


module.exports = {
  generateSchedule
}