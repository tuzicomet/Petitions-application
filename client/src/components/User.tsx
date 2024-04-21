import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams} from 'react-router-dom';

const User = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [user, setUser] = React.useState<User>({email: "", userId: 0, firstName: "", lastName: "", password: ""})
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [editEmail, setEditEmail] = React.useState("");

    // when the component mounts (i.e. is first rendered), or when any of the
    // dependencies change (second parameter, see at the bottom. In this case, it's
    // just id), then this will run.
    React.useEffect(() => {
        const getUser = () => {
            axios.get('http://localhost:4941/api/users/'+id)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setUser(response.data)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getUser()
    }, [id])

    const deleteUser = (user: User) => {
        axios.delete('http://localhost:4941/api/users/' + user.userId)
            .then((response) => {
                navigate('/users')
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    // Function to edit user
    const editUser = () => {
        axios.put(`http://localhost:4941/api/users/${user.userId}`, { email: editEmail })
            .then((response) => {
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
                {user.userId}: {user.email}
                <Link to={"/users"}>Back to users</Link>


                <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#editUserModal">
                    Edit
                </button>


                <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#deleteUserModal">
                    Delete
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
                                        <label htmlFor="email">Email:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
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
                                        onClick={() => deleteUser(user)}>
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