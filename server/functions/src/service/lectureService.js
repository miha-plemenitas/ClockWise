const { db } = require('../utils/firebaseAdmin');
const { processLectureData } = require("../utils/dataProcessors");
const { filterForAllowedKeys } = require("../utils/batchOperations");
const { lectureAllowedKeys } = require("../constants/constants");
const { setFirestoreTimestampsAndDuration } = require("../utils/timeUtils");
const { convertToDates } = require("../utils/timeUtils");


/**
 * Converts a date string to a JavaScript Date object set to the start or end of that day.
 * @param {string} dateString - The date string in the format "YYYY-MM-DD".
 * @param {boolean} endOfDay - Whether to set the time to the end of the day.
 * @returns {Date} - The JavaScript Date object.
 */
function convertToDate(dateString, endOfDay = false) {
  const date = new Date(dateString);
  if (endOfDay) {
    date.setHours(21, 0, 0, 0);
  } else {
    date.setHours(7, 0, 0, 0);
  }
  return date;
}


/**
 * Constructs a Firestore query with specified filtering criteria based on the field type.
 * If the field is an array, it uses "array-contains" for filtering, otherwise it uses equality comparison.
 * 
 * @param {firebase.firestore.CollectionReference} lectureRef - The Firestore collection reference to query.
 * @param {string} filterFieldName - The name of the field to filter by.
 * @param {*} filterValue - The value to filter the field by.
 * @returns {firebase.firestore.Query} A Firestore query with the applied filter.
 */
function buildFilteredQuery(lectureRef, filterFieldName, filterValue) {
  const arrayFields = ["tutor_ids", "room_ids", "group_ids", "branch_ids"];

  if (arrayFields.includes(filterFieldName)) {
    return lectureRef.where(filterFieldName, "array-contains", filterValue);
  } else {
    return lectureRef.where(filterFieldName, '==', filterValue);
  }
}


/**
 * Applies date filters to a Firestore query based on provided start and/or end times.
 * Filters range from the beginning of today to the specified end time, or between
 * provided start and end times. If no times are provided, it defaults to the entire current day.
 *
 * @param {firebase.firestore.Query} query - The Firestore query to which the date filters will be applied.
 * @param {string} [startTime] - The start time for the filtering, as a string which can be converted to a Date.
 * @param {string} [endTime] - The end time for the filtering, as a string which can be converted to a Date.
 * @returns {firebase.firestore.Query} A Firestore query with the applied date range filters.
 */
function applyDateFilters(query, startTime, endTime) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!startTime && !endTime) {
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);
    return query.where("startTime", ">=", today).where("startTime", "<=", endToday);
  }
  else if (startTime && !endTime) {
    const start = convertToDate(startTime);
    return query.where("startTime", ">=", start);
  }
  else if (!startTime && endTime) {
    const end = convertToDate(endTime, true);
    return query.where("startTime", ">=", today).where("startTime", "<=", end);
  }
  else if (startTime && endTime) {
    const start = convertToDate(startTime);
    const end = convertToDate(endTime, true);
    return query.where("startTime", ">=", start).where("startTime", "<=", end);
  }
  return query;
}


/**
 * Retrieves lectures from a Firestore collection filtered by a specific field and optionally
 * filtered by date range. It queries within a specified faculty based on its ID.
 * The function throws an error if the faculty does not exist.
 *
 * @param {string} facultyId - The ID of the faculty whose lectures are to be fetched.
 * @param {string} filterFieldName - The name of the field to filter the lectures by.
 * @param {*} filterValue - The value to filter by for the specified field.
 * @param {string} [startTime] - The optional start time for the date filtering, as a string.
 * @param {string} [endTime] - The optional end time for the date filtering, as a string.
 * @returns {Promise<Array>} A promise that resolves to an array of lecture objects.
 * @throws {Error} If the specified faculty does not exist.
 */
async function getLecturesByFilterAndOptionallyDate(
  facultyId,
  filterFieldName,
  filterValue,
  startTime,
  endTime,
  collectionName
) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const lectureRef = facultyRef.collection(collectionName);
  let filteredQuery = buildFilteredQuery(lectureRef, filterFieldName, filterValue);
  filteredQuery = applyDateFilters(filteredQuery, startTime, endTime);

  const snapshot = await filteredQuery.get();
  const lectures = snapshot.docs.map(doc => doc.data());

  console.log(lectures.length)

  return lectures;
}



/**
 * Finds free time slots between lectures.
 *
 * @param {Array<Object>} events - An array of lectures.
 * @param {string} startTime - The start time to consider for finding free slots.
 * @param {string} endTime - The end time to consider for finding free slots.
 * @returns {Array<Object>} An array of free time slots, each with start and end properties as ISO strings.
 */
