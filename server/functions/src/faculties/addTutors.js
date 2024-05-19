const { processTutorData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

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
