const functions = require("firebase-functions");
const { checkJwt } = require('../service/authenticationService');
const {
  getItemByFacultyAndCollectionAndItemId,
  getItemByFacultyAndCollectionAndFilterById
} = require('../service/facultyCollections');


/**
 * Google Cloud Function to retrieve a specific branch by ID from within a specified faculty's "branches" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the branch ID to be provided
 * in the query parameters. It handles CORS, checks if the JWT token is valid,, and addresses potential errors related
 * to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the branch belongs.
 * - branchId: The ID of the branch to retrieve.
 *
 * @param {functions.Request} request - The HTTP request object, containing the query parameters.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.getOneById = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
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

    try {
      await checkJwt(request);

      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "branches", branchId);
      console.log(`Found and sent branch with id ${branchId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      if (error === 'TokenExpired') {
        response.status(401).send("Token has expired");
      } else if (error === 'Unauthorized') {
        response.status(401).send("Unauthorized");
      } else {
        console.error("Failed to find branch: ", error);
        response.status(500).send("Failed to find branch: " + error.message);
      }
    }
  });


/**
 * Google Cloud Function to retrieve all branches associated with a specific program from a faculty's "branches" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the program ID to be provided in the query parameters.
 * It handles CORS, checks if the JWT token is valid,, and manages potential errors related to missing parameters, unauthorized access, or 
 * issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty associated with the program.
 * - programId: The ID of the program whose branches are to be fetched.
 *
 * @param {functions.Request} request - The HTTP request object, containing the query parameters.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.getAllForProgram = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
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

    try {
      await checkJwt(request);

      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "branches", "programId", Number(programId));
      console.log(`Found and sent all branches by faculty with faculty id ${facultyId} and program id ${programId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      if (error === 'TokenExpired') {
        response.status(401).send("Token has expired");
      } else if (error === 'Unauthorized') {
        response.status(401).send("Unauthorized");
      } else {
        console.error("Failed to find branches: ", error);
        response.status(500).send("Failed to find branches: " + error.message);
      }
    }
  });


/**
 * Google Cloud Function to retrieve all branches associated with a specific program and year from a faculty's "branches" collection.
 * This function is an HTTP-triggered endpoint that requires the faculty ID, program ID, and year to be provided in the query parameters.
 * It handles CORS, checks if the JWT token is valid,, and manages potential errors related to missing parameters, unauthorized access, or 
 * issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty associated with the program.
 * - programId: The ID of the program whose branches are to be fetched.
 * - year: The year for which the branches are to be fetched.
 *
 * @param {functions.Request} request - The HTTP request object, containing the query parameters.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.getAllForProgramYear = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
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

    try {
      await checkJwt(request);

      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "branches", "programId", Number(programId), year);
      console.log(`Found and sent all branches by faculty with faculty id ${facultyId}, program id ${programId} and year ${year}`);
      response.status(200).json({ result: result });
    } catch (error) {
      if (error === 'TokenExpired') {
        response.status(401).send("Token has expired");
      } else if (error === 'Unauthorized') {
        response.status(401).send("Unauthorized");
      } else {
        console.error("Failed to find branches: ", error);
        response.status(500).send("Failed to find branches: " + error.message);
      }
    }
  });
