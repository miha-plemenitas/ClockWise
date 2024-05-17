const functions = require("firebase-functions");
const { addFacultyDocumentsFromList, fetchProgramsForAllFaculties, fetchData } = require("./apiRequest");
const { checkBasicAuth } = require("./utility");


exports.addFaculties = functions.
  region("europe-west3").
  runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).
  https.
  onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await addFacultyDocumentsFromList();
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error adding faculties:", error);
      response.status(500).send("Failed to add faculties");
    }
  });


exports.addPrograms = functions.
  region("europe-west3").
  runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).
  https.
  onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await fetchProgramsForAllFaculties();
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error adding programs:", error);
      response.status(500).send("Failed to add programs");
    }
  });


exports.addBranches = functions.
  region("europe-west3").
  runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).
  https.
  onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await fetchData(id, "branches");
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error adding programs:", error);
      response.status(500).send("Failed to add programs");
    }
  });


exports.addCourses = functions.
  region("europe-west3").
  runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).
  https.
  onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await fetchData(id, "courses");
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error adding programs:", error);
      response.status(500).send("Failed to add programs");
    }
  });


exports.addTutors = functions.
  region("europe-west3").
  runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).
  https.
  onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await fetchData(id, "tutors");
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error adding programs:", error);
      response.status(500).send("Failed to add programs");
    }
  });


exports.addGroups = functions.
  region("europe-west3").
  runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).
  https.
  onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await fetchData(id, "groups");
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error adding programs:", error);
      response.status(500).send("Failed to add groups");
    }
  });


exports.addLectures = functions.
  region("europe-west3").
  runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).
  https.
  onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await fetchData(id, "lectures");
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error adding programs:", error);
      response.status(500).send("Failed to add lectures");
    }
  });


exports.addRooms = functions
  .region("europe-west3")
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await fetchData(id, "rooms");
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error adding programs:", error);
      response.status(500).send("Failed to add rooms");
    }
  });
