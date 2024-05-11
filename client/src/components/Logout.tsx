import { useNavigate } from 'react-router-dom';
import React from "react";

// Logout functional component
const Logout = () => {
    const navigate = useNavigate();

    // Handle logging out the user, and redirecting
    const handleLogout = () => {
        // remove the auth token from local storage
        localStorage.removeItem("savedAuthToken");
        // redirect the user to another page
        navigate("/");
    };

    // when this component is displayed
    React.useEffect(() => {
        // call the method to logout the user
        handleLogout();
    }, []);

    // function does not render anything
    return null;
};

export default Logout;