import React, {useState} from "react";
import axios from "axios"; // axios library for making HTTP requests
import {useNavigate} from 'react-router-dom';
import {
    Button, Paper, TextField, Alert, AlertTitle, InputAdornment, IconButton
} from "@mui/material"; // Material-UI components for styling
// icons for the password visibility toggle button
import {AddCircle, Visibility, VisibilityOff} from "@mui/icons-material";
import CSS from 'csstype';
import Navbar from "./Navbar";
import defaultImage from "../assets/default_picture.jpg";
import {uploadUserImage} from "../services/UserService";

// CSS properties for the card style
const card: CSS.Properties = {
    padding: "10px",
    margin: "20px",
};

// Register functional component
const Register = () => {
    // Define state variables using useState hook, which are used to store and
    // manage data within React components
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const [firstName, setFirstName] = useState(""); // first name input
    const [lastName, setLastName] = useState(""); // last name input
    const [email, setEmail] = useState(""); // email input
    const [password, setPassword] = useState(""); // password input
    const [showPassword, setShowPassword] = useState(false); // bool for whether to show the password text
    const [uploadedUserImage, setUploadedUserImage] = React.useState<File | null>(null); // State variable for user image file
    const supportedTypes = ['image/png', 'image/jpeg', 'image/gif']; // allowed MIME types for uploaded images
    // reference to the hidden file input element
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const navigate = useNavigate(); // navigation function for navigating to different pages

    // Function to toggle showing/hiding the password
    const togglePasswordVisibility = () => {
        // change the showPassword boolean to its opposite value
        setShowPassword(!showPassword);
    };

    // Function to handle change in user image input
    const handleChangeUserImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            // the uploaded file must be an accepted type (png, jpeg, gif)
            if (supportedTypes.includes(event.target.files[0].type)) {
                setUploadedUserImage(event.target.files[0]); // Set the selected image file
            } else {
                setErrorFlag(true);
                setErrorMessage("Uploaded images must be of MIME type: image/png, image/jpeg, or image/gif")
            }
        }
    };

    // Function to handle form submission
    const handleSubmit = async () => {
        // Call createPetition function to handle creating the petition
        await registerUser()
            .then(async (userId) => {
                // automatically log the user in
                await loginUser();

                // Get the saved authToken from local storage
                const savedAuthToken = localStorage.getItem("savedAuthToken");

                // If the user uploaded an image in the register form
                if (uploadedUserImage !== null) {
                    // Change the petition's image with the uploaded image
                    await uploadUserImage(uploadedUserImage, userId, savedAuthToken, setErrorFlag, setErrorMessage)
                }

                // Redirect after success
                navigate(`/users/${userId}`);
            })
    };

    // Function to register the user
    const registerUser = async () => {
        try {
            // Make a post request to the register endpoint with the entered in values
            const response = await axios.post(
                "http://localhost:4941/api/v1/users/register", {
                firstName,
                lastName,
                email,
                password,
            });
            // If registration was successful, return the userId
            return response.data.userId;
        } catch (error) {
            console.error("Registration failed:", error);
            // Return null if there was an error with the registration
            return null;
        }
    };

    // Function to log in the user, used for automatic login after registration
    // (TODO: Duplicate of the function in Login.tsx, can try importing instead)
    const loginUser = async () => {
        // Make a post request to the login endpoint with the passed in user credentials
        await axios.post("http://localhost:4941/api/v1/users/login", {
            email,
            password,
        })
            // if login was successful
            .then((response) => {
                console.log("Login successful:", response.data);
                // Save authentication token to browser storage so that user stays logged in
                localStorage.setItem("savedAuthToken", response.data.token);
                // Save the id of the user which the client is logged in as
                localStorage.setItem("clientUserId", response.data.userId);
            })
            // if there was an error with the login
            .catch((error) => {
                console.error("Login failed:", error);
                // if the response had an error message
                if (error.response && error.response.data) {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                } else { // if not, just set a generic error message
                    setErrorFlag(true);
                    setErrorMessage(error.toString());

                }
            });
    };

    return (
        <div>
            {/* Navigation Bar */}
            <Navbar />

            {/* Show error Alert if errorFlag is true */}
            {errorFlag &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            }

            {/* User table section */}
            <Paper elevation={3} style={card}>

                {/* Page Title */}
                <h1>Register</h1>

                {/* registration form */}
                <form
                    // handle form submission
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(); // Call handleSubmit on submission
                    }}
                >
                    {/* Container for the form components */}
                    <div className="vertical-form-container">

                        {/* Container holding the user image and the icon to edit it */}
                        <div className="image-container">
                            {/* Resource used: https://medium.com/web-dev-survey-from-kyoto/how-to-customize-the-file-upload-button-in-react-b3866a5973d8 */}
                            {/* Button to change user image */}
                            <div className="add-image-icon-container">
                                <IconButton aria-label="add"
                                            onClick={() => fileInputRef.current?.click()}>
                                    <AddCircle className="add-image-icon" />
                                </IconButton>
                            </div>
                            {/* Preview of user image */}
                            {uploadedUserImage ? (
                                // If the user has uploaded an image (userImage exists)
                                <img
                                    // create a URL from the uploaded userImage to display
                                    src={URL.createObjectURL(uploadedUserImage)}
                                    alt="User Preview"
                                    className="circle-img"
                                />
                            ) : (
                                // Otherwise, display a default image
                                <img
                                    src={defaultImage}
                                    alt="Default"
                                    className="circle-img"
                                />
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

                        {/* First Name input field */}
                        <div id="first-name-input-field">
                            <TextField
                                label="First Name"
                                placeholder="..."
                                value={firstName}
                                // Update firstName state on input change
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        {/* Last Name input field */}
                        <div id="last-name-input-field">
                            <TextField
                                label="Last Name"
                                placeholder="..."
                                value={lastName}
                                // Update lastName state on input change
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        {/* Email input field */}
                        <div id="email-input-field">
                            <TextField
                                label="Email"
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                // Update email state on input change
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password input field */}
                        <div id="password-input-field">
                            <TextField
                                label="Password"
                                // if showPassword is true, type=text (password text is shown)
                                // otherwise if false, type=password (password text is hidden)
                                type={showPassword ? "text" : "password"}
                                placeholder="..."
                                value={password}
                                // Update password state on input change
                                onChange={(e) => setPassword(e.target.value)}
                                // icon which toggles password visibility, using MUI input adornment
                                // (see https://mui.com/material-ui/react-text-field/)
                                // example in the resource has been adapted to an input prop, so it can be
                                // used with TextField (I was having problems labelling it as OutlinedInput)
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={togglePasswordVisibility}
                                                edge="end"
                                            >
                                                {/* the icon shown changes based on showPassword */}
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </div>

                        {/* Submit registration form button */}
                        <div id="submit-button">
                            <Button variant="outlined" type="submit">
                                Register
                            </Button>
                        </div>
                    </div>
                </form>

            </Paper>

        </div>
    );
};

export default Register;