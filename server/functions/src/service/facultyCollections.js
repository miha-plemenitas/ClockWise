const { db } = require('../utils/firebaseAdmin');


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

  if (year) {
    filteredQuery = filteredQuery.where("year", "==", Number(year));
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
  getItemByFacultyAndCollectionAndFilterById,
  getItemByFacultyAndCollectionAndItemId,
  getAllFacultyCollectionItems,
  getItemByFacultyAndCollectionAndItemId
}