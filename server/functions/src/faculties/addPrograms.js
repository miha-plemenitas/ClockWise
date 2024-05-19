const { db } = require('../utils/firebaseAdmin');
const { processProgramData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

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
