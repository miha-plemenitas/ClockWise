const { processLectureData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

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
    facultyDoc.ref.collection("lectures"),
    lectures,
    processLectureData
  );

  const log = `Added lectures for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}

module.exports = {
  fetchLecturesByFacultyDoc,
}
