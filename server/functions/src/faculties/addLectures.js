const { processLectureData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');
const { deleteAllDocumentsInCollection } = require("../utils/firebaseHelpers");

/**
 * Fetches lectures for a given faculty document within a specified date range.
 * Processes and stores the lectures in the Firestore collection.
 *
 * @param {firebase.firestore.DocumentSnapshot} facultyDoc - The Firestore document snapshot of the faculty.
 * @returns {Promise<string>} A log message indicating the completion of lecture addition.
 * @throws {Error} If there is an issue with fetching data from the API, processing lectures, or updating Firestore.
 */
async function fetchLecturesByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = "/scheduleAll";

  const params = {
    "schoolCode": faculty.schoolCode,
    "language": "slo",
    "dateFrom": "2024-02-26",
    "dateTo": "2024-06-14",
  };

  const lectures = await fetchFromApi(URL, params);

  await processItemsInBatch(
    facultyDoc.ref.collection("original_lectures"),
    lectures,
    processLectureData
  );

  const log = `Added lectures for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


async function duplicateLecturesByFacultyDoc(facultyDoc) {
  const originalLecturesRef = facultyDoc.ref.collection("original_lectures");
  const lecturesRef = facultyDoc.ref.collection("lectures");
  const faculty = facultyDoc.data();

  try {
    await deleteAllDocumentsInCollection(lecturesRef);
  } catch (error) {
    console.log("Error when deleting lectures" + error.message);
  }

  const originalLectures = await originalLecturesRef.get();

  if (originalLectures.empty) {
    const log = `The lectures were not duplicated for ${faculty.schoolCode} due to no original lectures.`;
    console.log(log);
    return log;
  }

  function processData(lecture) {
    if (!lecture.exists) return null;
    return lecture.data();
  }

  await processItemsInBatch(lecturesRef, originalLectures.docs, processData);

  const log = `The lectures were duplicated for ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


module.exports = {
  fetchLecturesByFacultyDoc,
  duplicateLecturesByFacultyDoc,
}
