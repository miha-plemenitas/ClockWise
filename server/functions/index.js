const functions = require('firebase-functions');
const { db } = require('./firebaseAdmin');
const { addFacultyDocumentsFromList, fetchAndStoreProgramsForFaculties, fetchAndStoreBranchesForPrograms, fetchAndStoreBranchesForProgram, fetchAndStoreCoursesById, 
  fetchAndStoreCoursesForAllFaculties } = require('./apiRequest');
const { request } = require('express');


exports.addFaculties = functions.https.onRequest(async (request, response) => {
    const result = await addFacultyDocumentsFromList();
    response.json({ result })
});

exports.addPrograms = functions.https.onRequest(async (request, response) => {
  const result = await fetchAndStoreProgramsForFaculties();
  response.json({ result })
});

exports.addBranches = functions.https.onRequest(async (request, response) => {
  const result = await fetchAndStoreBranchesForPrograms();
  response.json({ result })
});

exports.addBranch = functions.https.onRequest(async (request, response) => {
  const id = request.query.id;

  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }

  const result = await fetchAndStoreBranchesForProgram(id);
  response.json({ result })
});

exports.addCourse = functions.https.onRequest(async (request, response) => {
  const id = request.query.id;

  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }

  const result = await fetchAndStoreCoursesById(id);
  response.json({ result })
});

exports.addCourses = functions.https.onRequest(async (request, response) => {
  const result = await fetchAndStoreCoursesForAllFaculties();
  response.json({ result })
});