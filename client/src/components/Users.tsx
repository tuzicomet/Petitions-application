import axios from 'axios';
import React from "react";
import {Link, useNavigate} from 'react-router-dom';

import {Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Paper, TextField, TableContainer, Table, TableBody, TableHead,
    TableRow, TableCell, Stack,
    Alert, AlertTitle, Snackbar} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import CSS from 'csstype';
const card: CSS.Properties = {
    padding: "10px",
    margin: "20px",
}

interface HeadCell {
    id: string;
    label: string;
    numeric: boolean;
}
const headCells: readonly HeadCell[] = [
    { id: 'ID', label: 'id', numeric: true },
    { id: 'email', label: 'Email', numeric: false },
    { id: 'link', label: 'Link', numeric: false },
    { id: 'actions', label: 'Actions', numeric: false }
];


const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = React.useState < Array < User >> ([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [newEmail, setNewEmail] = React.useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
    const [dialogUser, setDialogUser] = React.useState<User>({ email: "", userId: -1, firstName: "", lastName: "", password: "" })
    const [emailEdit, setEmailEdit] = React.useState("");
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [addUserEmail, setAddUserEmail] = React.useState("");
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    }


    // React.useEffect hook, here it simply fetches all users when the page loads
    React.useEffect(() => {
        getUsers()
    }, [])

    const getUsers = () => {
        axios.get('http://localhost:4941/api/users')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUsers(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const user_rows = () => {
        return users.map((row: User) => (
            <TableRow hover tabIndex={-1} key={row.userId}>
                <TableCell>{row.userId}</TableCell>
                <TableCell align="right">{row.email}</TableCell>
                <TableCell align="right">
                    <Link to={"/users/" + row.userId}>Go to user</Link>
                </TableCell>
                <TableCell align="right">
                    <Button variant="outlined" endIcon={<EditIcon />} onClick={() => { handleEditDialogOpen(row) }}>
                        Edit
                    </Button>
                    <Button variant="outlined" endIcon={<DeleteIcon />} onClick={() => { handleDeleteDialogOpen(row) }}>
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
        ));
    }

    const addUser = () => {
        axios.post('http://localhost:4941/api/users', { email: addUserEmail  })
            .then((response) => {
                console.log('User created successfully');
                setNewEmail(""); // Reset the email field after submission
                getUsers();
            })
            .catch((error) => {
                console.error('Error creating user:', error);
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    // Function for deleting a single user
    const deleteUser = () => {
        axios.delete('http://localhost:4941/api/users/' + dialogUser.userId)
            .then(() => {
                getUsers(); // Refresh user list after deletion
                handleDeleteDialogClose()
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const handleDeleteDialogOpen = (user: User) => {
        setDialogUser(user)
        setOpenDeleteDialog(true);
    };

    const handleDeleteDialogClose = () => {
        setDialogUser({ email: "", userId: -1, firstName: "", lastName: "", password: "" })
        setOpenDeleteDialog(false);
    };

    const editUser = () => {
        axios.put('http://localhost:4941/api/users/' + dialogUser.userId, { email: emailEdit })
            .then(() => {
                getUsers(); // Refresh user list after edit
                handleEditDialogClose();
                setSnackMessage("Email changed successfully")
                setSnackOpen(true)

            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const updateEmailEditState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmailEdit(e.target.value);
    };

    const handleEditDialogOpen = (user: User) => {
        setEmailEdit(user.email); // Set initial value for email edit
        setDialogUser(user); // Set the dialogUser state with the correct user object
        setOpenEditDialog(true);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
    };

    return (
        <div>
            {/* Show error Alert if errorFlag is there */}
            {errorFlag &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            }

            {/* User table section */}
            <Paper elevation={3} style={card}>
                <h1>Users</h1>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align={headCell.numeric ? 'right' : 'left'}
                                        padding={'normal'}
                                    >
                                        {headCell.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {user_rows()}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add User section */}
            <Paper elevation={3} style={card}>
                <h1>Add a new user</h1>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <TextField
                        id="outlined-basic"
                        label="Email"
                        variant="outlined"
                        value={addUserEmail}
                        onChange={(event) => setAddUserEmail(event.target.value)}
                    />
                    <Button variant="outlined" onClick={() => { addUser() }}>
                        Submit
                    </Button>
                </Stack>
            </Paper>

            {/* Delete User Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleDeleteDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete User?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this user?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                    <Button variant="outlined" color="error" onClick={() => deleteUser()} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={handleEditDialogClose}
                aria-labelledby="edit-dialog-title"
                aria-describedby="edit-dialog-description"
            >
                <DialogTitle id="edit-dialog-title">
                    {"Edit User"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        id="outlined-basic"
                        label="Email"
                        variant="outlined"
                        value={emailEdit}
                        onChange={updateEmailEditState}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose}>
                        Cancel
                    </Button>
                    <Button variant="outlined" color="primary" onClick={editUser}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar component to wrap the error Alert in */}
            {/* This displays a pop-up message on screen informing the user of the error */}
            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}
            >
                <Alert onClose={handleSnackClose} severity="success" sx={{ width: '100%' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>

        </div>
    )
}

export default Users;