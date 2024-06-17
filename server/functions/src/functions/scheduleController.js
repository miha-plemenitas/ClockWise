const functions = require("firebase-functions");
const { generateSchedule } = require("../scheduler/scheduler");
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");
const { generateFullSchedule, saveGeneratedSchedule, enrichLecturesWithRoomData } = require("../scheduler/converter");


exports.generate = functions
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

      const { facultyId } = request.query;
      validateRequestParams({ facultyId });

      const schedule = await generateSchedule(facultyId);

      response.status(200).json({ result: schedule });
    } catch (error) {
      handleErrors(error, response);
    }
  });