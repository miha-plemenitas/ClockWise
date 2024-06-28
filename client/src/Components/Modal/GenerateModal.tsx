import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../Components/ui/button";
import CircularProgress from "@mui/material/CircularProgress";
import { firestore } from "../../Config/firebase";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { SxProps } from '@mui/system';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import useFaculties from '../Hooks/useFaculties';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";

interface GenerateModalProps {
  uid: string;
  isOpen: boolean;
  toggle: () => void;
  facultyId: string | null;
}

const style: SxProps = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'white',
  border: "none",
  borderRadius: "5px",
  boxShadow: 24,
  p: 4,
};

const GenerateModal: React.FC<GenerateModalProps> = ({ uid, isOpen, toggle, facultyId }) => {
  const [loading, setLoading] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  useEffect(() => {
    fetchCourses();
  }, [facultyId]);

  const fetchCourses = async () => {
    try {
      if (facultyId) {
        const courseRef = await firestore.collection("faculties").doc(facultyId).collection("courses");
        const courseSnapshot = await courseRef.get();

        const courses = courseSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(courses);
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  };


  const handleGenerateSchedule = async () => {
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

   
    <Modal
      open={isOpen}
      onClose={toggle}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
       {/* {loading && <CircularProgress />}
      {!loading && generatedEvents.length > 0 && (
        <pre>{JSON.stringify(generatedEvents, null, 2)}</pre>
      )}
      {!loading && generatedEvents.length === 0 && (
        <p>No events generated. Please try again.</p>
      )} */}

      <Box sx={style}>
        <Box sx={{ minWidth: 120 }}>
          <Typography id="custom-modal-title" variant="h4" component="h2">
            Generate Schedule
          </Typography>
          <div className="mt-3 space-y-4">
            <FormControl fullWidth>
              <InputLabel id="group-select-label">Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                fullWidth
                variant="outlined"
              >
                {courses.map((course: { id: any; course: any }) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.course}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <DatePicker
                  label="Start Date"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <DatePicker
                  label="End Date"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Box>


          </div>
          < div className="flex justify-end mt-4 w-full">
            <Button onClick={toggle} className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2">
              <span>Close</span>
            </Button>
            <Button onClick={handleGenerateSchedule} className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2">
              <span>Generate</span>
            </Button>
          </div>
        </Box>
      </Box>
    </Modal>
  );
};

export default GenerateModal;
