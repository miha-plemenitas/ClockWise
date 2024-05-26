function handleErrors(error, response) {
  console.log(error.message);
  if (error.message.startsWith("No ")) {
    response.status(400).send(error.message);
  } else if (error.message === 'TokenExpired' || error.message === 'Unauthorized') {
    response.status(401).send(error.message);
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


module.exports = {
  handleErrors,
  validateRequestParams,
}
