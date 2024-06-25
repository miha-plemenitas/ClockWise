const { db } = require('../utils/firebaseAdmin');

async function getDaysOff() {
    const dayRef = await db.collection("daysOff").get();

    const items = dayRef.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return items;
}

async function saveDayOff(dayData) {
    const dayRef = db.collection('daysOff');

    const docRef = await dayRef.add(dayData);

    console.log(`Day added with auto-generated UID: ${docRef.id}.`);
    return docRef.id;
}

async function deleteDayOff(dayId) {
    const dayRef = db.collection("daysOff").doc(dayId);
    await dayRef.delete();
    console.log(`Day with ID: ${dayId} deleted successfully.`);
    return 'Day deleted successfully';
}

module.exports = {
    saveDayOff,
    deleteDayOff,
    getDaysOff,
}