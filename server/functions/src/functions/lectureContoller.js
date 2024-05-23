const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  getLecturesByFilterAndOptionallyDate
} = require('../service/lectureService');


exports.getLecturesByFacultyIdAndCourseId = functions
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
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "course", courseId, startTime, endTime);
      console.log(`Found and sent course with id ${courseId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Error finding course:", error);
      response.status(500).send("Failed to find course: " + error.message);
    }
  });
