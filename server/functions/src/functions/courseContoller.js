const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  getAllFacultyCollectionItems,
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
    const courseId = request.query.courseId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!courseId) {
      response.status(400).send("No course sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "courses", courseId);
      console.log(`Found and sent course with id ${courseId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find course: ", error);
      response.status(500).send("Failed to find course: " + error.message);
    }
  });


exports.getAllForFaculty = functions
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
      const result = await getAllFacultyCollectionItems(facultyId, "courses");
      console.log(`Found and sent all courses by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find courses for faculty: ", error);
      response.status(500).send("Failed to find courses for faculty: " + error.message);
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
      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "courses", "programId", Number(programId));
      console.log(`Found and sent coures for program ${programId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding courses:", error);
      response.status(500).send("Failed to find courses: " + error.message);
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
      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "courses", "branchId", Number(branchId));
      console.log(`Found and sent courses for branch ${branchId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding courses:", error);
      response.status(500).send("Failed to find courses: " + error.message);
    }
  });
