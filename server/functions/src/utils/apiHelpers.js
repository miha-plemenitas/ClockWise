const axios = require("axios");
const { wttUrl, bufferedCredentials } = require('../constants/constants');
const { jwtDecode } = require('jwt-decode');

let token;
let tokenExpiry;


/**
 * Retrieves headers with a Bearer token for authentication.
 * If the token is not present or has expired, it fetches a new token from the login endpoint.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing headers with the Bearer token.
 * @throws {Error} If there is an issue with fetching a new token from the login endpoint.
 */
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


/**
 * Fetches data from a specified API endpoint with optional query parameters and headers.
 * If headers are not provided, it retrieves headers with a token.
 *
 * @param {string} endpointName - The endpoint name to fetch data from.
 * @param {Object} [params=null] - Optional query parameters to include in the API request.
 * @param {Object} [headers=null] - Optional headers to include in the API request.
 * @returns {Promise<Object>} A promise that resolves to the data fetched from the API.
 * @throws {Error} If there is an issue with fetching data from the API.
 */
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
