const { checkJwt } = require('../service/authenticationService');
const functions = require("firebase-functions");
const {
  getLecturesByFilterAndOptionallyDate
} = require('../service/lectureService');
const { handleErrors, validateRequestParams } = require("../utils/endpointHelpers");


/**
 * Google Cloud Function to retrieve all lectures for a specific course from a faculty's "lectures" collection.
 * This function is an HTTP-triggered endpoint that requires faculty ID and course ID to be provided in the query parameters,
 * with optional start and end times for date filtering. It handles CORS, checks if the JWT token is valid, and manages potential errors 
 * related to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty associated with the course.
 * - courseId: The ID of the course whose lectures are to be fetched.
 * - startTime: The optional start time for the date filtering, as a string.
 * - endTime: The optional end time for the date filtering, as a string.
 *
 * @param {functions.Request} request - The HTTP request object, containing the query parameters.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.getAllForCourse = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      const { facultyId, courseId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId ,courseId });
      await checkJwt(request);
      
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "courseId", courseId, startTime, endTime);
      console.log(`Found and sent lectures for course ${courseId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all lectures for a specific branch from a faculty's "lectures" collection.
* This function is an HTTP-triggered endpoint that requires faculty ID and branch ID to be provided in the query parameters,
* with optional start and end times for date filtering. It handles CORS, checks if the JWT token is valid, and manages potential errors 
* related to missing parameters, unauthorized access, or issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty associated with the branch.
* - branchId: The ID of the branch whose lectures are to be fetched.
* - startTime: The optional start time for the date filtering, as a string.
* - endTime: The optional end time for the date filtering, as a string.
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
      const { facultyId, branchId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, branchId });
      await checkJwt(request);
      
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "branches", Number(branchId), startTime, endTime);
      console.log(`Found and sent lectures for branch ${branchId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Google Cloud Function to retrieve all lectures for a specific group from a faculty's "lectures" collection.
 * This function is an HTTP-triggered endpoint that requires faculty ID and group ID to be provided in the query parameters,
 * with optional start and end times for date filtering. It handles CORS, checks if the JWT token is valid, and manages potential errors 
 * related to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty associated with the group.
 * - groupId: The ID of the group whose lectures are to be fetched.
 * - startTime: The optional start time for the date filtering, as a string.
 * - endTime: The optional end time for the date filtering, as a string.
 *
 * @param {functions.Request} request - The HTTP request object, containing the query parameters.
 * @param {functions.Response} response - The HTTP response object used to send back data or errors.
 */
exports.getAllForGroup = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      const { facultyId, groupId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, groupId });
      await checkJwt(request);
      
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "groups", Number(groupId), startTime, endTime);
      console.log(`Found and sent lectures for group ${groupId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all lectures for a specific room from a faculty's "lectures" collection.
* This function is an HTTP-triggered endpoint that requires faculty ID and room ID to be provided in the query parameters,
* with optional start and end times for date filtering. It handles CORS, checks if the JWT token is valid, and manages potential errors 
* related to missing parameters, unauthorized access, or issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty associated with the room.
* - roomId: The ID of the room whose lectures are to be fetched.
* - startTime: The optional start time for the date filtering, as a string.
* - endTime: The optional end time for the date filtering, as a string.
*
* @param {functions.Request} request - The HTTP request object, containing the query parameters.
* @param {functions.Response} response - The HTTP response object used to send back data or errors.
*/
exports.getAllForRoom = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      const { facultyId, roomId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, roomId });
      await checkJwt(request);
      
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "rooms", Number(roomId), startTime, endTime);
      console.log(`Found and sent lectures for course ${roomId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all lectures for a specific tutor from a faculty's "lectures" collection.
* This function is an HTTP-triggered endpoint that requires faculty ID and tutor ID to be provided in the query parameters,
* with optional start and end times for date filtering. It handles CORS, checks if the JWT token is valid, and manages potential errors 
* related to missing parameters, unauthorized access, or issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty associated with the tutor.
* - tutorId: The ID of the tutor whose lectures are to be fetched.
* - startTime: The optional start time for the date filtering, as a string.
* - endTime: The optional end time for the date filtering, as a string.
*
* @param {functions.Request} request - The HTTP request object, containing the query parameters.
* @param {functions.Response} response - The HTTP response object used to send back data or errors.
*/
exports.getAllForTutor = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      const { facultyId, tutorId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, tutorId });
      await checkJwt(request);
      
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "tutors", Number(tutorId), startTime, endTime);
      console.log(`Found and sent lectures for tutor ${tutorId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
