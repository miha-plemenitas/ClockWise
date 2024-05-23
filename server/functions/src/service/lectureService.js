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


function buildFilteredQuery(lectureRef, filterFieldName, filterValue) {
  const arrayFields = ["tutors", "rooms", "groups", "branches"];

  if (arrayFields.includes(filterFieldName)) {
    return lectureRef.where(filterFieldName, "array-contains", filterValue);
  } else {
    return lectureRef.where(filterFieldName, '==', filterValue);
  }
}


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