/**
 * Checks the basic authentication header in the request.
 * Compares the received authorization header with the expected authorization header.
 *
 * @param {functions.https.Request} request - The HTTP request object.
 * @returns {boolean} Returns true if the authorization header matches the expected value, otherwise false.
 */
function checkBasicAuth(request) {
    const bufferedPassowrd = Buffer.from("admin:password").toString("base64");
    const expectedAuth = "Basic " + bufferedPassowrd;
    const receivedAuth = request.headers.authorization;
  
    if (receivedAuth !== expectedAuth) {
      return false;
    }
    return true;
  }

module.exports = {
    checkBasicAuth,
}
