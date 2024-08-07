const functions = require("firebase-functions");
const {
  getLecturesByFilterAndOptionallyDate,
  findAndFormatFreeSlots,
  filterLectures,
  getLecturesByArrayContainsAny,
  findLectureForArrayOfItems,
  findAndFormatFreeSlotsForObjects,
  getRoomsBiggerThan,
  saveLecture,
  updateLecture,
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
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');

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
    response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, branchId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, branchId });

      const collectionName = getLectureCollectionName(request);

      console.log(`Got request for all lectures for faculty ${facultyId} and branch ${branchId}, with ${startTime} and ${endTime}`);
      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "branch_ids", Number(branchId), startTime, endTime, collectionName);
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
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');

    try {
      const { facultyId, groupId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, groupId });

      const collectionName = getLectureCollectionName(request);

      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "group_ids", Number(groupId), startTime, endTime, collectionName);
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
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, roomId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, roomId });

      const collectionName = getLectureCollectionName(request);

      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "room_ids", Number(roomId), startTime, endTime, collectionName);
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
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, tutorId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, tutorId });

      const collectionName = getLectureCollectionName(request);

      const result = await getLecturesByFilterAndOptionallyDate(facultyId, "tutor_ids", Number(tutorId), startTime, endTime, collectionName);
      console.log(`Found and sent lectures for tutor ${tutorId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Defines a Firebase Cloud Function deployed in the "europe-west3" region, intended to handle GET requests for finding available lecture slots.
 * The function configures CORS to allow requests from all origins. It processes the request after validating authentication and the required 
 * parameters, which include facultyId, startTime, endTime, groupId, tutorId, and roomId. These parameters are used to filter and determine available time slots 
 * within a specified range.
 *
 * @param {functions.https.Request} request - The HTTP request object from Firebase, containing facultyId, startTime, and endTime in the query.
 * These parameters specify the faculty to filter lectures for and the time range within which to find available slots.
 * @param {functions.Response} response - The response object used to send back the HTTP response. If available time slots are found,
 * they are returned in the response; otherwise, an appropriate error response is managed.
 * @returns {Promise<void>} A promise that resolves when the available slots have been successfully calculated and sent back,
 * or rejects if an error occurs, with error handling managed internally.
 */
exports.findAvailableByIds = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, startTime, endTime } = request.query;
      validateRequestParams({ facultyId, startTime, endTime });

      const events = await filterLectures(facultyId, request, startTime, endTime);
      const result = findAndFormatFreeSlots(events, startTime, endTime);

      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.findAvailableRoomSizeAndGroupIds = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId, startTime, endTime, roomSize, groupIds } = request.query;
      validateRequestParams({ facultyId, startTime, endTime, roomSize });

      let groupLectures = [];
      if (typeof groupIds !== 'undefined') {
        let groupArray = groupIds.split("_").map(Number);
        groupLectures = await getLecturesByArrayContainsAny(facultyId, "group_ids", groupArray, startTime, endTime, "lectures");
      }

      const rooms = await getRoomsBiggerThan(facultyId, Number(roomSize));
      const roomsWithLectures = await findLectureForArrayOfItems(rooms, facultyId, "room_ids", startTime, endTime, groupLectures);
      const result = await findAndFormatFreeSlotsForObjects(roomsWithLectures, startTime, endTime);

      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.add = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const { facultyId } = request.query;
      validateRequestParams({ facultyId });

      let lecture = await saveLecture(facultyId, request.body)
      console.log(`Added a lecture with id ${lecture.id} to faculty ${facultyId}`);
      response.status(200).json({ result: lecture });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.update = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
  
    try {
      await checkAuthenticationandMethodForRequest(request, "PUT");

      const { facultyId } = request.query;
      validateRequestParams({ facultyId });

      let result = await updateLecture(facultyId, request.body);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });