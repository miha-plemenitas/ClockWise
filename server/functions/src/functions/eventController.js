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
  checkJWTandMethodForRequest
} = require("../utils/endpointHelpers");


exports.add = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.set('Access-Control-Allow-Credentials', 'true');

    if (request.method === 'OPTIONS') {

      response.set('Access-Control-Allow-Methods', 'POST');
      response.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      response.set('Access-Control-Max-Age', '3600');
      response.status(204).send('');

    } else {
      try {
        await checkJWTandMethodForRequest(request, "POST");
        const { uid } = request.body;
        validateRequestParams({ uid });

        const eventId = await saveEventForUser(uid, request.body);
        return response.status(201).send({ uid: eventId });
      } catch (error) {
        handleErrors(error, response);
      }
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
      await checkJWTandMethodForRequest(request, "GET");
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
      await checkJWTandMethodForRequest(request, "GET");
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
      await checkJWTandMethodForRequest(request, "PUT");
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
      await checkJWTandMethodForRequest(request, "DELETE");
      const { uid, eventId } = request.body;
      validateRequestParams({ uid, eventId });

      const result = await deleteEventForUser(uid, eventId);
      console.log(`Deleted user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
