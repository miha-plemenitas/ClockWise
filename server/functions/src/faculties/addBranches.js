const { processBranchData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');
const { fetchFromApi } = require('../utils/apiHelpers');

async function fetchBranchesByFacultyDoc(facultyDoc) {
  const URL = "/branchAllForProgrmmeYear";
  const faculty = facultyDoc.data();
  const programs = await facultyDoc.ref.collection("programs").get();

  const numberOfPrograms = programs.size; // Added for courses filter
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
        "year": index,
      };

      const branches = await fetchFromApi(URL, params);
      await processItemsInBatch(
        facultyDoc.ref.collection("branches"),
        branches,
        (branch) => processBranchData(branch, program.programId, index));
    }
  }

  const log = `Added branches for faculty ${faculty.schoolCode}`;
  console.log(log);
  return log;
}

module.exports = {
  fetchBranchesByFacultyDoc,
}
