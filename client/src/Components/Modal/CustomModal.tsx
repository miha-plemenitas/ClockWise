import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button } from "../../Components/ui/button";
import TextField from '@mui/material/TextField';
import { SxProps } from '@mui/system';
import { format } from 'date-fns';
import { sl } from 'date-fns/locale';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/sl';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { truncate } from 'fs';

dayjs.extend(utc);
dayjs.extend(timezone);

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

interface CustomModalProps {
    isOpen: boolean;
    toggle: () => void;
    mode: 'view' | 'edit' | 'add';
    onSave?: (eventInfo: any) => void;
    onUpdate?: (eventInfo: any) => void;
    onUpdateLecture?: (eventInfo: any) => void;
    onDelete?: (eventInfo: any) => void;
    event: {
        id: string;
        title: string;
        start: string;
        end: string;
        extendedProps: {
            date: Dayjs;
            type: string;
            groups: string;
            teacher: string;
            location: string;
            notes: string;
            editable: boolean;
            lecture: boolean;
            executionType?: string;         
            executionTypeId?: string;       
            duration?: string;              
            courseId?: string;             
            hasRooms?: boolean;           
            branchIds?: string[];         
            branches?: string[];           
            tutors_arr?: { name: string; id: string }[]; 
            tutor_ids?: string[];           
            rooms_arr?: { name: string; id: string }[]; 
            room_ids?: string[];          
            groups_arr?: { name: string; id: string }[]; 
            group_ids?: string[];           
        };
    }
    role: string;
}

