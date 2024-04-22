import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loginUser = () => {
        axios.post("http://localhost:4941/api/v1/users/login", {
                email,
                password,
            })
            .then((response) => {
                // handle successful login
                console.log("Login successful:", response.data);
                // Save authentication token to browser storage
                localStorage.setItem("savedAuthToken", response.data.token);
                // DEBUG: redirect to the user 21's user page
                // (probably change to homepage or something? idk if user stories says anything)
                navigate("/users/21");
            })
            .catch((error) => {
                console.error("Login failed:", error);
                if (error.response && error.response.data) {
                    setError(error.response.data.message);
                } else {
                    setError("An unknown error occurred");
                }
            });
    };

    return (
        <div>
            {/* Your login form */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    loginUser();
                }}
            >
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {/* Display error message if there is one */}
            {error && <p>{error}</p>}
        </div>
    );
};

export default Login;
