const { processGroupData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

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
