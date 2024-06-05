const { checkJwt } = require('../service/authenticationService');
const functions = require("firebase-functions");
const {
  getAllFacultyCollectionItems,
  getItemByFacultyAndCollectionAndItemId
} = require('../service/facultyCollections');
const { handleErrors, validateRequestParams } = require("../utils/endpointHelpers");


/**
 * Google Cloud Function to retrieve a specific tutor by ID from within a specified faculty's "tutors" collection.
 * This function is an HTTP-triggered endpoint that requires the faculty ID and tutor ID to be provided in the query parameters.
 * It handles CORS and checks if the JWT token is valid. Errors are handled for missing parameters, authentication failure, or retrieval issues.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the tutor belongs.
 * - tutorId: The ID of the tutor to retrieve.
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
    response.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      const { facultyId, tutorId } = request.query;
      validateRequestParams({ facultyId, tutorId })
      await checkJwt(request);
      
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "tutors", tutorId);
      console.log(`Found and sent tutor with id ${tutorId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all tutors from the "tutors" collection for a specified faculty.
* This function is an HTTP-triggered endpoint that requires the faculty ID to be provided in the query parameters.
* It handles CORS, checks if the JWT token is valid, and manages potential errors related to missing parameters,
* unauthorized access, or issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty whose tutors are to be fetched.
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
      validateRequestParams({ facultyId })
      await checkJwt(request);
      
      const result = await getAllFacultyCollectionItems(facultyId, "tutors");
      console.log(`Found and sent all tutors by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
