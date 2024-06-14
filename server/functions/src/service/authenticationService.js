const functions = require('firebase-functions');


const adminPassword = functions.config().auth.password;
const adminUsername = functions.config().auth.username;


/**
 * Asynchronously checks if the HTTP request contains a valid Basic Authentication header with the correct credentials.
 * This function expects the request to have an 'Authorization' header starting with 'Basic ', followed by a base64-encoded string 
 * representing the username and password in the format 'username:password'. If the authentication check fails due to missing header,
 * incorrect format, or wrong credentials, it logs the error and throws an 'Unauthorized' error.
 *
 * @param {Object} request - The HTTP request object that should contain an authorization header with basic auth credentials.
 * @throws {Error} Throws an 'Unauthorized' error if authentication fails.
 */
const checkAuthentication = async (request) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.log("No basic auth");
    throw new Error("Unauthorized");
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (!(username === adminUsername && password === adminPassword)) {
    console.log("Wrong password");
    throw new Error("Unauthorized");
  }
};


module.exports = {
  checkAuthentication
}