function findFreeSlots(events, startTime, endTime) {
  let convertedEvents = events.map(convertToDates);

  convertedEvents.sort((a, b) => a.start - b.start);

  let freeSlots = [];

  startTime = convertToDate(startTime, false);
  endTime = convertToDate(endTime, true);

  if (startTime < convertedEvents[0].start) {
    freeSlots.push({ start: startTime, end: new Date(convertedEvents[0].start) });
  }

  for (let i = 0; i < convertedEvents.length - 1; i++) {
    if (convertedEvents[i].end < convertedEvents[i + 1].start) {
      freeSlots.push({ start: new Date(convertedEvents[i].end), end: new Date(convertedEvents[i + 1].start) });
    }
  }

  if (convertedEvents[convertedEvents.length - 1].end < endTime) {
    freeSlots.push({ start: new Date(convertedEvents[convertedEvents.length - 1].end), end: endTime });
  }

  return freeSlots.map(slot => ({
    start: slot.start.toISOString(),
    end: slot.end.toISOString()
  }));
}


/**
 * Formats free time slots into a structured object by date.
 *
 * @param {Array<Object>} freeSlots - An array of free time slots, each with start and end properties as ISO strings.
 * @returns {Object} An object where keys are dates (YYYY-MM-DD) and values are arrays of free time slots with start, end, and duration properties.
 */
function formatFreeSlots(freeSlots) {
  const result = {};

  freeSlots.forEach(slot => {
    const start = new Date(slot.start);
    const end = new Date(slot.end);

    for (let current = new Date(start); current < end; current.setDate(current.getDate() + 1)) {
      const currentDate = current.toISOString().slice(0, 10);

      if (!result[currentDate]) {
        result[currentDate] = [];
      }

      const currentStart = (current.toISOString().slice(11, 16) < "07:00") ? "07:00" : current.toISOString().slice(11, 16);
      let currentEnd = (end.toISOString().slice(11, 16) > "21:00" || end.toISOString().slice(0, 10) > currentDate) ? "21:00" : end.toISOString().slice(11, 16);
      if (current.toISOString().slice(0, 10) < currentDate) {
        currentEnd = "21:00";
      }

      const startDateTime = new Date(`${currentDate}T${currentStart}`);
      const endDateTime = new Date(`${currentDate}T${currentEnd}`);
      const duration = (endDateTime - startDateTime) / (60 * 60 * 1000);

      if (duration > 0) {
        result[currentDate].push({
          start: currentStart,
          end: currentEnd,
          duration: duration
        });
      }
    }
  });

  return result;
}


/**
 * Finds and formats free time slots between scheduled events.
 *
 * @param {Array<Object>} events - An array of event objects with startTime and endTime properties.
 * @param {string} startTime - The start time to consider for finding free slots.
 * @param {string} endTime - The end time to consider for finding free slots.
 * @returns {Object} An object where keys are dates (YYYY-MM-DD) and values are arrays of free time slots with start, end, and duration properties.
 */
function findAndFormatFreeSlots(events, startTime, endTime) {
  let freeSlots = findFreeSlots(events, startTime, endTime);
  let formatedSlots = formatFreeSlots(freeSlots);

  return formatedSlots;
}


/**
 * Filters lectures based on the provided request parameters and time range.
 *
 * @param {string} facultyId - The unique identifier of the faculty.
 * @param {Object} request - The request object containing query parameters.
 * @param {Object} request.query - The query parameters for filtering.
 * @param {string} [request.query.groupId] - The group ID to filter lectures by.
 * @param {string} [request.query.roomId] - The room ID to filter lectures by.
 * @param {string} [request.query.tutorId] - The tutor ID to filter lectures by.
 * @param {string} startTime - The start time to filter lectures by.
 * @param {string} endTime - The end time to filter lectures by.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of filtered lectures.
 * @throws {Error} If there weren't any group, room or tutor ids sent.
 */
async function filterLectures(
  facultyId,
  request,
  startTime,
  endTime
) {
  const { groupId, roomId, tutorId } = request.query;
  let events = []
  let filteredLectures;

  if (groupId) {
    filteredLectures = await getLecturesByFilterAndOptionallyDate(facultyId, "group_ids", Number(groupId), startTime, endTime, "lectures");
    filteredLectures = Object.values(filteredLectures);
    events.push(...filteredLectures);
  } if (roomId) {
    filteredLectures = await getLecturesByFilterAndOptionallyDate(facultyId, "room_ids", Number(roomId), startTime, endTime, "lectures");
    filteredLectures = Object.values(filteredLectures);
    events.push(...filteredLectures);
  } if (tutorId) {
    filteredLectures = await getLecturesByFilterAndOptionallyDate(facultyId, "tutor_ids", Number(tutorId), startTime, endTime, "lectures");
    filteredLectures = Object.values(filteredLectures);
    events.push(...filteredLectures);
  }

  if(!filteredLectures){
    throw new Error("No group, room or tutor ID sent")
  }

  return events;
}


