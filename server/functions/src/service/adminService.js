const { db } = require('../utils/firebaseAdmin');

async function getDaysOff(facultyId) {
    const daysOffRef = db.collection("faculties").doc(facultyId).collection("daysOff");
    const daysOffSnapshot = await daysOffRef.get();

    const daysOff = daysOffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return daysOff;
}

async function saveDayOff(facultyId, dayData) {
    const daysOffRef = db.collection("faculties").doc(facultyId).collection("daysOff");
    const docRef = await daysOffRef.add(dayData);

    console.log(`Day added with auto-generated UID: ${docRef.id} in faculty ${facultyId}.`);
    return docRef.id;
}

async function deleteDayOff(facultyId, dayId) {
    const dayRef = db.collection("faculties").doc(facultyId).collection("daysOff").doc(dayId);
    await dayRef.delete();
    console.log(`Day with ID: ${dayId} deleted successfully from faculty ${facultyId}.`);
    return 'Day deleted successfully';
}


module.exports = {
    saveDayOff,
    deleteDayOff,
    getDaysOff,
}