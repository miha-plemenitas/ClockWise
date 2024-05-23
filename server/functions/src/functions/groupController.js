const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  getItemByFacultyAndCollectionAndFilterById,
  getItemByFacultyAndCollectionAndItemId
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
    const groupId = request.query.groupId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!groupId) {
      response.status(400).send("No group sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "groups", groupId);
      console.log(`Found and sent group with id ${groupId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding group:", error);
      response.status(500).send("Failed to find group: " + error.message);
    }
  });


exports.getAllForBranch = functions
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
      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "groups", "branchId", Number(branchId));
      console.log(`Found and sent all groups by faculty with faculty ${facultyId} and branch ${branchId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find groups: ", error);
      response.status(500).send("Failed to find groups: " + error.message);
    }
  });
