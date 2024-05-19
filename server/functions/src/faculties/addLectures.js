const { processLectureData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

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
