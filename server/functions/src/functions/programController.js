const { checkJwt } = require('../service/authenticationService');
const functions = require("firebase-functions");
const {
  getAllFacultyCollectionItems,
  getItemByFacultyAndCollectionAndItemId
} = require('../service/facultyCollections');


/**
 * Google Cloud Function to retrieve a specific program by ID from within a specified faculty's "programs" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the program ID to be provided
 * in the query parameters. It handles CORS, checks if the JWT token is valid, and addresses potential errors related
 * to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the program belongs.
 * - programId: The ID of the program to retrieve.
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
    const programId = request.query.programId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!programId) {
      response.status(400).send("No program ID sent");
      return;
    }

    try {
      await checkJwt(request);
      
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "programs", programId);
      console.log(`Found and sent program with id ${programId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      if (error === 'TokenExpired') {
        response.status(401).send("Token has expired");
      } else if (error === 'Unauthorized') {
        response.status(401).send("Unauthorized");
      } else {
        console.error("Failed to find program: ", error);
        response.status(500).send("Failed to find program: " + error.message);
      }
    }
  });


/**
 * Google Cloud Function to retrieve all programs from the "programs" collection for a specified faculty.
 * This function is an HTTP-triggered endpoint that requires the faculty ID to be provided in the query parameters.
 * It handles CORS, employs basic authentication, and manages potential errors related to missing parameters,
 * unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty whose programs are to be fetched.
 *
 * @param {functions.Request} request - The HTTP request object, containing the query parameters.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.getAllForFaculty = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    }

    try {
      await checkJwt(request);
      
      const result = await getAllFacultyCollectionItems(facultyId, "programs");
      console.log(`Found and sent all programs by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      if (error === 'TokenExpired') {
        response.status(401).send("Token has expired");
      } else if (error === 'Unauthorized') {
        response.status(401).send("Unauthorized");
      } else {
        console.error("Failed to find programs for faculty: ", error);
        response.status(500).send("Failed to find programs for faculty: " + error.message);
      }
    }
  });
