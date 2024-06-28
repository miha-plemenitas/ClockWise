const functions = require("firebase-functions");
const { generateSchedule } = require("../scheduler/scheduler");
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");
const { getHeatMap } = require("../utils/timeUtils");


/**
 * Cloud Function to generate a schedule for a specified faculty.
 *
 * This function handles HTTP requests to generate a schedule for a faculty. It validates the request, 
 * processes the schedule generation, and returns the result. This function is configured to run in the
 * "europe-west3" region with specific timeout and memory settings.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @param {functions.Response} response - The HTTP response object.
 *
 * @returns {Promise<void>} A promise that resolves when the function has completed processing.
 *
 * @throws {Error} Throws an error if the authentication fails, the request method is incorrect, 
 *                 or the request parameters are invalid.
 */
exports.generate = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https
  .onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const { facultyId, iterations } = request.query;
      validateRequestParams({ facultyId });

      const result = await generateSchedule(facultyId, iterations);

      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


/**
* Cloud Function to generate a heat map for a specified faculty.
*
* This function handles HTTP requests to generate a heat map for a faculty. It validates the request,
* processes the heat map generation, and returns the result. This function is configured to run in the
* "europe-west3" region with specific timeout settings.
*
* @param {functions.https.Request} request - The HTTP request object.
* @param {functions.Response} response - The HTTP response object.
*
* @returns {Promise<void>} A promise that resolves when the function has completed processing.
*
* @throws {Error} Throws an error if the authentication fails, the request method is incorrect,
*                 or the request parameters are invalid.
*/
exports.heatMap = functions
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

      let { facultyId, collection, type } = request.query;
      validateRequestParams({ facultyId, collection });

      if (!type) {
        type = "count";
      }

      const result = await getHeatMap(facultyId, collection, type);

      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
