import React, { useState } from "react";
import axios from "axios"; // axios library for making HTTP requests
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Paper, TextField, TableContainer, Table, TableBody, TableHead,
    TableRow, TableCell, Stack, Alert, AlertTitle, Snackbar, IconButton,
    Chip, MenuItem, InputLabel, Select
} from "@mui/material"; // Material-UI components for styling
import CSS from 'csstype';
import {Search} from "@mui/icons-material";

// CSS properties for the card style
// TODO: can these be moved out?
const card: CSS.Properties = {
    padding: "10px",
    margin: "20px",
};

// Login functional component
const Login = () => {
    // Define state variables using useState hook, which are used to store and
    // manage data within React components
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const [email, setEmail] = useState(""); //email input
    const [password, setPassword] = useState(""); // password input
    const [error, setError] = useState<string | null>(null); // error messages
    const navigate = useNavigate(); // navigation function for navigating to different pages

    // Function to log in the user
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
                // Redirect to the user's page after successful login
                navigate("/users/21"); // DEBUG: Redirect to user 21's page (should be changed)
            })
            // if there was an error with the login
            .catch((error) => {
                console.error("Login failed:", error);
                // if the response had an error message
                if (error.response && error.response.data) {
                    //setError(error.response.data.message);
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                } else { // if not, just set a generic error message
                    //setError("An unknown error occurred");
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
                <h1>Login</h1>

                {/* login form */}
                <form
                    // handle form submission
                    onSubmit={(e) => {
                        e.preventDefault();
                        loginUser(); // Call loginUser function to handle login
                    }}
                >
                    {/* Email input field */}
                    <div id="email-input-field">
                        <TextField
                            label="Email"
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
                        />
                    </div>

                    {/* Password input field */}
                    <div id="password-input-field">
                        <TextField
                            label="Password"
                            type="password"
                            placeholder="..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                        />
                    </div>

                    {/* Submit button */}
                    <div id="submit-button">
                        <Button variant="outlined" type="submit">
                            Login
                        </Button>
                    </div>
                </form>

            </Paper>

        </div>
    );
};

export default Login;