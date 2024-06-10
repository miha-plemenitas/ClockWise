const { checkAuthentication } = require('../service/authenticationService');


function handleErrors(error, response) {
  console.log(error.message);
  if (error.message.startsWith("No ")) {
    response.status(400).send(error.message);
  } else if (error.message === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
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


function validateRequestParams(params) {
  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      throw new Error(`No ${key} sent`);
    }
  }
}


function checkForHTTPMethod(request, required) {
  if (request.method === "OPTIONS") {
    throw new Error("OPTIONS");
  } else if (request.method !== required) {
    throw new Error(`Method ${request.method} not allowed`);
  }
}


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
