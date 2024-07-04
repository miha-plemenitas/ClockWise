const { db } = require('../utils/firebaseAdmin');
const {
  generateTimeSlots,
  initializeSchedule,
  splitAndSortRooms
} = require("./utilities");
const { resetCollectionAndFetchSchedule, expandLectureData } = require("./preparer");
const { updateLectureDates, saveGeneratedSchedule } = require("./converter");
const fs = require('fs');
const path = require('path');


/**
 * Retrieves lectures and rooms data for a faculty.
 *
 * This function checks if the data exists in local JSON files. If the files exist, it reads the data from them.
 * Otherwise, it fetches the data, saves it to the JSON files, and then returns the data.
 *
 * @param {string} facultyId - The ID of the faculty.
 * @returns {Promise<Object>} A promise that resolves to an object containing `original_lectures` and `rooms`.
 */
async function getLecturesAndRooms(facultyId){ 
  const lecturesPath = path.resolve(__dirname, '../data/lectures.json');
  const roomsPath = path.resolve(__dirname, '../data/rooms.json');

  let original_lectures, rooms;

  if (fs.existsSync(lecturesPath) && fs.existsSync(roomsPath)) {
    original_lectures = JSON.parse(fs.readFileSync(lecturesPath, 'utf8'));
    rooms = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));
  } else {
    const schedule = await resetCollectionAndFetchSchedule(facultyId);
    original_lectures = schedule.original_lectures;
    rooms = schedule.rooms;

    fs.writeFileSync(lecturesPath, JSON.stringify(original_lectures, null, 2));
    fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2));
  }

  return { original_lectures, rooms};
}


/**
 * Generates a schedule for a faculty based on lectures and rooms data.
 *
 * This function retrieves lectures and rooms data for the specified faculty, splits and sorts the rooms,
 * generates time slots, expands lecture data, initializes the schedule, assigns IDs to unscheduled lectures,
 * saves the generated schedule, and returns the result.
 *
 * @param {string} facultyId - The ID of the faculty.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of scheduled lectures.
 */
async function generateSchedule(facultyId) {
  //const { rooms, original_lectures } = await resetCollectionAndFetchSchedule(facultyId); // IF production

  const { rooms, original_lectures } = await getLecturesAndRooms(facultyId); //IF working local

  splitAndSortRooms(rooms);

  await generateTimeSlots(facultyId, original_lectures);
  expandLectureData(original_lectures);

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