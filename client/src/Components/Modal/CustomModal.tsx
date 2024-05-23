import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button } from "../../Components/ui/button";
import TextField from '@mui/material/TextField';
import { SxProps } from '@mui/system';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/de';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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
    onSave: (eventInfo: any) => void;
    event?: {
        id: string;
        title: string;
        start: string;
        end: string;
        extendedProps: {
            type: string;
            groups: string;
            teacher: string;
            location: string;
            editable: boolean;
        };
    };
}

export default function CustomModal({
    isOpen,
    toggle,
    mode,
    onSave,
    event,
}: CustomModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Dayjs | null>(null);
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);
    const [izvajalec, setIzvajalec] = useState('');
    const [skupina, setSkupina] = useState('');
    const [tip, setTip] = useState('');
    const [prostor, setProstor] = useState('');


    const formatDate = (dateString: string) => format(new Date(dateString), 'EEEE, d. M. yyyy', { locale: enUS });
    const formatTime = (startString: string, endString: string) => {
        const startTime = format(new Date(startString), 'HH:mm');
        const endTime = format(new Date(endString), 'HH:mm');
        return `${startTime} - ${endTime}`;
    };

    const handleAddEvent = () => {
        if (!date) return;

        const updatedStartTime = startTime ? startTime.set('year', date.year()).set('month', date.month()).set('date', date.date()) : null;
        const updatedEndTime = endTime ? endTime.set('year', date.year()).set('month', date.month()).set('date', date.date()) : null;
        const eventDetails = {
            title,
            startTime: updatedStartTime ? updatedStartTime.format('YYYY-MM-DDTHH:mm:ss') : null,
            endTime: updatedEndTime ? updatedEndTime.format('YYYY-MM-DDTHH:mm:ss') : null,
            extendedProps: {
                type: tip,
                groups: skupina,
                teacher: izvajalec,
                location: prostor,
                editable: true
            }
        };

        onSave(eventDetails);
        setTitle('');
        setDate(null);
        setStartTime(null);
        setEndTime(null);
        setIzvajalec(''); 
        setSkupina('');
        setTip('');
        setProstor('');
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

                {mode === 'edit' && event && (
                    <>
                        <Typography id="custom-modal-title" variant="h4" component="h2">
                            Edit Event
                        </Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Title"
                            defaultValue={event.title}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Date"
                                defaultValue={formatDate(event.start)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Time"
                                defaultValue={formatTime(event.start, event.end)}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Teacher"
                            defaultValue={event.extendedProps.teacher}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Groups"
                            defaultValue={event.extendedProps.groups}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Type"
                                defaultValue={event.extendedProps.type}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                defaultValue={event.extendedProps.location}
                            />
                        </Box>
                    </>
                )}

                {mode === 'add' && (
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
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
                                <DatePicker
                                    label="Date"
                                    value={date}
                                    onChange={(newValue) => setDate(newValue)}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
                                <TimePicker
                                    label="Start time"
                                    value={startTime}
                                    onChange={(newValue) => setStartTime(newValue)}
                                />
                            </LocalizationProvider>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
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
                            name="izvajalec"
                            value={izvajalec}
                            onChange={(e) => setIzvajalec(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Groups"
                            name="skupina"
                            value={skupina}
                            onChange={(e) => setSkupina(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Type"
                                name="tip"
                                value={tip}
                                onChange={(e) => setTip(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                name="prostor"
                                value={prostor}
                                onChange={(e) => setProstor(e.target.value)}
                            />
                        </Box>
                    </>
                )}

                < div className="flex justify-end mt-4 w-full">
                    <Button
                        onClick={toggle}
                        className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2"
                    >
                        <span>Close</span>
                    </Button>
                    {mode === 'edit' && (
                        <Button
                            onClick={() => {/* Handle save action */ }}
                            className="bg-modra text-white hover:bg-modra-700 items-center space-x-2"
                        >
                            <span>Save</span>
                        </Button>
                    )}
                    {mode === 'add' && (
                        <Button
                            onClick={handleAddEvent}
                            className="bg-modra text-white hover:bg-modra-700 items-center space-x-2"
                        >
                            <span>Add</span>
                        </Button>
                    )}

                </div>
            </Box>
        </Modal >
    );
}
