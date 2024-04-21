import axios from 'axios';
import React from "react";
import CSS from 'csstype';
import { Paper, AlertTitle, Alert } from "@mui/material";
import UserListObject from "./UserListObject";
import {useUserStore} from "../store";

const UserList = () => {
    // const [users, setUsers] = React.useState<Array<User>>([])
    // use the UserStore state from store/index.ts
    const users = useUserStore(state => state.users)
    const setUsers = useUserStore(state => state.setUsers)

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    React.useEffect(() => {
        const getUsers = () => {
            axios.get('http://localhost:4941/api/users')
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setUsers(response.data)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString() + " defaulting to old users changes app may not work as expected")
                })
        }
        getUsers()
    }, [setUsers])

    const user_rows = () => users.map((user: User) => <UserListObject key={ user.userId + user.email } user={user} />)
    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",
        width: "fit-content"
    }

    return (
        <Paper elevation={3} style={card} >
            <h1>UserList </h1>
            <div style={{ display: "inline-block", maxWidth: "965px", minWidth: "320" }}>
                {errorFlag?
                    <Alert severity = "error">
                        <AlertTitle> Error </AlertTitle>
                        { errorMessage }
                    </Alert>: ""}
                { user_rows() }
            </div>
        </Paper>
    )
}

export default UserList;
