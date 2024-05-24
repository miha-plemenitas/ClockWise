const { db } = require('../utils/firebaseAdmin');


/**
 * Retrieves all items from a specified sub-collection for a given faculty by its ID.
 * This function checks if the faculty exists before attempting to fetch items from the sub-collection.
 * If the faculty does not exist, it throws an error.
 *
 * @param {string} facultyId - The ID of the faculty whose sub-collection items are to be fetched.
 * @param {string} collectionName - The name of the sub-collection from which items are to be fetched.
 * @returns {Promise<Array>} A promise that resolves to an array of items (data objects) from the specified sub-collection.
 * @throws {Error} If no faculty with the provided ID exists in the database.
 */
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


/**
 * Retrieves a specific item from a specified sub-collection associated with a given faculty ID.
 * The function verifies the existence of both the faculty and the item within the sub-collection.
 * If either the faculty or the item does not exist, it throws an error.
 *
 * @param {string} facultyId - The ID of the faculty associated with the sub-collection.
 * @param {string} collectionName - The name of the sub-collection from which the item is to be fetched.
 * @param {string} itemId - The ID of the item to retrieve from the sub-collection.
 * @returns {Promise<Object>} A promise that resolves to the item's data object.
 * @throws {Error} If no faculty with the provided ID exists or if the specified item does not exist in the sub-collection.
 */
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


/**
 * Retrieves items from a specific sub-collection within a faculty, filtered by a field value
 * and optionally by a specific year. This function checks if the faculty exists before performing
 * any queries. If the faculty does not exist or no items match the filtering criteria, an error is thrown
 * or an empty array is returned, respectively.
 *
 * @param {string} facultyId - The ID of the faculty whose sub-collection is being queried.
 * @param {string} collectionName - The name of the sub-collection from which items are to be fetched.
 * @param {string} filterFieldName - The field name to filter by.
 * @param {*} filterValue - The value to filter by.
 * @param {number} [year] - An optional year to further filter the items. Must be a valid year if provided.
 * @returns {Promise<Array>} A promise that resolves to an array of items matching the filter criteria.
 * @throws {Error} If no faculty with the provided ID exists or if no items match the filtering criteria.
 */
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