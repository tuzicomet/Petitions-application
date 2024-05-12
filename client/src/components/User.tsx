import axios from 'axios'; // Axios library for making HTTP requests
import React, { ChangeEvent } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom'; // React Router for navigation
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Snackbar, Alert } from "@mui/material"; // Material-UI components
import EditIcon from "@mui/icons-material/Edit";
import Navbar from "./Navbar";
import defaultImage from "../assets/default_picture.jpg";

import { getUser, getUserImage, editUser, changeUserImage } from "../services/UserService";

// User functional component
const User = () => {
    const { id } = useParams(); // Get route parameters
    const navigate = useNavigate(); // Navigation function for navigating to different pages
    const [user, setUser] = React.useState<User>({ // Define state variable for user data
        id: 0,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        imageFilename: "",
        authToken: ""
    });
    const [imageUrl, setImageUrl] = React.useState<string | null>(null); // url to the user's image file
    const [editUserDetails, setEditUserDetails] = React.useState<Partial<User>>({}); // Partial<User> to allow only some fields to be edited
    const [currentPassword, setCurrentPassword] = React.useState(""); // State variable for current password input
    const [errorFlag, setErrorFlag] = React.useState(false); // Flag for error status
    const [errorMessage, setErrorMessage] = React.useState(""); // Error message
    const [openEditDialog, setOpenEditDialog] = React.useState(false); // State for opening/closing edit dialog
    const [snackOpen, setSnackOpen] = React.useState(false); // Snackbar open state
    const [snackMessage, setSnackMessage] = React.useState(""); // Snackbar message
    const savedAuthToken = localStorage.getItem("savedAuthToken"); // Get the saved authToken from local storage
    const [authenticatedAsUser, setAuthenticatedAsUser] = React.useState(false); // boolean saying whether the client is authenticated as the user

    // reference to the hidden file input element
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // run whenever id changes
    React.useEffect(() => {
        getUser(id, savedAuthToken, setUser, setAuthenticatedAsUser, setErrorFlag, setErrorMessage);
        // get the user's profile image
        const getProfileImage = async () => {
            // use the getUserImage method from UserService to get the user's profile photo
            const userImage = await getUserImage(id);
            // set the image to the imageUrl variable
            setImageUrl(userImage);
        }
        getProfileImage();
    }, [id]);

    // Snackbar close handler
    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    // method to handle editing the user's information
    const handleEditUser = () => {
        // call the editUser method from userService with the relevant parameters,
        // and it will handle editing the user
        editUser(
            id,
            savedAuthToken,
            editUserDetails,
            setErrorFlag,
            setErrorMessage,
            setSnackMessage,
            setSnackOpen,
            setOpenEditDialog
        );
    };

    // method to handle uploading a new image for a user's profile picture
    const handleChangeUserImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        // call the uploadUserImage method from userService with the relevant parameters,
        // and it will handle uploading and updating the user's profile photo
        changeUserImage(
            event,
            id,
            savedAuthToken,
            setErrorFlag,
            setErrorMessage,
            setSnackMessage,
            setSnackOpen
        );
    };

    return (
        // JSX elements to display on the page
        <div>
            {/* Navigation Bar */}
            <Navbar/>

            {/* Show error Alert if errorFlag is true */}
            {errorFlag &&
                <Alert severity="error">
                    {errorMessage}
                </Alert>
            }

            <h1>User</h1>

            {/* Display user's image.
             If userImage is null, then display the default image */}
            <img src={imageUrl || defaultImage}
                 alt="User Profile"
                 style={{width: 100, height: 100, borderRadius: "10%"}}
            />

            <div>
                {/* Display user details */}
                <strong>First Name:</strong> {user.firstName}<br/>
                <strong>Last Name:</strong> {user.lastName}<br/>
                {/* Only display the following fields if client is authenticated as user */}
                {authenticatedAsUser && (
                    <>
                        <strong>Email:</strong> {user.email}<br/>
                    </>
                )}
            </div>

            {/* Link to navigate back to the users list */}
            <Link to={"/users"}>Back to users</Link>

            {/* Only display if the client is authenticated as user */}
            {authenticatedAsUser && (
                <>
                    {/* Button to edit user details (opens the Edit user dialog) */}
                    <Button variant="outlined" startIcon={<EditIcon/>} onClick={() => setOpenEditDialog(true)}>
                        Edit
                    </Button>

                    {/* Button to upload a new profile picture */}
                    {/* Resource used: https://medium.com/web-dev-survey-from-kyoto/how-to-customize-the-file-upload-button-in-react-b3866a5973d8 */}
                    {/* TODO: make a button on top of the curent image instead? */}
                    {/* TODO: let users remove their profile picture (how would this fit with above?) */}
                    <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
                        {/* When clicked, it clicks the hidden file input element */}
                        Change Picture
                    </Button>
                    {/* Hidden file input element */}
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }} // Hide the element
                        ref={fileInputRef} // variable which references this element
                        // When an image is uploaded, call the handleImageUpload function
                        onChange={handleChangeUserImage}
                    />
                </>
            )}

            {/* Edit User Dialog (popup modal) */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
            >
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {/* Instructions for editing user details */}
                        Make changes to user details:
                    </DialogContentText>
                    {/* Input fields for editing user details */}
                    <TextField
                        label="First Name"
                        value={editUserDetails.firstName || ""}
                        onChange={(e) => setEditUserDetails({...editUserDetails, firstName: e.target.value})}
                    /><br/>
                    <TextField
                        label="Last Name"
                        value={editUserDetails.lastName || ""}
                        onChange={(e) => setEditUserDetails({...editUserDetails, lastName: e.target.value})}
                    /><br/>
                    <TextField
                        label="Email"
                        value={editUserDetails.email || ""}
                        onChange={(e) => setEditUserDetails({...editUserDetails, email: e.target.value})}
                    /><br/>
                    <TextField
                        label="Password"
                        type="password"
                        value={editUserDetails.password || ""}
                        onChange={(e) => setEditUserDetails({...editUserDetails, password: e.target.value})}
                    /><br/>
                    <TextField
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    /><br/>
                </DialogContent>
                <DialogActions>
                    {/* Cancel and Save buttons for edit dialog */}
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditUser}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar component for displaying success message */}
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
