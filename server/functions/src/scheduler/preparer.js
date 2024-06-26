const { db } = require('../utils/firebaseAdmin');
const { deleteAllDocumentsInCollection } = require("../utils/firebaseHelpers");
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");


// Dobiš sobe, brez default(za diplome) in MS teams
async function getAvailableRooms(facultyId){
  const rooms = await getAllFacultyCollectionItems(facultyId, "rooms");

  const availableRooms = rooms.filter(room => room.id != "213" && room.id != "308");
  return availableRooms;
}


// Gets weeks number (used it in the visualization, not needed anymore)
function getWeekNumber(date) {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const dayOfWeek = startDate.getDay() || 7;
  startDate.setDate(startDate.getDate() + 1 - dayOfWeek);
  const diff = (date - startDate) / (24 * 60 * 60 * 1000);
  return Math.ceil((diff + 1) / 7);
};


// Prepares lecture, filtered out those without .room_ids (residual ones)
// Adds sizes to lectures and fixes execution types
// Also sets up the ones that shouldnt be scheduled
function prepareLecture(data, rooms) {
  if(!data.room_ids){
    console.log(data);
  }

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

  const nonSchedulableExecutionTypeIds = ["102", "116", "110", "93"];
  if (!nonSchedulableExecutionTypeIds.includes(data.executionTypeId)) {
    delete data.endTime;
    delete data.room_ids;
    delete data.rooms;
    data.schedulable = 1;
  } else {
    data.schedulable = -1;
  }

  return data;
}


//Deletam ze zgenerirano kolekcijo, pridobim sobe in celoten urnik
//TODO - lahko dodam nov boolean ki samo deleta vse v kolekciji
async function resetCollectionAndFetchSchedule(facultyId) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const generatedLecturesRef = facultyRef.collection("generated_lectures");

  await deleteAllDocumentsInCollection(generatedLecturesRef);

  const rooms = await getAvailableRooms(facultyId); //iz sob sam vmes se deletam ms teams pa default sobo za diplomo n shit
  const original_lectures = await fetchWholeSchedule(facultyRef, rooms); //vsi lecturji razen tipa 99

  return { original_lectures, rooms };
}


//pridobi vse iz original_lectures, ki nimajo executionTypeId = 99
//vmes jih deleta, na koncu pa jim da se id od indexa
async function fetchWholeSchedule(facultyRef, rooms) {
  const lecturesRef = facultyRef.collection("original_lectures");

  const lectureQuery = lecturesRef
    .where("executionTypeId", "!=", "99");

  const snapshot = await lectureQuery.get();

  const batch = facultyRef.firestore.batch();

  const filteredDocs = snapshot.docs.filter(doc => {
    const data = doc.data();
    if (!data.room_ids) {
      batch.delete(doc.ref);
      return false;
    }
    return true;
  });
  await batch.commit();

  let index = 0;
  const lectures = filteredDocs.map(doc => {
    let lecture = prepareLecture(doc.data(), rooms);
    lecture.id = index;
    index++;
    return lecture;
  });

  return lectures;
}


//Ponavljajocim predavanjam oz tipom lecturjem dam next id, da se bo lahko schedulal zaporedno vsak tedn
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
