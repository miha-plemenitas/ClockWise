const functions = require('firebase-functions');


const adminPassword = functions.config().auth.password;
const adminUsername = functions.config().auth.username;


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
