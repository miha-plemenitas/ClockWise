const functions = require("firebase-functions");
const { saveDayOff, deleteDayOff, getDaysOff} = require("../service/adminService");
const {
  handleErrors,
  validateRequestParams,
  checkAuthenticationandMethodForRequest
} = require("../utils/endpointHelpers");


exports.getAll = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { facultyId } = request.query;

      const result = await getDaysOff(facultyId);
      console.log(`Found and sent days.`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.addDay = functions
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

      const { facultyId } = request.body;

      const dayId = await saveDayOff(facultyId, request.body);
      return response.status(201).send({ id: dayId });
    } catch (error) {
      handleErrors(error, response);
    }
  });

  exports.deleteDay = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', 'https://clockwise.si');
    response.set('Access-Control-Allow-Credentials', 'true');

    try {
      await checkAuthenticationandMethodForRequest(request, "DELETE");

      const { facultyId, dayId } = request.body;
      const result = await deleteDayOff(facultyId, dayId);
      console.log(`Deleted day with id ${dayId}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
