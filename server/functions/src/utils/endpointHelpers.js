const { checkAuthentication } = require('../service/authenticationService');


/**
 * Handles errors and sends appropriate HTTP responses.
 *
 * @param {Error} error - The error object.
 * @param {Object} response - The response object to send HTTP responses.
 */
function handleErrors(error, response) {
  console.log(error.message);
  if (error.message.startsWith("No ")) {
    response.status(400).send(error.message);
  } else if (error.message.startsWith('OPTIONS')) {
    let allowedMethod = error.message.split("|")[1];
    
    response.set('Access-Control-Allow-Methods', allowedMethod);
    response.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
  }  else if (error.message === "Unauthorized") {
    response.status(401).send(error.message);
  } else if (
    error.message.includes(" does not exist in ") ||
    error.message.includes(" not found")) {
    response.status(404).send(error.message);
  } else if (error.message.startsWith("Method ")) {
    response.status(405).send(error.message);
  } else {
    console.error("Error:", error);
    response.status(500).send("Failed due to: " + error.message);
  }
}


/**
 * Validates that all request parameters are provided and not empty.
 *
 * @param {Object} params - The request parameters to validate.
 * @throws {Error} If any parameter is missing or empty.
 */
function validateRequestParams(params) {
  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      throw new Error(`No ${key} sent`);
    }
  }
}


/**
 * Checks if the HTTP method of the request matches the required method.
 *
 * @param {Object} request - The request object containing the HTTP method.
 * @param {string} required - The required HTTP method.
 * @throws {Error} If the request method is "OPTIONS" or does not match the required method.
 */
function checkForHTTPMethod(request, required) {
  if (request.method === "OPTIONS") {
    throw new Error(`OPTIONS|${required}`);
  } else if (request.method !== required) {
    throw new Error(`Method ${request.method} not allowed`);
  }
}


/**
 * Checks the HTTP method and authentication for the request.
 *
 * @param {Object} request - The request object containing the HTTP method.
 * @param {string} require - The required HTTP method.
 * @returns {Promise<void>} A promise that resolves when the checks are complete.
 * @throws {Error} If the HTTP method is not allowed or authentication fails.
 */
async function checkAuthenticationandMethodForRequest(request, require) {
  checkForHTTPMethod(request, require);
  await checkAuthentication(request);
}


module.exports = {
  handleErrors,
  validateRequestParams,
  checkForHTTPMethod,
  checkAuthenticationandMethodForRequest,
}
