const { db } = require('../utils/firebaseAdmin');


async function getAllFaculties() {
  const facultyRef = await db.collection("faculties").get();
  const faculties = facultyRef.docs.map(doc => doc.data());

  return faculties;
}


async function getFacultyById(facultyId) {
  const facultyDoc = await db.collection("faculties").doc(facultyId).get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const faculty = facultyDoc.data();
  return faculty;
}


module.exports = {
  getAllFaculties,
  getFacultyById
}