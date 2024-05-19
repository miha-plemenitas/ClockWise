const axios = require("axios");
const { wttUrl, bufferedCredentials } = require('../constants/constants');
const { jwtDecode } = require('jwt-decode');

let token;
let tokenExpiry;

async function getHeadersWithToken() {
  if (!token || (tokenExpiry && Date.now() >= tokenExpiry * 1000)) {
    const URL = "/login";
    const credentials = bufferedCredentials.toString("base64");
    const headers = {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
    };
    
    console.log("Calling login endpoint");
    const data = await fetchFromApi(URL, undefined, headers);
    token = data.token;

    const decodedToken = jwtDecode(token);
    tokenExpiry = decodedToken.exp;
  }

  const headersWithToken = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
  return headersWithToken;
}

async function fetchFromApi(endpointName, params = null, headers = null) {
  const URL = wttUrl + endpointName;
  if (!headers) {
    headers = await getHeadersWithToken();
  }

  try {
    const response = await axios.get(URL, {
      params: params,
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses from API:", error.message);
    throw new Error("Failed to fetch courses");
  }
}

module.exports = {
  fetchFromApi,
  getHeadersWithToken,
}
