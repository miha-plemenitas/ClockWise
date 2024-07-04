const functions = require("firebase-functions");
const {
  getItemByFacultyAndCollectionAndItemId,
  getItemByFacultyAndCollectionAndFilterById
} = require('../service/facultyCollections');
const { handleErrors, validateRequestParams, checkAuthenticationandMethodForRequest } = require("../utils/endpointHelpers");


/**
 * Google Cloud Function to retrieve a specific branch by ID from within a specified faculty's "branches" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the branch ID to be provided
 * in the query parameters. It handles CORS, checks if the JWT token is valid, and addresses potential errors related
 * to missing parameters, unauthorized access, or isues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the branch belongs.
 * - branchId: The ID of the branch to retrieve.
 *
 * @param {functions.Request} request - The HTTP request object, containing the query parameters.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.get = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");
      
      const { facultyId, branchId } = request.query;
      validateRequestParams({ facultyId, branchId });

      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "branches", branchId);
      console.log(`Found and sent branch with id ${branchId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
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
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, programId } = request.query;
      validateRequestParams({ facultyId, programId });

      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "branches", "programId", Number(programId));
      console.log(`Found and sent all branches by faculty with faculty id ${facultyId} and program id ${programId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
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
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
  
    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, programId, year } = request.query;
      validateRequestParams({ facultyId, programId, year });

      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "branches", "programId", Number(programId), year);
      console.log(`Found and sent all branches by faculty with faculty id ${facultyId}, program id ${programId} and year ${year}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
