const functions = require("firebase-functions");
const {
  getItemByFacultyAndCollectionAndFilterById,
  getItemByFacultyAndCollectionAndItemId
} = require('../service/facultyCollections');
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");


/**
 * Google Cloud Function to retrieve a specific group by ID from within a specified faculty's "groups" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the group ID to be provided
 * in the query parameters. It handles CORS, checks if the JWT token is valid, and addresses potential errors related
 * to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the group belongs.
 * - groupId: The ID of the group to retrieve.
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
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, groupId } = request.query;
      validateRequestParams({ facultyId, groupId });
      
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "groups", groupId);
      console.log(`Found and sent group with id ${groupId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


  /**
 * Google Cloud Function to retrieve all groups associated with a specific branch from a faculty's "groups" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the branch ID to be provided in the query parameters.
 * It handles CORS, checks if the JWT token is valid, and manages potential errors related to missing parameters, unauthorized access, or 
 * issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty associated with the branch.
 * - branchId: The ID of the branch whose groups are to be fetched.
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
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, branchId } = request.query;
      validateRequestParams({ facultyId, branchId });
      
      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "groups", "branchId", Number(branchId));
      console.log(`Found and sent all groups by faculty with faculty ${facultyId} and branch ${branchId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
