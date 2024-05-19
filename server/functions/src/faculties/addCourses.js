const { findProgramForBranch } = require('../utils/firebaseHelpers');
const { processCourseData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

async function fetchCoursesByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = "/courseAll";
  const params = {
    "schoolCode": faculty.schoolCode,
    "language": "slo"
  };

  const courses = await fetchFromApi(URL, params);

  const programLookups = courses.filter((_, index) => index % faculty.numberOfPrograms === 0)
    .map(course => findProgramForBranch(facultyDoc.ref, course.branchId)
      .then((programId) => ({
        ...course,
        programId: programId,
      })));

  const resolvedCourses = await Promise.all(programLookups);

  await processItemsInBatch(
    facultyDoc.ref.collection("courses"),
    resolvedCourses,
    (course) => processCourseData(course)
  );

  const log = `Added courses for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}

module.exports = {
  fetchCoursesByFacultyDoc,
}
