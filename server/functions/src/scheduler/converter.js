const moment = require('moment');
const { processScheduleData } = require("../utils/dataProcessors");
const { processItemsInBatch } = require('../utils/batchOperations');
const { db } = require('../utils/firebaseAdmin');
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");
const { deleteAllDocumentsInCollection } = require("../utils/firebaseHelpers");


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


function updateLectureDates(lectures) {
  const weekDates = getNextWeekdayDates();

  return lectures.map(lecture => {
      const day = lecture.day;
      const date = weekDates[day];
      
      if (!date) return lecture;

      const startTime = new Date(date);
      startTime.setHours(lecture.start, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(lecture.end, 0, 0, 0);

      lecture.start_time = startTime.toISOString();
      lecture.end_time = endTime.toISOString();

      return lecture;
  });
}


function getNextWeekdayDates() {
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));
  
  const dates = {
      "Monday": new Date(nextMonday),
      "Tuesday": new Date(nextMonday.setDate(nextMonday.getDate() + 1)),
      "Wednesday": new Date(nextMonday.setDate(nextMonday.getDate() + 1)),
      "Thursday": new Date(nextMonday.setDate(nextMonday.getDate() + 1)),
      "Friday": new Date(nextMonday.setDate(nextMonday.getDate() + 1))
  };
  
  return dates;
}



/**
 * Saves the generated schedule of lectures for a specified faculty.
 *
 * This function deletes all documents in the "generated_lectures" collection for the specified faculty,
 * processes the lecture items in batches, and saves them to the collection.
 *
 * @param {string} facultyId - The ID of the faculty.
 * @param {Array<Object>} lectures - An array of lecture objects to be saved.
 * @returns {Promise<void>} A promise that resolves when the schedule has been saved.
 */
async function saveGeneratedSchedule(facultyId, lectures) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const genLecturesRef = facultyRef.collection("generated_lectures");

  await deleteAllDocumentsInCollection(genLecturesRef);

  await processItemsInBatch(genLecturesRef, lectures, processScheduleData);
}


module.exports = {
  generateFullSchedule,
  saveGeneratedSchedule,
  updateLectureDates
}