const axios = require('axios');
const { db } = require('./firebaseAdmin');
const { wtt_URL } = require('./constants');
const { response } = require('express');

async function getToken() {
  username = "wtt_api_user_a"
  password = "H50lsd2$XejBIBv7t"

  const credentials = `${username}:${password}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');

  const headers = {
    Authorization: `Basic ${encodedCredentials}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.get(`${wtt_URL}/login`, { headers });
  const token = response.data.token;
  return token;
}

async function performApiRequest() {
  let token;
  try {
    token = await getToken();
  } catch (error) {
    console.error('Error in performApiRequest:', error);
  }

  console.log("Token:", token);
  return token;

}

module.exports = { performApiRequest };
