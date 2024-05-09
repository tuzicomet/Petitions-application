import axios from 'axios'; // Axios library for making HTTP requests
import React from "react";
import { Link, useNavigate, useParams } from 'react-router-dom'; // React Router for navigation
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Snackbar, Alert } from "@mui/material"; // Material-UI components
import EditIcon from "@mui/icons-material/Edit";

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

    const handleSnackClose = () => { // Snackbar close handler
        setSnackOpen(false);
    };

    React.useEffect(() => { // Effect hook to fetch user data and image on component mount
        const getUser = () => { // Function to fetch user data
            axios.get<User>(`http://localhost:4941/api/v1/users/${id}`, {
                headers: {
                    // Include the savedAuthToken in the request header as X-Authorization
                    'X-Authorization': savedAuthToken
                }
            })
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setUser(response.data); // Set user data in state
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
                // TODO: if user has no image, must give a default image
                console.error("Error fetching user image:", error);
            }
        };

        getUser(); // Fetch user data
        getUserImage(); // Fetch user image
    }, [id]); // Dependency array with id to re-fetch data when id changes

    const editUser = () => { // Function to edit user details
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

    return (
        // JSX elements to display on the page
        <div>
            {/* Show error Alert if errorFlag is true */}
            {errorFlag &&
                <Alert severity="error">
                    {errorMessage}
                </Alert>
            }

            <h1>User</h1>

            {/* Display user's image if available */}
            {userImage && (
                <img
                    src={userImage}
                    alt="User Profile"
                    style={{ width: 100, height: 100, borderRadius: "10%" }}
                />
            )}

            <div>
                {/* Display user details */}
                <strong>First Name:</strong> {user.firstName}<br />
                <strong>Last Name:</strong> {user.lastName}<br />
                <strong>Email:</strong> {user.email}<br />
            </div>

            {/* Link to navigate back to the users list */}
            <Link to={"/users"}>Back to users</Link>

            {/* Button to open edit dialog */}
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setOpenEditDialog(true)}>
                Edit
            </Button>

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
