const axios = require('axios');

const { db, admin } = require('./firebaseAdmin');
const { wtt_URL, credentials } = require('./constants');
const faculties = require('./faculties.json');
const { response } = require('express');
const { findProgramForBranch, processLectureData, processFacultyData, processProgramData, processBranchData, processCourseData, processTutorData,
  processGroupData, processRoomData } = require('./utility');


async function fetchFromApi(URL, params = null, headers = null) {
  if (!headers) {
    headers = await getHeadersWithToken();
  }

  try {
    const response = await axios.get(URL, {
      params: params,
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses from API:", error.message);
    throw new Error("Failed to fetch courses");
  }
}


async function processItemsInBatch(collectionRef, items, processData, batchLimit = 400) {
  let batch = db.batch();
  let batchCounter = 0;

  for (const item of items) {
    const data = processData(item);
    if (!data) continue;

    const docRef = collectionRef.doc(data.id);
    batch.set(docRef, data);
    batchCounter++;

    if (batchCounter >= batchLimit) {
      await commitBatch(batch);
      batch = db.batch();
      batchCounter = 0;
    }
  }

  if (batchCounter > 0) {
    await commitBatch(batch);
  }
}


async function commitBatch(batch) {
  try {
    await batch.commit();
  } catch (error) {
    console.error(`Failed to commit batch: ${error.message}`);
  }
}


async function getHeadersWithToken() {
  const URL = `${wtt_URL}/login`;
  const headers = {
    Authorization: `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };

  const data = await fetchFromApi(URL, undefined, headers);
  const token = data.token;

  const headersWithToken = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return headersWithToken;
}


async function addFacultyDocumentsFromList() {
  await processItemsInBatch(db.collection('faculties'), faculties, processFacultyData);

  const log = `All faculties added or updated successfully`;
  console.log(log);
  return log;
}


async function fetchProgramsForAllFaculties() {
  const faculties = await db.collection('faculties').get();

  for (const facultyDoc of faculties.docs) {
    const faculty = facultyDoc.data();

    const URL = `${wtt_URL}/basicProgrammeAll`;
    const params = {
      "schoolCode": faculty.schoolCode,
      "language": "slo"
    }

    const programs = await fetchFromApi(URL, params);

    await processItemsInBatch(facultyDoc.ref.collection('programs'), programs, processProgramData);
  }

  const log = "Added programs for all faculties";
  console.log(log);
  return log;
}


async function fetchBranchesByFacultyDoc(facultyDoc) {
  const URL = `${wtt_URL}/branchAllForProgrmmeYear`;
  const faculty = facultyDoc.data();
  const programs = await facultyDoc.ref.collection('programs').get();

  const numberOfPrograms = programs.size;     // Added for courses filter
  await facultyDoc.ref.update({
    numberOfPrograms: numberOfPrograms
  });

  for (const programDoc of programs.docs) {
    const program = programDoc.data();
    const year = Number(program.programDuration);

    for (let index = 1; index <= year; index++) {
      const params = {
        "schoolCode": faculty.schoolCode,
        "language": "slo",
        "programmeId": program.programId,
        "year": index
      }

      const branches = await fetchFromApi(URL, params);
      await processItemsInBatch(facultyDoc.ref.collection('branches'), branches, (branch) => processBranchData(branch, program.programId, index));
    }
  }

  const log = `Added branches for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


async function fetchCoursesByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = `${wtt_URL}/courseAll`;
  const params = { "schoolCode": faculty.schoolCode, "language": "slo" }

  const courses = await fetchFromApi(URL, params);

  const programLookups = courses.filter((_, index) => index % faculty.numberOfPrograms === 0)
    .map(course => findProgramForBranch(facultyDoc.ref, course.branchId)
      .then(programId => ({
        ...course,
        programId: programId
      })));

  const resolvedCourses = await Promise.all(programLookups);

  await processItemsInBatch(facultyDoc.ref.collection('courses'), resolvedCourses, (course) => processCourseData(course));

  const log = `Added courses for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


async function fetchTutorsByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = `${wtt_URL}/basicTutorAll`;
  const params = { "schoolCode": faculty.schoolCode, "language": "slo" }

  const tutors = await fetchFromApi(URL, params);

  await processItemsInBatch(facultyDoc.ref.collection('tutors'), tutors, (tutor) => processTutorData(tutor));

  const log = `Added tutors for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


async function fetchGroupsByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = `${wtt_URL}/groupAllForBranch`;

  const branches = await facultyDoc.ref.collection('branches').get();
  for (const branchDoc of branches.docs) {
    const branch = branchDoc.data();
    const params = { "schoolCode": faculty.schoolCode, "language": "slo", "branchId": branch.branchId }

    const groups = await fetchFromApi(URL, params);

    await processItemsInBatch(facultyDoc.ref.collection('groups'), groups, (group) => processGroupData(group, branch));
  }
  const log = `Added groups for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


async function fetchLecturesByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = `${wtt_URL}/scheduleAll`;

  const params = {
    "schoolCode": faculty.schoolCode,
    "language": "slo",
    "dateFrom": "2024-02-26",
    "dateTo": "2024-06-14"
  }

  const lectures = await fetchFromApi(URL, params);

  await processItemsInBatch(facultyDoc.ref.collection("lectures"), lectures, processLectureData);

  const log = `Added lectures for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


async function fetchRoomsByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const lectures = await facultyDoc.ref.collection('lectures').get();
  const uniqueRooms = new Map();

  for (const lectureDoc of lectures.docs) {
    const lecture = lectureDoc.data();

    for (const room of lecture.rooms) {
      if (!room.id)
        continue;
      uniqueRooms.set(room.id, { id: room.id, name: room.name });
    }
  }

  const uniqueRoomsArray = Array.from(uniqueRooms.values());

  await processItemsInBatch(facultyDoc.ref.collection("rooms"), uniqueRoomsArray, (room) => processRoomData(room));

  const log = `Added rooms for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


async function fetchDataForFaculty(facultyParam, dataType) {
  let facultyDoc;

  if (typeof facultyParam === 'string') {
    let facultyRef = db.collection('faculties').doc(facultyParam);
    facultyDoc = await facultyRef.get();
    if (!facultyDoc) {
      return "Faculty with this ID could not be found";
    }
  } else {
    facultyDoc = facultyParam;   // If facultyParam is a DocumentSnapshot
  }

  switch (dataType) {
    case 'tutors':
      return fetchTutorsByFacultyDoc(facultyDoc);
    case 'courses':
      return fetchCoursesByFacultyDoc(facultyDoc);
    case 'branches':
      return fetchBranchesByFacultyDoc(facultyDoc);
    case 'groups':
      return fetchGroupsByFacultyDoc(facultyDoc);
    case 'lectures':
      return fetchLecturesByFacultyDoc(facultyDoc);
    case 'rooms':
      return fetchRoomsByFacultyDoc(facultyDoc);
    default:
      console.error('Invalid data type specified');
      return null;
  }
}


async function fetchDataForAllFaculties(dataType) {
  const faculties = await db.collection('faculties').get();
  const promises = faculties.docs.map(facultyDoc => {
    return fetchDataForFaculty(facultyDoc, dataType);
  });

  await Promise.all(promises);
  return `Added ${dataType} to all faculties`;
}


async function fetchDataByFacultyId(id, dataType) {
  return fetchDataForFaculty(id, dataType);
}


async function fetchData(id, collectionName) {
  let result;
  if (!id) {
    result = await fetchDataForAllFaculties(collectionName);
    return result;
  } else {
    result = await fetchDataByFacultyId(id, collectionName);
    return result
  }
}


module.exports = {
  addFacultyDocumentsFromList, fetchProgramsForAllFaculties, fetchDataByFacultyId, fetchDataForAllFaculties, fetchData
};
