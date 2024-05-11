import React, {useState} from "react";
import axios from "axios"; // axios library for making HTTP requests
import {useNavigate} from 'react-router-dom';
import {
    Button, Paper, TextField, Alert, AlertTitle
} from "@mui/material"; // Material-UI components for styling
import CSS from 'csstype';

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

    const navigate = useNavigate(); // navigation function for navigating to different pages

    // Function to register the user
    const registerUser = () => {
        // Make a post request to the register endpoint with the entered in values
        axios.post("http://localhost:4941/api/v1/users/register", {
            firstName,
            lastName,
            email,
            password,
        })
            // if register was successful
            .then((response) => {
                console.log("Registration successful:", response.data);
                // log in the user automatically after successful registration
                loginUser();
            })
            // if there was an error with the registration
            .catch((error) => {
                console.error("Registration failed:", error);
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

    // Function to log in the user, used for automatic login after registration
    // (TODO: Duplicate of the function in Login.tsx, can try importing instead)
    const loginUser = () => {
        // Make a post request to the login endpoint with the passed in user credentials
        axios.post("http://localhost:4941/api/v1/users/login", {
            email,
            password,
        })
            // if login was successful
            .then((response) => {
                console.log("Login successful:", response.data);
                // Save authentication token to browser storage so that user stays logged in
                localStorage.setItem("savedAuthToken", response.data.token);
                // Redirect after successful login
                navigate("/users/21"); // DEBUG: Redirect to user 21's page (should be changed)
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
            {/* Show error Alert if errorFlag is true */}
            {errorFlag &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            }

            {/* Petition table section */}
            <Paper elevation={3} style={card}>

                {/* Page Title */}
                <h1>Register</h1>

                {/* registration form */}
                <form
                    // handle form submission
                    onSubmit={(e) => {
                        e.preventDefault();
                        registerUser(); // Call registerUser function to handle registering the user
                    }}
                >
                    {/* Container for the form components */}
                    <div id="vertical-form-container">

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
                                type="password"
                                placeholder="..."
                                value={password}
                                // Update password state on input change
                                onChange={(e) => setPassword(e.target.value)}
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