export default function CustomModal({
    isOpen,
    toggle,
    mode,
    onSave,
    onUpdate,
    onUpdateLecture,
    onDelete,
    event,
    role
}: CustomModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Dayjs | null>(null);
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);
    const [notes, setNotes] = useState('');
    const [type, setType] = useState('');
    const [room, setRoom] = useState('');
    const [tutor, setTutor] = useState('');
    const [group, setGroup] = useState('');

    const formatDate = (dateString: string) => format(new Date(dateString), 'EEEE, d. M. yyyy', { locale: sl });
    const formatTime = (startString: string, endString: string) => {
        const startTime = format(new Date(startString), 'HH:mm');
        const endTime = format(new Date(endString), 'HH:mm');
        return `${startTime} - ${endTime}`;
    };

    const handleAddEvent = () => {
        if (!date) return;

        const updatedStartTime = startTime ? startTime.set('year', date.year()).set('month', date.month()).set('date', date.date()) : null;
        const updatedEndTime = endTime ? endTime.set('year', date.year()).set('month', date.month()).set('date', date.date()) : null;
        let eventDetails = {};

        if (role === 'Referat') {
            eventDetails = {
                "course": title || '',
                "startTime": updatedStartTime ? updatedStartTime.format('YYYY-MM-DDTHH:mm:ss') : null,
                "endTime": updatedEndTime ? updatedEndTime.format('YYYY-MM-DDTHH:mm:ss') : null,
                "executionType": type || '',
                "executionTypeId": '',
                "duration": '',
                "courseId": '',
                "hasRooms": true,
                "branch_ids": [], // doloci v timetable
                "branches": [],
                "tutors": [{ name: tutor, id: '' }],
                "tutor_ids": [],
                "rooms": [{ name: room, id: '' }],
                "room_ids": [],
                "groups": [{ name: group, id: '' }],
                "group_ids": [],
                "lecture": true,
            };
        } else {
            eventDetails = {
                "startTime": updatedStartTime ? updatedStartTime.format('YYYY-MM-DDTHH:mm:ss') : null,
                "endTime": updatedEndTime ? updatedEndTime.format('YYYY-MM-DDTHH:mm:ss') : null,
                "title": title,
                "notes": notes,
                "editable": true,
                "lecture": false
            };
        }

        if (onSave) {
            onSave(eventDetails);
        }

        setTitle('');
        setDate(null);
        setStartTime(null);
        setEndTime(null);
        setNotes('');
        setTutor('');
        setGroup('');
        setType('');
        setRoom('');
    }

    const handleUpdateEvent = () => {

        const newdate = date || dayjs(event.start);
        const newStart = dayjs(event.start);
        const newEnd = dayjs(event.end);

        const updatedStartTime = startTime ? startTime.set('year', newdate.year()).set('month', newdate.month()).set('date', newdate.date()) : newStart.set('year', newdate.year()).set('month', newdate.month()).set('date', newdate.date());
        const updatedEndTime = endTime ? endTime.set('year', newdate.year()).set('month', newdate.month()).set('date', newdate.date()) : newEnd.set('year', newdate.year()).set('month', newdate.month()).set('date', newdate.date());
        let eventDetails = {}

        if (event.extendedProps.lecture) {
            eventDetails = {
                "id": event.id,
                "course": title || event.title, 
                "startTime": updatedStartTime ? updatedStartTime.format('YYYY-MM-DDTHH:mm:ss') : null,
                "endTime": updatedEndTime ? updatedEndTime.format('YYYY-MM-DDTHH:mm:ss') : null,
                "executionType": type || event.extendedProps.type, 
                "executionTypeId": event.extendedProps.executionType,
                "duration": event.extendedProps.duration,
                "courseId": event.extendedProps.courseId, 
                "hasRooms": event.extendedProps.hasRooms, 

                // "tutors": tutor ? [{ name: tutor, id: '' }] : event.extendedProps.tutors_arr,
                // "tutor_ids": tutor ? [] : event.extendedProps.tutor_ids,
                // "rooms": room ? [{ name: room, id: '' }] : event.extendedProps.rooms_arr, 
                // "room_ids": room ? [] : event.extendedProps.room_ids,
                // "groups": group ? [{ name: group, id: '' }] : event.extendedProps.groups_arr, 
                // "group_ids": group ? [] : event.extendedProps.group_ids,
                // "branch_ids": event.extendedProps.branchIds, 
                // "branches": event.extendedProps.branches,

                "lecture": true,
            };
        } else {
            eventDetails = {
                "id": event.id,
                "title": title || event.title,
                "startTime": updatedStartTime ? updatedStartTime.format('YYYY-MM-DDTHH:mm:ss') : null,
                "endTime": updatedEndTime ? updatedEndTime.format('YYYY-MM-DDTHH:mm:ss') : null,
                "notes": notes || event.extendedProps.notes,
                "editable": true,
                "lecture": false
            };
        }

        if (onUpdate) {
            onUpdate(eventDetails);
        }
        setTitle('');
        setDate(null);
        setStartTime(null);
        setEndTime(null);
        setNotes('');
        setTutor('');
        setGroup('');
        setType('');
        setRoom('');
    }

    const handleDeleteEvent = () => {
        if (onDelete) {
            onDelete(event.id);
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
                {mode === 'view' && event && (
                    <>
                        <Typography id="custom-modal-title" variant="h4" component="h2">
                            {event.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
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
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
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
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                    },
                                }}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Teacher"
                            defaultValue={event.extendedProps.teacher}
                            InputProps={{
                                readOnly: true,
                            }}
                            disabled
                            sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Groups"
                            defaultValue={event.extendedProps.groups}
                            InputProps={{
                                readOnly: true,
                            }}
                            disabled
                            sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                },
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Type"
                                defaultValue={event.extendedProps.type}
                                InputProps={{
                                    readOnly: true,
                                }}
                                disabled
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                    },
                                }}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                defaultValue={event.extendedProps.location}
                                InputProps={{
                                    readOnly: true,
                                }}
                                disabled
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                    },
                                }}
                            />
                        </Box>
                    </>
                )}

                {mode === 'edit' && event.extendedProps.lecture && role === 'Tutor' && event && (
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
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                },
                            }}

                        />
                        <Box sx={{ marginTop: 1 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <DatePicker
                                    label="Date"
                                    value={dayjs(event.start)}
                                    onChange={(newValue) => setDate(newValue)}
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <TimePicker
                                    label="Start time"
                                    value={dayjs(event.start)}
                                    onChange={(newValue) => setStartTime(newValue)}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
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
                            defaultValue={event.extendedProps.teacher}
                            InputProps={{
                                readOnly: true,
                            }}
                            disabled
                            sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Groups"
                            defaultValue={event.extendedProps.groups}
                            InputProps={{
                                readOnly: true,
                            }}
                            disabled
                            sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                },
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Type"
                                defaultValue={event.extendedProps.type}
                                onChange={(e) => setType(e.target.value)}

                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                defaultValue={event.extendedProps.location}
                                onChange={(e) => setRoom(e.target.value)}
                            />
                        </Box>
                    </>
                )}

                {mode === 'edit' && event.extendedProps.lecture && role === 'Referat' && event && (
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
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <DatePicker
                                    label="Date"
                                    value={dayjs(event.start)}
                                    onChange={(newValue) => setDate(newValue)}
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <TimePicker
                                    label="Start time"
                                    value={dayjs(event.start)}
                                    onChange={(newValue) => setStartTime(newValue)}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
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
                            defaultValue={event.extendedProps.teacher}
                            onChange={(e) => setTutor(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Groups"
                            defaultValue={event.extendedProps.groups}
                            onChange={(e) => setGroup(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Type"
                                defaultValue={event.extendedProps.type}
                                onChange={(e) => setType(e.target.value)}

                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                defaultValue={event.extendedProps.location}
                                onChange={(e) => setRoom(e.target.value)}
                            />
                        </Box>
                    </>
                )}

                {mode === 'edit' && !event.extendedProps.lecture && event && (
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
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <DatePicker
                                    label="Date"
                                    value={dayjs(event.start)}
                                    onChange={(newValue) => setDate(newValue)}
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <TimePicker
                                    label="Start time"
                                    value={dayjs(event.start)}
                                    onChange={(newValue) => setStartTime(newValue)}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
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

                {mode === 'add' && role !== 'Referat' && (
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
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <DatePicker
                                    label="Date"
                                    value={date}
                                    onChange={(newValue) => setDate(newValue)}
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <TimePicker
                                    label="Start time"
                                    value={startTime}
                                    onChange={(newValue) => setStartTime(newValue)}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
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

                {mode === 'add' && role === 'Referat' && (
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
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <DatePicker
                                    label="Date"
                                    value={date}
                                    onChange={(newValue) => setDate(newValue)}
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
                                <TimePicker
                                    label="Start time"
                                    value={startTime}
                                    onChange={(newValue) => setStartTime(newValue)}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sl">
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
                            label="Teacher"
                            value={tutor}
                            onChange={(e) => setTutor(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Groups"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
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
                                label="Location"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                            />
                        </Box>
                    </>
                )}
                < div className="flex justify-end mt-4 w-full">
                    <Button onClick={toggle} className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2">
                        <span>Close</span>
                    </Button>
                    {mode === 'edit' && !event.extendedProps.lecture && (

                        <Button onClick={handleDeleteEvent} className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2">
                            <span>Delete</span>
                        </Button>

                    )}
                    {mode === 'edit' && (
                        <>
                            <Button
                                onClick={handleUpdateEvent}
                                className="bg-modra text-white hover:bg-modra-700 items-center space-x-2"
                            >
                                <span>Save</span>
                            </Button>
                        </>
                    )}
                    {mode === 'add' && (
                        <Button onClick={handleAddEvent} className="bg-modra text-white hover:bg-modra-700 items-center space-x-2">
                            <span>Add</span>
                        </Button>
                    )}

                </div>
            </Box>
        </Modal >
    );
}
