import axios from 'axios';
import React from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';

const User = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = React.useState<User>({
        id: 0,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        imageFilename: "",
        authToken: ""
    });
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [editUsername, setEditUsername] = React.useState("");

    React.useEffect(() => {
        const getUser = () => {
            axios.get<User>(`http://localhost:4941/api/v1/users/${id}`)
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

    const deleteUser = () => {
        axios.delete(`http://localhost:4941/api/v1/users/${id}`)
            .then(() => {
                navigate('/users');
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const editUser = () => {
        axios.patch(`http://localhost:4941/api/v1/users/${id}`, { username: editUsername })
            .then(() => {
                navigate('/users');
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    if (errorFlag) {
        return (
            <div>
                <h1>User</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
                <Link to={"/users"}>Back to users</Link>
            </div>
        )
    } else {
        return (
            <div>
                <h1>User</h1>
                <div>
                    <strong>ID:</strong> {user.id}<br />
                    <strong>Name:</strong> {user.firstName} {user.lastName}<br />
                    <strong>Email:</strong> {user.email}<br />
                    <strong>Password:</strong> {user.password}<br />
                    <strong>Image Filename:</strong> {user.imageFilename}<br />
                    <strong>Auth Token:</strong> {user.authToken}<br />
                </div>
                <Link to={"/users"}>Back to users</Link>

                {/* Edit User Modal */}
                <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#editUserModal">
                    Edit
                </button>
                <div className="modal fade" id="editUserModal" tabIndex={-1} role="dialog"
                     aria-labelledby="editUserModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="editUserModalLabel">Edit User</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={editUser}>
                                    <div className="form-group">
                                        <label htmlFor="editUsername">Username:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editUsername"
                                            value={editUsername}
                                            onChange={(e) => setEditUsername(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete User Modal */}
                <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#deleteUserModal">
                    Delete
                </button>
                <div className="modal fade" id="deleteUserModal" tabIndex={-1} role="dialog"
                     aria-labelledby="deleteUserModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="deleteUserModalLabel">Delete User</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                Are you sure that you want to delete this user?
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">
                                    Close
                                </button>
                                <button type="button" className="btn btn-primary" data-dismiss="modal"
                                        onClick={deleteUser}>
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

export default User;