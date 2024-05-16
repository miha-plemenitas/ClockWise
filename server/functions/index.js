const functions = require('firebase-functions');
const { db } = require('./firebaseAdmin');
const { addFacultyDocumentsFromList, fetchProgramsForAllFaculties, fetchDataByFacultyId, fetchDataForAllFaculties } = require('./apiRequest');
const { request } = require('express');
const { checkBasicAuth } = require('./utility');


exports.addFaculties = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  try {
    const result = await addFacultyDocumentsFromList();
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error adding faculties:', error);
    response.status(500).send('Failed to add faculties');
  }
});


exports.addPrograms = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  try {
    const result = await fetchProgramsForAllFaculties();
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error adding programs:', error);
    response.status(500).send('Failed to add programs');
  }
});


exports.addBranches = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  try {
    const result = await fetchDataForAllFaculties("branches");
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error adding programs:', error);
    response.status(500).send('Failed to add programs');
  }
});


exports.addBranch = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  const id = request.query.id;
  if (!id) {
    response.status(400).send(response, 400, 'No ID provided');
    return;
  }
  try {
    const result = await fetchDataByFacultyId(id, "branches");
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error fetching branches for faculty:', error);
    response.status(500).send('Failed to fetch branches');
  }
});


exports.addCourse = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  const id = request.query.id;
  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }
  try {
    const result = await fetchDataByFacultyId(id, "courses");
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error fetching branches for faculty:', error);
    response.status(500).send('Failed to fetch branches');
  }
});


exports.addCourses = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  try {
    const result = await fetchDataForAllFaculties("courses");
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error adding programs:', error);
    response.status(500).send('Failed to add programs');
  }
});


exports.addTutor = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  const id = request.query.id;
  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }
  try {
    const result = await fetchDataByFacultyId(id, "tutors");
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error fetching branches for faculty:', error);
    response.status(500).send('Failed to fetch tutors');
  }
});


exports.addTutors = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  try {
    const result = await fetchDataForAllFaculties("tutors");
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error adding programs:', error);
    response.status(500).send('Failed to add programs');
  }
});


exports.addGroup = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  const id = request.query.id;
  if (!id) {
    response.status(400).send('No ID provided');
    return;
  }
  try {
    const result = await fetchDataByFacultyId(id, "groups");
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error fetching branches for faculty:', error);
    response.status(500).send('Failed to fetch groups');
  }
});


exports.addGroupsForAll = functions.region('europe-west3').https.onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (!checkBasicAuth(request)) {
    response.status(401).send('Unauthorized');
    return;
  }

  try {
    const result = await fetchDataForAllFaculties("groups");
    response.status(200).json({ result: result });
  } catch (error) {
    console.error('Error adding programs:', error);
    response.status(500).send('Failed to add groups');
  }
});