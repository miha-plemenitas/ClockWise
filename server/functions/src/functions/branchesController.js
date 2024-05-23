const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  getItemByFacultyAndCollectionAndItemId,
  getItemByFacultyAndCollectionAndFilterById
} = require('../service/facultyCollections');

exports.getOneById = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const branchId = request.query.branchId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!branchId) {
      response.status(400).send("No branch sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "branches", branchId);
      console.log(`Found and sent branch with id ${branchId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find branch: ", error);
      response.status(500).send("Failed to find branch: " + error.message);
    }
  });


exports.getAllForProgram = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const programId = request.query.programId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!programId) {
      response.status(400).send("No program sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "branches", "programId", Number(programId));
      console.log(`Found and sent all branches by faculty with faculty id ${facultyId} and program id ${programId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find branches: ", error);
      response.status(500).send("Failed to find branches: " + error.message);
    }
  });


exports.getAllForProgramYear = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const programId = request.query.programId;
    const year = request.query.year;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!programId) {
      response.status(400).send("No program sent");
      return;
    } if (!year) {
      response.status(400).send("No year sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "branches", "programId", Number(programId), year);
      console.log(`Found and sent all branches by faculty with faculty id ${facultyId}, program id ${programId} and year ${year}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find branches: ", error);
      response.status(500).send("Failed to find branches: " + error.message);
    }
  });
