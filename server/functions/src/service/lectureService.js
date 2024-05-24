const { db } = require('../utils/firebaseAdmin');


/**
 * Converts a date string to a JavaScript Date object set to the start or end of that day.
 * @param {string} dateString - The date string in the format "YYYY-MM-DD".
 * @param {boolean} endOfDay - Whether to set the time to the end of the day.
 * @returns {Date} - The JavaScript Date object.
 */
function convertToDate(dateString, endOfDay = false) {
  const date = new Date(dateString);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999); // Set to the end of the day.
  } else {
    date.setHours(0, 0, 0, 0); // Set to the start of the day.
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
  const arrayFields = ["tutors", "rooms", "groups", "branches"];

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
  endTime
) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const lectureRef = facultyRef.collection("lectures");
  let filteredQuery = buildFilteredQuery(lectureRef, filterFieldName, filterValue);
  filteredQuery = applyDateFilters(filteredQuery, startTime, endTime);

  const snapshot = await filteredQuery.get();
  const lectures = snapshot.docs.map(doc => doc.data());

  return lectures;
}


module.exports = {
  getLecturesByFilterAndOptionallyDate
}