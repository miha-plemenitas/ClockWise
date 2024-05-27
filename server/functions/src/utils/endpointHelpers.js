const { checkJwt } = require('../service/authenticationService');


function handleErrors(error, response) {
  console.log(error.message);
  if (error.message.startsWith("No ")) {
    response.status(400).send(error.message);
  } else if (error.message === 'TokenExpired' || error.message === 'Unauthorized') {
    response.status(401).send(error.message);
  } else if (error.message.includes(" does not exist in ")) {
    response.status(404).send(error.message);
  }else if (error.message.startsWith("Method ")) {
    response.status(405).send(error.message);
  }  else {
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
  if (request.method !== required) {
    throw new Error(`Method ${request.method} not allowed`);
  }
}


async function checkJWTandMethodForRequest (request, require) {
  checkForHTTPMethod(request, require);
  await checkJwt(request);
}


module.exports = {
  handleErrors,
  validateRequestParams,
  checkForHTTPMethod,
  checkJWTandMethodForRequest,
}
