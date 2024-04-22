import axios from 'axios';
import React from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
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
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [editUsername, setEditUsername] = React.useState("");
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("");

    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    React.useEffect(() => {
        const getUser = () => {
            axios.get<User>(`http://localhost:4941/api/v1/users/${id}`)
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

    const deleteUser = () => {
        axios.delete(`http://localhost:4941/api/v1/users/${user.id}`)
            .then(() => {
                navigate('/users');
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const editUser = () => {
        axios.patch(`http://localhost:4941/api/v1/users/${user.id}`, { username: editUsername })
            .then(() => {
                setOpenEditDialog(false);
                setSnackMessage("Username changed successfully");
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

            <Button variant="outlined" startIcon={<DeleteIcon />} onClick={deleteUser}>
                Delete
            </Button>

            {/* Edit User Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
            >
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter new username:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Username"
                        type="text"
                        fullWidth
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                    />
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
