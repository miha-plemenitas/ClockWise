const { checkJwt } = require('../service/authenticationService');
const functions = require("firebase-functions");
const {
  getAllFacultyCollectionItems,
  getItemByFacultyAndCollectionAndItemId
} = require('../service/facultyCollections');
const { handleErrors, validateRequestParams } = require("../utils/endpointHelpers");


/**
 * Google Cloud Function to retrieve a specific room by ID from within a specified faculty's "rooms" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the room ID to be provided
 * in the query parameters. It handles CORS, checks if the JWT token is valid, and addresses potential errors related
 * to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the room belongs.
 * - roomId: The ID of the room to retrieve.
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
      const { facultyId, roomId } = request.query;
      validateRequestParams({ facultyId, roomId });
      await checkJwt(request);
      
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "rooms", roomId);
      console.log(`Found and sent room with id ${roomId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all rooms from the "rooms" collection for a specified faculty.
* This function is an HTTP-triggered endpoint that requires the faculty ID to be provided in the query parameters.
* It handles CORS, employs basic authentication, and manages potential errors related to missing parameters,
* unauthorized access, or issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty whose rooms are to be fetched.
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
      
      const result = await getAllFacultyCollectionItems(facultyId, "rooms");
      console.log(`Found and sent all rooms by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
