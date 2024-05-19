const { processGroupData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

/**
 * Fetches groups for each branch of a given faculty document.
 * Processes and stores the groups in the Firestore collection.
 *
 * @param {firebase.firestore.DocumentSnapshot} facultyDoc - The Firestore document snapshot of the faculty.
 * @returns {Promise<string>} A log message indicating the completion of group addition.
 * @throws {Error} If there is an issue with fetching data from the API, processing groups, or updating Firestore.
 */
async function fetchGroupsByFacultyDoc(facultyDoc) {
  const faculty = facultyDoc.data();
  const URL = "/groupAllForBranch";

  const branches = await facultyDoc.ref.collection("branches").get();
  for (const branchDoc of branches.docs) {
    const branch = branchDoc.data();
    const params = {
      "schoolCode": faculty.schoolCode,
      "language": "slo",
      "branchId": branch.branchId,
    };

    const groups = await fetchFromApi(URL, params);

    await processItemsInBatch(
      facultyDoc.ref.collection("groups"),
      groups,
      (group) => processGroupData(group, branch)
    );
  }
  const log = `Added groups for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}

module.exports = {
  fetchGroupsByFacultyDoc,
}
