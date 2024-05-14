const functions = require('firebase-functions');
const { db } = require('./firebaseAdmin');
const { addFacultyDocumentsFromList, fetchProgramsForAllFaculties, fetchDataByFacultyId, fetchDataForAllFaculties } = require('./apiRequest');
const { request } = require('express');
const { sendErrorResponse, sendSuccessResponse, checkBasicAuth } = require('./utility');


exports.addFaculties = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  try {
    const result = await addFacultyDocumentsFromList();
    sendSuccessResponse(response, result);
  } catch (error) {
    console.error('Error adding faculties:', error);
    sendErrorResponse(response, 500, 'Failed to add faculties');
  }
});


exports.addPrograms = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  try {
    const result = await fetchProgramsForAllFaculties();
    sendSuccessResponse(response, result);
  } catch (error) {
    console.error('Error adding programs:', error);
    sendErrorResponse(response, 500, 'Failed to add programs');
  }
});


exports.addBranches = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  try {
    const result = await fetchDataForAllFaculties("branches");
    sendSuccessResponse(response, result);
  } catch (error) {
    console.error('Error adding programs:', error);
    sendErrorResponse(response, 500, 'Failed to add programs');
  }
});


exports.addBranch = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  const id = request.query.id;
  if (!id) {
    sendErrorResponse(response, 400, 'No ID provided');
    return;
  }
  try {
    const result = await fetchDataByFacultyId(id, "branches");
    sendSuccessResponse(response, result);
  } catch (error) {
    console.error('Error fetching branches for faculty:', error);
    sendErrorResponse(response, 500, 'Failed to fetch branches');
  }
});


exports.addCourse = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  const id = request.query.id;
  if (!id) {
    sendErrorResponse(response, 400, 'No ID provided');
    return;
  }
  try {
    const result = await fetchDataByFacultyId(id, "courses");
    sendSuccessResponse(response, result);
  } catch (error) {
    console.error('Error fetching branches for faculty:', error);
    sendErrorResponse(response, 500, 'Failed to fetch branches');
  }
});


exports.addCourses = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  try {
    const result = await fetchDataForAllFaculties("courses");
    sendSuccessResponse(response, result);
  } catch (error) {
    console.error('Error adding programs:', error);
    sendErrorResponse(response, 500, 'Failed to add programs');
  }
});


exports.addTutor = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  const id = request.query.id;
  if (!id) {
    sendErrorResponse(response, 400, 'No ID provided');
    return;
  }
  try {
    const result = await fetchDataByFacultyId(id, "tutors");
    sendSuccessResponse(response, result);
  } catch (error) {
    console.error('Error fetching branches for faculty:', error);
    sendErrorResponse(response, 500, 'Failed to fetch branches');
  }
});


exports.addTutors = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  try {
    const result = await fetchDataForAllFaculties("tutors");
    sendSuccessResponse(response, result);
  } catch (error) {
    console.error('Error adding programs:', error);
    sendErrorResponse(response, 500, 'Failed to add programs');
  }
});
