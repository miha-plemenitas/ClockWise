const functions = require("firebase-functions");
const { saveUser, getUserById, getUnverifiedUsers, updateUser, deleteUser, notifyUsers, verifyUser } = require("../service/userService");
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");


/**
 * Defines a Firebase Cloud Function deployed in the "europe-west3" region, intended to handle POST requests to add a user. 
 * The function manages CORS to allow requests from any origin and supports credentials for cross-origin requests. It ensures 
 * authentication and method validation (POST) before validating the user's UID provided in the request body.
 * 
 * Upon validating the parameters, the function attempts to save the user by UID. If the user already exists, it returns a message 
 * indicating that the user already exists. If the user does not exist, it proceeds to add the user and returns a success message.
 * Any errors encountered during the process are handled and appropriate responses are generated.
 *
 * @param {functions.https.Request} request - The HTTP request object from Firebase, containing the UID in the body necessary 
 * for adding or checking the user.
 * @param {functions.Response} response - The response object used to send back the HTTP response. Depending on the result of 
 * the user save attempt, it either returns a success message for a new user addition or a message for an existing user.
 * @returns {Promise<void>} A promise that resolves with no value when the user check/addition is completed, or rejects with an 
 * error if the process fails.
 */
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

      const { uid, email, name } = request.body;
      validateRequestParams({ uid });

      const existing = await saveUser(uid, email, name);
      if (existing) {
        return response.status(200).send({ message: 'User already exists' });
      } else {
        return response.status(201).send({ message: 'User added successfully' });
      }
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Defines a Firebase Cloud Function deployed in the "europe-west3" region, intended to handle GET requests to retrieve a user by UID.
 * The function configures CORS to allow requests from all origins. It checks the request's authentication and confirms the HTTP method is GET 
 * before validating the user's UID provided in the request body. Upon successful validation, it retrieves the user's data and returns it.
 *
 * If the user is found, their data is returned in the response; otherwise, an error is handled and an appropriate response is sent back. The function 
 * is configured with a 540-second timeout to allow for potentially lengthy database operations.
 *
 * @param {functions.https.Request} request - The HTTP request object from Firebase, containing the user's UID in the body.
 * @param {functions.Response} response - The response object used to send back the HTTP response. If the user is successfully retrieved,
 * the user data is returned in a JSON format; otherwise, error handling procedures manage the response.
 * @returns {Promise<void>} A promise that resolves when the user data has been successfully retrieved and sent back, or rejects if an error occurs,
 * with error handling managed internally.
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

      const { uid } = request.query;
      validateRequestParams({ uid });

      const result = await getUserById(uid);
      console.log(`Found and sent user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


  exports.getUnverified = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const result = await getUnverifiedUsers();
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });

/**
 * Defines a Firebase Cloud Function deployed in the "europe-west3" region, intended to handle PUT requests for updating a user's information.
 * The function configures CORS to allow requests from all origins and ensures that the request is authenticated and uses the correct method (PUT).
 * It validates the user's UID provided in the request body before proceeding to update the user's data.
 *
 * If the user update is successful, the updated user data is returned in the response; otherwise, the function handles errors and responds 
 * appropriately. The function is configured with a 540-second timeout to accommodate potentially lengthy operations such as database access or third-party service calls.
 *
 * @param {functions.https.Request} request - The HTTP request object from Firebase, containing the user's UID and additional data for the update in the body.
 * @param {functions.Response} response - The response object used to send back the HTTP response. If the user update is successful, the response includes
 * the updated user data; otherwise, errors are handled and detailed in the response.
 * @returns {Promise<void>} A promise that resolves when the user update process is successfully completed and the data is sent back, or rejects if an error occurs,
 * with error handling managed internally.
 */
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

      const { uid } = request.body;
      validateRequestParams({ uid });

      const result = await updateUser(uid, request.body);
      console.log(`Found and updated user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Defines a Firebase Cloud Function deployed in the "europe-west3" region, intended to handle DELETE requests for removing a user's record.
 * The function configures CORS to allow requests from all origins. It checks the request's authentication and confirms the HTTP method is DELETE
 * before validating the user's UID provided in the request body. Upon successful validation, it proceeds to delete the user's data.
 *
 * If the deletion is successful, the function logs the action and returns a success status along with a result indicating the operation's outcome.
 * Any errors encountered during the process are handled and appropriate responses are generated to ensure clear communication of issues to the client.
 *
 * @param {functions.https.Request} request - The HTTP request object from Firebase, containing the user's UID in the body necessary for identifying the user to be deleted.
 * @param {functions.Response} response - The response object used to send back the HTTP response. If the deletion is successful,
 * the response includes a confirmation result; otherwise, errors are handled and detailed in the response.
 * @returns {Promise<void>} A promise that resolves when the user deletion has been successfully completed and the response has been sent,
 * or rejects if an error occurs, with error handling managed internally.
 */
exports.delete = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    try {
      await checkAuthenticationandMethodForRequest(request, "DELETE");

      const { uid } = request.body;
      validateRequestParams({ uid });

      const result = await deleteUser(uid);
      console.log(`Found and deleted user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


  exports.verify = functions
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

      const { uid, email } = request.body;
      validateRequestParams({ uid });

      const verified = await verifyUser(uid, email);
      if (verified) {
        response.status(200).json({ success: true, message: 'Verification successful' });
      } else {
        response.status(400).json({ success: false, message: 'Verification failed' }); 
      }
    } catch (error) {
      handleErrors(error, response);
    }
  });


  exports.notifyUsersOnLectureUpdate = functions
  .region("europe-west3")
  .firestore
  .document('lectures/{lectureId}')
  .onWrite(async (change, context) => {
    await notifyUsers(context, change);

    return null;
  });
