const { db } = require('../utils/firebaseAdmin');
const { filterForAllowedKeys, convertDatesToTimestamps } = require("../utils/batchOperations");
const { checkIfExistsByRefCollectionNameId } = require("../utils/firebaseHelpers");
const { eventAllowedKeys } = require("../constants/constants");


async function saveEventForUser(uid, eventData) {
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);

  const eventsRef = userRef.collection('events');
  const formatedData = filterAndFormatTimes(eventData, eventAllowedKeys);

  const docRef = await eventsRef.add(formatedData);

  console.log(`Event added with auto-generated UID: ${docRef.id} under user ID: ${uid}`);
  return docRef.id;
}


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


async function getEventsForUser(uid){
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);
  const eventsRef = await  userRef.collection("events").get();

  const items = eventsRef.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return items;
}


async function updateEventForUser(uid, eventId, data) {
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);
  const eventRef = await checkIfExistsByRefCollectionNameId(
    userRef,
    "events",
    eventId
  );

  data = filterForAllowedKeys(data, eventAllowedKeys);

  await eventRef.update(data);

  console.log(`Event with id ${eventId} under ${uid} updated successfully.`);
  return `Event with id ${eventId} under ${uid} updated successfully.`;
}


function filterAndFormatTimes(data, allowedKeys) {
  let newData = filterForAllowedKeys(data, allowedKeys);
  newData = convertDatesToTimestamps(newData);
  return newData;
}


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
