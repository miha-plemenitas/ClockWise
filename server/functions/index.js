const functions = require('firebase-functions');
const { db } = require('./firebaseAdmin');
const { performApiRequest } = require('./apiRequest');

exports.addDataFromApi = functions.https.onRequest(async (request, response) => {
  try {
    const result = await performApiRequest();
    response.json({ result });
  } catch (error) {
    console.error("Error adding data from API:", error);
    response.status(500).send(error);
  }
});
