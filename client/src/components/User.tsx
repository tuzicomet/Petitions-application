import axios from 'axios'; // Axios library for making HTTP requests
import React, { ChangeEvent } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom'; // React Router for navigation
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Snackbar, Alert } from "@mui/material"; // Material-UI components
import EditIcon from "@mui/icons-material/Edit";
import Navbar from "./Navbar";
import defaultImage from "../assets/default_picture.jpg";

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
    const [editUserDetails, setEditUserDetails] = React.useState<Partial<User>>({}); // Partial<User> to allow only some fields to be edited
    const [currentPassword, setCurrentPassword] = React.useState(""); // State variable for current password input
    const [errorFlag, setErrorFlag] = React.useState(false); // Flag for error status
    const [errorMessage, setErrorMessage] = React.useState(""); // Error message
    const [openEditDialog, setOpenEditDialog] = React.useState(false); // State for opening/closing edit dialog
    const [snackOpen, setSnackOpen] = React.useState(false); // Snackbar open state
    const [snackMessage, setSnackMessage] = React.useState(""); // Snackbar message
    const savedAuthToken = localStorage.getItem("savedAuthToken"); // Get the saved authToken from local storage
    // userImage should either accept string or null (if no image/unauthorized)
    const [userImage, setUserImage] = React.useState<string | null>(null); // State variable for user image URL

    const [authenticatedAsUser, setAuthenticatedAsUser] = React.useState(false); // boolean saying whether the client is authenticated as the user

    // reference to the hidden file input element
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Snackbar close handler
    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    React.useEffect(() => {
        getUser(); // Fetch user data
        getUserImage(); // Fetch user image
    }, [id]); // Dependency array with id to re-fetch data when id changes

    // Function to fetch user data
    const getUser = () => {
        // send a request to GET the user with the given id
        axios.get<User>(`http://localhost:4941/api/v1/users/${id}`, {
            headers: {
                // Include the savedAuthToken in the request header as X-Authorization
                'X-Authorization': savedAuthToken
            }
        })
            // if the request was successful
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setUser(response.data); // Set user data in state
                if (response.data.email) {
                    // email is only returned if the currently authenticated user is viewing their own details
                    // so if it is returned, set authenticatedAsUser to true
                    setAuthenticatedAsUser(true);
                }
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString()); // Set error message
            });
    };

    // retrieve the user's saved image (if it exists)
    const getUserImage = async () => { // Function to fetch user image
        try {
            // send a request to retrieve the user's image
            const response = await axios.get(`http://localhost:4941/api/v1/users/${id}/image`, {
                // treat the response as binary data
                responseType: 'arraybuffer',
                // send the saved authentication token in the header
                headers: {
                    'X-Authorization': savedAuthToken
                }
            });
            // Create blob object containing the image data, along with its MIME (content) type
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            // Create a URL for the blob object to use it as the image URL
            const imageUrl = URL.createObjectURL(blob);
            // Set the image URL in the state to display the image
            setUserImage(imageUrl);
        } catch (error) {
            // if user has no image, or user's image cannot be retrieved
            setUserImage(null);
        }
    };

    // Function to edit user details
    const editUser = () => {
        axios.patch(`http://localhost:4941/api/v1/users/${id}`, editUserDetails, {
            headers: {
                // Include the savedAuthToken in the request header as X-Authorization
                'X-Authorization': savedAuthToken
            }
        })
            .then(() => {
                setOpenEditDialog(false); // Close edit dialog
                setSnackMessage("User details updated successfully"); // Set success message for snackbar
                setSnackOpen(true); // Open snackbar
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString()); // Set error message
            });
    };

    // Function to handle image upload
    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) {
            // if no files were selected, then return early
            return;
        }

        // Get the first selected file
        const imageFile = event.target.files[0];

        // Resource used for turning the uploaded image into binary data
        // (which is what the image needs to be sent as to the server)
        // https://developer.mozilla.org/en-US/docs/Web/API/FileReader

        // Create a FileReader object to read the file content
        const fileReader = new FileReader();

        // Start reading the contents of the image file, with the result containing
        // an ArrayBuffer representing the file's data
        fileReader.readAsArrayBuffer(imageFile);

        // after file reading is complete
        fileReader.onload = () => {
            const fileData = fileReader.result as ArrayBuffer;
            // Send a PUT request to set the user's image,
            // with the raw binary data in the request body
            axios.put(`http://localhost:4941/api/v1/users/${id}/image`, fileData, {
                headers: {
                    'X-Authorization': savedAuthToken,
                    // Set the content type based on the type of the image file
                    'Content-Type': imageFile.type
                }
            })
                .then(() => {
                    // Refresh user image after successful upload
                    getUserImage();
                    // Display success message in Snackbar
                    setSnackMessage("Image uploaded successfully");
                    setSnackOpen(true);
                })
                .catch((error) => {
                    // Set error flag and message if upload fails
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        };

        // if there was an error reading the file
        fileReader.onerror = () => {
            // Set error flag and message
            setErrorFlag(true);
            setErrorMessage("Error reading the file.");
        };
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
            <img src={userImage || defaultImage}
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
                    {/* TODO: make a button on top of the curent image instead */}
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
                        onChange={handleImageUpload}
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
                    <Button onClick={editUser}>Save</Button>
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
