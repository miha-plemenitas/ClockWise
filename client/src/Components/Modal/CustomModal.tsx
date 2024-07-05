import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Button } from "../../Components/ui/button";
import TextField from "@mui/material/TextField";
import { SxProps } from "@mui/system";
import { format } from "date-fns";
import { sl } from "date-fns/locale";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Key, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/sl";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import useRooms from "../Hooks/useRooms";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import useTutors from "../Hooks/useTutors";
import { Chip } from "@mui/material";

dayjs.extend(utc);
dayjs.extend(timezone);

const style: SxProps = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "white",
  border: "none",
  borderRadius: "5px",
  boxShadow: 24,
  p: 4,
};

interface CustomModalProps {
  isOpen: boolean;
  toggle: () => void;
  mode: "view" | "edit" | "add";
  onSave?: (eventInfo: any) => void;
  onUpdate?: (eventInfo: any) => void;
  onDelete?: (eventInfo: any) => void;
  event: {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: {
      date: Dayjs;
      notes: string;
      editable: boolean;
      lecture: boolean;
      executionType?: string;
      executionTypeId?: string;
      duration?: string;
      courseId?: string;
      hasRooms?: boolean;
      branch_ids?: string[];
      branches?: string[];
      tutors: { name: string; id: string }[];
      tutor_ids?: string[];
      rooms: { name: string; id: string }[];
      room_ids?: string[];
      groups: { name: string; id: string }[];
      group_ids?: string[];
    };
  };
  role: string;
  selectedFacultyId: string;
  allGroups?: Group[];
}

interface Room {
  id: string;
  name: string;
}

interface Group {
  id: string;
  branchId: number;
  programId: number;
  name: string;
}

