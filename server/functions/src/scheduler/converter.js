const moment = require('moment');
const { processScheduleData } = require("../utils/dataProcessors");
const { processItemsInBatch } = require('../utils/batchOperations');
const { db } = require('../utils/firebaseAdmin');
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");


function generateFullSchedule(lectures, dateFrom) {
  let occurrences = [];
  let startOfWeek = getNextMonday(dateFrom);

  lectures.forEach(lecture => {
      let currentDate = startOfWeek.clone();

      if (lecture.timeSlot.day !== "Monday") {
          while (currentDate.format('dddd') !== lecture.timeSlot.day) {
              currentDate.add(1, 'day');
          }
      }

      occurrences.push({
          ...lecture,
          date: currentDate.clone()
      });
  });

  console.log("Schedule generated for the next week starting from " + startOfWeek.format("YYYY-MM-DD"));
  return occurrences;
}


function getNextMonday(dateFrom) {
  let date = dateFrom ? moment(dateFrom) : moment();
  let nextMonday = date.isoWeekday() <= 1 ? date.isoWeekday(1) : date.add(1, 'weeks').isoWeekday(1);
  nextMonday.startOf('day');
  return nextMonday;
}


async function enrichLecturesWithRoomData(lectures) {
  const roomData = await getAllFacultyCollectionItems("13", "rooms");
  const roomMap = new Map(roomData.map(room => [room.roomId, room.roomName]));

  return lectures.map(lecture => {
      const roomName = roomMap.get(lecture.room) || 'Unknown Room';
      return {
          ...lecture,
          roomName
      };
  });
}


async function saveGeneratedSchedule(lectures) {
  const facultyRef = db.collection("faculties").doc("13");
  console.log("Starting to save")

  await processItemsInBatch(facultyRef.collection("generated_lectures"), lectures, processScheduleData);
  console.log("Successfuly saved data")
}


module.exports = {
  generateFullSchedule,
  saveGeneratedSchedule,
  enrichLecturesWithRoomData
}