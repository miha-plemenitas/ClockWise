import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar, GridColDef } from '@mui/x-data-grid';
import { Select, MenuItem } from '@mui/material';
import { Button } from "../../Components/ui/button";
import axios from 'axios';
import { Buffer } from "buffer";
import useFaculties from '../../Components/Hooks/useFaculties';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Student' | 'Tutor' | 'Referat';
    facultyId: number | null;
    isVerified: boolean;
}

const Admin: React.FC = () => {
    const [users, setUsers] = useState<User[]>([])
    const [userChanges, setUserChanges] = useState<{ [userId: string]: Partial<User> }>({});
    const { faculties, loading: facultiesLoading, error: facultiesError } = useFaculties();

    useEffect(() => {
        fetchUsers();
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
                    className="no-border-date-picker"
                    sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                            border: "none !important",
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
            width: 500,
            renderCell: (params) => (
                <Select
                    value={params.value}
                    onChange={(event) => handleFacultyChange(event, params)}
                    displayEmpty
                    className="no-border-date-picker"
                    sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                            border: "none !important",
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

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-4 w-full h-full">
                <div className="w-full h-full">
                    <DataGrid rows={users} columns={columns} slots={{ toolbar: GridToolbar }} />
                </div>
            </div>
        </div>
    );
};

export default Admin;


