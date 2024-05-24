const { checkBasicAuth } = require('../utils/auth');
const functions = require("firebase-functions");
const {
  getAllFacultyCollectionItems,
  getItemByFacultyAndCollectionAndItemId
} = require('../service/facultyCollections');


/**
 * Google Cloud Function to retrieve a specific tutor by ID from within a specified faculty's "tutors" collection.
 * This function is an HTTP-triggered endpoint that requires the faculty ID and tutor ID to be provided in the query parameters.
 * It handles CORS and uses basic authentication. Errors are handled for missing parameters, authentication failure, or retrieval issues.
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
    response.set("Access-Control-Allow-Origin", "*");
    const facultyId = request.query.facultyId;
    const tutorId = request.query.tutorId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    } if (!tutorId) {
      response.status(400).send("No tutor ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "tutors", tutorId);
      console.log(`Found and sent tutor with id ${tutorId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find tutor: ", error);
      response.status(500).send("Failed to find tutor: " + error.message);
    }
  });


/**
* Google Cloud Function to retrieve all tutors from the "tutors" collection for a specified faculty.
* This function is an HTTP-triggered endpoint that requires the faculty ID to be provided in the query parameters.
* It handles CORS, employs basic authentication, and manages potential errors related to missing parameters,
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
    const facultyId = request.query.facultyId;

    if (!facultyId) {
      response.status(400).send("No faculty ID sent");
      return;
    }

    if (!checkBasicAuth(request)) {
      response.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await getAllFacultyCollectionItems(facultyId, "tutors");
      console.log(`Found and sent all tutors by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      console.error("Failed to find tutors for faculty: ", error);
      response.status(500).send("Failed to find tutors for faculty: " + error.message);
    }
  });
