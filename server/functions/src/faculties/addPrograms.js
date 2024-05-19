const { db } = require('../utils/firebaseAdmin');
const { processProgramData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

/**
 * Fetches programs for all faculties in the Firestore collection.
 * Processes and stores the programs for each faculty in their respective Firestore sub-collections.
 *
 * @returns {Promise<string>} A log message indicating the completion of program addition for all faculties.
 * @throws {Error} If there is an issue with fetching data from the API, processing programs, or updating Firestore.
 */
async function fetchProgramsForAllFaculties() {
  const faculties = await db.collection("faculties").get();

  for (const facultyDoc of faculties.docs) {
    const faculty = facultyDoc.data();

    const URL = "/basicProgrammeAll";
    const params = {
      "schoolCode": faculty.schoolCode,
      "language": "slo",
    };

    const programs = await fetchFromApi(URL, params);

    await processItemsInBatch(facultyDoc.ref.collection("programs"), programs, processProgramData);
  }

  const log = "Added programs for all faculties";
  console.log(log);
  return log;
}

module.exports = {
  fetchProgramsForAllFaculties,
}
