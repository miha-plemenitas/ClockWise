const { Timestamp } = require('firebase-admin/firestore');
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");


function setFirestoreTimestampsAndDuration(lecture) {
  const startDateTimeString = `${lecture.day}T${String(lecture.start).padStart(2, '0')}:00:00.000Z`;
    const endDateTimeString = `${lecture.day}T${String(lecture.end).padStart(2, '0')}:00:00.000Z`;
  
    const startDateTime = new Date(startDateTimeString);
    const endDateTime = new Date(endDateTimeString);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      console.log(lecture);
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


function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}


async function getHeatMap(facultyId, collectionName, type) {
  // Validate collectionName and type
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

  // Pre-generate heatmap structure
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