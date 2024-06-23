import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button } from "../../Components/ui/button";
import { SxProps } from '@mui/system';
import { useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import useFaculties from '../Hooks/useFaculties';

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

interface HeatmapModalProps {
    isOpen: boolean;
    toggle: () => void;
    onGenerate: (data: any) => void;
}

export default function HeatmapModal({
    isOpen,
    toggle,
    onGenerate

}: HeatmapModalProps) {

    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const { faculties, loading, error } = useFaculties();

    const handleGenerateHeatmap = () => {
        if (selectedFaculty && selectedCollection && selectedType) {
            const data = {selectedFaculty, selectedCollection, selectedType}
            onGenerate(data)
        }

        setSelectedCollection('');
        setSelectedType('');
        setSelectedFaculty('');
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
                        Generate heatmap
                    </Typography>
                    <div className="mt-3 space-y-4">
                        <FormControl fullWidth >
                            <InputLabel id="demo-simple-select-label">Select a faculty</InputLabel>
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
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Select a collection</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedCollection}
                                label="Age"
                                onChange={(e) => setSelectedCollection(e.target.value)}
                            >
                                <MenuItem value={'original_lectures'}>Original lectures</MenuItem>
                                <MenuItem value={'lectures'}>Lectures</MenuItem>
                                <MenuItem value={'generated_lectures'}>Generated lectures</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Select a type</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedType}
                                label="Age"
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <MenuItem value={'frequency'}>Frequency</MenuItem>
                                <MenuItem value={'count'}>Count</MenuItem>
                                <MenuItem value={'both'}>Both</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    < div className="flex justify-end mt-4 w-full">
                        <Button onClick={toggle} className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2">
                            <span>Close</span>
                        </Button>
                        <Button onClick={handleGenerateHeatmap} className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2">
                            <span>Generate</span>
                        </Button>
                    </div>
                </Box>
            </Box>
        </Modal>);
}
