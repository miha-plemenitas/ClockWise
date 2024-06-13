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
