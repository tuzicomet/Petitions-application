import React from "react"; // Import React library
import axios from "axios"; // Import Axios for making HTTP requests
import { Delete, Edit } from "@mui/icons-material"; // Import icons for delete and edit actions
import { usePetitionStore } from "../store"; // Import custom hook from store
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
} from "@mui/material"; // Import Material-UI components
import CSS from 'csstype'; // Import CSSType for defining CSS properties

// Interface defining props for PetitionListObject component
interface IPetitionProps {
    petition: PetitionFull; // Petition object
}

/**
 * PetitionListObject component renders a single petition item.
 * It allows users to view, edit, and delete a petition.
 */
const PetitionListObject = (props: IPetitionProps) => {
    const [petition] = React.useState<PetitionFull>(props.petition);
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [categoryId, setCategoryId] = React.useState(-1);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const deletePetitionFromStore = usePetitionStore(state => state.removePetition);
    const editPetitionFromStore = usePetitionStore(state => state.editPetition);

    // Function to close delete dialog
    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };

    // Function to close edit dialog
    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
    };

    // Function to delete petition
    const deletePetition = () => {
        // send a http DELETE request to delete the petition
        axios.delete('http://localhost:4941/api/petitions/' + petition.petitionId)
            .then(() => {
                deletePetitionFromStore(petition); // Remove petition from store as well
            });
    };

    // Function to edit petition
    const editPetition = () => {
        axios.put(
            'http://localhost:4941/api/v1/petitions/' + petition.petitionId,
            { "title": title } // HTTP PUT request to edit petition title
        )
            .then(() => {
                editPetitionFromStore(petition, title, description, categoryId); // Edit petition in store
            });
    };

    return (
        <Card className="petition-card">
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
                    {petition.petitionId} {petition.title} {/* Render petition ID and title */}
                </Typography>
            </CardContent>
            <CardActions>
                {/* Button to open edit dialog */}
                <IconButton onClick={() => { setOpenEditDialog(true) }}>
                    <Edit /> {/* Edit icon */}
                </IconButton>
                {/* Button to open delete dialog */}
                <IconButton onClick={() => { setOpenDeleteDialog(true) }}>
                    <Delete /> {/* Delete icon */}
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default PetitionListObject;