const axios = require('axios');
const { db } = require('./firebaseAdmin');
const { wtt_URL } = require('./constants');
const faculties = require('./faculties.json');

/**
 * Asynchronously retrieves an authentication token from a server.
 *
 * This function uses HTTP Basic Authentication to request a token from the WiseTimeTable server.
 * It constructs the authentication header with a username and password, encodes 
 * the credentials to Base64, and sends a GET request to the server's login endpoint.
 * 
 * @returns {Promise<string>} A promise that resolves to the authentication JWT token.
 */
async function getToken() {
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
  return token;
}

/**
 * Adds faculty information to the Firestore 'faculties' collection from a provided list.
 * 
 * This function iterates through an array of faculty objects, each containing faculty
 * information. It uses each faculty's name as a document ID and adds a document to the
 * Firestore 'faculties' collection if it does not already exist. Each document includes
 * the faculty's name, school code, and an index as an identifier.
 *
 * Note: This function assumes that 'faculties' is a globally accessible array where each
 * element is an object with 'name' and 'schoolCode' properties.
 */
async function addFacultyDocumentsFromList() {
  console.log(faculties.length)
  for (let index = 0; index < faculties.length; index++) {
    const faculty = faculties[index];

    try {
      const docId = faculty.name;
      const docRef = db.collection('faculties').doc(docId);
      const doc = await docRef.get();

      if (!doc.exists) {
        await docRef.set({
          name: faculty.name,
          schoolCode: faculty.schoolCode,
          id: index
        });
        console.log(`Added faculty: ${faculty.name} with ID ${index}`);
      }
    } catch (error) {
      console.error('Error processing faculty:', faculty.name, error);
    }
  }
}

async function getPrograms(token, attempt = 0) {
  const faculties = await db.collection('faculties').get();

  faculties.forEach(async (doc) => {
    const faculty = doc.data();

    const params = {
      "schoolCode": faculty.schoolCode
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    try {
      response = await axios.get(wtt_URL + "/basicProgrammeAll", {
        params: params,
        headers: headers
      });

      const programs = response.data;

      programs.forEach(async (program) => {
        await doc.ref.collection('programs').doc(program.name).set({
          name: program.name,
          programLength: program.year,
          id: program.id,
          facultyRef: doc.ref
        });
      });
    } catch (error) {
      console.log('Error while fetching program data: ' + error);
    }
  });
}

async function performApiRequest() {
  let token;
  try {
    token = await getToken();
    await getPrograms(token);
  } catch (error) {
    console.error('Error in performApiRequest:', error);
  }
  console.log("Token:", token);
  return token;
}

module.exports = { performApiRequest, addFacultyDocumentsFromList };
