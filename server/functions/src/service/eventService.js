const { db } = require('../utils/firebaseAdmin');
const { filterForAllowedKeys, convertDatesToTimestamps } = require("../utils/batchOperations");
const { checkIfExistsByRefCollectionNameId } = require("../utils/firebaseHelpers");
const { eventAllowedKeys } = require("../constants/constants");


/**
 * Asynchronously saves an event to the specified user's collection of events in the database. The function first checks if the user exists by
 * their UID. If the user exists, it processes the event data by filtering and formatting it based on allowed keys, then adds the formatted data
 * as a new document under the user's 'events' collection. The function logs the successful addition and returns the auto-generated document ID.
 *
 * @param {string} uid - The UID of the user for whom the event is being saved.
 * @param {Object} eventData - The data for the event to be saved, which may contain various properties that will be filtered and formatted.
 * @returns {Promise<string>} A promise that resolves with the ID of the newly created event document.
 * @throws {Error} Throws an error if the user does not exist or if there is a failure during the event data processing or save operation.
 */
async function saveEventForUser(uid, eventData) {
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);

  const eventsRef = userRef.collection('events');
  const formatedData = filterAndFormatTimes(eventData, eventAllowedKeys);

  const docRef = await eventsRef.add(formatedData);

  console.log(`Event added with auto-generated UID: ${docRef.id} under user ID: ${uid}`);
  return docRef.id;
}


/**
 * Asynchronously retrieves a specific event for a user based on the user's UID and the event's ID.
 * The function first verifies the existence of the user by their UID, then verifies the existence of the event
 * under the user's 'events' collection by the event ID. If both the user and the event exist, it fetches the event data.
 *
 * @param {string} uid - The UID of the user whose event is being retrieved.
 * @param {string} eventId - The ID of the event to be retrieved.
 * @returns {Promise<Object|null>} A promise that resolves to the event data if found, or null if the event does not exist.
 */
async function getEventByUserAndEventId(uid, eventId) {
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);

  const eventRef = await checkIfExistsByRefCollectionNameId(
    userRef,
    "events",
    eventId
  );

  const eventDoc = await eventRef.get();
  const event = eventDoc.data();
  return event;
}


/**
 * Asynchronously retrieves all events for a user based on the user's UID.
 * The function first verifies the existence of the user by their UID. If the user exists,
 * it fetches all documents from the user's 'events' collection and returns an array of event objects.
 *
 * @param {string} uid - The UID of the user whose events are being retrieved.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of event objects, where each object contains the event data and its ID.
 * @throws {Error} Throws an error if the user does not exist or if there is a failure during the data retrieval process.
 */
async function getEventsForUser(uid){
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);
  const eventsRef = await  userRef.collection("events").get();

  const items = eventsRef.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return items;
}


/**
 * Updates an event for a user in the database.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} eventId - The unique identifier of the event.
 * @param {Object} data - The data to update the event with.
 * @returns {Promise<string>} A promise that resolves to a success message.
 */
async function updateEventForUser(uid, eventId, data) {
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);
  const eventRef = await checkIfExistsByRefCollectionNameId(
    userRef,
    "events",
    eventId
  );

  data = filterAndFormatTimes(data, eventAllowedKeys);

  await eventRef.update(data);

  console.log(`Event with id ${eventId} under ${uid} updated successfully.`);
  return `Event with id ${eventId} under ${uid} updated successfully.`;
}


/**
 * Filters and formats the given data.
 *
 * @param {Object} data - The data to be filtered and formatted.
 * @param {Array<string>} allowedKeys - The list of allowed keys.
 * @returns {Object} The filtered and formatted data.
 */
function filterAndFormatTimes(data, allowedKeys) {
  let newData = filterForAllowedKeys(data, allowedKeys);
  newData = convertDatesToTimestamps(newData);
  return newData;
}


/**
 * Deletes an event for a user in the database.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {string} eventId - The unique identifier of the event.
 * @returns {Promise<string>} A promise that resolves to a success message.
 */
async function deleteEventForUser(uid, eventId) {
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);
  const eventRef = await checkIfExistsByRefCollectionNameId(
    userRef,
    "events",
    eventId
  );

  await eventRef.delete();
  console.log(`Event with ID: ${eventId} deleted successfully.`);
  return 'Event deleted successfully';
}


module.exports = {
  saveEventForUser,
  getEventByUserAndEventId,
  getEventsForUser,
  updateEventForUser,
  deleteEventForUser
}
