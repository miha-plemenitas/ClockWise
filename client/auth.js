require("dotenv").config({ path: "./.env" });
const axios = require("axios");
const Buffer = require("buffer").Buffer;

const loginUrl =
  "https://europe-west3-pameten-urnik.cloudfunctions.net/auth-login";
const username = process.env.APP_USERNAME;
const password = process.env.APP_PASSWORD;

console.log("Username from env file:", username);
console.log("Password from env file:", password);

if (!username || !password) {
  console.error("Username or password environment variable is not set.");
  process.exit(1); // Exit the script with an error code
}

console.log("Username used:", username);
console.log("Password used:", password);

async function login() {
  const bufferedCredentials = Buffer.from(`${username}:${password}`);
  const credentials = bufferedCredentials.toString("base64");
  const headers = {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };

  console.log("Request Headers:", headers);
  console.log("Request Body:", { uid: username });

  try {
    const response = await axios.post(
      loginUrl,
      { uid: username },
      { headers: headers, withCredentials: true }
    );
    const cookieHeader = response.headers["set-cookie"][0];
    const token = cookieHeader.split(";")[0].split("=")[1]; // Extract the token value
    return {
      success: true,
      message: "Login successful",
      token: token,
    };
  } catch (error) {
    console.error(
      "Login failed:",
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      message: "Login failed",
      error: error.message,
    };
  }
}

module.exports = { login };

login()
  .then((result) => console.log(result))
  .catch((err) => console.error(err));
