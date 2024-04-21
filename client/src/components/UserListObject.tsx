import React from "react";
import axios from "axios";
import { Delete, Edit } from "@mui/icons-material";
import { useUserStore } from "../store";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import CSS from 'csstype';

interface IUserProps {
    user: User
}

const UserListObject = (props: IUserProps) => {
    const [user] = React.useState<User>(props.user);
    const [email, setEmail] = React.useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const deleteUserFromStore = useUserStore(state => state.removeUser);
    const editUserFromStore = useUserStore(state => state.editUser);

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
    };

    const deleteUser = () => {
        axios.delete('http://localhost:4941/api/users/' + user.userId)
            .then(() => {
                deleteUserFromStore(user);
            });
    };

    const editUser = () => {
        axios.put('http://localhost:4941/api/users/' + user.userId, { "email": email })
            .then(() => {
                editUserFromStore(user, email);
            });
    };

    const userCardStyles: CSS.Properties = {
        display: "inline-block",
        height: "328px",
        width: "300px",
        margin: "10px",
        padding: "0px"
    };

    return (
        <Card sx={userCardStyles}>
            <CardMedia
                component="img"
                height="200"
                width="200"
                sx={{ objectFit: "cover" }}
                image="https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png"
                alt="Auction hero"
            />
            <CardContent>
                <Typography variant="h4">
                    {user.userId} {user.email}
                </Typography>
            </CardContent>
            <CardActions>
                <IconButton onClick={() => { setOpenEditDialog(true) }}>
                    <Edit />
                </IconButton>
                <IconButton onClick={() => { setOpenDeleteDialog(true) }}>
                    <Delete />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default UserListObject;
