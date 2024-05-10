import axios from 'axios'; // used for making HTTP requests
import React from "react";
import {Link} from 'react-router-dom';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Paper, TextField, TableContainer, Table, TableBody, TableHead,
    TableRow, TableCell, Stack, Alert, AlertTitle, Snackbar, IconButton
} from "@mui/material"; // Material-UI components for styling
// import icons from MUI
import { Delete, Edit, Search, Filter, Sort } from "@mui/icons-material";
import CSS from 'csstype';

// CSS properties for the card style
const card: CSS.Properties = {
    padding: "10px",
    margin: "20px",
};

// interface for table head cell
interface HeadCell {
    id: string;
    label: string;
    numeric: boolean;
}

// Define table head cells
// (the columns in the petitions list)
const headCells: readonly HeadCell[] = [
    { id: 'ID', label: 'ID', numeric: true },
    { id: 'title', label: 'Title', numeric: false },
    { id: 'link', label: 'Link', numeric: false },
    { id: 'actions', label: 'Actions', numeric: false }
];

/**
 * Petitions component for managing petitions.
 * This component fetches, displays, creates, edits, and deletes petitions.
 */
const Petitions = () => {
    // State variables
    const [petitions, setPetitions] = React.useState<Array<PetitionFull>>([]);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [newPetitionTitle, setNewPetitionTitle] = React.useState("");

    const [openSearchDialog, setOpenSearchDialog] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState(""); // query to search the petition list with

    const [openFilterDialog, setOpenFilterDialog] = React.useState(false);
    const [supportCostQuery, setSupportCostQuery] = React.useState(""); // queried support cost filter

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

    // Function to close Snackbar
    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    // React.useEffect hook, runs whenever the page is rendered
    React.useEffect(() => {
        getPetitions();
    }, []);

    // Function to fetch petitions from API
    const getPetitions = () => {
        // Initialize an object to hold the query parameters
        // (which are made up of string keys and string values)
        // Query parameters will be passed in only if they are given
        const queryParams: Record<string, string> = {};

        // Check if there's a search query
        // If there is no search query/the field is empty, do not add it
        if (searchQuery !== "") {
            queryParams['q'] = searchQuery; // Add the search query parameter
        }

        // If there is a maximum support cost filter query given
        if (supportCostQuery !== "") {
            // pass in the support cost query directly, it is parsed by backend
            queryParams['supportingCost'] = supportCostQuery;
        }

        axios.get('http://localhost:4941/api/v1/petitions', {
            // parameters to filter the petition list with
            params: queryParams
        })
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setPetitions(response.data.petitions);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    // Function to open the search petition dialog
    const handleSearchDialogOpen = () => {
        setOpenSearchDialog(true);
    };

    // Function to close the search petition dialog
    const handleSearchDialogClose = () => {
        setOpenSearchDialog(false);
    };

    // Function to update the search query state
    const updateSearchQueryState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Function to open the filter petition dialog
    const handleFilterDialogOpen = () => {
        setOpenFilterDialog(true);
    };

    // Function to close the filter petition dialog
    const handleFilterDialogClose = () => {
        setOpenFilterDialog(false);
    };

    // Function to update the support cost filter query state, based on the given input
    const updateSupportCostQueryState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSupportCostQuery(e.target.value);
    };

    // Function to render rows for petitions
    const petitionRows = () => {
        return petitions.map((petition: PetitionFull) => (
            <TableRow key={petition.petitionId}>
                <TableCell>{petition.petitionId}</TableCell>
                <TableCell align="right">{petition.title}</TableCell>
                <TableCell align="right">
                    <Link to={`/petitions/${petition.petitionId}`}>Go to petition</Link>
                </TableCell>
                <TableCell align="right">
                    <Button variant="outlined" endIcon={<Edit />} onClick={() => { handleEditDialogOpen(petition) }}>
                        Edit
                    </Button>
                    <Button variant="outlined" endIcon={<Delete />} onClick={() => { handleDeleteDialogOpen(petition) }}>
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
        ));
    };

    // Function to add a new petition
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

    // Function to delete a petition
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

    // Function to open delete petition dialog
    const handleDeleteDialogOpen = (petition: PetitionFull) => {
        setDialogPetition(petition); // Set the dialogPetition state with the correct petition object
        setOpenDeleteDialog(true);
    };

    // Function to close delete petition dialog
    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };

    // Function to edit a petition
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

    // Function to update title edit state
    const updateTitleEditState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleEdit(e.target.value);
    };

    // Function to open edit petition dialog
    const handleEditDialogOpen = (petition: PetitionFull) => {
        setTitleEdit(petition.title); // Set initial value for title edit
        setDialogPetition(petition); // Set the dialogPetition state with the correct petition object
        setOpenEditDialog(true);
    };

    // Function to close edit petition dialog
    const handleEditDialogClose = () => {
        setOpenEditDialog(false);
    };

    return (
        <div>
            {/* Show error Alert if errorFlag is true */}
            {errorFlag &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            }

            {/* Search Petition Dialog */}
            <Dialog
                open={openSearchDialog}
                onClose={handleSearchDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Search Petitions"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        id="outlined-basic"
                        label="Search query"
                        variant="outlined"
                        value={searchQuery}
                        onChange={updateSearchQueryState}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSearchDialogClose}>Cancel</Button>
                    {/* Search Button */}
                    <Button variant="outlined" endIcon={<Search />}
                            onClick={() => {
                                getPetitions(); // perform the search
                                handleSearchDialogClose(); // close the search dialog
                            }} autoFocus>
                        Search
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Filter Petition Dialog */}
            <Dialog
                open={openFilterDialog}
                onClose={handleFilterDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Filter Petitions"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        id="outlined-basic"
                        label="Maximum Support Cost"
                        variant="outlined"
                        value={supportCostQuery}
                        onChange={updateSupportCostQueryState}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleFilterDialogClose}>Cancel</Button>
                    {/* Search Button */}
                    <Button variant="outlined" endIcon={<Filter />}
                            onClick={() => {
                                getPetitions(); // perform the search
                                handleFilterDialogClose(); // close the filter dialog
                            }} autoFocus>
                        Filter
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Petition table section */}
            <Paper elevation={3} style={card}>

                {/* Title */}
                <h1>Petitions</h1>

                {/* Search button which opens the search dialog */}
                <Button variant="outlined" endIcon={<Search />}
                        onClick={handleSearchDialogOpen}>
                    Search
                </Button>

                {/* Filter button which opens the filter dialog */}
                <Button variant="outlined" endIcon={<Filter />}
                        onClick={handleFilterDialogOpen}>
                    Filter
                </Button>

                {/* Petition table */}
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