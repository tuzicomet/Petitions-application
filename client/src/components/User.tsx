import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams} from 'react-router-dom';

const User = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    // Set the initial state, matching the User type
    const [user, setUser] = React.useState<User>({
        id: 0,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        imageFilename: "",
        authToken: ""
    });
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    React.useEffect(() => {
        const getUser = () => {
            axios.get<User>('http://localhost:4941/api/v1/users/' + id)
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setUser(response.data);
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        };
        getUser();
    }, [id]);

    if (errorFlag) {
        return (
            <div>
                <h1>User</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
                <Link to={"/users"}>Back to users</Link>
            </div>
        );
    } else {
        return (
            <div>
                <h1>User</h1>
                {/* Display user information */}
                <div>
                    <strong>ID:</strong> {user.id}<br />
                    <strong>Name:</strong> {user.firstName} {user.lastName}<br />
                    <strong>Email:</strong> {user.email}<br />
                    <strong>Password:</strong> {user.password}<br />
                    <strong>Image Filename:</strong> {user.imageFilename}<br />
                    <strong>Auth Token:</strong> {user.authToken}<br />
                </div>
                <Link to={"/users"}>Back to users</Link>
                <button type="button">Edit</button>
                <button type="button">Delete</button>
            </div>
        );
    }
};

export default User;