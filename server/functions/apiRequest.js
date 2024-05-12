const axios = require('axios');

const { db } = require('./firebaseAdmin');
const { wtt_URL } = require('./constants');
const faculties = require('./faculties.json');

// TODO: Fill DB with courses and branches
// TODO: Fill DB with lectureres
// TODO: FIll DB with lectures, separate from lectureres, rooms and groups


async function getHeadersWithToken() {
  username = "wtt_api_user_a"
  password = "H50lsd2$XejBIBv7t"

  const credentials = `${username}:${password}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');

  const headers = {
    Authorization: `Basic ${encodedCredentials}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.get(`${wtt_URL}/login`, { headers });
  const token = response.data.token;

  const headersWithToken = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  return headersWithToken;
}


async function addFacultyDocumentsFromList() {
  for (let index = 0; index < faculties.length; index++) {
    const faculty = faculties[index];

    try {
      const facultyId = index.toString();
      const docRef = db.collection('faculties').doc(facultyId);
      const doc = await docRef.get();

      if (!doc.exists) {
        await docRef.set({
          name: faculty.name,
          schoolCode: faculty.schoolCode,
          facultyId: index
        });
        console.log(`Added faculty: ${faculty.name} with ID ${index}`);
      }
    } catch (error) {
      console.error('Error processing faculty:', faculty.name, error);
    }
  }
  console.log("Added all the faculties to the Database.");
  return true;
}


async function fetchAndStoreProgramsForFaculties() {
  const headers = await getHeadersWithToken();

  const faculties = await db.collection('faculties').get();

  faculties.forEach(async (doc) => {
    const faculty = doc.data();

    const params = {
      "schoolCode": faculty.schoolCode,
      "language": "slo"
    }

    try {
      response = await axios.get(wtt_URL + "/basicProgrammeAll", {
        params: params,
        headers: headers
      });

      const programs = response.data;

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

async function fetchAndStoreBranchesForPrograms() {
  const headers = await getHeadersWithToken();

  const faculties = await db.collection('faculties').get();
  for (const facultyDoc of faculties.docs) {
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
        };
        let response;
        try {
          response = await axios.get(wtt_URL + "/branchAllForProgrmmeYear", { params, headers });
        } catch (error) {
          console.error("Error while fetching program branches", error);
          continue;
        }

        for (const branch of response.data) {
          if (!branch.branchName) {
            console.log("Skipping branch with empty name");
            continue;
          }
          const branchData = {
            name: branch.branchName,
            branchId: branch.id,
            year: index,
            programRef: programDoc.ref,
          };

          try {
            const branchId = branch.id.toString();
            await programDoc.ref.collection('branches').doc(branchId).set(branchData);
            console.log(`Added branch ${branch.branchName}, for program ${program.programId}, ${faculty.facultyId} on year ${index}`);
          } catch (error) {
            console.error("Failed to process branch:", branch.branchName, error);
          }
        }
      }
    }
  }
  return true;
}


async function fetchAndStoreBranchesForProgram(id) {
  const headers = await getHeadersWithToken();

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

      let response;
      try {
        response = await axios.get(wtt_URL + "/branchAllForProgrmmeYear", {
          params: params,
          headers: headers
        });
      } catch (error) {
        console.error("Error while fatching program branche from API");
      }

      const branchPromises = response.data.map(async (branch) => {
        if (!branch.branchName) {
          return;
        }

        const branchData = {
          name: branch.branchName,
          branchId: branch.id,
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

module.exports = { addFacultyDocumentsFromList, fetchAndStoreProgramsForFaculties, fetchAndStoreBranchesForPrograms, fetchAndStoreBranchesForProgram };