export default function CustomModal({
  isOpen,
  toggle,
  mode,
  onSave,
  onUpdate,
  onDelete,
  event,
  role,
  selectedFacultyId,
  allGroups
}: CustomModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("");
  const [room, setRoom] = useState<Room[]>([]);
  const [tutor, setTutor] = useState<{ name: string; id: string }[]>([]);
  const [group, setGroup] = useState<{ name: string; id: string }[]>([]);
  const [repeatCount, setRepeatCount] = useState(0);
  const [groups, setGroups] = useState<any[]>([]);

  const { rooms } = useRooms(selectedFacultyId);
  const { tutors } = useTutors(selectedFacultyId);

  useEffect(() => {
    if (event && event.extendedProps && event.extendedProps.tutors) {
      const initialTutors = event.extendedProps.tutors.map(tutor => ({
        id: tutor.id,
        name: tutor.name
      }));
      setTutor(initialTutors);
    }

    if (event && event.extendedProps && event.extendedProps.groups) {
      const initialGroups = event.extendedProps.groups.map(group => ({
        id: group.id,
        name: group.name
      }));
      setGroup(initialGroups);
    }

    if (event && event.extendedProps && event.extendedProps.rooms) {
      const initialRooms = event.extendedProps.rooms.map(room => ({
        id: room.id,
        name: room.name
      }));
      setRoom(initialRooms);
    }

    if (allGroups) {
      setGroups(allGroups);
      console.log("groups",allGroups);
    }
  }, [event]);

  useEffect(() => {

    if (allGroups) {
      setGroups(allGroups);
      console.log("groups",allGroups);
    }
  }, [selectedFacultyId]);
  
  const handleRoomChange = (event: any) => {
    const selectedValues = event.target.value;
    const newSelectedRoom = rooms
      .filter(room => selectedValues.includes(room.id.toString()))
      .map(room => ({ id: room.id, name: room.roomName }));

    setRoom(newSelectedRoom);
  };

  const handleGroupChange = (event: any) => {
    const selectedValues = event.target.value;
    const newSelectedGroups = groups
      .filter(group => selectedValues.includes(group.id.toString()))
      .map(group => ({ id: group.id, name: group.name }));

    setGroup(newSelectedGroups);
  };

  const handleTutorChange = (event: any) => {
    const selectedValues = event.target.value;
    const newSelectedTutors = tutors
      .filter(tutor => selectedValues.includes(tutor.id.toString()))
      .map(tutor => ({ id: tutor.id, name: tutor.name }));

    setTutor(newSelectedTutors);
  };

  const formatDate = (dateString: string) => format(new Date(dateString), "EEEE, d. M. yyyy", { locale: sl });
  const formatTime = (startString: string, endString: string) => {
    const startTime = format(new Date(startString), "HH:mm");
    const endTime = format(new Date(endString), "HH:mm");
    return `${startTime} - ${endTime}`;
  };

  const handleAddEvent = () => {
    if (!date) return;

    const updatedStartTime = startTime
      ? startTime
        .set("year", date.year())
        .set("month", date.month())
        .set("date", date.date())
      : null;
    const updatedEndTime = endTime
      ? endTime
        .set("year", date.year())
        .set("month", date.month())
        .set("date", date.date())
      : null;
    let eventDetails = {};

    if (role === "Referat") {
      const eventDetailsList = [];
      for (let i = 0; i <= repeatCount; i++) {
        const eventStart = updatedStartTime
          ? updatedStartTime.add(i, "week")
          : null;
        const eventEnd = updatedEndTime ? updatedEndTime.add(i, "week") : null;

        eventDetailsList.push({
          course: title || "",
          startTime: eventStart ? eventStart.format("YYYY-MM-DDTHH:mm:ss") : null,
          endTime: eventEnd ? eventEnd.format("YYYY-MM-DDTHH:mm:ss") : null,
          executionType: type || "",
          executionTypeId: "",
          duration: "",
          courseId: "",
          hasRooms: true,
          branch_ids: [],
          branches: [],
          tutors: tutor,
          tutor_ids: tutor.map((tutor: { id: any; }) => tutor.id),
          rooms: room,
          room_ids: room.map((room: { id: any; }) => room.id),
          groups: group,
          group_ids: group.map((group: { id: any; }) => group.id),
          lecture: true,
        });
      }

      if (onSave) {
        eventDetailsList.forEach((eventDetails) => onSave(eventDetails));
      }

    } else {
      eventDetails = {
        startTime: updatedStartTime
          ? updatedStartTime.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        endTime: updatedEndTime
          ? updatedEndTime.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        title: title,
        notes: notes,
        editable: true,
        lecture: false,
      };
    }

    if (onSave) {
      onSave(eventDetails);
    }

    setTitle("");
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setNotes("");
    setTutor([]);
    setGroup([]);
    setType("");
    setRoom([]);
    setRepeatCount(0);
  };

  const handleUpdateEvent = () => {
    const newdate = date || dayjs(event.start);
    const newStart = dayjs(event.start);
    const newEnd = dayjs(event.end);

    const updatedStartTime = startTime
      ? startTime
        .set("year", newdate.year())
        .set("month", newdate.month())
        .set("date", newdate.date())
      : newStart
        .set("year", newdate.year())
        .set("month", newdate.month())
        .set("date", newdate.date());
    const updatedEndTime = endTime
      ? endTime
        .set("year", newdate.year())
        .set("month", newdate.month())
        .set("date", newdate.date())
      : newEnd
        .set("year", newdate.year())
        .set("month", newdate.month())
        .set("date", newdate.date());
    let eventDetails = {};

    if (event.extendedProps.lecture) {
      eventDetails = {
        id: event.id,
        course: title || event.title,
        startTime: updatedStartTime ? updatedStartTime.format("YYYY-MM-DDTHH:mm:ss") : null,
        endTime: updatedEndTime ? updatedEndTime.format("YYYY-MM-DDTHH:mm:ss") : null,
        executionType: type || event.extendedProps.executionType,
        executionTypeId: event.extendedProps.executionTypeId,
        duration: event.extendedProps.duration,
        courseId: event.extendedProps.courseId,
        hasRooms: event.extendedProps.hasRooms,
        tutors: tutor && tutor.length > 0 ? tutor : event.extendedProps.tutors,
        tutor_ids: tutor && tutor.length > 0 ? tutor.map((tutor: { id: any; }) => tutor.id) : event.extendedProps.tutor_ids,
        rooms: room && room.length > 0 ? room : event.extendedProps.rooms,
        room_ids: room && room.length > 0 ? room.map((room: { id: any; }) => room.id) : event.extendedProps.room_ids,
        groups: group && group.length > 0 ? group : event.extendedProps.groups,
        group_ids: group && group.length > 0 ? group.map((group: { id: any; }) => group.id) : event.extendedProps.group_ids,

        branch_ids: event.extendedProps.branch_ids,
        branches: event.extendedProps.branches,
        lecture: true,
      };
    } else {
      eventDetails = {
        id: event.id,
        title: title || event.title,
        startTime: updatedStartTime
          ? updatedStartTime.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        endTime: updatedEndTime
          ? updatedEndTime.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        notes: notes || event.extendedProps.notes,
        editable: true,
        lecture: false,
      };
    }


    if (onUpdate) {
      onUpdate(eventDetails);
    }

    setTitle("");
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setNotes("");
    setTutor([]);
    setGroup([]);
    setType("");
    setRoom([]);
  };

  const handleDeleteEvent = () => {
    if (onDelete) {
      onDelete(event.id);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={toggle}
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
      <Box sx={style}>
        {mode === "view" && event && (
          <>
            <Typography id="custom-modal-title" variant="h4" component="h2">
              {event.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Date"
                defaultValue={formatDate(event.start)}
                InputProps={{
                  readOnly: true,
                }}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                  },
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Time"
                defaultValue={formatTime(event.start, event.end)}
                InputProps={{
                  readOnly: true,
                }}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                  },
                }}
              />
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Teacher"
              defaultValue={event.extendedProps.tutors.map((tutor: any) => tutor.name).join(", ")}
              InputProps={{
                readOnly: true,
              }}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                },
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Groups"
              defaultValue={event.extendedProps.groups.map((group: any) => group.name).join(", ")}
              InputProps={{
                readOnly: true,
              }}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Type"
                defaultValue={event.extendedProps.executionType}
                InputProps={{
                  readOnly: true,
                }}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                  },
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Location"
                defaultValue={event.extendedProps.rooms.map((room: any) => room.name).join(", ")}
                InputProps={{
                  readOnly: true,
                }}
                disabled
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                  },
                }}
              />
            </Box>
          </>
        )}

        {mode === "edit" && event.extendedProps.lecture && role === "Tutor" && event && (
          <>
            <Typography id="custom-modal-title" variant="h4" component="h2">
              Edit Lecture
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Title"
              defaultValue={event.title}
              InputProps={{
                readOnly: true,
              }}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                },
              }}
            />
            <Box sx={{ marginTop: 1 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <DatePicker
                  label="Date"
                  value={dayjs(event.start)}
                  onChange={(newValue) => setDate(newValue)}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="Start time"
                  value={dayjs(event.start)}
                  onChange={(newValue) => setStartTime(newValue)}
                />
              </LocalizationProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="End time"
                  value={dayjs(event.end)}
                  onChange={(newValue) => setEndTime(newValue)}
                />
              </LocalizationProvider>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Teacher"
              defaultValue={event.extendedProps.tutors.map((tutor: any) => tutor.name).join(", ")}
              InputProps={{
                readOnly: true,
              }}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                },
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Groups"
              defaultValue={event.extendedProps.groups.map((group: any) => group.name).join(", ")}
              InputProps={{
                readOnly: true,
              }}
              disabled
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                },
              }}
            />
            <FormControl fullWidth margin="normal">
                <InputLabel id="room-select-label">Rooms</InputLabel>
                <Select
                  labelId="room-select-label"
                  id="room-select"
                  multiple 
                  value={room.map(room => room.id.toString())} 
                  label="Rooms"
                  onChange={handleRoomChange}
                  renderValue={(selected) => (
                    <div>
                      {selected.map((value) => (
                        <Chip key={value} label={room.find(room => room.id.toString() === value)?.name} />
                      ))}
                    </div>
                  )}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.roomName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Type"
                defaultValue={event.extendedProps.executionType}
                onChange={(e) => setType(e.target.value)}
              />
              
            </Box>
          </>
        )}

        {mode === "edit" && event.extendedProps.lecture && role === "Referat" && event && (
          <>
            <Typography id="custom-modal-title" variant="h4" component="h2">
              Edit Lecture
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Title"
              defaultValue={event.title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Box sx={{ marginTop: 1 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <DatePicker
                  label="Date"
                  value={dayjs(event.start)}
                  onChange={(newValue) => setDate(newValue)}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="Start time"
                  value={dayjs(event.start)}
                  onChange={(newValue) => setStartTime(newValue)}
                />
              </LocalizationProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="End time"
                  value={dayjs(event.end)}
                  onChange={(newValue) => setEndTime(newValue)}
                />
              </LocalizationProvider>
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="tutor-select-label">Tutors</InputLabel>
              <Select
                labelId="tutor-select-label"
                id="tutor-select"
                multiple 
                value={tutor.map(tutor => tutor.id.toString())} 
                label="Tutors"
                onChange={handleTutorChange}
                renderValue={(selected) => (
                  <div>
                    {selected.map((value) => (
                      <Chip key={value} label={tutors.find(tutor => tutor.id.toString() === value)?.name} />
                    ))}
                  </div>
                )}
              >
                {tutors.map((tutor) => (
                  <MenuItem key={tutor.id} value={tutor.id}>
                    {tutor.firstName} {tutor.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="group-select-label">Groups</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                multiple
                value={group.map(group => group.id.toString())}
                label="Groups"
                onChange={handleGroupChange}
                renderValue={(selected) => (
                  <div>
                    {selected.map((value) => (
                      <Chip key={value} label={groups.find(group => group.id.toString() === value)?.name} />
                    ))}
                  </div>
                )}
              >
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel id="room-select-label">Rooms</InputLabel>
                <Select
                  labelId="room-select-label"
                  id="room-select"
                  multiple 
                  value={room.map(room => room.id.toString())}
                  label="Rooms"
                  onChange={handleRoomChange}
                  renderValue={(selected) => (
                    <div>
                      {selected.map((value) => (
                        <Chip key={value} label={room.find(room => room.id.toString() === value)?.name} />
                      ))}
                    </div>
                  )}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.roomName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Type"
                defaultValue={event.extendedProps.executionType}
                onChange={(e) => setType(e.target.value)}
              />
              
            </Box>
          </>
        )}

        {mode === "edit" && !event.extendedProps.lecture && event && (
          <>
            <Typography id="custom-modal-title" variant="h4" component="h2">
              Edit Event
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Title"
              defaultValue={event.title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Box sx={{ marginTop: 1 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <DatePicker
                  label="Date"
                  value={dayjs(event.start)}
                  onChange={(newValue) => setDate(newValue)}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="Start time"
                  value={dayjs(event.start)}
                  onChange={(newValue) => setStartTime(newValue)}
                />
              </LocalizationProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="End time"
                  value={dayjs(event.end)}
                  onChange={(newValue) => setEndTime(newValue)}
                />
              </LocalizationProvider>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Notes"
              multiline
              rows={4}
              defaultValue={event.extendedProps.notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </>
        )}

        {mode === "add" && role !== "Referat" && (
          <>
            <Typography id="custom-modal-title" variant="h4" component="h2">
              Add New Event
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              label="Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Box sx={{ marginTop: 1 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="Start time"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                />
              </LocalizationProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="End time"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                />
              </LocalizationProvider>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Notes"
              name="notes"
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </>
        )}

        {mode === "add" && role === "Referat" && ( 
          <>
            <Typography id="custom-modal-title" variant="h4" component="h2">
              Add New Lecture
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Box sx={{ marginTop: 1 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="Start time"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                />
              </LocalizationProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="sl"
              >
                <TimePicker
                  label="End time"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                />
              </LocalizationProvider>
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="tutor-select-label">Tutors</InputLabel>
              <Select
                labelId="tutor-select-label"
                id="tutor-select"
                multiple
                value={tutor.map(tutor => tutor.id.toString())}
                label="Tutors"
                onChange={handleTutorChange}
                renderValue={(selected) => (
                  <div>
                    {selected.map((value) => (
                      <Chip key={value} label={tutors.find(tutor => tutor.id.toString() === value)?.name} />
                    ))}
                  </div>
                )}
              >
                {tutors.map((tutor) => (
                  <MenuItem key={tutor.id} value={tutor.id}>
                    {tutor.firstName} {tutor.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="group-select-label">Groups</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                multiple
                value={group.map(group => group.id.toString())} 
                label="Groups"
                onChange={handleGroupChange}
                renderValue={(selected) => (
                  <div>
                    {selected.map((value: Key | null | undefined) => (
                      <Chip key={value} label={group.find(room => room.id.toString() === value)?.name} />
                    ))}
                  </div>
                )}
              >
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="room-select-label">Rooms</InputLabel>
              <Select
                labelId="room-select-label"
                id="room-select"
                multiple 
                value={room.map(room => room.id.toString())}
                label="Rooms"
                onChange={handleRoomChange}
                renderValue={(selected) => (
                  <div>
                    {selected.map((value) => (
                      <Chip key={value} label={room.find(room => room.id.toString() === value)?.name} />
                    ))}
                  </div>
                )}
              >
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.roomName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Repeat for (weeks)"
                type="number"
                value={repeatCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
              />
            </Box>
          </>
        )}
        <div className="flex justify-end mt-4 w-full">
          <Button
            onClick={toggle}
            className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2"
          >
            <span>Close</span>
          </Button>
          {mode === "edit" && !event.extendedProps.lecture && (
            <Button
              onClick={handleDeleteEvent}
              className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2"
            >
              <span>Delete</span>
            </Button>
          )}
          {mode === "edit" && (
            <>
              <Button
                onClick={handleUpdateEvent}
                className="bg-modra text-white hover:bg-modra-700 items-center space-x-2"
              >
                <span>Save</span>
              </Button>
            </>
          )}
          {mode === "add" && (
            <Button
              onClick={handleAddEvent}
              className="bg-modra text-white hover:bg-modra-700 items-center space-x-2"
            >
              <span>Add</span>
            </Button>
          )}
        </div>
      </Box>
    </Modal>
  );
}
