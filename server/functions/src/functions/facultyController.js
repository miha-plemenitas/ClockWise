const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  getAllFaculties,
  getFacultyById
} = require('../service/facultyService');


exports.getAll = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getAllFaculties();
      console.log("Found and sent all faculties");
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding faculties:", error);
      response.status(500).send("Error finding faculties: " + error.message);
    }
  });


exports.getById = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getFacultyById(facultyId);
      console.log(`Found and sent faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find faculty:", error);
      response.status(500).send("Failed to find faculty: " + error.message);
    }
  });
