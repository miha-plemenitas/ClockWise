const { Timestamp } = require('firebase-admin/firestore');
const { setFirestoreTimestampsAndDuration } = require("./timeUtils");

/**
 * Processes lecture data and returns a formatted object.
 *
 * @param {Object} lecture - The lecture data.
 * @returns {Object} The processed lecture data.
 */
function processLectureData(lecture) {
  let { executionTypeId, executionType } = lecture;

  if (!executionTypeId || executionTypeId === "") {
    executionTypeId = "99";
    executionType = "99";
  }

  const { startTime, endTime, duration } = setFirestoreTimestampsAndDuration(lecture);

  const extractIds = (items) => items.map(item => item.id);

  let hasRooms = false;
  if (Array.isArray(lecture.rooms)) {
    hasRooms = lecture.rooms.length > 0;
  }

  if(!lecture.rooms || !lecture.lecturers || !lecture.groups || !lecture.branches){
    throw new Error("No rooms, tutors, groups or branches sent");
  }

  return {
    id: `${lecture.id} ${lecture.start_time}`,
    startTime: startTime,
    endTime: endTime,
    courseId: lecture.courseId,
    course: lecture.course,
    executionTypeId: executionTypeId,
    executionType: executionType,
    branch_ids: lecture.branches ? extractIds(lecture.branches) : [],
    room_ids: lecture.rooms ? extractIds(lecture.rooms) : [],
    group_ids: lecture.groups ? extractIds(lecture.groups) : [],
    tutor_ids: lecture.lecturers ? extractIds(lecture.lecturers) : [],
    rooms: lecture.rooms,
    tutors: lecture.lecturers,
    groups: lecture.groups,
    branches: lecture.branches,
    duration: duration,
    hasRooms: hasRooms
  };
}


/**
 * Processes faculty data and returns a formatted object.
 *
 * @param {Object} faculty - The faculty data.
 * @returns {Object} The processed faculty data.
 */
function processFacultyData(faculty) {
  return {
    id: faculty.id.toString(),
    name: faculty.name,
    schoolCode: faculty.schoolCode,
    facultyId: faculty.id,
  };
}


/**
 * Processes program data and returns a formatted object.
 *
 * @param {Object} program - The program data.
 * @returns {Object} The processed program data.
 */
function processProgramData(program) {
  return {
    id: program.id.toString(),
    name: program.name,
    programDuration: program.year,
    programId: Number(program.id),
  };
}


/**
 * Processes branch data and returns a formatted object.
 *
 * @param {Object} branch - The branch data.
 * @param {string} programId - The program ID associated with the branch.
 * @param {number} index - The index representing the year.
 * @returns {Object} The processed branch data.
 */
function processBranchData(branch, programId, index) {
  return {
    id: branch.id.toString(),
    name: branch.branchName,
    branchId: Number(branch.id),
    year: index,
    programId: programId,
  };
}


/**
 * Processes course data and returns a formatted object.
 *
 * @param {Object} course - The course data.
 * @returns {Object} The processed course data.
 */
function processCourseData(course) {
  return {
    id: course.id.toString(),
    courseId: Number(course.id),
    course: course.course,
    programId: course.programId,
    branchId: Number(course.branchId),
  };
}


/**
 * Processes tutor data and returns a formatted object.
 *
 * @param {Object} tutor - The tutor data.
 * @returns {Object} The processed tutor data.
 */
function processTutorData(tutor) {
  return {
    id: tutor.id.toString(),
    tutorId: Number(tutor.id),
    firstName: tutor.firstName,
    lastName: tutor.lastName,
  };
}


/**
 * Processes group data and returns a formatted object.
 *
 * @param {Object} group - The group data.
 * @param {Object} branch - The branch data associated with the group.
 * @returns {Object} The processed group data.
 */
function processGroupData(group, branch) {
  return {
    id: group.id.toString(),
    groupId: Number(group.id),
    name: group.name,
    branchId: branch.branchId,
    programId: branch.programId,
  };
}


/**
 * Processes room data and returns a formatted object.
 *
 * @param {Object} room - The room data.
 * @returns {Object} The processed room data.
 */
function processRoomData(room) {
  return {
    id: room.id.toString(),
    roomId: Number(room.id),
    roomName: room.name,
    size: room.size,
    equipment: room.equipment
  };
}


/**
 * Processes schedule data and returns a formatted object.
 *
 * @param {Object} lecture - The lecture data.
 * @returns {Object} The processed lecture data.
 */
function processScheduleData(lecture) {
  const { startTime, endTime } = setFirestoreTimestampsAndDuration(lecture);

  let completeLecture = {
    startTime: startTime,
    endTime: endTime,
    ...lecture
  };

  delete completeLecture.week;
  delete completeLecture.schedulable;
  delete completeLecture.prevId;
  delete completeLecture.nextId;
  delete completeLecture.day;
  delete completeLecture.start;
  delete completeLecture.end;

  return completeLecture;
}


module.exports = {
  processBranchData,
  processCourseData,
  processFacultyData,
  processGroupData,
  processLectureData,
  processProgramData,
  processRoomData,
  processTutorData,
  processScheduleData
}
