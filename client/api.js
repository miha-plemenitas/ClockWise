const axios = require("axios");
const { login } = require("./auth");

async function fetchData() {
  const loginResult = await login();
  if (!loginResult.success) {
    console.error("Failed to login:", loginResult.message);
    return;
  }

  const jwtToken = loginResult.token;

  try {
    const response = await axios.get(
      "https://europe-west3-pameten-urnik.cloudfunctions.net/lecture-getAllForCourse?facultyId=13&courseId=354&startTime=2024-02-26&endTime=2024-06-14",
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Cookie: `token=${jwtToken}`, // Send the token as a cookie
        },
        withCredentials: true,
      }
    );
    console.log("Data fetched successfully:", response.data);
  } catch (error) {
    console.error(
      "Failed to fetch data:",
      error.response ? error.response.data : error.message
    );
  }
}

fetchData();
