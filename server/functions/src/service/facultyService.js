const { db } = require('../utils/firebaseAdmin');

// Odstrani to funkcijo
async function selectGetItemCollectionFunction(
  facultyId,
  collectionName,
  itemId = undefined
) {
  let result;
  if (itemId) {
    result = await getItemByFacultyAndCollectionAndItemId(
      facultyId,
      collectionName,
      itemId
    );
  } else {
    result = await getAllFacultyCollectionItems(facultyId, collectionName);
  }
  return result;
}


async function getAllFaculties() {
  const facultyRef = await db.collection("faculties").get();
  const faculties = facultyRef.docs.map(doc => doc.data());

  return faculties;
}

async function getFacultyById(facultyId) {
  const facultyDoc = await db.collection("faculties").doc(facultyId).get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const faculty = facultyDoc.data();
  return faculty;
}


async function getAllFacultyCollectionItems(facultyId, collectionName) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const itemDocs = await facultyRef.collection(collectionName).get();
  const items = itemDocs.docs.map(doc => doc.data());
  return items;
}


async function getItemByFacultyAndCollectionAndItemId(facultyId, collectionName, itemId) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const itemRef = facultyRef.collection(collectionName).doc(itemId);
  const itemDoc = await itemRef.get();

  if (!itemDoc.exists) {
    throw new Error(`Item with id ${itemId} does not exist in ${collectionName} under faculty with id ${facultyId}`);
  }

  const item = itemDoc.data();
  return item;
}


function filterByYear(filteredQuery, year) {
  return filteredQuery.where("year", "==", Number(year));
}


async function getItemByFacultyAndCollectionAndFilterById(
  facultyId,
  collectionName,
  filterFieldName,
  filterValue,
  year
) {
  const facultyRef = db.collection("faculties").doc(facultyId);
  const facultyDoc = await facultyRef.get();

  if (!facultyDoc.exists) {
    throw new Error(`Faculty with id ${facultyId} not found`);
  }

  const collectionRef = facultyRef.collection(collectionName);
  let filteredQuery = collectionRef.where(filterFieldName, '==', filterValue);

  if (year){
    filteredQuery = filterByYear(filteredQuery, year);
  }
  const itemDocs = await filteredQuery.get();

  if (itemDocs.empty) {
    console.log('No matching documents.');
    return [];
  }

  let items = itemDocs.docs.map(doc => doc.data());
  return items;
}

module.exports = {
  selectGetItemCollectionFunction,
  getAllFaculties,
  getFacultyById,
  getItemByFacultyAndCollectionAndFilterById,
  getItemByFacultyAndCollectionAndItemId,
}