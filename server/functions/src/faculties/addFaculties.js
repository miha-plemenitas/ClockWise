const { faculties } = require('../constants/constants');
const { db } = require('../utils/firebaseAdmin');
const { processFacultyData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');

async function addFacultyDocumentsFromList() {
  await processItemsInBatch(
    db.collection("faculties"),
    faculties,
    processFacultyData
  );

  const log = `All faculties added or updated successfully`;
  console.log(log);
  return log;
}

module.exports = {
  addFacultyDocumentsFromList,
}
