const {
  fetchTutorsByFacultyDoc,
  fetchCoursesByFacultyDoc,
  fetchBranchesByFacultyDoc,
  fetchGroupsByFacultyDoc,
  fetchLecturesByFacultyDoc,
  fetchRoomsByFacultyDoc,
  duplicateLecturesByFacultyDoc,
} = require('./');
const { db } = require('../utils/firebaseAdmin');

/**
 * Fetches specified data for a given faculty based on the provided data type.
 * Supports fetching tutors, courses, branches, groups, lectures, and rooms.
 *
 * @param {string|firebase.firestore.DocumentSnapshot} facultyParam - The ID of the faculty or the Firestore document snapshot of the faculty.
 * @param {string} dataType - The type of data to fetch. Must be one of "tutors", "courses", "branches", "groups", "lectures", or "rooms".
 * @returns {Promise<string|null>} A log message indicating the completion of the data fetch, or null if the data type is invalid.
 * @throws {Error} If there is an issue with fetching data from Firestore or fetching the specified data type.
 */
async function fetchDataForFaculty(facultyParam, dataType) {
  let facultyDoc;

  if (typeof facultyParam === "string") {
    const facultyRef = db.collection("faculties").doc(facultyParam);
    facultyDoc = await facultyRef.get();
    if (!facultyDoc) {
      throw new Error("Faculty with this ID was not found");
    }
  } else {
    facultyDoc = facultyParam; // If facultyParam is a DocumentSnapshot
  }

  switch (dataType) {
    case "tutors":
      return fetchTutorsByFacultyDoc(facultyDoc);
    case "courses":
      return fetchCoursesByFacultyDoc(facultyDoc);
    case "branches":
      return fetchBranchesByFacultyDoc(facultyDoc);
    case "groups":
      return fetchGroupsByFacultyDoc(facultyDoc);
    case "original_lectures":
      return fetchLecturesByFacultyDoc(facultyDoc);
    case "lectures":
      return duplicateLecturesByFacultyDoc(facultyDoc);
    case "rooms":
      return fetchRoomsByFacultyDoc(facultyDoc);
    default:
      console.error("Invalid data type specified");
      return null;
  }
}


/**
 * Fetches specified data for all faculties and processes the data accordingly.
 * Supports fetching tutors, courses, branches, groups, lectures, and rooms for all faculties.
 *
 * @param {string} dataType - The type of data to fetch for each faculty. Must be one of "tutors", "courses", "branches", "groups", "lectures", or "rooms".
 * @returns {Promise<string>} A log message indicating the completion of the data fetch for all faculties.
 * @throws {Error} If there is an issue with fetching data from Firestore or processing the specified data type.
 */
async function fetchDataForAllFaculties(dataType) {
  const faculties = await db.collection("faculties").get();
  const promises = faculties.docs.map((facultyDoc) => {
    return fetchDataForFaculty(facultyDoc, dataType);
  });

  await Promise.all(promises);
  return `Added ${dataType} to all faculties`;
}


/**
 * Fetches specified data for all faculties or a specific faculty based on the provided faculty ID and collection name.
 * If no ID is provided, it fetches data for all faculties.
 * Supports fetching tutors, courses, branches, groups, lectures, and rooms.
 *
 * @param {string|null} id - The ID of the faculty. If null, data will be fetched for all faculties.
 * @param {string} collectionName - The name of the collection to fetch data from. Must be one of "tutors", "courses", "branches", "groups", "lectures", or "rooms".
 * @returns {Promise<string>} A log message indicating the completion of the data fetch.
 * @throws {Error} If there is an issue with fetching data from Firestore or processing the specified collection.
 */
async function fetchData(id, collectionName) {
  let result;
  if (!id) {
    result = await fetchDataForAllFaculties(collectionName);
    return result;
  } else {
    result = await fetchDataForFaculty(id, collectionName);
    return result;
  }
}

module.exports = {
  fetchDataForFaculty,
  fetchData,
  fetchDataForAllFaculties,
}
