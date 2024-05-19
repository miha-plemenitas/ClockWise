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

module.exports = {
  findProgramForBranch,
}
