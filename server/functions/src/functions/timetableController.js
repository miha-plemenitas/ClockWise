const functions = require("firebase-functions");
const {
  saveTimetableForUser,
} = require("../service/timetableService");
const {
    handleErrors,
    validateRequestParams,
    checkAuthenticationandMethodForRequest
  } = require("../utils/endpointHelpers");


exports.add = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "POST");

      const { uid } = request.body;
      validateRequestParams({ uid });

      const timetableId = await saveTimetableForUser(uid, request.body);
      return response.status(201).send({ uid: timetableId });
    } catch (error) {
      handleErrors(error, response);
    }
  });