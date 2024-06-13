const {
  addFacultyDocumentsFromList,
  fetchProgramsForAllFaculties
} = require('../faculties');
const { fetchData } = require('../faculties/fetchDataForFaculty');
const functions = require("firebase-functions");
const { handleErrors, checkAuthenticationandMethodForRequest } = require("../utils/endpointHelpers");


/**
 * Cloud Function to add faculty documents from a list.
 * This function runs with a specified timeout and memory allocation, and is triggered via an HTTP request.
 * The function sets CORS headers, checks if the JWT token is valid, and attempts to add faculties.
 * On success, it returns a JSON response with the result. On failure, it returns an error response.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.https.Response} response - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
exports.addFaculties = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await addFacultyDocumentsFromList();
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Cloud Function to fetch and add programs for all faculties.
 * This function runs with a specified timeout and memory allocation, and is triggered via an HTTP request.
 * The function sets CORS headers, checks if the JWT token is valid, and attempts to fetch and add programs for all faculties.
 * On success, it returns a JSON response with the result. On failure, it returns an error response.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.https.Response} response - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
exports.addPrograms = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await fetchProgramsForAllFaculties();
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Cloud Function to fetch and add branches for a specific faculty or all faculties.
 * This function runs with a specified timeout and memory allocation, and is triggered via an HTTP request.
 * The function sets CORS headers, checks if the JWT token is valid, and attempts to fetch and add branches.
 * If a faculty ID is provided via query parameters, it fetches and adds branches for that specific faculty.
 * If no faculty ID is provided, it fetches and adds branches for all faculties.
 * On success, it returns a JSON response with the result. On failure, it returns an error response.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.https.Response} response - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
exports.addBranches = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await fetchData(id, "branches");
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });

/**
 * Cloud Function to fetch and add courses for a specific faculty or all faculties.
 * This function runs with a specified timeout and memory allocation, and is triggered via an HTTP request.
 * The function sets CORS headers, checks if the JWT token is valid, and attempts to fetch and add courses.
 * If a faculty ID is provided via query parameters, it fetches and adds courses for that specific faculty.
 * If no faculty ID is provided, it fetches and adds courses for all faculties.
 * On success, it returns a JSON response with the result. On failure, it returns an error response.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.https.Response} response - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
exports.addCourses = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await fetchData(id, "courses");
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Cloud Function to fetch and add tutors for a specific faculty or all faculties.
 * This function runs with a specified timeout and memory allocation, and is triggered via an HTTP request.
 * The function sets CORS headers, checks if the JWT token is valid, and attempts to fetch and add tutors.
 * If a faculty ID is provided via query parameters, it fetches and adds tutors for that specific faculty.
 * If no faculty ID is provided, it fetches and adds tutors for all faculties.
 * On success, it returns a JSON response with the result. On failure, it returns an error response.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.https.Response} response - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
exports.addTutors = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await fetchData(id, "tutors");
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Cloud Function to fetch and add groups for a specific faculty or all faculties.
 * This function runs with a specified timeout and memory allocation, and is triggered via an HTTP request.
 * The function sets CORS headers, checks if the JWT token is valid, and attempts to fetch and add groups.
 * If a faculty ID is provided via query parameters, it fetches and adds groups for that specific faculty.
 * If no faculty ID is provided, it fetches and adds groups for all faculties.
 * On success, it returns a JSON response with the result. On failure, it returns an error response.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.https.Response} response - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
exports.addGroups = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await fetchData(id, "groups");
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Cloud Function to fetch and add lectures for a specific faculty or all faculties.
 * This function runs with a specified timeout and memory allocation, and is triggered via an HTTP request.
 * The function sets CORS headers, checks if the JWT token is valid, and attempts to fetch and add lectures.
 * If a faculty ID is provided via query parameters, it fetches and adds lectures for that specific faculty.
 * If no faculty ID is provided, it fetches and adds lectures for all faculties.
 * On success, it returns a JSON response with the result. On failure, it returns an error response.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.https.Response} response - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
exports.addLectures = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await fetchData(id, "original_lectures");
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Cloud Function to fetch and add rooms for a specific faculty or all faculties.
 * This function runs in the "europe-west3" region and is triggered via an HTTP request.
 * The function sets CORS headers, checks if the JWT token is valid, and attempts to fetch and add rooms.
 * If a faculty ID is provided via query parameters, it fetches and adds rooms for that specific faculty.
 * If no faculty ID is provided, it fetches and adds rooms for all faculties.
 * On success, it returns a JSON response with the result. On failure, it returns an error response.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.https.Response} response - The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
exports.addRooms = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await fetchData(id, "rooms");
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.duplicateLectures = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const id = request.query.id;

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const result = await fetchData(id, "lectures");
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
