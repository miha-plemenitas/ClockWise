const { db } = require('../utils/firebaseAdmin');
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

  data.duration = Math.floor(data.duration);

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

  if (nonSchedulableExecutionTypeIds.includes(data.executionTypeId) || data.size != null || data.course == "") {
    data.schedulable = -1;
  } else {
    delete data.endTime;
    delete data.room_ids;
    delete data.rooms;
    data.schedulable = 1;
  }

  return data;
}


//Deletam ze zgenerirano kolekcijo, pridobim sobe in celoten urnik
//TODO - lahko dodam nov boolean ki samo deleta vse v kolekciji
async function resetCollectionAndFetchSchedule(facultyId) {
  const facultyRef = db.collection("faculties").doc(facultyId);

  const rooms = await getAvailableRooms(facultyId); //iz sob sam vmes se deletam ms teams pa default sobo za diplomo n shit
  const original_lectures = await fetchWholeSchedule(facultyRef, rooms); //vsi lecturji razen tipa 99

  return { original_lectures, rooms };
}


//pridobi vse iz original_lectures, ki nimajo executionTypeId = 99
//vmes jih deleta, na koncu pa jim da se id od indexa
async function fetchWholeSchedule(facultyRef, rooms) {
  const lecturesRef = facultyRef.collection("original_lectures");

  const lectureQuery = lecturesRef;

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


//grupira po tutors, course, execution type.... dobesedno samo za nextId
function groupLectures(lectures) {
  const dataType = new Map();

  for (const lecture of lectures) {
    let data = `C${lecture.courseId} E${lecture.executionTypeId} S${lecture.size} T${lecture.tutor_ids.join(",")} G${lecture.group_ids.join(",")}`;

    let lectureInfo = dataType.get(data);
    if (!lectureInfo) {
      lectureInfo = [];
      dataType.set(data, lectureInfo);
    }

    const lastLecture = lectureInfo[lectureInfo.length - 1];
    const duration = lastLecture ? lastLecture.duration + lecture.duration : lecture.duration;

    lectureInfo.push({ id: lecture.id, weekNo: lecture.week, duration: duration });
  }

  const json = Object.fromEntries(dataType);
  return json;
}


//Ponavljajocim predavanjam oz tipom lecturjem dam next id, da se bo lahko schedulal zaporedno vsak tedn
async function expandLectureData(lectures){
  const groupedLectures = groupLectures(lectures);

  for(const key in groupedLectures){
    const groupedLecture = groupedLectures[key];
    const length = groupedLecture.length;

    for (let i = 0; i < length; i++) {
      const groupL = groupedLecture[i];
      const id = groupL.id;
      const lecture = lectures[id];
      
      // Assigning prevId
      if (i - 1 >= 0) {
        const prevGroupL = groupedLecture[i - 1];
        const prevId = prevGroupL.id;
        lecture.prevId = prevId;
      } else {
        lecture.prevId = -1;
      }

      // Assigning nextId
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
