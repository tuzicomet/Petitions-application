import React from "react";
import { Link } from "react-router-dom";
import {Button} from "@mui/material";

// Navigation bar component
// to be added to the top of each page
const Navbar = () => {
    return (
        <nav>
            <div id="navigation-bar">
                <Button>
                    <Link to="/">Home</Link>
                </Button>
                <Button>
                    <Link to="/petitions">Petitions</Link>
                </Button>
                <Button>
                    <Link to="/profile">Profile</Link>
                </Button>
                <Button>
                    <Link to="/register">Register</Link>
                </Button>
                <Button>
                    <Link to="/login">Login</Link>
                </Button>
                <Button>
                    <Link to="/logout">Logout</Link>
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;