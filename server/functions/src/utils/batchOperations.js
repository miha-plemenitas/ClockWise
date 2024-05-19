const { db } = require('./firebaseAdmin');

async function processItemsInBatch(
  collectionRef,
  items,
  processData,
  batchLimit = 400
) {
  let batch = db.batch();
  let batchCounter = 0;

  for (const item of items) {
    const data = processData(item);
    if (!data) continue;

    const docRef = collectionRef.doc(data.id);
    batch.set(docRef, data);
    batchCounter++;

    if (batchCounter >= batchLimit) {
      await commitBatch(batch);
      batch = db.batch();
      batchCounter = 0;
    }
  }

  if (batchCounter > 0) {
    await commitBatch(batch);
  }
}


async function commitBatch(batch) {
  try {
    await batch.commit();
  } catch (error) {
    console.error(`Failed to commit batch: ${error.message}`);
  }
}

module.exports = {
  processItemsInBatch, 
  commitBatch,
}
