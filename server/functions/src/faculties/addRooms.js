const { processRoomData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');

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
  const lectures = await facultyDoc.ref.collection("lectures").get();

  if (lectures.empty) {
    const log = `No lectures found for ${faculty.schoolCode} and no rooms added`;
    console.log(log);
    return log;
  }

  const uniqueRooms = new Map();

  for (const lectureDoc of lectures.docs) {
    const lecture = lectureDoc.data();

    for (const room of lecture.rooms) {
      if (!room.id) {
        continue;
      }
      uniqueRooms.set(room.id, { id: room.id, name: room.name });
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
