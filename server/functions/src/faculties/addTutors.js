const { processTutorData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

/**
 * Fetches tutors for a given faculty document.
 * Processes and stores the tutors in the Firestore collection.
 *
 * @param {firebase.firestore.DocumentSnapshot} facultyDoc - The Firestore document snapshot of the faculty.
 * @returns {Promise<string>} A log message indicating the completion of tutor addition.
 * @throws {Error} If there is an issue with fetching data from the API, processing tutors, or updating Firestore.
 */
async function fetchTutorsByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = "/basicTutorAll";
  const params = { "schoolCode": faculty.schoolCode, "language": "slo" }

  const tutors = await fetchFromApi(URL, params);

  await processItemsInBatch(facultyDoc.ref.collection("tutors"), tutors, (tutor) => processTutorData(tutor));

  const log = `Added tutors for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}

module.exports = {
  fetchTutorsByFacultyDoc,
}
