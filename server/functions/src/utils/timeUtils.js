const { Timestamp } = require('firebase-admin/firestore');
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");


function setFirestoreTimestampsAndDuration(lecture) {
  const startTimeDateObj = new Date(lecture.start_time);
  const endTimeDateObj = new Date(lecture.end_time);

  const startTime = lecture.start_time ? Timestamp.fromDate(startTimeDateObj) : null;
  const endTime = lecture.end_time ? Timestamp.fromDate(endTimeDateObj) : null;
  const duration = (endTimeDateObj - startTimeDateObj) / (1000 * 60 * 60);

  return { startTime, endTime, duration };
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


function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}


async function getHeatMap(facultyId, collectionName, type) {
  assert(
    collectionName === 'original_lectures' || collectionName === 'lectures' || collectionName === 'generated_lectures',
    'collection name not found, must be lectures, original_lectures or generated_lectures'
  );

  assert(
    type === 'both' || type === 'frequency' || type === 'count',
    'type name not found, must be both, frequency or count'
  );

  let lectures = await getAllFacultyCollectionItems(facultyId, collectionName);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const heatmap = {};
  let totalCounter = 0;

  lectures.forEach(lecture => {
    const { start, end } = convertToDates(lecture);
    const dayOfWeek = daysOfWeek[start.getUTCDay()];
    const hour = start.getUTCHours();

    for (let index = hour; index < (lecture.duration + hour); index++) {
      if (!heatmap[dayOfWeek]) {
        heatmap[dayOfWeek] = {};
      }

      if (!heatmap[dayOfWeek][hour]) {
        heatmap[dayOfWeek][hour] = 1;
      } else {
        heatmap[dayOfWeek][hour]++;
      }
      totalCounter++;
    }
  });

  for (const day in heatmap) {
    for (const hour in heatmap[day]) {
      const count = heatmap[day][hour];
      const frequency = count / totalCounter;

      if (type === "both") {
        heatmap[day][hour] = [count, frequency];
      } else if (type == "frequency"){
        heatmap[day][hour] = frequency;
      }
    }
  }

  return heatmap;
}


module.exports = {
  setFirestoreTimestampsAndDuration,
  getHeatMap,
  convertToDates
}