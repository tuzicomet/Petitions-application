import React from "react";
import { Link } from "react-router-dom";
import {Button} from "@mui/material";

// Navigation bar component
// to be added to the top of each page
const Navbar = () => {
    // boolean saying whether the client is logged in
    const [clientIsLoggedIn, setClientIsLoggedIn] = React.useState(false);

    React.useEffect(() => {
        const checkIfUserIsLoggedIn = () => {
            const authToken = localStorage.getItem("savedAuthToken");
            if (authToken) {
                // If an auth token is found, the user is logged in
                setClientIsLoggedIn(true);
            } else {
                // Otherwise, user is not logged in
                setClientIsLoggedIn(false);
            }
        }

        checkIfUserIsLoggedIn();
    })

    return (
        <nav>
            <div id="navigation-bar">
                <Button>
                    <Link to="/">Home</Link>
                </Button>
                <Button>
                    <Link to="/petitions">Petitions</Link>
                </Button>

                {/* Only show if client is logged in */}
                {clientIsLoggedIn && (
                    <Button>
                        <Link to="/profile">Profile</Link>
                    </Button>
                )}

                {/* Only show if client is not logged in */}
                {!clientIsLoggedIn && (
                    <>
                        <Button>
                            <Link to="/register">Register</Link>
                        </Button>
                        <Button>
                            <Link to="/login">Login</Link>
                        </Button>
                    </>
                )}

                {/* Only show if client is logged in */}
                {clientIsLoggedIn && (
                    <Button>
                        <Link to="/logout">Logout</Link>
                    </Button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;