const functions = require("firebase-functions");
const {
  saveTimetableForUser,
  getTimetableByUserId
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
    response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
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

  exports.get = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
  
    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { uid } = request.query;
      validateRequestParams({ uid });

      const result = await getTimetableByUserId(uid);
      console.log(`Found and sent timetable for user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
