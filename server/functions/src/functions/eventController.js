const functions = require("firebase-functions");
const {
  saveEventForUser,
  getEventByUserAndEventId,
  getEventsForUser,
  updateEventForUser,
  deleteEventForUser
} = require("../service/eventService");
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

        const eventId = await saveEventForUser(uid, request.body);
        return response.status(201).send({ uid: eventId });
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
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { uid, eventId } = request.body;
      validateRequestParams({ uid, eventId });

      const result = await getEventByUserAndEventId(uid, eventId);
      console.log(`Found and sent event ${eventId} for user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.getAll = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "GET");

      const { uid } = request.body;
      validateRequestParams({ uid });

      const result = await getEventsForUser(uid);
      console.log(`Found and sent events for user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.update = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "PUT");

      const { uid, eventId } = request.body;
      validateRequestParams({ uid, eventId });

      const result = await updateEventForUser(uid, eventId, request.body);
      console.log(`Updated event ${eventId} for user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });


exports.delete = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");

    try {
      await checkAuthenticationandMethodForRequest(request, "DELETE");
      
      const { uid, eventId } = request.body;
      validateRequestParams({ uid, eventId });

      const result = await deleteEventForUser(uid, eventId);
      console.log(`Deleted user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
