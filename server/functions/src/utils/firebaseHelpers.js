const { db } = require('../utils/firebaseAdmin');
const { commitBatch } = require("./batchOperations");


/**
 * Finds the program ID for a given branch within a faculty.
 * Looks up the branch document by its ID and returns the associated program ID.
 *
 * @param {firebase.firestore.DocumentReference} facultyRef - The Firestore document reference of the faculty.
 * @param {string} branchId - The ID of the branch to find the program for.
 * @returns {Promise<string|null>} A promise that resolves to the program ID if found, otherwise null.
 * @throws {Error} If there is an issue with fetching the branch document.
 */
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


/**
 * Deletes all documents in a Firestore collection in batches.
 *
 * @param {Object} collectionRef - The reference to the Firestore collection.
 */
async function deleteAllDocumentsInCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  let batch = db.batch();
  let count = 0;

  snapshot.docs.forEach((doc, index) => {
    batch.delete(doc.ref);
    count++;

    if (count >= 400) {
      commitBatch(batch);
      batch = db.batch();
      count = 0;
    }
  });

  if (count > 0) {
    commitBatch(batch);
  }
}


/**
 * Checks if a document exists in a Firestore collection by reference, collection name, and document ID.
 *
 * @param {Object} ref - The reference to the parent Firestore collection.
 * @param {string} collectionName - The name of the sub-collection.
 * @param {string} id - The document ID to check for existence.
 * @returns {Promise<Object>} A promise that resolves to the document reference if it exists.
 * @throws {Error} If the document does not exist in the specified collection.
 */
async function checkIfExistsByRefCollectionNameId(ref, collectionName, id) {
  const foundRef = ref.collection(collectionName).doc(id);
  const doc = await foundRef.get();

  if(!doc.exists){
    throw new Error(`${id} does not exist in ${collectionName}`);
  } else {
    return foundRef;
  }
}


module.exports = {
  findProgramForBranch,
  deleteAllDocumentsInCollection,
  checkIfExistsByRefCollectionNameId,
}
