const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  getItemByFacultyAndCollectionAndFilterById,
  getItemByFacultyAndCollectionAndItemId
} = require('../service/facultyCollections');


/**
 * Google Cloud Function to retrieve a specific group by ID from within a specified faculty's "groups" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the group ID to be provided
 * in the query parameters. It handles CORS, uses basic authentication, and addresses potential errors related
 * to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the group belongs.
 * - groupId: The ID of the group to retrieve.
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


  /**
 * Google Cloud Function to retrieve all groups associated with a specific branch from a faculty's "groups" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the branch ID to be provided in the query parameters.
 * It handles CORS, uses basic authentication, and manages potential errors related to missing parameters, unauthorized access, or 
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
