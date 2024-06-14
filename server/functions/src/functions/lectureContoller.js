const functions = require("firebase-functions");
const {
  getLecturesByFilterAndOptionallyDate,
  findFreeSlots,
  filterLectures,
  prepareSearchFilters
} = require('../service/lectureService');
const { handleErrors, validateRequestParams, checkAuthenticationandMethodForRequest } = require("../utils/endpointHelpers");
const { getLectureCollectionName } = require("../utils/apiHelpers");


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
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, courseId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, courseId });

      const collectionName = getLectureCollectionName(request);

      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "courseId", courseId, startTime, endTime, collectionName);
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
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, branchId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, branchId });



      console.log(`Got request for all lectures for faculty ${facultyId} and branch ${branchId}, with ${startTime} and ${endTime}`);
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "branch_ids", Number(branchId), startTime, endTime, "lectures");
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

      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "group_ids", Number(groupId), startTime, endTime, "lectures");
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
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, roomId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, roomId });

      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "room_ids", Number(roomId), startTime, endTime, "lectures");
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
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, tutorId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, tutorId });

      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "tutor_ids", Number(tutorId), startTime, endTime, "lectures");
      console.log(`Found and sent lectures for tutor ${tutorId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.findAvailable = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, groupId, startTime, endTime, roomId, tutorId } = request.query;
      validateRequestParams({ facultyId, startTime, endTime });

      let events = []
      let filteredLectures;

      if (groupId) {
        filteredLectures = await getLecturesByFilterAndOptionallyDate(facultyId, "group_ids", Number(groupId), startTime, endTime, "lectures");
        filteredLectures = Object.values(filteredLectures);
        events.push(...filteredLectures);
      }
      if (roomId) {
        filteredLectures = await getLecturesByFilterAndOptionallyDate(facultyId, "room_ids", Number(roomId), startTime, endTime, "lectures");
        filteredLectures = Object.values(filteredLectures);
        events.push(...filteredLectures);
      }

      //TODO: Add start and end
      const result = findFreeSlots(events);

      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
