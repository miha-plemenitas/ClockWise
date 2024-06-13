const { processRoomData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { roomData, roomBonusBlankFields } = require("../constants/room");


function enhanceRoomDetails(room) {
  let roomEnhanced = false;
  for (const roomDataEntry of roomData) {
    if (roomDataEntry.roomName === room.name) {
      room.size = roomDataEntry.size;
      room.equipment = roomDataEntry.equipment;
      roomEnhanced = true;
      break;
    }
  }

  if (!roomEnhanced) {
    room.size = roomBonusBlankFields.size;
    room.equipment = roomBonusBlankFields.equipment;
  }
}


/**
 * Fetches unique rooms from lectures for a given faculty document.
 * Processes and stores the unique rooms in the Firestore collection.
 *
 * @param {firebase.firestore.DocumentSnapshot} facultyDoc - The Firestore document snapshot of the faculty.
 * @returns {Promise<string>} A log message indicating the completion of room addition or if no lectures were found.
 * @throws {Error} If there is an issue with fetching data from Firestore, processing rooms, or updating Firestore.
 */
async function fetchRoomsByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const lectures = await facultyDoc.ref.collection("original_lectures").get();

  if (lectures.empty) {
    const log = `No lectures found for ${faculty.schoolCode} and no rooms added`;
    console.log(log);
    return log;
  }

  const uniqueRooms = new Map();
  let changeBool;

  for (const lectureDoc of lectures.docs) {
    const lecture = lectureDoc.data();

    for (const room of lecture.rooms) {
      if (room.id && !uniqueRooms.has(room.id)) {
        enhanceRoomDetails(room);
        uniqueRooms.set(room.id, room);
      }
    }
  }

  const uniqueRoomsArray = Array.from(uniqueRooms.values());

  await processItemsInBatch(
    facultyDoc.ref.collection("rooms"),
    uniqueRoomsArray,
    (room) => processRoomData(room)
  );

  const log = `Added rooms for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


module.exports = {
  fetchRoomsByFacultyDoc,
}
