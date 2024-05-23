const { db } = require('../utils/firebaseAdmin');


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
  } else if (startTime && !endTime) {
    return query.where("startTime", ">=", startTime.toDate());
  } else if (!startTime && endTime) {
    return query.where("startTime", ">=", today).where("startTime", "<=", endTime.toDate());
  } else if (startTime && endTime) {
    return query.where("startTime", ">=", startTime.toDate()).where("startTime", "<=", endTime.toDate());
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