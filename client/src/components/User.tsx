import React from "react";
import { useParams } from 'react-router-dom'; // React Router for navigation
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
    IconButton,
    Paper, Table, TableBody, TableRow, TableCell
} from "@mui/material"; // Material-UI components
import EditIcon from "@mui/icons-material/Edit";
import Navbar from "./Navbar";
import defaultImage from "../assets/default_picture.jpg";

import { getUser, getUserImage, editUser, changeUserImage } from "../services/UserService";
import {AddCircle, Edit} from "@mui/icons-material";
import PetitionList from "./PetitionList";
import {getPetitionsSupportedByUserId, getPetitionsWithOwnerId} from "../services/PetitionService";
import {datetimeToDDMMYYYY} from "../utils/Utils";

// User functional component
const User = () => {
    const { id } = useParams(); // Get route parameters
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
    const [ownedPetitions, setOwnedPetitions] = React.useState<Array<PetitionFull>>([]);
    const [supportedPetitions, setSupportedPetitions] = React.useState<Array<PetitionFull>>([]);
    const [changeMade, setChangeMade] = React.useState(false);

    // run whenever one of the dependencies changes
    React.useEffect(() => {
        // if the client is logged in as the user whose page they are viewing
        if (clientUserId === id) {
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

        // get the petitions which the user owns, and the petitions which they support
        const getRelatedPetitions = async () => {
            if (id !== undefined) {
                const ownedPetitions = await getPetitionsWithOwnerId(parseInt(id, 10));
                setOwnedPetitions(ownedPetitions);
                const supportedPetitions = await getPetitionsSupportedByUserId(parseInt(id, 10))
                setSupportedPetitions(supportedPetitions)
            }
        }
        getRelatedPetitions();

        // reset the changeMade variable
        setChangeMade(false);
    }, [id, clientUserId, savedAuthToken, changeMade]);

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
        )
            .then(() => {
                setChangeMade(true);
            })
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
                setChangeMade(true);
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

            <Paper elevation={1} className="user-profile-card">

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
                            alt="User Profile"
                            className="circle-img"
                        />
                    ) : (
                        // Otherwise, display the user's current image, if it exists, otherwise default image
                        <img src={userImage || defaultImage} alt="User Profile" className="circle-img"/>
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

                <div className="user-profile-details">
                    {/* Display user details */}
                    <div className="user-profile-name">
                        {user.firstName} {user.lastName}
                    </div>

                    {/* Only display the following fields if client is authenticated as user */}
                    {authenticatedAsUser && (
                        <>
                            <div className="user-profile-email">
                                {user.email}
                            </div>

                            {/* Button to edit user details (opens the Edit user dialog) */}
                            <Button variant="outlined" startIcon={<EditIcon/>}
                                    onClick={() => setOpenEditDialog(true)}>
                                Edit
                            </Button>
                        </>
                    )}

                </div>

            </Paper>

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

            {/* Only display if client is viewing their own user profile */}
            {authenticatedAsUser &&
                <Paper elevation={3} className="card">
                    {/* Owned Petitions table */}
                    <h3>Owned Petitions</h3>
                    <PetitionList petitions={ownedPetitions}/>

                    {/* Supported Petitions table */}
                    <h3>Supported Petitions</h3>
                    <PetitionList petitions={supportedPetitions}/>
                </Paper>
            }

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
