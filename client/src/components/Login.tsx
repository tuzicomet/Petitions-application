import React, { useState } from "react";
import axios from "axios"; // axios library for making HTTP requests
import { Link, useNavigate, useParams } from 'react-router-dom';

// Login functional component
const Login = () => {
    // Define state variables using useState hook, which are used to store and
    // manage data within React components
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
                    setError(error.response.data.message);
                } else { // if not, just set a generic error message
                    setError("An unknown error occurred");
                }
            });
    };

    return (
        <div>
            {/* login form */}
            <form
                onSubmit={(e) => { // Handle form submission
                    e.preventDefault(); // Prevent default form submission behavior
                    loginUser(); // Call loginUser function to handle login
                }}
            >
                {/* Email input field */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Update email state on input change
                />
                {/* Password input field */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                />
                {/* Submit button */}
                <button type="submit">Login</button>
            </form>

            {/* Display error message if error is true */}
            {error && <p>{error}</p>}
        </div>
    );
};

export default Login;