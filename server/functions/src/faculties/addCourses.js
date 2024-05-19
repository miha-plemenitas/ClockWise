const { findProgramForBranch } = require('../utils/firebaseHelpers');
const { processCourseData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

/**
 * Fetches courses for a given faculty document.
 * Filters and processes the courses, associates them with programs, and stores the processed data in Firestore.
 *
 * @param {firebase.firestore.DocumentSnapshot} facultyDoc - The Firestore document snapshot of the faculty.
 * @returns {Promise<string>} A log message indicating the completion of course addition.
 * @throws {Error} If there is an issue with fetching data from the API, processing courses, or updating Firestore.
 */
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
