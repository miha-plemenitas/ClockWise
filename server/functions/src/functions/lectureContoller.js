const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  getLecturesByFilterAndOptionallyDate
} = require('../service/lectureService');


exports.getAllForCourse = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const startTime = request.query.startTime;
    const endTime = request.query.endTime;
    const courseId = request.query.courseId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!courseId) {
      response.status(400).send("No course ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "courseId", courseId, startTime, endTime);
      console.log(`Found and sent lectures for course ${courseId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding lectures:", error);
      response.status(500).send("Failed to find lectures: " + error.message);
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
    const startTime = request.query.startTime;
    const endTime = request.query.endTime;
    const branchId = request.query.branchId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!branchId) {
      response.status(400).send("No branch ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "branches", Number(branchId), startTime, endTime);
      console.log(`Found and sent lectures for branch ${branchId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding lectures:", error);
      response.status(500).send("Failed to find lectures: " + error.message);
    }
  });


exports.getAllForGroup = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const startTime = request.query.startTime;
    const endTime = request.query.endTime;
    const groupId = request.query.groupId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!groupId) {
      response.status(400).send("No group ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "groups", Number(groupId), startTime, endTime);
      console.log(`Found and sent lectures for group ${groupId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding lectures:", error);
      response.status(500).send("Failed to find lectures: " + error.message);
    }
  });


exports.getAllForRoom = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const startTime = request.query.startTime;
    const endTime = request.query.endTime;
    const roomId = request.query.roomId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!roomId) {
      response.status(400).send("No room ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "rooms", Number(roomId), startTime, endTime);
      console.log(`Found and sent lectures for course ${roomId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding lectures:", error);
      response.status(500).send("Failed to find lectures: " + error.message);
    }
  });


exports.getAllForTutor = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const startTime = request.query.startTime;
    const endTime = request.query.endTime;
    const tutorId = request.query.tutorId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!tutorId) {
      response.status(400).send("No tutor ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "tutors", Number(tutorId), startTime, endTime);
      console.log(`Found and sent lectures for tutor ${tutorId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding lectures:", error);
      response.status(500).send("Failed to find lectures: " + error.message);
    }
  });
