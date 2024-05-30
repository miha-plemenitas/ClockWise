const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');
const admin = require("../utils/firebaseAdmin");
const allowedRoles = require("../constants/constants");

const secretKey = functions.config().auth.secret_key;
const adminPassword = functions.config().auth.password;
const adminUsername = functions.config().auth.username;


const checkJwt = async (request) => {
  const cookies = request.headers.cookie;
  if (!cookies) {
    throw new Error('Unauthorized');
  }

  const token = cookies.split(';').find(cookie => cookie.trim().startsWith('token='));
  if (!token) {
    throw new Error('Unauthorized');
  }

  const tokenValue = token.split('=')[1];

  return new Promise((resolve, reject) => {
    jwt.verify(tokenValue, secretKey, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw new Error('TokenExpired');
        }
        throw new Error('Unauthorized');
      }
      request.user = decoded;
      resolve(true);
    });
  });
};


async function verifyCurrentRole(uid) {
  const requester = await admin.auth().getUser(uid);
  if (!requester.customClaims || requester.customClaims.role !== 'admin') {
    throw new Error('Requester does not have permission to change roles');
  }
}


async function validateTargetRole(role){
  if (!allowedRoles.includes(role)) {
    throw new Error('Invalid role');
  }
}


async function setRoleForUid(uid, role){
  await admin.auth().setCustomUserClaims(uid, { role: role });
}


async function verifyValidateAndSetRole(requesterUid, targetUid, role) {
  await verifyCurrentRole(requesterUid);
  await validateTargetRole(role);
  await setRoleForUid(targetUid, role);
}


function checkForCredentials(authHeader){
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    throw new Error("Invalid credentials sent")
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (!username === adminUsername || !password === adminPassword) {
    throw new Error("Invalid credentials sent");
  }
}


module.exports = {
  checkJwt,
  verifyValidateAndSetRole,
  setRoleForUid
}
