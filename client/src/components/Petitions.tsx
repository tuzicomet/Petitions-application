import axios from 'axios';
import React from "react";
import {Link} from 'react-router-dom';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TextField, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Stack, Alert, AlertTitle, Snackbar} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CSS from 'csstype';

const card: CSS.Properties = {
    padding: "10px",
    margin: "20px",
};

interface HeadCell {
    id: string;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    { id: 'ID', label: 'ID', numeric: true },
    { id: 'title', label: 'Title', numeric: false },
    { id: 'link', label: 'Link', numeric: false },
    { id: 'actions', label: 'Actions', numeric: false }
];

const Petitions = () => {
    const [petitions, setPetitions] = React.useState<Array<PetitionFull>>([]);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [newPetitionTitle, setNewPetitionTitle] = React.useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [dialogPetition, setDialogPetition] = React.useState<Partial<PetitionFull>>({
        title: "",
        categoryId: 0,
        description: "",
    });
    const [titleEdit, setTitleEdit] = React.useState("");
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("");

    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    // React.useEffect hook, here it simply fetches all petitions when the page loads
    React.useEffect(() => {
        getPetitions();
    }, []);

    const getPetitions = () => {
        axios.get('http://localhost:4941/api/v1/petitions')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setPetitions(response.data.petitions);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const petitionRows = () => {
        return petitions.map((petition: PetitionFull) => (
            <TableRow key={petition.petitionId}>
                <TableCell>{petition.petitionId}</TableCell>
                <TableCell align="right">{petition.title}</TableCell>
                <TableCell align="right">
                    <Link to={`/petitions/${petition.petitionId}`}>Go to petition</Link>
                </TableCell>
                <TableCell align="right">
                    <Button variant="outlined" endIcon={<EditIcon />} onClick={() => { handleEditDialogOpen(petition) }}>
                        Edit
                    </Button>
                    <Button variant="outlined" endIcon={<DeleteIcon />} onClick={() => { handleDeleteDialogOpen(petition) }}>
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
        ));
    };

    const addPetition = () => {
        axios.post('http://localhost:4941/api/v1/petitions', { title: newPetitionTitle })
            .then(() => {
                setNewPetitionTitle(""); // Reset the title field after submission
                getPetitions();
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const deletePetition = () => {
        axios.delete(`http://localhost:4941/api/v1/petitions/${dialogPetition.petitionId}`)
            .then(() => {
                getPetitions(); // Refresh petition list after deletion
                handleDeleteDialogClose();
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const handleDeleteDialogOpen = (petition: PetitionFull) => {
        setDialogPetition(petition);
        setOpenDeleteDialog(true);
    };

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };

    const editPetition = () => {
        axios.put(`http://localhost:4941/api/v1/petitions/${dialogPetition.petitionId}`, { title: titleEdit })
            .then(() => {
                getPetitions(); // Refresh petition list after edit
                handleEditDialogClose();
                setSnackMessage("Title changed successfully");
                setSnackOpen(true);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    const updateTitleEditState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleEdit(e.target.value);
    };

    const handleEditDialogOpen = (petition: PetitionFull) => {
        setTitleEdit(petition.title); // Set initial value for title edit
        setDialogPetition(petition); // Set the dialogPetition state with the correct petition object
        setOpenEditDialog(true);
    };

    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
    };

    return (
        <div>
            {/* Show error Alert if errorFlag is there */}
            {errorFlag &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            }

            {/* Petition table section */}
            <Paper elevation={3} style={card}>
                <h1>Petitions</h1>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        align={headCell.numeric ? 'right' : 'left'}
                                        padding={'normal'}
                                    >
                                        {headCell.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {petitionRows()}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add Petition section */}
            <Paper elevation={3} style={card}>
                <h1>Add a new petition</h1>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <TextField
                        id="outlined-basic"
                        label="Title"
                        variant="outlined"
                        value={newPetitionTitle}
                        onChange={(event) => setNewPetitionTitle(event.target.value)}
                    />
                    <Button variant="outlined" onClick={addPetition}>
                        Submit
                    </Button>
                </Stack>
            </Paper>

            {/* Delete Petition Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleDeleteDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Petition?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this petition?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                    <Button variant="outlined" color="error" onClick={deletePetition} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Petition Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={handleEditDialogClose}
                aria-labelledby="edit-dialog-title"
                aria-describedby="edit-dialog-description"
            >
                <DialogTitle id="edit-dialog-title">
                    {"Edit Petition"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        id="outlined-basic"
                        label="Title"
                        variant="outlined"
                        value={titleEdit}
                        onChange={updateTitleEditState}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose}>
                        Cancel
                    </Button>
                    <Button variant="outlined" color="primary" onClick={editPetition}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar component to wrap the error Alert in */}
            {/* This displays a pop-up message on screen informing the user of the error */}
            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}
            >
                <Alert onClose={handleSnackClose} severity="success" sx={{ width: '100%' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>

        </div>
    );
}

export default Petitions;