async function getLecturesByArrayContainsAny(
  facultyId,
  filterFieldName,
  filterValue,
  startTime,
  endTime,
  collectionName
) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const lectureRef = facultyRef.collection(collectionName);
  let lectureQuery = lectureRef.where(filterFieldName, "array-contains-any", filterValue);
  lectureQuery = applyDateFilters(lectureQuery, startTime, endTime);

  const snapshot = await lectureQuery.get();
  const lectures = snapshot.docs.map(doc => doc.data());

  return lectures;
}


async function getRoomsBiggerThan(
  facultyId,
  roomSize
) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const roomRef = facultyRef.collection("rooms");
  let roomQuery = roomRef.where("size", ">=", roomSize);

  const snapshot = await roomQuery.get();
  const rooms = snapshot.docs.map(doc => doc.data());

  return rooms;
}


async function findLectureForArrayOfItems(
  arrayOfItems,
  facultyId,
  collectionName,
  startTime,
  endTime,
  groupEvents
) {
  const data = {};
  for(const item of arrayOfItems){
    let itemLectures = await getLecturesByFilterAndOptionallyDate(facultyId, collectionName, Number(item.id), startTime, endTime, "lectures");
    if(itemLectures.length == 0){
      continue;
    }

    itemLectures = Object.values(itemLectures);
    itemLectures.push(...groupEvents);

    data[item.id] = itemLectures;
  }
  return data;
}


async function findAndFormatFreeSlotsForObjects(object, startTime, endTime) {
  const data = {}
  Object.keys(object).forEach(function(key) {
    const formatedSlots = findAndFormatFreeSlots(object[key], startTime, endTime);
    data[key] = formatedSlots;
  });

  return data;
}


async function saveLecture(facultyId, lecture){
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const lectureCollectionRef = facultyRef.collection("lectures");
  let filteredLecture = filterForAllowedKeys(lecture, lectureAllowedKeys);
  filteredLecture = preprareLectureForProccessing(filteredLecture, true);

  const processedLecture = processLectureData(filteredLecture);
  if(lecture.hasOwnProperty('exam') && lecture.exam !== undefined){
    processedLecture.exam = lecture.exam;
  }

  const docRef = await lectureCollectionRef.add(processedLecture);
  const updateWithId = { id: docRef.id };
  await docRef.update(updateWithId);

  const newLectureDoc = await docRef.get();
  const fullLectureData = newLectureDoc.data();

  fullLectureData.id = newLectureDoc.id;

  return fullLectureData;
}


async function updateLecture(facultyId, lecture){
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const lectureId = lecture.id;
  if (!lectureId){
    throw new Error("No lecture ID sent in request body");
  }
  const lectureCollectionRef = facultyRef.collection("lectures").doc(lectureId);

  const lectureDoc = await lectureCollectionRef.get();
  if (!lectureDoc.exists) {
    console.log(`No lecture found with ID: ${lectureId}`);
    throw new Error(`No lecture found with ID: ${lectureId}`);
  } 

  lecture = preprareLectureForProccessing(lecture);
  const { startTime, endTime, duration } = setFirestoreTimestampsAndDuration(lecture);
  lecture = configureTimeKeysLecture(lecture, startTime, endTime, duration);

  await lectureCollectionRef.update(lecture);

  return lecture;
}


function preprareLectureForProccessing(lecture, allCondition = false){
  lecture.start_time = lecture.startTime;
  lecture.end_time = lecture.endTime;
  if(allCondition) {
    lecture.lecturers = lecture.tutors;
  }

  return lecture;
}


function configureTimeKeysLecture(lecture, startTime, endTime, duration){
  lecture.startTime = startTime;
  lecture.endTime = endTime;
  lecture.duration = duration;
  delete lecture.start_time;
  delete lecture.end_time;

  return lecture
}


module.exports = {
  getLecturesByFilterAndOptionallyDate,
  findAndFormatFreeSlots,
  filterLectures,
  getLecturesByArrayContainsAny,
  getRoomsBiggerThan,
  findLectureForArrayOfItems,
  findAndFormatFreeSlotsForObjects,
  saveLecture,
  updateLecture,
}