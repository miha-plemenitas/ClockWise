import axios from "axios";
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

const BASE_URL = "https://europe-west3-pameten-urnik.cloudfunctions.net";

const getAuthHeaders = () => {
  const bufferedCredentials = Buffer.from("admin:password"); // Replace with actual credentials
  const credentials = bufferedCredentials.toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
};

export const fetchFaculties = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/faculty-getAll`, {
      headers: getAuthHeaders(),
      withCredentials: true, // Ensure credentials are included in the request
    });
    return response.data.result;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      console.error("Error response:", error.response.data);
      throw new Error(`Server Error: ${error.response.data}`);
    } else if (error.request) {
      // Request was made but no response was received
      console.error("Error request:", error.request);
      throw new Error("Network Error: No response received from server");
    } else {
      // Something happened in setting up the request
      console.error("Error message:", error.message);
      throw new Error(`Network Error: ${error.message}`);
    }
  }
};
