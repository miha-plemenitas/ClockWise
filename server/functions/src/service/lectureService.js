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
  let freeSlots;

  startTime = convertToDate(startTime, false);
  endTime = convertToDate(endTime, true);
  if (endTime <= startTime) {
    throw new Error("No: End time must be larger than start time.");
  }
  
  if (events.length === 0) {
    freeSlots = generateFreeSlotsForEmptyPeriod(startTime, endTime);
  } else {
    freeSlots = findFreeSlots(events, startTime, endTime);
    freeSlots = formatFreeSlots(freeSlots);
  }

  return freeSlots;
}


function generateFreeSlotsForEmptyPeriod(startTime, endTime) {
  let freeSlots = {};

  while (startTime <= endTime) {
    let dateString = startTime.toISOString().split('T')[0];
    freeSlots[dateString] = [{
      start: "07:00",
      end: "21:00",
      duration: 14
    }];

    startTime.setDate(startTime.getDate() + 1);
  }

  return freeSlots;
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

/**
 * Retrieves lectures from a Firestore collection where a specified array field contains any of the provided values.
 *
 * This function queries a Firestore collection for documents where the specified field contains any of the values
 * in the provided array. Optionally, it can also filter the results based on a start and end time.
 *
 * @param {string} facultyId - The ID of the faculty to which the collection belongs.
 * @param {string} filterFieldName - The name of the field to filter by using the "array-contains-any" clause.
 * @param {Array} filterValue - The array of values to check within the specified field.
 * @param {Timestamp} startTime - The start time to filter the lectures (optional).
 * @param {Timestamp} endTime - The end time to filter the lectures (optional).
 * @param {string} collectionName - The name of the collection to query within the faculty document.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of lecture documents.
 * @throws {Error} Throws an error if the faculty document does not exist.
 */
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


/**
 * Retrieves rooms from a Firestore collection that have a size greater than or equal to the specified size.
 *
 * This function queries a Firestore collection for documents representing rooms where the size field is greater than
 * or equal to the specified room size.
 *
 * @param {string} facultyId - The ID of the faculty to which the rooms collection belongs.
 * @param {number} roomSize - The minimum size of the rooms to be retrieved.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of room documents.
 * @throws {Error} Throws an error if the faculty document does not exist.
 */
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


/**
 * Retrieves lectures for an array of items from a Firestore collection with optional date filters.
 *
 * This function queries a Firestore collection for lectures corresponding to each item in the provided array.
 * Optionally, it can filter the results based on a start and end time. Group events are also included in the results.
 *
 * @param {Array<Object>} arrayOfItems - An array of items to find lectures for.
 * @param {string} facultyId - The ID of the faculty to which the collection belongs.
 * @param {string} collectionName - The name of the collection to query within the faculty document.
 * @param {Timestamp} startTime - The start time to filter the lectures (optional).
 * @param {Timestamp} endTime - The end time to filter the lectures (optional).
 * @param {Array<Object>} groupEvents - An array of group events to include in the results.
 *
 * @returns {Promise<Object>} A promise that resolves to an object mapping item IDs to their corresponding lectures.
 */
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


/**
 * Finds and formats free slots for each item in the provided object within a specified time range.
 *
 * This function processes each item in the given object to find and format free slots based on the provided
 * start and end times. The results are returned as a new object with the same keys as the input object.
 *
 * @param {Object} object - The input object containing items to find and format free slots for.
 * @param {Timestamp} startTime - The start time for finding free slots.
 * @param {Timestamp} endTime - The end time for finding free slots.
 *
 * @returns {Promise<Object>} A promise that resolves to an object mapping the original keys to their corresponding formatted free slots.
 */
async function findAndFormatFreeSlotsForObjects(object, startTime, endTime) {
  const data = {}
  Object.keys(object).forEach(function(key) {
    const formatedSlots = findAndFormatFreeSlots(object[key], startTime, endTime);
    data[key] = formatedSlots;
  });

  return data;
}


/**
 * Saves a lecture to the Firestore database for a specified faculty.
 *
 * This function saves a lecture document to the Firestore "lectures" collection within the specified faculty document.
 * It filters and processes the lecture data, then adds it to the collection, and updates the document with its generated ID.
 *
 * @param {string} facultyId - The ID of the faculty to which the lecture belongs.
 * @param {Object} lecture - The lecture data to be saved.
 *
 * @returns {Promise<Object>} A promise that resolves to the saved lecture document with its full data, including the generated ID.
 * @throws {Error} Throws an error if the faculty document does not exist.
 */
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


/**
 * Updates a lecture in the Firestore database for a specified faculty.
 *
 * This function updates a lecture document in the Firestore "lectures" collection within the specified faculty document.
 * It processes and prepares the lecture data, sets Firestore timestamps and duration, and updates the document.
 *
 * @param {string} facultyId - The ID of the faculty to which the lecture belongs.
 * @param {Object} lecture - The lecture data to be updated. Must include an `id` field.
 *
 * @returns {Promise<Object>} A promise that resolves to the updated lecture document data.
 * @throws {Error} Throws an error if the faculty document or the lecture document does not exist, or if no lecture ID is provided.
 */
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


/**
 * Prepares the lecture data for processing.
 *
 * This function modifies the lecture object to standardize the field names and optionally
 * includes additional fields based on the provided condition.
 *
 * @param {Object} lecture - The lecture object to be processed.
 * @param {boolean} [allCondition=false] - A flag indicating whether additional fields should be included.
 *
 * @returns {Object} The modified lecture object with standardized field names and optional additional fields.
 */
function preprareLectureForProccessing(lecture, allCondition = false){
  lecture.start_time = lecture.startTime;
  lecture.end_time = lecture.endTime;
  if(allCondition) {
    lecture.lecturers = lecture.tutors;
  }

  return lecture;
}


/**
 * Configures the time-related keys of a lecture object.
 *
 * This function sets the `startTime`, `endTime`, and `duration` fields of the lecture object.
 * It also removes the `start_time` and `end_time` fields from the lecture object.
 *
 * @param {Object} lecture - The lecture object to be configured.
 * @param {Timestamp} startTime - The Firestore Timestamp representing the start time of the lecture.
 * @param {Timestamp} endTime - The Firestore Timestamp representing the end time of the lecture.
 * @param {number} duration - The duration of the lecture in hours, rounded down to the nearest whole number.
 *
 * @returns {Object} The modified lecture object with updated time-related keys.
 */
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