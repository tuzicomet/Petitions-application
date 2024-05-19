import axios from 'axios'; // Axios library for making HTTP requests
import React, { ChangeEvent } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom'; // React Router for navigation
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Snackbar,
    Alert,
    IconButton
} from "@mui/material"; // Material-UI components
import EditIcon from "@mui/icons-material/Edit";
import Navbar from "./Navbar";
import defaultImage from "../assets/default_picture.jpg";

import { getUser, getUserImage, editUser, changeUserImage } from "../services/UserService";
import {AddCircle} from "@mui/icons-material";

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
    const [userImage, setUserImage] = React.useState<string | null>(null); // url to the user's image file
    const [editUserDetails, setEditUserDetails] = React.useState<Partial<User>>({}); // Partial<User> to allow only some fields to be edited
    const [currentPassword, setCurrentPassword] = React.useState(""); // State variable for current password input
    const [errorFlag, setErrorFlag] = React.useState(false); // Flag for error status
    const [errorMessage, setErrorMessage] = React.useState(""); // Error message
    const [openEditDialog, setOpenEditDialog] = React.useState(false); // State for opening/closing edit dialog
    const [snackOpen, setSnackOpen] = React.useState(false); // Snackbar open state
    const [snackMessage, setSnackMessage] = React.useState(""); // Snackbar message
    const savedAuthToken = localStorage.getItem("savedAuthToken"); // Get the saved authToken from local storage
    const clientUserId = localStorage.getItem("clientUserId"); // get the client's user id from local storage
    const [authenticatedAsUser, setAuthenticatedAsUser] = React.useState(false); // boolean saying whether the client is authenticated as the user
    // allowed MIME types for uploaded images
    const supportedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    // reference to the hidden file input element
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    // State variable for the uploaded petition image file
    const [uploadedImage, setUploadedImage] = React.useState<File | null>(null);

    // run whenever id changes
    React.useEffect(() => {
        // if the client is logged in as the user whose page they are viewing
        if (clientUserId == id) {
            setAuthenticatedAsUser(true);
        }
        getUser(id, savedAuthToken, setUser, setErrorFlag, setErrorMessage);
        // get the user's profile image
        const getProfileImage = async () => {
            // use the getUserImage method from UserService to get the user's profile photo
            const userImage = await getUserImage(id);
            // set the image to the imageUrl variable
            setUserImage(userImage);
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
    const handleChangeUserImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            // the uploaded file must be an accepted type (png, jpeg, gif)
            if (supportedTypes.includes(event.target.files[0].type)) {
                // Change the petition's image with the uploaded image
                await changeUserImage(event.target.files[0], id, savedAuthToken,
                    setErrorFlag, setErrorMessage, setSnackMessage, setSnackOpen)

                // re-fetch the user's image so the new image will be displayed
                const fetchUserImageUrl = async () => {
                    // get the petition's hero image using getUserImage from UserService
                    const userImageUrl = await getUserImage(id);
                    // set the image url to the userImage state variable
                    setUserImage(userImageUrl);
                }
                await fetchUserImageUrl();
            } else {
                setErrorFlag(true);
                setErrorMessage("Uploaded images must be of MIME type: image/png, image/jpeg, or image/gif")
            }
        }
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

            {/* Container holding the user image and the icon to edit it */}
            <div className="image-container">
                {/* Resource used: https://medium.com/web-dev-survey-from-kyoto/how-to-customize-the-file-upload-button-in-react-b3866a5973d8 */}

                {/* Button to change user image, only show if logged in as the user */}
                {authenticatedAsUser &&
                    <div className="add-image-icon-container">
                        <IconButton aria-label="add"
                                    onClick={() => fileInputRef.current?.click()}>
                            <AddCircle className="add-image-icon"/>
                        </IconButton>
                    </div>
                }

                {/* Display user image */}
                {uploadedImage ? (
                    // If the user has uploaded an image (petitionImage exists)
                    <img
                        // create a URL from the uploaded petitionImage to display
                        src={URL.createObjectURL(uploadedImage)}
                        alt="Petition Preview"
                        className="circle-img"
                    />
                ) : (
                    // Otherwise, display the user's current image, if it exists, otherwise default image
                    <img src={userImage || defaultImage} alt="User Profile Picture" className="circle-img"/>
                )}

                {/* Hidden user image upload input */}
                <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef} // variable which references this element
                    style={{display: 'none'}} // Hide the input
                    onChange={handleChangeUserImage}
                />
            </div>

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

            {/* Only display if the client is authenticated as user */}
            {authenticatedAsUser && (
                <>
                    {/* Button to edit user details (opens the Edit user dialog) */}
                    <Button variant="outlined" startIcon={<EditIcon/>} onClick={() => setOpenEditDialog(true)}>
                        Edit
                    </Button>
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
