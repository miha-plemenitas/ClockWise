const { db } = require('../utils/firebaseAdmin');
const { deleteAllDocumentsInCollection } = require("../utils/firebaseHelpers");
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");


async function getAvailableRooms(facultyId){
  const rooms = await getAllFacultyCollectionItems(facultyId, "rooms");

  const availableRooms = rooms.filter(room => room.id != "213" && room.id != "308");
  return availableRooms;
}


function getWeekNumber(date) {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const dayOfWeek = startDate.getDay() || 7;
  startDate.setDate(startDate.getDate() + 1 - dayOfWeek);
  const diff = (date - startDate) / (24 * 60 * 60 * 1000);
  return Math.ceil((diff + 1) / 7);
};


function prepareLecture(data, rooms) {

  const roomSizes = rooms
    .filter(room => data.room_ids.includes(room.roomId))
    .map(room => room.size);

  data.size = Math.max(...roomSizes);

  const executionTypeMap = {
    "SE ": { type: "SE", id: "11" },
    "LV ": { type: "LV", id: "10" },
    "RV ": { type: "RV", id: "35" },
    "PR ": { type: "PR", id: "2" },
    "SV ": { type: "SV", id: "3" },
  };

  for (const [prefix, { type, id }] of Object.entries(executionTypeMap)) {
    if (data.executionType.startsWith(prefix)) {
      data.executionType = type;
      data.executionTypeId = id;
      break;
    }
  }

  const date = new Date(data.startTime._seconds * 1000);
  data.week = getWeekNumber(date);

  delete data.id;
  if (!data.executionTypeId in ["102", "116", "110", "93"]){
    delete data.endTime;
    delete data.room_ids;
    delete data.rooms;
  } else {
    data.schedulable = false;
  }

  return data;
}


async function resetCollectionAndFetchSchedule(facultyId) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const generatedLecturesRef = facultyRef.collection("generated_lectures");

  await deleteAllDocumentsInCollection(generatedLecturesRef);

  const rooms = await getAvailableRooms(facultyId);
  const original_lectures = await fetchWholeSchedule(facultyRef, rooms);

  return { original_lectures, rooms };
}


async function fetchWholeSchedule(facultyRef, rooms) {
  const lecturesRef = facultyRef.collection("original_lectures");

  const lectureQuery = lecturesRef
    .where("executionTypeId", "!=", "99");

  const snapshot = await lectureQuery.get();
  let index = 0;
  const lectures = snapshot.docs.map(doc => {
    let lecture = prepareLecture(doc.data(), rooms);
    lecture.id = index;
    index++;
    
    return lecture;
  });

  return lectures;
}


async function expandLectureData(groupedLectures, lectures){
  for(const key in groupedLectures){
    const groupedLecture = groupedLectures[key];
    const length = groupedLecture.length;

    for (let i = 0; i < length; i++) {
      const groupL = groupedLecture[i];
      const id = groupL.id;
      const lecture = lectures[id];
    
      if (i + 1 < length) {
        const nextGroupL = groupedLecture[i + 1];
        const nextId = nextGroupL.id;
        lecture.nextId = nextId;
      } else {
        lecture.nextId = -1;
      }
    }
  }
}


module.exports = {
  resetCollectionAndFetchSchedule,
  getWeekNumber,
  expandLectureData
};
