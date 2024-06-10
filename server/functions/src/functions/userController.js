const functions = require("firebase-functions");
const { saveUser, getUserById, updateUser, deleteUser } = require("../service/userService");
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
    response.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.set('Access-Control-Allow-Credentials', 'true');

      try {
        await checkAuthenticationandMethodForRequest(request, "POST");

        const { uid } = request.body;
        validateRequestParams({ uid });

        const existing = await saveUser(uid);
        if (existing) {
          return response.status(200).send({ message: 'User already exists' });
        } else {
          return response.status(201).send({ message: 'User added successfully' });
        }
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

      const { uid } = request.body;
      validateRequestParams({ uid });

      const result = await getUserById(uid);
      console.log(`Found and sent user with id ${uid}`);
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

      const { uid } = request.body;
      validateRequestParams({ uid });

      const result = await updateUser(uid, request.body);
      console.log(`Found and updated user with id ${uid}`);
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
      
      const { uid } = request.body;
      validateRequestParams({ uid });

      const result = await deleteUser(uid);
      console.log(`Found and deleted user with id ${uid}`);
      response.status(200).json({ result: result });
    } catch (error) {
      handleErrors(error, response);
    }
  });
