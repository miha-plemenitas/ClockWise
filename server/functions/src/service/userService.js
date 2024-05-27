const { db } = require('../utils/firebaseAdmin');
const { filterForAllowedKeys } = require("../utils/batchOperations");
const { all } = require('axios');


async function saveUser(uid) {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({ uid });
    return false;
  }
  return true;
}


async function getUserById(uid) {
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists) {
    throw new Error(`User with id ${uid} not found`);
  }

  const user = userDoc.data();
  return user;
}


async function updateUser(uid, updates) {
  const userRef = db.collection('users').doc(uid);

  const allowedKeys = ["facultyId", "programId", "branchId", "groupId", "role"];
  const filteredUpdates = filterForAllowedKeys(updates, allowedKeys);

  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    console.log(`No user found with ID: ${uid}`);
    throw new Error('User not found');
  } else if (Object.keys(filteredUpdates).length === 0) {
    throw new Error("No valid update fields provided");
  }

  await userRef.update(filteredUpdates);

  console.log(`User document with ID: ${uid} updated successfully.`);
  return `User document with ID: ${uid} updated successfully.`;
}


async function deleteUser(uid) {
  const userRef = db.collection('users').doc(uid);

  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new Error("User does not exist.");
  }

  await userRef.delete();
  console.log(`User with ID: ${uid} deleted successfully.`);
  return 'User deleted successfully';
}


module.exports = {
  saveUser,
  getUserById,
  updateUser,
  deleteUser,
}
