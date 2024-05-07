import React from "react";
import axios from "axios";
import { Delete, Edit } from "@mui/icons-material";
import { usePetitionStore } from "../store";
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

interface IPetitionProps {
    petition: PetitionFull
}

const PetitionListObject = (props: IPetitionProps) => {
    const [petition] = React.useState<PetitionFull>(props.petition);
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [categoryId, setCategoryId] = React.useState(-1);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const deletePetitionFromStore = usePetitionStore(state => state.removePetition);
    const editPetitionFromStore = usePetitionStore(state => state.editPetition);

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
    };

    const deletePetition = () => {
        axios.delete('http://localhost:3000/api/petitions/' + petition.petitionId)
            .then(() => {
                deletePetitionFromStore(petition);
            });
    };

    const editPetition = () => {
        axios.put(
            'http://localhost:4941/api/v1/petitions/' + petition.petitionId,
            { "title": title }
        )
            .then(() => {
                editPetitionFromStore(petition, title, description, categoryId);
            });
    };

    const petitionCardStyles: CSS.Properties = {
        display: "inline-block",
        height: "328px",
        width: "300px",
        margin: "10px",
        padding: "0px"
    };

    return (
        <Card sx={petitionCardStyles}>
            <CardMedia
                component="img"
                height="200"
                width="200"
                sx={{ objectFit: "cover" }}
                image="https://png.pngitem.com/pimgs/s/150-1503945_transparent-petition-png-default-petition-image-png-png.png"
                alt="Auction hero"
            />
            <CardContent>
                <Typography variant="h4">
                    {petition.petitionId} {petition.title}
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

export default PetitionListObject;
