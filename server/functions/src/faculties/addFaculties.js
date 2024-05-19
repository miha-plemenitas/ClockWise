const { faculties } = require('../constants/constants');
const { db } = require('../utils/firebaseAdmin');
const { processFacultyData } = require('../utils/dataProcessors');
const { processItemsInBatch } = require('../utils/batchOperations');

/**
 * Adds or updates faculty documents in the Firestore collection from a given list of faculties.
 * Processes each faculty in the list and stores the processed data in the Firestore collection.
 *
 * @returns {Promise<string>} A log message indicating the completion of adding or updating all faculty documents.
 * @throws {Error} If there is an issue with processing items in batch or updating Firestore.
 */
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
