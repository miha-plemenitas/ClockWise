const functions = require("firebase-functions");
const {
  saveEventForUser,
  getEventByUserAndEventId,
  getEventsForUser,
  updateEventForUser,
  deleteEventForUser
} = require("../service/eventService");
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");


/**
 * Defines a Firebase Cloud Function that adds a new event for a user. This function is deployed to the "europe-west3" region and is set to timeout after 540 seconds.
 * It handles CORS by allowing all origins and credentials. The function requires a POST request with user ID ('uid') in the body.
 * After validating the request, it proceeds to save an event for the user and returns the event ID in the response.
 *
 * @param {functions.https.Request} request - The HTTP request object provided by Firebase, including the user's data.
 * @param {functions.Response} response - The response object used to send back the HTTP response.
 * @returns {Promise<void>} A promise that resolves when the event has been added successfully or rejects with an error.
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

      const { uid } = request.body;
      validateRequestParams({ uid });

      const eventId = await saveEventForUser(uid, request.body);
      return response.status(201).send({ uid: eventId });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Defines a Firebase Cloud Function deployed to the "europe-west3" region with a 540-second timeout. The function handles GET requests to retrieve an event for a user.
* It expects a 'uid' for the user and an 'eventId' specifying the event to retrieve. It sets CORS to allow all origins.
* The function validates the user's ID and event ID, retrieves the event details, and returns them in the response.
* If an error occurs, it handles and logs the error, then sends an appropriate HTTP response.
*
* @param {functions.https.Request} request - The HTTP request object from Firebase, containing the user and event IDs in the body.
* @param {functions.Response} response - The response object used to send back the HTTP response.
* @returns {Promise<void>} A promise that resolves when the event data has been successfully retrieved and sent back, or rejects if an error occurs.
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

      const { uid, eventId } = request.body;
      validateRequestParams({ uid, eventId });

      const result = await getEventByUserAndEventId(uid, eventId);
      console.log(`Found and sent event ${eventId} for user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Defines a Firebase Cloud Function that is deployed to the "europe-west3" region with a 540-second timeout.
* The function is designed to handle GET requests to fetch all events associated with a given user ID ('uid').It sets CORS to allow all origins.
* Upon successful authentication and parameter validation, it retrieves all events for the specified user and returns them in the response.
*
* @param {functions.https.Request} request - The HTTP request object from Firebase. It expects a 'uid' in the query parameters.
* @param {functions.Response} response - The response object used to send back the HTTP response.
* @returns {Promise<void>} A promise that resolves when the events have been successfully retrieved and sent back, or rejects if an error occurs.
*/
exports.getAll = functions
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

      const { uid } = request.query;
      validateRequestParams({ uid });

      const result = await getEventsForUser(uid);
      console.log(`Found and sent events for user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Defines a Firebase Cloud Function deployed in the "europe-west3" region, intended to handle PUT requests for updating an event.
 * Configures CORS to allow requests from all origins and to support credentials. The function ensures authentication
 * and method (PUT) validation before proceeding to validate the required parameters (uid and eventId).
 * If validation passes, it updates the specified event for the user and returns the updated event details in the response.
 *
 * @param {functions.https.Request} request - The HTTP request object from Firebase, containing the user's UID and event ID,
 * along with other event details in the body that may need updating.
 * @param {functions.Response} response - The response object used to send back the HTTP response.
 * @returns {Promise<void>} A promise that resolves when the event update is successfully processed and sent back,
 * or rejects if an error occurs, managing error handling appropriately.
 */
exports.update = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "PUT");

      const { uid, eventId } = request.body;
      validateRequestParams({ uid, eventId });

      const result = await updateEventForUser(uid, eventId, request.body);
      console.log(`Updated event ${eventId} for user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
 * Defines a Firebase Cloud Function deployed in the "europe-west3" region, intended to handle DELETE requests. The function
 * configures CORS to allow requests from all origins and supports credentials. It ensures authentication and validates that
 * the DELETE request contains the necessary parameters (uid and eventId) before proceeding.
 * Upon successful validation, it deletes the specified event for the user and returns a success status.
 *
 * @param {functions.https.Request} request - The HTTP request object from Firebase. It should include a user ID (`uid`) and
 * an event ID (`eventId`) in the body, indicating which event should be deleted.
 * @param {functions.Response} response - The response object used to send back the HTTP response. If the event is successfully
 * deleted, a success message and result will be returned; if not, it will handle and respond to errors appropriately.
 * @returns {Promise<void>} A promise that resolves when the event has been successfully deleted and the response has been sent,
 * or it rejects if an error occurs, with error handling managed internally.
 */
exports.delete = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "DELETE");

      const { uid, eventId } = request.body;
      validateRequestParams({ uid, eventId });

      const result = await deleteEventForUser(uid, eventId);
      console.log(`Deleted user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
