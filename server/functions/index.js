const functions = require('firebase-functions');
const { db } = require('./firebaseAdmin');
const { performApiRequest, addFacultyDocumentsFromList } = require('./apiRequest');
const { request } = require('express');

exports.addDataFromApi = functions.https.onRequest(async (request, response) => {
  try {
    const result = await performApiRequest();
    response.json({ result });
  } catch (error) {
    console.error("Error adding data from API:", error);
    response.status(500).send(error);
  }
});

exports.addFaculties = functions.https.onRequest(async (request, response) => {
    const result = await addFacultyDocumentsFromList();
    response.json({ result })
})
