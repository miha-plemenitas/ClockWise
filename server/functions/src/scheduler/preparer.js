const { db } = require('../utils/firebaseAdmin');
const { getAllFacultyCollectionItems } = require("../service/facultyCollections");


/**
 * Retrieves available rooms for a specified faculty, excluding certain room IDs.
 *
 * This function fetches all rooms for the specified faculty and filters out rooms with specific IDs
 * that are not considered available.
 *
 * @param {string} facultyId - The ID of the faculty.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of available room objects.
 */
async function getAvailableRooms(facultyId){
  const rooms = await getAllFacultyCollectionItems(facultyId, "rooms");

  const availableRooms = rooms.filter(room => room.id != "213" && room.id != "308");
  return availableRooms;
}


/**
 * Calculates the ISO week number for a given date.
 *
 * This function calculates the week number of the year for the given date according to the ISO-8601 standard,
 * where the week starts on Monday and the first week of the year contains the first Thursday.
 *
 * @param {Date} date - The date object for which to calculate the week number.
 * @returns {number} The ISO week number of the year for the given date.
 */
function getWeekNumber(date) {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const dayOfWeek = startDate.getDay() || 7;
  startDate.setDate(startDate.getDate() + 1 - dayOfWeek);
  const diff = (date - startDate) / (24 * 60 * 60 * 1000);
  return Math.ceil((diff + 1) / 7);
};


/**
 * Prepares lecture data by processing and normalizing various fields.
 *
 * This function processes the lecture data by calculating the duration, determining the size based on room information,
 * mapping execution types to their respective IDs, calculating the week number, and setting the schedulable status.
 *
 * @param {Object} data - The lecture data object to be prepared.
 * @param {Array<Object>} rooms - An array of room objects to use for determining room sizes.
 * @returns {Object} The prepared lecture data object.
 */
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


/**
 * Resets the collection and fetches the schedule of lectures for a faculty.
 *
 * This function retrieves the available rooms and the entire schedule of lectures for the specified faculty.
 * It filters and prepares the lecture data for further processing.
 *
 * @param {string} facultyId - The ID of the faculty.
 * @returns {Promise<Object>} A promise that resolves to an object containing `original_lectures` and `rooms`.
 */
async function resetCollectionAndFetchSchedule(facultyId) {
  const facultyRef = db.collection("faculties").doc(facultyId);

  const rooms = await getAvailableRooms(facultyId); //iz sob sam vmes se deletam ms teams pa default sobo za diplomo n shit
  const original_lectures = await fetchWholeSchedule(facultyRef, rooms); //vsi lecturji razen tipa 99

  return { original_lectures, rooms };
}


/**
 * Fetches the entire schedule of lectures for a faculty, filters out invalid lectures, and prepares them.
 *
 * This function retrieves all lecture documents from the "original_lectures" collection of the specified faculty.
 * It filters out lectures without room IDs, deletes them from the database, prepares the remaining lectures, and assigns IDs to them.
 *
 * @param {Object} facultyRef - The Firestore reference to the faculty document.
 * @param {Array<Object>} rooms - An array of room objects to be used in preparing the lectures.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of prepared lecture objects.
 */
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


/**
 * Groups lectures by course, execution type, size, tutors, and groups for assigning `nextId` and `prevId`.
 *
 * This function groups lectures by combining various attributes such as course ID, execution type ID,
 * size, tutor IDs, and group IDs. It creates a unique key for each combination and stores lecture information
 * in a map for further processing.
 *
 * @param {Array<Object>} lectures - An array of lecture objects to be grouped.
 * @returns {Object} An object containing grouped lecture information.
 */function groupLectures(lectures) {
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


/**
 * Expands lecture data by assigning `prevId` and `nextId` to recurring lectures.
 *
 * This function groups lectures by type and assigns `prevId` and `nextId` to each lecture
 * in the group to facilitate sequential scheduling each week.
 *
 * @param {Array<Object>} lectures - An array of lecture objects to be expanded.
 * @returns {Promise<void>} A promise that resolves when the lecture data has been expanded.
 */
async function expandLectureData(lectures){
  const groupedLectures = groupLectures(lectures);

  for(const key in groupedLectures){
    const groupedLecture = groupedLectures[key];
    const length = groupedLecture.length;

    for (let i = 0; i < length; i++) {
      const groupL = groupedLecture[i];
      const id = groupL.id;
      const lecture = lectures[id];
      
      if (i - 1 >= 0) {
        const prevGroupL = groupedLecture[i - 1];
        const prevId = prevGroupL.id;
        lecture.prevId = prevId;
      } else {
        lecture.prevId = -1;
      }

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
