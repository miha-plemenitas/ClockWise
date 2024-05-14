const axios = require('axios');

const { db, admin } = require('./firebaseAdmin');
const { wtt_URL, credentials } = require('./constants');
const faculties = require('./faculties.json');
const { response } = require('express');

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
    console.log("All faculties added or updated successfully.");
  } catch (error) {
    console.error('Error processing faculties:', error);
    return false;
  }

  return true;
}


async function fetchAndStoreProgramsForFaculties() {
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
      console.log('Error while fetching program data: ' + error);
    }
  });
  return true;
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

      const branchPromises = branches.map(async (branch) => {
        if (!branch.branchName) {
          return;
        }

        const branchData = {
          name: branch.branchName,
          branchId: Number(branch.id),
          year: index,
          programRef: programDoc.ref,
          programId: program.programId
        };

        const branchId = branch.id.toString();
        try {
          await facultyDoc.ref.collection('branches').doc(branchId).set(branchData);
        } catch (error) {
          console.error("Failed to save branch data: " + error.message);
        }
      });

      await Promise.all(branchPromises);
    }
    console.log(`Added branches for program ${program.name}`);
  }
  console.log(`Added branches for faculty ${faculty.schoolCode}`);
}


async function fetchCoursesByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = `${wtt_URL}/courseAll`;
  const params = { "schoolCode": faculty.schoolCode, "language": "slo" }

  const courses = await fetchFromApi(URL, params);
  const batch = db.batch();

  const programLookups = courses.filter((_, index) => index % 20 === 0)
    .map(course => findProgramForBranch(facultyDoc.ref, course.branchId)
      .then(programId => ({
        course,
        programId
      })));

  const resolvedCourses = await Promise.all(programLookups);

  resolvedCourses.forEach(({ course, programId }) => {
    const courseData = {
      courseId: Number(course.id),
      course: course.course,
      programId: programId,
      branchId: Number(course.branchId)
    };
    const courseRef = facultyDoc.ref.collection('courses').doc(course.id);
    batch.set(courseRef, courseData);
  });

  await batch.commit();
  console.log(`Added courses for faculty ${faculty.schoolCode}`);

  return;
}


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


async function fetchTutorsByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = `${wtt_URL}/basicTutorAll`;
  const params = { "schoolCode": faculty.schoolCode, "language": "slo" }

  const tutors = await fetchFromApi(URL, params);

  for (const tutor of tutors) {
    const tutorId = tutor.id;

    const tutorData = {
      tutorId: Number(tutorId),
      firstName: tutor.firstName,
      lastName: tutor.lastName
    }

    await facultyDoc.ref.collection('tutors').doc(tutorId).set(tutorData);
  }

  console.log(`Added tutors for faculty ${faculty.schoolCode}`);
  return;
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
  return;
}


async function fetchDataByFacultyId(id, dataType) {
  return fetchDataForFaculty(id, dataType);
}


module.exports = {
  addFacultyDocumentsFromList, fetchAndStoreProgramsForFaculties, fetchDataByFacultyId, fetchDataForAllFaculties
};
