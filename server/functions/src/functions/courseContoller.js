const functions = require("firebase-functions");
const {
  getAllFacultyCollectionItems,
  getItemByFacultyAndCollectionAndItemId,
  getItemByFacultyAndCollectionAndFilterById
} = require('../service/facultyCollections');
const { handleErrors, validateRequestParams, checkAuthenticationandMethodForRequest } = require("../utils/endpointHelpers");
const {
  getLecturesByFilterAndOptionallyDate
} = require('../service/lectureService');


/**
 * Google Cloud Function to retrieve a specific course by ID from within a specified faculty's "courses" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the course ID to be provided
 * in the query parameters. It handles CORS, checks if the JWT token is valid, and addresses potential errors related
 * to missing parameters, unauthorized access, or issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty to which the course belongs.
 * - courseId: The ID of the course to retrieve.
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

      const { facultyId, courseId } = request.query;
      validateRequestParams({ facultyId, courseId });

      const result = await getItemByFacultyAndCollectionAndItemId(facultyId, "courses", courseId);
      console.log(`Found and sent course with id ${courseId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all courses from the "courses" collection for a specified faculty.
* This function is an HTTP-triggered endpoint that requires the faculty ID to be provided in the query parameters.
* It handles CORS, check for JWT token, and manages potential errors related to missing parameters,
* unauthorized access, or issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty whose courses are to be fetched.
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

      const result = await getAllFacultyCollectionItems(facultyId, "courses");
      console.log(`Found and sent all courses by faculty with id ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Google Cloud Function to retrieve all courses associated with a specific program from a faculty's "courses" collection.
* This function is an HTTP-triggered endpoint that requires both the faculty ID and the program ID to be provided in the query parameters.
* It handles CORS, checks if the JWT token is valid, and manages potential errors related to missing parameters, unauthorized access, or 
* issues during data retrieval.
*
* Query Parameters:
* - facultyId: The ID of the faculty associated with the program.
* - programId: The ID of the program whose courses are to be fetched.
*
* @param {functions.Request} request - The HTTP request object, containing the query parameters.
* @param {functions.Response} response - The HTTP response object used to send back data or errors.
*/
exports.getAllForProgram = functions
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

      const result = await getItemByFacultyAndCollectionAndFilterById(facultyId, "courses", "programId", Number(programId));
      console.log(`Found and sent coures for program ${programId} of faculty ${facultyId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Google Cloud Function to retrieve all courses associated with a specific branch from a faculty's "lecture" collection.
 * This function is an HTTP-triggered endpoint that requires both the faculty ID and the branch ID to be provided in the query parameters.
 * It handles CORS, checks authentication, and manages potential errors related to missing parameters, unauthorized access, or 
 * issues during data retrieval.
 *
 * Query Parameters:
 * - facultyId: The ID of the faculty associated with the branch.
 * - branchId: The ID of the branch whose courses are to be fetched.
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

      const { facultyId, branchId } = request.query;
      validateRequestParams({ facultyId, branchId });

      const lectures = await getLecturesByFilterAndOptionallyDate(facultyId, "branch_ids", Number(branchId), "2024-02-26", "2024-06-09", "original_lectures");
      const courses = new Array();

      for (const lecture of lectures) {
        const course = {
          "id": lecture.courseId,
          "courseId": Number(lecture.courseId),
          "course": lecture.course,
          "branchId": branchId
        };

        if (!courses.some(existingCourse => existingCourse.courseId === course.courseId)) {
          courses.push(course);
        }
      }

      response.status(200).json({ result: courses });
    } catch (error) {
      handleErrors(error, response);
    }
  });
