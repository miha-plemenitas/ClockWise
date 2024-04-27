/**
 * Firebase Admin Initialization
 * 
 * This module initializes Firebase Admin and exports the initialized admin
 * and Firestore instances for use throughout the project. This ensures that
 * Firebase Admin is only set up once and can be easily imported in other files.
 */
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

module.exports = { admin, db };