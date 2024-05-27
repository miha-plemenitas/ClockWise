const { checkJwt } = require('../service/authenticationService');
const functions = require("firebase-functions");
const {
  getAllFacultyCollectionItems,
  getItemByFacultyAndCollectionAndItemId,
  getItemByFacultyAndCollectionAndFilterById
} = require('../service/facultyCollections');
const { handleErrors, validateRequestParams } = require("../utils/endpointHelpers");


/**
 * Google Cloud Function to retrieve a specific course by ID from within a specified faculty's "courses" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the course ID to be provided
 * in the query parameters. It handles CORS, checks if the JWT token is valid, and addresses potential errors related
 * to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the course belongs.
 * - courseId: The ID of the course to retrieve.
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

    try {
      const { facultyId, courseId } = request.query;
      validateRequestParams({ facultyId, courseId });
      await checkJwt(request);
      
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "courses", courseId);
      console.log(`Found and sent course with id ${courseId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all courses from the "courses" collection for a specified faculty.
* This function is an HTTP-triggered endpoint that requires the faculty ID to be provided in the query parameters.
* It handles CORS, check for JWT token, and manages potential errors related to missing parameters,
* unauthorized access, or issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty whose courses are to be fetched.
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

    try {
      const { facultyId } = request.query;
      validateRequestParams({ facultyId });
      await checkJwt(request);
      
      const result = await getAllFacultyCollectionItems(facultyId, "courses");
      console.log(`Found and sent all courses by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all courses associated with a specific program from a faculty's "courses" collection.
* This function is an HTTP-triggered endpoint that requires both the faculty ID and the program ID to be provided in the query parameters.
* It handles CORS, checks if the JWT token is valid, and manages potential errors related to missing parameters, unauthorized access, or 
* issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty associated with the program.
* - programId: The ID of the program whose courses are to be fetched.
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

    try {
      const { facultyId, programId } = request.query;
      validateRequestParams({ facultyId, programId });
      await checkJwt(request);
      
      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "courses", "programId", Number(programId));
      console.log(`Found and sent coures for program ${programId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Google Cloud Function to retrieve all courses associated with a specific branch from a faculty's "courses" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the branch ID to be provided in the query parameters.
 * It handles CORS, checks if the JWT token is valid, and manages potential errors related to missing parameters, unauthorized access, or 
 * issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty associated with the branch.
 * - branchId: The ID of the branch whose courses are to be fetched.
 *
 * @param {functions.Request} request - The HTTP request object, containing the query parameters.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.getAllForBranch = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      const { facultyId, branchId } = request.query;
      validateRequestParams({ facultyId, branchId });
      await checkJwt(request);
      
      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "courses", "branchId", Number(branchId));
      console.log(`Found and sent courses for branch ${branchId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });