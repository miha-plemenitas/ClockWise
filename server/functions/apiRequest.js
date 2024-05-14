const axios = require('axios');

const { db, admin } = require('./firebaseAdmin');
const { wtt_URL, credentials } = require('./constants');
const faculties = require('./faculties.json');

// TODO: Fill DB with courses
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


async function fetchBranchesByFacultyId(id) {
  let facultyDoc;
  try {
    const facultyRef = db.collection('faculties').doc(id);
    facultyDoc = await facultyRef.get();

    if (!facultyDoc.exists)
      throw new Error();
  } catch (error) {
    return "Faculty with this ID could not be found";
  }

  const response = await fetchBranchesByFacultyDoc(facultyDoc);
  return response;
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


async function fetchBranchesForAllFaculties() {
  const headers = await getHeadersWithToken();

  const faculties = await db.collection('faculties').get();
  for (const facultyDoc of faculties.docs) {
    const response = await fetchBranchesByFacultyDoc(facultyDoc);
  }
}

async function fetchAndStoreBranchesForProgram(id) {
  const URL = `${wtt_URL}/branchAllForProgrmmeYear`;

  let facultyDoc;
  try {
    const facultyRef = db.collection('faculties').doc(id);
    facultyDoc = await facultyRef.get();

    if (!facultyDoc.exists)
      throw new Error();
  } catch (error) {
    return "Faculty with this ID could not be found";
  }

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
        };

        const branchId = branch.id.toString();
        try {
          await programDoc.ref.collection('branches').doc(branchId).set(branchData);
          console.log(`Added branch ${branch.branchName}, for program ${program.programId}, ${faculty.facultyId}`);
        } catch (error) {
          console.error("Failed to save branch data: " + error.message);
        }
      });

      await Promise.all(branchPromises);
    }
  }
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


async function fetchAndStoreCoursesById(id) {
  const headers = await getHeadersWithToken();

  let facultyDoc;
  let facultyRef;
  try {
    facultyRef = db.collection('faculties').doc(id);
    facultyDoc = await facultyRef.get();

    if (!facultyDoc.exists) throw new Error("Faculty not found");
  } catch (error) {
    console.error("Error fetching faculty:", error.message);
    return "Faculty with this ID could not be found";
  }

  const faculty = facultyDoc.data();
  let response;
  try {
    response = await axios.get(wtt_URL + "/courseAll", {
      params: { "schoolCode": faculty.schoolCode, "language": "slo" },
      headers: headers
    });
  } catch (error) {
    console.error("Error fetching courses from API:", error.message);
    return;
  }

  const courses = response.data;
  const batch = db.batch();

  const programLookups = courses.filter((_, index) => index % 20 === 0)
    .map(course => findProgramForBranch(facultyRef, course.branchId)
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
    const courseRef = facultyRef.collection('courses').doc(course.id);
    batch.set(courseRef, courseData);
  });

  await batch.commit();
  console.log("Added all selected courses successfully.");
}


async function fetchAndStoreCoursesForAllFaculties() {
  const headers = await getHeadersWithToken();
  let facultiesSnapshot;
  try {
    facultiesSnapshot = await db.collection('faculties').get();
    if (facultiesSnapshot.empty) throw new Error("No faculties found");
  } catch (error) {
    console.error("Error fetching faculties:", error.message);
    return "Failed to fetch faculties";
  }

  for (const facultyDoc of facultiesSnapshot.docs) {
    const faculty = facultyDoc.data();
    const facultyRef = facultyDoc.ref;

    let response;
    try {
      response = await axios.get(wtt_URL + "/courseAll", {
        params: { "schoolCode": faculty.schoolCode, "language": "slo" },
        headers: headers
      });
    } catch (error) {
      console.error(`Error fetching courses for faculty ${faculty.schoolCode}:`, error.message);
      continue;
    }

    const courses = response.data;
    const batch = db.batch();

    const programLookups = courses.filter((_, index) => index % 20 === 0)
      .map(course => findProgramForBranch(facultyRef, course.branchId)
        .then(programId => ({
          course,
          programId
        })));

    const resolvedCourses = await Promise.all(programLookups);

    resolvedCourses.forEach(({ course, programId }) => {
      if (programId) {
        const courseData = {
          courseId: Number(course.id),
          course: course.course,
          programId: programId,
          branchId: Number(course.branchId)
        };
        const courseRef = facultyRef.collection('courses').doc(course.id);
        batch.set(courseRef, courseData);
      }
    });

    await batch.commit();
    console.log(`Added all selected courses successfully for faculty ${faculty.schoolCode}.`);
  }
}

async function fetchAndStoreTutorsForFacultiesById(id) {
  const headers = await getHeadersWithToken();

  let facultyDoc;
  let facultyRef;
  try {
    facultyRef = db.collection('faculties').doc(id);
    facultyDoc = await facultyRef.get();

    if (!facultyDoc.exists) throw new Error("Faculty not found");
  } catch (error) {
    console.error("Error fetching faculty:", error.message);
    return "Faculty with this ID could not be found";
  }

  const faculty = facultyDoc.data();
  let response;
  try {
    response = await axios.get(wtt_URL + "/basicTutorAll", {
      params: { "schoolCode": faculty.schoolCode, "language": "slo" },
      headers: headers
    });
  } catch (error) {
    console.error("Error fetching courses from API:", error.message);
    return;
  }

  const tutors = response.data;

  for (const tutor of tutors) {
    const tutorId = tutor.id;

    const tutorData = {
      tutorId: Number(tutorId),
      firstName: tutor.firstName,
      lastName: tutor.lastName
    }

    await facultyRef.collection('tutors').doc(tutorId).set(tutorData);
  }

  console.log("Succesfully added tutors");
}

async function fetchAndStoreTutorsForFaculties() {
  const headers = await getHeadersWithToken();

  let facultiesSnapshot;
  try {
    facultiesSnapshot = await db.collection('faculties').get();
    if (facultiesSnapshot.empty) throw new Error("No faculties found");
  } catch (error) {
    console.error("Error fetching faculties:", error.message);
    return "Failed to fetch faculties";
  }

  for (const facultyDoc of facultiesSnapshot.docs) {

    const faculty = facultyDoc.data();
    const facultyRef = facultyDoc.ref;

    let response;
    try {
      response = await axios.get(wtt_URL + "/basicTutorAll", {
        params: { "schoolCode": faculty.schoolCode, "language": "slo" },
        headers: headers
      });
    } catch (error) {
      console.error("Error fetching courses from API:", error.message);
      return;
    }

    const tutors = response.data;

    for (const tutor of tutors) {
      const tutorId = tutor.id;

      const tutorData = {
        tutorId: Number(tutorId),
        firstName: tutor.firstName,
        lastName: tutor.lastName
      }

      await facultyRef.collection('tutors').doc(tutorId).set(tutorData);
    }

    console.log("Succesfully added tutors");
  }
}

module.exports = {
  addFacultyDocumentsFromList, fetchAndStoreProgramsForFaculties, fetchBranchesForAllFaculties, fetchAndStoreBranchesForProgram, fetchAndStoreCoursesById,
  fetchAndStoreCoursesForAllFaculties, fetchAndStoreTutorsForFacultiesById, fetchAndStoreTutorsForFaculties, fetchBranchesByFacultyId
};
