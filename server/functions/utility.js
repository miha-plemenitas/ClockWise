async function findProgramForBranch(facultyRef, branchId) {
  try {
    const branchQuery = facultyRef.collection("branches").doc(branchId);
    const branchDoc = await branchQuery.get();

    if (!branchDoc.empty) {
      const branch = branchDoc.data();
      return branch.programId;
    }
  } catch (error) {
    console.error("Error finding program for branch:", error);
  }

  return null;
}


function checkBasicAuth(request) {
  const bufferedPassowrd = Buffer.from("admin:password").toString("base64");
  const expectedAuth = "Basic " + bufferedPassowrd;
  const receivedAuth = request.headers.authorization;

  if (receivedAuth !== expectedAuth) {
    return false;
  }
  return true;
}


function processLectureData(lecture) {
  let {executionTypeId, executionType} = lecture;

  if (!executionTypeId || executionTypeId === "") {
    executionTypeId = "99";
    executionType = "99";
  }

  return {
    id: `${lecture.id} ${lecture.start_time}`,
    startTime: lecture.start_time,
    endTime: lecture.end_time,
    courseId: lecture.courseId,
    course: lecture.course,
    executionTypeId: executionTypeId,
    executionType: executionType,
    branches: lecture.branches,
    rooms: lecture.rooms,
    groups: lecture.groups,
    tutors: lecture.lecturers,
  };
}


function processFacultyData(faculty) {
  return {
    id: faculty.id.toString(),
    name: faculty.name,
    schoolCode: faculty.schoolCode,
    facultyId: faculty.id,
  };
}


function processProgramData(program) {
  return {
    id: program.id.toString(),
    name: program.name,
    programDuration: program.year,
    programId: Number(program.id),
  };
}


function processBranchData(branch, programId, index) {
  return {
    id: branch.id.toString(),
    name: branch.branchName,
    branchId: Number(branch.id),
    year: index,
    programId: programId,
  };
}


function processCourseData(course) {
  return {
    id: course.id.toString(),
    courseId: Number(course.id),
    course: course.course,
    programId: course.programId,
    branchId: Number(course.branchId),
  };
}


function processTutorData(tutor) {
  return {
    id: tutor.id.toString(),
    tutorId: Number(tutor.id),
    firstName: tutor.firstName,
    lastName: tutor.lastName,
  };
}


function processGroupData(group, branch) {
  return {
    id: group.id.toString(),
    groupId: Number(group.id),
    name: group.name,
    branchId: branch.branchId,
    programId: branch.programId,
  };
}


function processRoomData(room) {
  return {
    id: room.id.toString(),
    roomId: Number(room.id),
    roomName: room.name,
  };
}

module.exports = {
  findProgramForBranch, checkBasicAuth,
  processLectureData, processFacultyData, processProgramData, processBranchData,
  processCourseData, processTutorData, processGroupData, processRoomData,
};
