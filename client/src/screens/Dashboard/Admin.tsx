import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar, GridColDef } from '@mui/x-data-grid';
import { Select, MenuItem } from '@mui/material';
import { Button } from "../../Components/ui/button";
import "./Admin.css"
import axios from 'axios';
import { Buffer } from "buffer";
import useFaculties from '../../Components/Hooks/useFaculties';
import { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Student' | 'Tutor' | 'Referat';
    facultyId: number | null;
    isVerified: boolean;
}

interface DayOff {
    id?: string;
    startDate: Dayjs;
    endDate?: Dayjs | null;
    facultyId?: string | null;
    facultyName?: string | null;
}

const Admin: React.FC = () => {
    const [users, setUsers] = useState<User[]>([])
    const [userChanges, setUserChanges] = useState<{ [userId: string]: Partial<User> }>({});
    const { faculties, loading: facultiesLoading, error: facultiesError } = useFaculties();
    const [daysOff, setDaysOff] = useState<DayOff[]>([]);
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchDays();
    }, []);

    const fetchUsers = async () => {
        try {
            const username = process.env.REACT_APP_USERNAME;
            const password = process.env.REACT_APP_PASSWORD;

            const bufferedCredentials = Buffer.from(`${username}:${password}`);
            const credentials = bufferedCredentials.toString("base64");
            const headers = {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
            };

            const response = await axios.get(
                "https://europe-west3-pameten-urnik.cloudfunctions.net/user-getUnverified",
                {
                    headers: headers
                }
            );
            setUsers(response.data.result);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
        {
            field: 'role',
            headerName: 'Role',
            width: 150,
            renderCell: (params) => (
                <Select
                    value={params.value}
                    onChange={(event) => handleRoleChange(event, params)}
                    sx={{
                        width: '100%',
                        '& .MuiSelect-select': {
                            outline: 'none',
                        },
                    }}
                >
                    <MenuItem value="Student">Student</MenuItem>
                    <MenuItem value="Tutor">Tutor</MenuItem>
                    <MenuItem value="Referat">Referat</MenuItem>
                </Select>
            ),
        },
        {
            field: 'facultyId',
            headerName: 'Faculty',
            width: 200,
            renderCell: (params) => (
                <Select
                    value={params.value}
                    onChange={(event) => handleFacultyChange(event, params)}
                    displayEmpty
                    sx={{
                        width: '100%',
                        '& .MuiSelect-select': {
                            outline: 'none',
                        },
                    }}
                >
                    <MenuItem value="">Select faculty</MenuItem>
                    {!facultiesLoading &&
                        faculties.map((faculty) => (
                            <MenuItem key={faculty.id} value={faculty.id}>
                                {faculty.name}
                            </MenuItem>
                        ))}
                </Select>
            ),
        },
        {
            field: 'akcija',
            headerName: '',
            width: 100,
            renderCell: (params) => (
                <Button
                    className="bg-modra text-white mr-2 hover:bg-modra-700 items-center space-x-2"
                    onClick={() => handleVerifyClick(params.row.id)}
                >
                    Verify
                </Button>
            ),
        },
    ];


    const handleRoleChange = (event: any, params: any) => {
        const userId = params.row.id;
        const newRole = event.target.value;

        setUserChanges((prevChanges) => ({
            ...prevChanges,
            [userId]: { ...prevChanges[userId], role: newRole },
        }));

        setUsers((prevUsers) =>
            prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
        );
    };

    const handleFacultyChange = (event: any, params: any) => {
        const userId = params.row.id;
        const newFacultyId = event.target.value;

        setUserChanges({
            ...userChanges,
            [userId]: { ...userChanges[userId], facultyId: newFacultyId },
        });

        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, facultyId: newFacultyId } : user
            )
        );
    };;


    const handleVerifyClick = async (userId: string) => {
        try {
            const user = users.find((user) => user.id === userId);
            const changes = userChanges[userId];
            const updatedUser = { ...user, ...changes };
            updatedUser.isVerified = true;


            const username = process.env.REACT_APP_USERNAME;
            const password = process.env.REACT_APP_PASSWORD;

            const bufferedCredentials = Buffer.from(`${username}:${password}`);
            const credentials = bufferedCredentials.toString("base64");
            const headers = {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
            };

            const response = await axios.put("https://europe-west3-pameten-urnik.cloudfunctions.net/user-update",
                {
                    uid: userId,
                    ...updatedUser
                },
                { headers: headers }
            );

            setUserChanges({});
            fetchUsers();

        } catch (error) {
            console.error("Error verifying user:", error);
        }
    };

    const columnsDaysOff: GridColDef[] = [
        { field: 'startDate', headerName: 'Start date', width: 250 },
        { field: 'endDate', headerName: 'End date', width: 250 },
        { field: 'facultyName', headerName: 'Faculty', width: 250 },
        {
            field: 'akcija',
            headerName: '',
            width: 100,
            renderCell: (params) => (
                <Button onClick={() => handleRemoveDayOff(params.row.id)} >
                    Remove
                </Button>
            ),
        },
    ];

    const handleAddDayOff = async () => {
        try {
            if (startDate) {
                const selectedFaculty = faculties.find(f => f.id === selectedFacultyId);
                const novProstiDan: DayOff = {
                    startDate: startDate,
                    facultyId: selectedFacultyId || null,
                    facultyName: selectedFaculty?.name || null,
                };

                if (endDate && endDate.isAfter(startDate)) {
                    novProstiDan.endDate = endDate;
                } else {
                    novProstiDan.endDate = null;
                }

                console.log(novProstiDan);

                const username = process.env.REACT_APP_USERNAME;
                const password = process.env.REACT_APP_PASSWORD;

                const bufferedCredentials = Buffer.from(`${username}:${password}`);
                const credentials = bufferedCredentials.toString("base64");
                const headers = {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/json",
                };

                const response = await axios.post("https://europe-west3-pameten-urnik.cloudfunctions.net/admin-addDay",
                    novProstiDan,
                    { headers: headers }
                );

                setStartDate(null);
                setEndDate(null);
                setSelectedFacultyId(null);
                fetchDays()
            }
        } catch (error) {
            console.error("Error adding day off:", error);
        }
    };

    const handleRemoveDayOff = async (dayId: string) => {
        try {
            const username = process.env.REACT_APP_USERNAME;
            const password = process.env.REACT_APP_PASSWORD;

            const bufferedCredentials = Buffer.from(`${username}:${password}`);
            const credentials = bufferedCredentials.toString("base64");
            const headers = {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
            };

            const response = await axios.delete(
                "https://europe-west3-pameten-urnik.cloudfunctions.net/admin-deleteDay",
                {
                    data: { dayId },
                    headers: headers
                }
            );
            fetchDays();
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const fetchDays = async () => {
        try {
            const username = process.env.REACT_APP_USERNAME;
            const password = process.env.REACT_APP_PASSWORD;

            const bufferedCredentials = Buffer.from(`${username}:${password}`);
            const credentials = bufferedCredentials.toString("base64");
            const headers = {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
            };

            const response = await axios.get(
                "https://europe-west3-pameten-urnik.cloudfunctions.net/admin-getAll",
                {
                    headers: headers
                }
            );
            setDaysOff(response.data.result);
        } catch (error) {
            console.error("Error fetching days:", error);
        }
    }

    return (
        <div>
            <div className="flex flex-col 2xl:flex-row gap-4">
                <div className="2xl:w-1/2">
                    <DataGrid rows={users} columns={columns} slots={{ toolbar: GridToolbar }} />
                </div>
                <div className="2xl:w-1/2">
                    <div className="flex flex-col gap-4">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className="flex gap-2 items-center">
                                <DatePicker
                                    label="Start date"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                />
                                <DatePicker
                                    label="End date (optional)"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}

                                />
                                <Select
                                    value={selectedFacultyId || ''}
                                    onChange={(event) => setSelectedFacultyId(event.target.value as string)}
                                    displayEmpty
                                    sx={{
                                        width: 150,
                                        '& .MuiSelect-select': {
                                            outline: 'none',
                                        },
                                    }}
                                >
                                    <MenuItem value="">Select faculty</MenuItem>
                                    {!facultiesLoading &&
                                        faculties.map((faculty) => (
                                            <MenuItem key={faculty.id} value={faculty.id}>
                                                {faculty.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                                <Button className="bg-blue-500 text-white hover:bg-blue-700" onClick={handleAddDayOff}>
                                    Add
                                </Button>
                            </div>
                        </LocalizationProvider>
                    </div>

                    <div style={{ height: 400, width: '100%' }}>
                        <DataGrid rows={daysOff} columns={columnsDaysOff} slots={{ toolbar: GridToolbar }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;


