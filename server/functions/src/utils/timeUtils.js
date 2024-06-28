const { Timestamp } = require('firebase-admin/firestore');
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");


/**
 * Converts lecture day and time information into Firestore Timestamps.
 *
 * This function takes an object representing a lecture, constructs start and end Date objects
 * from the provided day and start/end times, and converts these into Firestore Timestamps.
 *
 * @param {Object} lecture - The lecture object.
 * @param {string} lecture.day - The day of the lecture in 'YYYY-MM-DD' format.
 * @param {number} lecture.start - The starting hour of the lecture (0-23).
 * @param {number} lecture.end - The ending hour of the lecture (0-23).
 *
 * @returns {Object} An object containing the Firestore Timestamps.
 * @returns {Timestamp} return.startTime - The Firestore Timestamp representing the start time of the lecture.
 * @returns {Timestamp} return.endTime - The Firestore Timestamp representing the end time of the lecture.
 *
 * @throws {Error} Throws an error if the date format is invalid.
 */
function setFirestoreTimestampsAndDuration(lecture) {
  const startDateTimeString = `${lecture.day}T${String(lecture.start).padStart(2, '0')}:00:00.000Z`;
    const endDateTimeString = `${lecture.day}T${String(lecture.end).padStart(2, '0')}:00:00.000Z`;
  
    const startDateTime = new Date(startDateTimeString);
    const endDateTime = new Date(endDateTimeString);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      throw new Error('Invalid date format.');
    }
  
  
    const startTime = Timestamp.fromDate(startDateTime);
    const endTime = Timestamp.fromDate(endDateTime);
  
    return { startTime, endTime };
}


/**
 * Converts event unix timestamps to JavaScript Date objects.
 *
 * @param {Object} event - The event object containing timestamp properties.
 * @returns {Object} An object containing start and end Date objects.
 */
function convertToDates(event) {
  return {
    start: new Date(event.startTime._seconds * 1000 + event.startTime._nanoseconds / 1000000),
    end: new Date(event.endTime._seconds * 1000 + event.endTime._nanoseconds / 1000000),
  };
}


/**
 * Asserts that a condition is true, and throws an error with a specified message if it is not.
 *
 * This function is used for validating conditions during runtime. If the provided condition
 * evaluates to false, an error is thrown with the given message. If no message is provided,
 * a default message "Assertion failed" is used.
 *
 * @param {boolean} condition - The condition to be checked.
 * @param {string} [message] - The message to be used in the error if the condition is false.
 *
 * @throws {Error} Throws an error with the provided message if the condition is false.
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}


/**
 * Generates heatmap data for Plotly heatmap visualization based on faculty lecture schedules.
 *
 * This function retrieves lecture data from a specified collection, calculates the lecture 
 * distribution across the days of the week and hours of the day, and formats the data for use 
 * in a Plotly heatmap.
 *
 * @param {string} facultyId - The ID of the faculty.
 * @param {string} collectionName - The name of the collection to fetch lectures from. Must be one of 'original_lectures', 'lectures', or 'generated_lectures'.
 * @param {string} type - The type of data to be returned. Must be either 'frequency' or 'count'.
 * 
 * @returns {Promise<Object>} A promise that resolves to an object containing the heatmap data.
 * @returns {Array<number>} return.x - An array of hours of the day (0-23).
 * @returns {Array<string>} return.y - An array of days of the week.
 * @returns {Array<Array<number>>} return.z - A 2D array representing the heatmap values, either frequencies or counts of lectures.
 * 
 * @throws {Error} Throws an error if the collection name or type is invalid.
 */
async function getHeatMap(facultyId, collectionName, type) {
  assert(
    ['original_lectures', 'lectures', 'generated_lectures'].includes(collectionName),
    'collection name not found, must be lectures, original_lectures or generated_lectures'
  );

  assert(
    ['frequency', 'count'].includes(type),
    'type name not found, must be frequency or count'
  );

  let lectures = await getAllFacultyCollectionItems(facultyId, collectionName);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const heatmap = daysOfWeek.reduce((acc, day) => {
    acc[day] = Array.from({ length: 24 }, () => 0);
    return acc;
  }, {});

  let totalCounter = 0;

  lectures.forEach(lecture => {
    const { start } = convertToDates(lecture);
    const dayOfWeek = daysOfWeek[start.getUTCDay() - 1];
    const startHour = start.getUTCHours();
    const endHour = Math.min(startHour + Math.floor(lecture.duration), 24);

    if (dayOfWeek) {
      for (let hour = startHour; hour < endHour; hour++) {
        heatmap[dayOfWeek][hour]++;
        totalCounter++;
      }
    }
  });

  const z = daysOfWeek.map(day => heatmap[day]);

  if (type === 'frequency') {
    for (let dayIndex = 0; dayIndex < z.length; dayIndex++) {
      for (let hourIndex = 0; hourIndex < z[dayIndex].length; hourIndex++) {
        const count = z[dayIndex][hourIndex];
        const frequency = count / totalCounter;

        z[dayIndex][hourIndex] = frequency;
      }
    }
  }

  return {
    z: z,
    x: hoursOfDay,
    y: daysOfWeek
  };
}



module.exports = {
  setFirestoreTimestampsAndDuration,
  getHeatMap,
  convertToDates
}