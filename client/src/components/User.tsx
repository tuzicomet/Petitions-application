import axios from 'axios';
import React from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const User = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = React.useState<User>({
        id: 0,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        imageFilename: "",
        authToken: ""
    });
    const [editUserDetails, setEditUserDetails] = React.useState<Partial<User>>({}); // Partial<User> to allow only some fields to be edited
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("");
    const savedAuthToken = localStorage.getItem("savedAuthToken"); // Get the saved authToken from local storage

    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    React.useEffect(() => {
        const getUser = () => {
            axios.get<User>(`http://localhost:4941/api/v1/users/${id}`, {
                headers: {
                    // Include the savedAuthToken in the request header as X-Authorization
                    'X-Authorization': savedAuthToken
                }
            })
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setUser(response.data);
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        };
        getUser();
    }, [id]);

    const editUser = () => {
        axios.patch(`http://localhost:4941/api/v1/users/${id}`, editUserDetails, {
            headers: {
                // Include the savedAuthToken in the request header as X-Authorization
                'X-Authorization': savedAuthToken
            }
        })
            .then(() => {
                setOpenEditDialog(false);
                setSnackMessage("User details updated successfully");
                setSnackOpen(true);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    return (
        <div>
            {/* Show error Alert if errorFlag is there */}
            {errorFlag &&
                <Alert severity="error">
                    {errorMessage}
                </Alert>
            }

            <h1>User</h1>
            <div>
                <strong>ID:</strong> {user.id}<br />
                <strong>First Name:</strong> {user.firstName}<br />
                <strong>Last Name:</strong> {user.lastName}<br />
                <strong>Email:</strong> {user.email}<br />
                <strong>Password:</strong> {user.password}<br />
                <strong>Image Filename:</strong> {user.imageFilename}<br />
                <strong>Auth Token:</strong> {user.authToken}<br />
            </div>

            <Link to={"/users"}>Back to users</Link>

            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setOpenEditDialog(true)}>
                Edit
            </Button>

            {/* Edit User Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
            >
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Make changes to user details:
                    </DialogContentText>
                    <TextField
                        label="First Name"
                        value={editUserDetails.firstName || ""}
                        onChange={(e) => setEditUserDetails({ ...editUserDetails, firstName: e.target.value })}
                    /><br />
                    <TextField
                        label="Last Name"
                        value={editUserDetails.lastName || ""}
                        onChange={(e) => setEditUserDetails({ ...editUserDetails, lastName: e.target.value })}
                    /><br />
                    <TextField
                        label="Email"
                        value={editUserDetails.email || ""}
                        onChange={(e) => setEditUserDetails({ ...editUserDetails, email: e.target.value })}
                    /><br />
                    <TextField
                        label="Password"
                        type="password"
                        value={editUserDetails.password || ""}
                        onChange={(e) => setEditUserDetails({ ...editUserDetails, password: e.target.value })}
                    /><br />
                    <TextField
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    /><br />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={editUser}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar component */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={6000}
                onClose={handleSnackClose}
                message={snackMessage}
            />
        </div>
    );
};

export default User;