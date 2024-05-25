const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');

const secretKey = functions.config().auth.secret_key;

const checkJwt = (request) => {
  return new Promise((resolve, reject) => {
    const cookies = request.headers.cookie;
    if (!cookies) {
      return reject('Unauthorized');
    }

    const token = cookies.split(';').find(cookie => cookie.trim().startsWith('token='));
    if (!token) {
      return reject('Unauthorized');
    }

    const tokenValue = token.split('=')[1];
    jwt.verify(tokenValue, secretKey, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return reject('TokenExpired');
        }
        return reject('Unauthorized');
      }
      request.user = decoded;
      return resolve(true);
    });
  });
};


module.exports = {
  checkJwt,
}
