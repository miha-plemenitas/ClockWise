const functions = require("firebase-functions");
const {
  getAllFaculties,
  getFacultyById
} = require('../service/facultyService');
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");


/**
 * Google Cloud Function to retrieve all faculties from the database.
 * This function is an HTTP-triggered endpoint that handles CORS and checks for JWT token.
 * It addresses potential errors related to unauthorized access or issues during data retrieval.
 *
 * @param {functions.Request} request - The HTTP request object, which includes authentication details.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.getAll = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const result = await getAllFaculties();
      console.log("Found and sent all faculties");
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve a specific faculty by its ID from the "faculties" collection.
* This function is an HTTP-triggered endpoint that requires the faculty ID to be provided in the query parameters.
* It handles CORS, checks if the JWT token is valid, and manages potential errors related to missing parameters,
* unauthorized access, or issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty to retrieve.
*
* @param {functions.Request} request - The HTTP request object, containing the query parameters.
* @param {functions.Response} response - The HTTP response object used to send back data or errors.
*/
exports.getById = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId } = request.query;
      validateRequestParams({ facultyId });

      const result = await getFacultyById(facultyId);
      console.log(`Found and sent faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
