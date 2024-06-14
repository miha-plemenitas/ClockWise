const { db } = require('./firebaseAdmin');
const { Timestamp } = require('firebase-admin/firestore');


/**
 * Processes items in batches and commits them to a Firestore collection.
 * If the number of items exceeds the batch limit, multiple batches are committed.
 *
 * @param {firebase.firestore.CollectionReference} collectionRef - The Firestore collection reference where the items will be written.
 * @param {Array} items - The array of items to be processed and written to the Firestore collection.
 * @param {function} processData - A function that processes an item and returns the data to be written to Firestore.
 * @param {number} [batchLimit=400] - The maximum number of writes allowed in a single batch (default is 400).
 * @returns {Promise<void>} A promise that resolves when all batches have been committed.
 * @throws {Error} If there is an issue with committing a batch.
 */
async function processItemsInBatch(
  collectionRef,
  items,
  processData,
  batchLimit = 400
) {
  let batch = db.batch();
  let batchCounter = 0;

  for (const item of items) {
    const data = processData(item);
    if (!data) continue;

    const docRef = collectionRef.doc(data.id);
    batch.set(docRef, data);
    batchCounter++;

    if (batchCounter >= batchLimit) {
      await commitBatch(batch);
      batch = db.batch();
      batchCounter = 0;
    }
  }

  if (batchCounter > 0) {
    await commitBatch(batch);
  }
}


/**
 * Commits a Firestore batch.
 * Logs an error message if the commit fails.
 *
 * @param {firebase.firestore.WriteBatch} batch - The Firestore WriteBatch to commit.
 * @returns {Promise<void>} A promise that resolves when the batch is committed.
 * @throws {Error} If there is an issue with committing the batch.
 */
async function commitBatch(batch) {
  try {
    await batch.commit();
  } catch (error) {
    console.error(`Failed to commit batch: ${error.message}`);
  }
}


/**
 * Filters an object to only include allowed keys.
 *
 * @param {Object} object - The object to be filtered.
 * @param {Array<string>} allowedKeys - The list of allowed keys.
 * @returns {Object} The filtered object containing only allowed keys.
 * @throws {Error} If no valid update fields are provided.
 */
function filterForAllowedKeys(object, allowedKeys) {
  const filteredObject = Object.keys(object)
    .filter(key => allowedKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});

  if (Object.keys(filteredObject).length === 0) {
    throw new Error("No valid update fields provided");
  }

  return filteredObject;
}


/**
 * Converts date fields in the data object to Firestore Timestamp objects.
 *
 * @param {Object} data - The data object containing date fields.
 * @returns {Object} The updated data object with date fields converted to Timestamps.
 * @throws {Error} If the date fields are not correctly formatted.
 */
function convertDatesToTimestamps(data) {
  const dateFields = ['startTime', 'endTime'];
  try {
    dateFields.forEach(field => {
      if (data[field]) {
        data[field] = Timestamp.fromDate(new Date(data[field]));
      }
    });

    return data;
  } catch (error) {
    throw new Error("Dates are not correctly formated, please use ISO 8601");
  } 
}


module.exports = {
  processItemsInBatch,
  commitBatch,
  filterForAllowedKeys,
  convertDatesToTimestamps
}
