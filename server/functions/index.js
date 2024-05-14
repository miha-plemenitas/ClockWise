const functions = require('firebase-functions');
const { db } = require('./firebaseAdmin');
const { addFacultyDocumentsFromList, fetchAndStoreProgramsForFaculties, fetchDataByFacultyId, fetchDataForAllFaculties } = require('./apiRequest');
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
  const result = await fetchDataForAllFaculties("branches");
  response.json({ result })
});


exports.addBranch = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const id = request.query.id;

  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }

  const result = await fetchDataByFacultyId(id, "branches");
  response.json({ result })
});


exports.addCourse = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const id = request.query.id;

  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }

  const result = await fetchDataByFacultyId(id, "courses");
  response.json({ result })
});


exports.addCourses = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const result = await fetchDataForAllFaculties("courses");
  response.json({ result })
});


exports.addTutor = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const id = request.query.id;

  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }

  const result = await fetchDataByFacultyId(id, "tutors");
  response.json({ result })
});


exports.addTutors = functions.region('europe-west3').https.onRequest(async (request, response) => {
  const result = await fetchDataForAllFaculties("tutors");
  response.json({ result })
});
