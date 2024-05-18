import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button } from "../../Components/ui/button";
import TextField from '@mui/material/TextField';
import { SxProps } from '@mui/system';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

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
    event?: {
        title: string;
        start: string;
        end: string;
        extendedProps: {
            tip: string;
            skupina: string;
            izvajalec: string;
            prostor: string;
        };
    };
}

export default function CustomModal({
    isOpen,
    toggle,
    event,
}: CustomModalProps) {

    const formatDate = (dateString: string) => format(new Date(dateString), 'EEEE, d. M. yyyy', { locale: enUS });
    const formatTime = (startString: string, endString: string) => {
        const startTime = format(new Date(startString), 'HH:mm');
        const endTime = format(new Date(endString), 'HH:mm');
        return `${startTime} - ${endTime}`;
    };

    return (
        <Modal
            open={isOpen}
            onClose={toggle}
            aria-labelledby="custom-modal-title"
            aria-describedby="custom-modal-description"
        >
            <Box sx={style}>
                {event && (
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
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Time"
                                defaultValue={formatTime(event.start, event.end)}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Teacher"
                            defaultValue={event.extendedProps.izvajalec}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Groups"
                            defaultValue={event.extendedProps.skupina}
                            InputProps={{
                                readOnly: true,
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Type"
                                defaultValue={event.extendedProps.tip}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />


                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                defaultValue={event.extendedProps.prostor}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Box>

                    </>
                )}
                <div className="flex justify-end mt-4 w-full">
                    <Button
                        onClick={toggle}
                        className="bg-modra text-white hover:bg-modra-700 items-center space-x-2"
                    >
                        <span>Close</span>
                    </Button>
                </div>
            </Box>
        </Modal>
    );
}
