const axios = require('axios');

const { db, admin } = require('./firebaseAdmin');
const { wtt_URL, credentials } = require('./constants');
const faculties = require('./faculties.json');
const { response } = require('express');
const { findProgramForBranch } = require('./utility');

// TODO: FILL DB with groups 
// TODO: FIll DB with lectures, separate from lectureres, rooms and groups

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
          await commitBatch(batch, collectionRef.parent.id);
          batch = db.batch();
          batchCounter = 0;
      }
  }

  if (batchCounter > 0) {
      await commitBatch(batch, collectionRef.parent.id);
  }
}


async function commitBatch(batch, logIdentifier) {
  try {
      await batch.commit();
  } catch (error) {
      console.error(`Failed to commit batch for ${logIdentifier}: ${error.message}`);
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
  const batch = db.batch();

  faculties.forEach((faculty, index) => {
    const facultyId = index.toString();
    const docRef = db.collection('faculties').doc(facultyId);

    batch.set(docRef, {
      name: faculty.name,
      schoolCode: faculty.schoolCode,
      facultyId: index
    }, { merge: true });
  });

  try {
    await batch.commit();
    const log = "All faculties added or updated successfully.";
    console.log(log);
    return log;
  } catch (error) {
    console.error('Error processing faculties:', error);
    throw new Error("Error processing faculties");
  }
}


async function fetchProgramsForAllFaculties() {
  const faculties = await db.collection('faculties').get();

  faculties.forEach(async (doc) => {
    const faculty = doc.data();

    const URL = `${wtt_URL}/basicProgrammeAll`;
    const params = {
      "schoolCode": faculty.schoolCode,
      "language": "slo"
    }

    const programs = await fetchFromApi(URL, params);
    try {
      programs.forEach(async (program) => {
        const programData = {
          name: program.name,
          programDuration: program.year,
          programId: Number(program.id),
          facultyRef: doc.ref
        }

        const programId = program.id.toString();
        await doc.ref.collection('programs').doc(programId).set(programData);
      });
    } catch (error) {
      console.log('Error saving data: ' + error);
      throw new Error("Error saving data");
    }
  });
  const log = "Added programs for all faculties";
  console.log(log);
  return log;
}


async function fetchBranchesByFacultyDoc(facultyDoc) {
  const URL = `${wtt_URL}/branchAllForProgrmmeYear`;
  const faculty = facultyDoc.data();
  const programs = await facultyDoc.ref.collection('programs').get();

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
      await processItemsInBatch(facultyDoc.ref.collection('branches'), branches, (branch)=> ({
        id: branch.id.toString(),
        name: branch.branchName,
        branchId: Number(branch.id),
        year: index,
        programRef: programDoc.ref,
        programId: program.programId
      }));
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

  const programLookups = courses.filter((_, index) => index % 20 === 0)
    .map(course => findProgramForBranch(facultyDoc.ref, course.branchId)
      .then(programId => ({
        ...course,
        programId: programId
      })));

  const resolvedCourses = await Promise.all(programLookups);

  await processItemsInBatch(facultyDoc.ref.collection('courses'), resolvedCourses, (item) => ({
    id: item.id.toString(),
    courseId: Number(item.id),
    course: item.course,
    programId: item.programId,
    branchId: Number(item.branchId)
  }));

  const log = `Added courses for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}


async function fetchTutorsByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = `${wtt_URL}/basicTutorAll`;
  const params = { "schoolCode": faculty.schoolCode, "language": "slo" }

  const tutors = await fetchFromApi(URL, params);

  await processItemsInBatch(facultyDoc.ref.collection('tutors'), tutors, (tutor) => ({
    id: tutor.id.toString(),
    tutorId: Number(tutor.id),
    firstName: tutor.firstName,
    lastName: tutor.lastName
  }));

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

    await processItemsInBatch(facultyDoc.ref.collection('groups'), groups, (group) => ({
      id: group.id.toString(),
      groupId: Number(group.id),
      name: group.name,
      branchId: branch.branchId,
      programId: branch.programId
    }));
  }
  const log = `Added groups for faculty ${faculty.schoolCode}`;
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


module.exports = {
  addFacultyDocumentsFromList, fetchProgramsForAllFaculties, fetchDataByFacultyId, fetchDataForAllFaculties
};
