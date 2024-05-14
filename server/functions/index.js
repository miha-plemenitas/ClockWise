const functions = require('firebase-functions');
const { db } = require('./firebaseAdmin');
const { addFacultyDocumentsFromList, fetchAndStoreProgramsForFaculties, fetchBranchesForAllFaculties, fetchAndStoreBranchesForProgram, fetchAndStoreCoursesById, 
  fetchAndStoreCoursesForAllFaculties, fetchAndStoreTutorsForFacultiesById, fetchAndStoreTutorsForFaculties, fetchBranchesByFacultyId } = require('./apiRequest');
const { request } = require('express');


exports.addFaculties = functions.region('europe-west3').https.onRequest(async (request, response) => {
    const result = await addFacultyDocumentsFromList();
    response.json({ result })
});

exports.addPrograms = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const result = await fetchAndStoreProgramsForFaculties();
  response.json({ result })
});

exports.addBranches = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const result = await fetchBranchesForAllFaculties();
  response.json({ result })
});

exports.addBranch = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const id = request.query.id;

  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }

  const result = await fetchBranchesByFacultyId(id);
  response.json({ result })
});

exports.addCourse = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const id = request.query.id;

  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }

  const result = await fetchAndStoreCoursesById(id);
  response.json({ result })
});

exports.addCourses = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const result = await fetchAndStoreCoursesForAllFaculties();
  response.json({ result })
});

exports.addTutor = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const id = request.query.id;

  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }

  const result = await fetchAndStoreTutorsForFacultiesById(id);
  response.json({ result })
});

exports.addTutors = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const result = await fetchAndStoreTutorsForFaculties();
  response.json({ result })
});