const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  selectGetItemCollectionFunction,
  getAllFaculties,
  getFacultyById,
  getItemByFacultyAndCollectionAndFilterById,
  getItemByFacultyAndCollectionAndItemId
} = require('../service/facultyService');


exports.getAllFaculties = functions
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


exports.getFaculty = functions
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


exports.getProgramByFacultyIdAndProgramId = functions
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
      response.status(400).send("No program ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await selectGetItemCollectionFunction(facultyId, "programs", programId);
      console.log(`Found and sent program with id ${programId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find program: ", error);
      response.status(500).send("Failed to find program: " + error.message);
    }
  });


exports.getAllProgramsByFacultyId = functions
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
      const result = await selectGetItemCollectionFunction(facultyId, "programs");
      console.log(`Found and sent all programs by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find programs for faculty: ", error);
      response.status(500).send("Failed to find programs for faculty: " + error.message);
    }
  });


exports.getAllTutorsByFacultyId = functions
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
      const result = await selectGetItemCollectionFunction(facultyId, "tutors");
      console.log(`Found and sent all tutors by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find tutors for faculty: ", error);
      response.status(500).send("Failed to find tutors for faculty: " + error.message);
    }
  });


exports.getTutorByFacultyIdAndTutorId = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
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
      const result = await selectGetItemCollectionFunction(facultyId, "tutors", tutorId);
      console.log(`Found and sent tutor with id ${tutorId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find tutor: ", error);
      response.status(500).send("Failed to find tutor: " + error.message);
    }
  });


exports.getAllCoursesByFacultyId = functions
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
      const result = await selectGetItemCollectionFunction(facultyId, "courses");
      console.log(`Found and sent all courses by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find courses for faculty: ", error);
      response.status(500).send("Failed to find courses for faculty: " + error.message);
    }
  });


exports.getCoursesByFacultyIdAndCourseId = functions
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
      const result = await selectGetItemCollectionFunction(facultyId, "courses", courseId);
      console.log(`Found and sent course with id ${courseId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find course: ", error);
      response.status(500).send("Failed to find course: " + error.message);
    }
  });


exports.getAllRoomsByFacultyId = functions
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
      const result = await selectGetItemCollectionFunction(facultyId, "rooms");
      console.log(`Found and sent all rooms by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find rooms for faculty: ", error);
      response.status(500).send("Failed to find rooms for faculty: " + error.message);
    }
  });


exports.getRoomsByFacultyIdAndRoomId = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const roomId = request.query.roomId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!roomId) {
      response.status(400).send("No room sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await selectGetItemCollectionFunction(facultyId, "rooms", roomId);
      console.log(`Found and sent room with id ${roomId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find room: ", error);
      response.status(500).send("Failed to find room: " + error.message);
    }
  });


exports.getAllBranchesByFacultyIdAndProgramId = functions
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


exports.getAllBranchesByFacultyIProgramIdAndYear = functions
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


exports.getBranchesByFacultyIdAndBranchId = functions
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


exports.getAllGroupsByFacultyIdAndBranchId = functions
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


exports.getGroupByFacultyIdAndGroupId = functions
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


exports.getCoursesByFacultyIdAndProgramId = functions
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


exports.getCoursesByFacultyIdAndBranchId = functions
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


exports.getCourseByFacultyIdAndCourseId = functions
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
      console.error("Error finding course:", error);
      response.status(500).send("Failed to find course: " + error.message);
    }
  });