import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button } from "../ui/button";
import { SxProps } from '@mui/system';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import useFaculties from '../Hooks/useFaculties';
import { firestore } from '../../Config/firebase';
import { Chip } from '@mui/material';
import axios from 'axios';
import { Buffer } from "buffer";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from 'dayjs';

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

interface AvailableTimeSlotsModalProps {
    isOpen: boolean;
    toggle: () => void;
    onFind: (data: any) => void;
}

const AvailableTimeSlotsModal = ({
    isOpen,
    toggle,
    onFind
}: AvailableTimeSlotsModalProps) => {

    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<any>('');
    const [selectedTutor, setSelectedTutor] = useState<any>('');
    const [selectedRoom, setSelectedRoom] = useState('');

    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);

    const { faculties, loading, error } = useFaculties();
    const [groups, setGroups] = useState<any>([]);
    const [rooms, setRooms] = useState<any>([]);
    const [tutors, setTutors] = useState<any>([])

    const fetchAllRooms = async () => {
        try {
            const querySnapshot = await firestore
                .collection("faculties")
                .doc(selectedFaculty.toString())
                .collection("rooms")
                .get();

            const filteredRooms: any[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as any[];

            const roomsWithName = filteredRooms.map(room => ({
                ...room,
                name: room.roomName
            }));

            setRooms(roomsWithName);
        } catch (err) {
            console.error("Error loading rooms:", err);
        }
    }

    const fetchAllTutors = async () => {
        try {
            const querySnapshot = await firestore
                .collection("faculties")
                .doc(selectedFaculty.toString())
                .collection("tutors")
                .get();

            const filteredTutors: any[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as any[];

            const tutorsWithName = filteredTutors.map(tutor => ({
                ...tutor,
                name: `${tutor.firstName} ${tutor.lastName}`.toUpperCase()
            }));

            const sortedTutors = tutorsWithName.sort((a, b) => a.name.localeCompare(b.name));
            setTutors(sortedTutors);
        } catch (err) {
            console.error("Error loading rooms:", err);
        }
    }

    const fetchAllGroups = async () => {
        try {
            const querySnapshot = await firestore
                .collection("faculties")
                .doc(selectedFaculty.toString())
                .collection("groups")
                .get();

            const filteredGroups: any[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as any[];

            setGroups(filteredGroups);
        } catch (err) {
            console.error("Error loading groups:", err);
        }
    };

    useEffect(() => {
        fetchAllGroups();
        fetchAllRooms();
        fetchAllTutors();
    }, [selectedFaculty]);

    useEffect(() => {
        setSelectedFaculty('');
        setSelectedGroup('');
        setSelectedRoom('');
        setSelectedTutor('');

        setStartTime(null);
        setEndTime(null);
    }, []);

    const handleFindTimeSlots = () => {

        let data = {
            facultyId: selectedFaculty.toString(),
            startTime: startTime,
            endTime: endTime,
            groupId: selectedGroup,
            tutorId: selectedTutor,
            roomsId: selectedRoom,
            faculty: faculties.find((f: any) => f.id === selectedFaculty)?.name || "",
            group: groups.find((g: any) => g.id === selectedGroup)?.name || "",
            tutor: tutors.find((t: any) => t.id === selectedTutor)?.name || "",      
            room: rooms.find((r: any) => r.id === selectedRoom)?.name || ""
    }

    if (data) {
        onFind(data);
    }
}

return (
    <Modal
        open={isOpen}
        onClose={toggle}
        aria-labelledby="custom-modal-title"
        aria-describedby="custom-modal-description"
    >
        <Box sx={style}>
            <Box sx={{ minWidth: 120 }}>
                <Typography id="custom-modal-title" variant="h4" component="h2">
                    Find Avaiable Time Slots
                </Typography>
                <div className="mt-3 space-y-4">
                    <FormControl fullWidth >
                        <InputLabel id="group-select-label">Faculty</InputLabel>
                        <Select
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                            fullWidth
                            variant="outlined"
                        >
                            {loading ? (
                                <MenuItem disabled>Loading...</MenuItem>
                            ) : error ? (
                                <MenuItem disabled>Error loading faculties</MenuItem>
                            ) : (
                                faculties.map((faculty) => (
                                    <MenuItem key={faculty.id} value={faculty.facultyId}>
                                        {faculty.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth >
                        <InputLabel id="group-select-label">Group</InputLabel>
                        <Select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            fullWidth
                            variant="outlined"
                        >

                            {groups.map((group: { id: any; name: any; }) => (
                                <MenuItem key={group.id} value={group.id}>
                                    {group.name}
                                </MenuItem>
                            ))}

                        </Select>
                    </FormControl>
                    <FormControl fullWidth >
                        <InputLabel id="group-select-label">Tutor</InputLabel>
                        <Select
                            value={selectedTutor}
                            onChange={(e) => setSelectedTutor(e.target.value)}
                            fullWidth
                            variant="outlined"
                        >

                            {tutors.map((tutor: { id: any; name: any; }) => (
                                <MenuItem key={tutor.id} value={tutor.id}>
                                    {tutor.name}
                                </MenuItem>
                            ))}

                        </Select>
                    </FormControl>
                    <FormControl fullWidth >
                        <InputLabel id="group-select-label">Room</InputLabel>
                        <Select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            fullWidth
                            variant="outlined"
                        >
                            {rooms.map((room: { id: any; name: any; }) => (
                                <MenuItem key={room.id} value={room.id}>
                                    {room.name}
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
                    <Button onClick={handleFindTimeSlots} className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2">
                        <span>Find</span>
                    </Button>
                </div>
            </Box>
        </Box>
    </Modal>
);
}

export default AvailableTimeSlotsModal;