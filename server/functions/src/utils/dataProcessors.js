const { Timestamp } = require('firebase-admin/firestore');

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

  const startTime = lecture.start_time ? Timestamp.fromDate(new Date(lecture.start_time)) : null;
  const endTime = lecture.end_time ? Timestamp.fromDate(new Date(lecture.end_time)) : null;

  const extractIds = (items) => items.map(item => item.id);


  return {
    id: `${lecture.id} ${lecture.start_time}`,
    startTime: startTime,
    endTime: endTime,
    courseId: lecture.courseId,
    course: lecture.course,
    executionTypeId: executionTypeId,
    executionType: executionType,
    branches: lecture.branches ? extractIds(lecture.branches) : [],
    rooms: lecture.rooms ? extractIds(lecture.rooms) : [],
    groups: lecture.groups ? extractIds(lecture.groups) : [],
    tutors: lecture.lecturers ? extractIds(lecture.lecturers) : [],
    rooms_full: lecture.rooms,
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
  };
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
}
