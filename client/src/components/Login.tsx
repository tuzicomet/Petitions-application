import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const loginUser = () => {
        axios.post("http://localhost:4941/api/v1/users/login", {
                email,
                password,
            })
            .then((response) => {
                console.log("Login successful:", response.data);
                // Handle successful login here, e.g., redirect
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
