const { db } = require('../utils/firebaseAdmin');
const { filterForAllowedKeys } = require("../utils/batchOperations");
const { checkIfExistsByRefCollectionNameId } = require("../utils/firebaseHelpers");
const { timetableAllowedKeys } = require("../constants/constants");

async function saveTimetableForUser(uid, timetableData) {
  const userRef = await checkIfExistsByRefCollectionNameId(db, "users", uid);
  const timetableRef = userRef.collection("timetable");

  const timetableQuery = timetableRef.limit(1);
  const timetableSnapshot = await timetableQuery.get();

  const formattedData = filterForAllowedKeys(timetableData, timetableAllowedKeys);

  if (timetableSnapshot.empty) {
    const docRef = await timetableRef.add(formattedData);
    console.log(`Timetable added with UID: ${docRef.id} under user ID: ${uid}`);
    return docRef.id;
  } else {

    const timetableDocRef = timetableSnapshot.docs[0].ref;
    await timetableDocRef.set(formattedData);
    console.log(`Timetable updated for user ID: ${uid}`);
    return timetableDocRef.id;
  }
}

module.exports = {
  saveTimetableForUser
}