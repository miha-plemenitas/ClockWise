import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button } from "../../Components/ui/button";

import { SxProps } from '@mui/system';

const style: SxProps = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
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
                        <Typography id="custom-modal-title" variant="h6" component="h2">
                            {event.title}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Start:</strong> {event.start}
                        </Typography>
                        <Typography variant="body1">
                            <strong>End:</strong> {event.end}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Type:</strong> {event.extendedProps.tip}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Teacher:</strong> {event.extendedProps.izvajalec}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Location:</strong> {event.extendedProps.prostor}
                        </Typography>
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



