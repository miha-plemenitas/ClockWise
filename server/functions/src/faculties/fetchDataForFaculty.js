const {
  fetchTutorsByFacultyDoc,
  fetchCoursesByFacultyDoc,
  fetchBranchesByFacultyDoc,
  fetchGroupsByFacultyDoc,
  fetchLecturesByFacultyDoc,
  fetchRoomsByFacultyDoc,
} = require('./');
const { db } = require('../utils/firebaseAdmin');

async function fetchDataForFaculty(facultyParam, dataType) {
  let facultyDoc;

  if (typeof facultyParam === "string") {
    const facultyRef = db.collection("faculties").doc(facultyParam);
    facultyDoc = await facultyRef.get();
    if (!facultyDoc) {
      return "Faculty with this ID could not be found";
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
    case "lectures":
      return fetchLecturesByFacultyDoc(facultyDoc);
    case "rooms":
      return fetchRoomsByFacultyDoc(facultyDoc);
    default:
      console.error("Invalid data type specified");
      return null;
  }
}


async function fetchDataForAllFaculties(dataType) {
  const faculties = await db.collection("faculties").get();
  const promises = faculties.docs.map((facultyDoc) => {
    return fetchDataForFaculty(facultyDoc, dataType);
  });

  await Promise.all(promises);
  return `Added ${dataType} to all faculties`;
}


async function fetchDataByFacultyId(id, dataType) {
  return fetchDataForFaculty(id, dataType);
}


async function fetchData(id, collectionName) {
  let result;
  if (!id) {
    result = await fetchDataForAllFaculties(collectionName);
    return result;
  } else {
    result = await fetchDataByFacultyId(id, collectionName);
    return result;
  }
}

module.exports = {
  fetchDataForFaculty,
  fetchData,
  fetchDataByFacultyId,
  fetchDataForAllFaculties,
}
