const { db } = require('../utils/firebaseAdmin');


/**
 * Retrieves all faculty records from the Firestore "faculties" collection.
 * This asynchronous function fetches the collection, maps each document to its data,
 * and returns an array of all faculty data.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of faculty objects.
 */
async function getAllFaculties() {
  const facultyRef = await db.collection("faculties").get();
  const faculties = facultyRef.docs.map(doc => doc.data());

  return faculties;
}


/**
 * Retrieves a specific faculty record by its ID from the Firestore "faculties" collection.
 * If the faculty does not exist, it throws an error.
 * 
 * @param {string} facultyId - The ID of the faculty to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the faculty data object.
 * @throws {Error} If no faculty with the provided ID exists in the database.
 */
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