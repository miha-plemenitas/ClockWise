const functions = require("firebase-functions");
const {
  getAllFacultyCollectionItems,
  getItemByFacultyAndCollectionAndItemId
} = require('../service/facultyCollections');
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");


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

      const { facultyId, programId } = request.query;
      validateRequestParams({ facultyId, programId });
      
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "programs", programId);
      console.log(`Found and sent program with id ${programId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
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
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    try {      
      await checkAuthenticationandMethodForRequest(request, "GET");
      
      const { facultyId } = request.query;
      validateRequestParams({ facultyId });
      
      const result = await getAllFacultyCollectionItems(facultyId, "programs");
      console.log(`Found and sent all programs by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
