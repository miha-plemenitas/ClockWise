const functions = require("firebase-functions");
const { generateSchedule } = require("../scheduler/scheduler");
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");


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

      const { facultyId, iterations } = request.query;
      validateRequestParams({ facultyId });

      const schedule = await generateSchedule(facultyId, iterations);
      console.log(`Generated and saved a schedule for ${facultyId}`);

      response.status(200).json({ result: schedule });
    } catch (error) {
      handleErrors(error, response);
    }
  });
