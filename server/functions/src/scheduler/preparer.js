const { db } = require('../utils/firebaseAdmin');
const { deleteAllDocumentsInCollection } = require("../utils/firebaseHelpers");
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");

async function resetCollectionAndFetchTwoWeekSchedule(facultyId) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const generatedLecturesRef = facultyRef.collection("generated_lectures");

  await deleteAllDocumentsInCollection(generatedLecturesRef);

  const rooms = await getAllFacultyCollectionItems(facultyId, "rooms");
  const original_lectures = await fetchTwoWeekSchedule(facultyRef, rooms);

  return { original_lectures, rooms };
}


function prepareLecture(data, rooms) {
  const roomSizes = rooms
    .filter(room => data.room_ids.includes(room.roomId))
    .map(room => room.size);

  data.size = Math.max(...roomSizes);

  delete data.id;
  delete data.startTime;
  delete data.endTime;
  delete data.room_ids;
  delete data.rooms;

  return data;
}


async function fetchTwoWeekSchedule(facultyRef, rooms) {
  const lecturesRef = facultyRef.collection("original_lectures");
  const startTime = new Date("2024-03-04T00:00:00Z");
  const endTime = new Date("2024-03-09T00:00:00Z");

  const lectureQuery = lecturesRef
    .where("startTime", ">=", startTime)
    .where("startTime", "<=", endTime)
    .where("hasRooms", "==", true)
    .where("executionTypeId", "!=", "99");

  const snapshot = await lectureQuery.get();
  const lectures = snapshot.docs.map(doc => {
    return prepareLecture(doc.data(), rooms);
  });

  return lectures;
}

module.exports = {
  resetCollectionAndFetchTwoWeekSchedule
};
