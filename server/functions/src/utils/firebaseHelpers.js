const { db } = require('../utils/firebaseAdmin');


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
  const batch = db.batch();

  snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
  });

  await batch.commit();
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
