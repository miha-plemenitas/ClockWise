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
