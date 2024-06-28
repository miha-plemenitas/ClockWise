import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../Components/ui/button";
import CircularProgress from "@mui/material/CircularProgress";
import { firestore } from "../../Config/firebase";

interface GenerateModalProps {
  uid: string;
}

const GenerateModal: React.FC<GenerateModalProps> = ({ uid }) => {
  const [loading, setLoading] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<any[]>([]);
  const [facultyId, setFacultyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacultyId = async () => {
      try {
        const userDoc = await firestore.collection("users").doc(uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setFacultyId(userData?.facultyId || null);
        }
      } catch (error) {
        console.error("Error fetching faculty ID:", error);
      }
    };

    fetchFacultyId();
  }, [uid]);

  const handleGenerate = async () => {
    if (!facultyId) {
      console.error("No faculty ID found");
      return;
    }

    setLoading(true);

    try {
      const username = process.env.REACT_APP_USERNAME;
      const password = process.env.REACT_APP_PASSWORD;

      const credentials = window.btoa(`${username}:${password}`);
      const headers = {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        `https://europe-west3-pameten-urnik.cloudfunctions.net/schedule-generate?facultyId=${facultyId}`,
        {},
        { headers }
      );

      console.log("API response:", response.data);

      if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result)
      ) {
        setGeneratedEvents(response.data.result);
      } else {
        console.error("Unexpected API response structure", response.data);
        setGeneratedEvents([]);
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      setGeneratedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleGenerate} disabled={loading}>
        Generate Timetable
      </Button>
      {loading && <CircularProgress />}
      {!loading && generatedEvents.length > 0 && (
        <pre>{JSON.stringify(generatedEvents, null, 2)}</pre>
      )}
      {!loading && generatedEvents.length === 0 && (
        <p>No events generated. Please try again.</p>
      )}
    </div>
  );
};

export default GenerateModal;
