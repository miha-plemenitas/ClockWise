const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');

const secretKey = functions.config().auth.secret_key;


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


module.exports = {
  checkJwt
}
