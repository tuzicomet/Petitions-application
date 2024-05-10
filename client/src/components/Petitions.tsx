import axios from 'axios'; // used for making HTTP requests
import React from "react";
import {Link} from 'react-router-dom';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Paper, TextField, TableContainer, Table, TableBody, TableHead,
    TableRow, TableCell, Stack, Alert, AlertTitle, Snackbar, IconButton,
    Chip, MenuItem
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

// Available petition categories
const categories = [
    { id: 1, name: "Wildlife" },
    { id: 2, name: "Environmental Causes" },
    { id: 3, name: "Animal Rights" },
    { id: 4, name: "Health and Wellness" },
    { id: 5, name: "Education" },
    { id: 6, name: "Human Rights" },
    { id: 7, name: "Technology and Innovation" },
    { id: 8, name: "Arts and Culture" },
    { id: 9, name: "Community Development" },
    { id: 10, name: "Economic Empowerment" },
    { id: 11, name: "Science and Research" },
    { id: 12, name: "Sports and Recreation" }
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
    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]); // categories to filter petitions by
    const [supportCostQuery, setSupportCostQuery] = React.useState(""); // queried support cost filter

    const [openSortDialog, setOpenSortDialog] = React.useState(false);

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
        // Query parameters will be passed in only if they are given
        const queryParams: Record<string, string | number[]> = {};

        // Check if there's a search query
        // If there is no search query/the field is empty, do not add it
        if (searchQuery !== "") {
            queryParams['q'] = searchQuery; // Add the search query parameter
        }

        // check if there are any categories selected
        if (selectedCategories.length !== 0) {
            // if so, pass in the array of selected category ids as parameters
            queryParams['categoryIds'] = selectedCategories;
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

    // Function to handle when a category id is selected from the dropdown
    const handleCategorySelection = (categoryId: number) => {
        // if the category (given by id) is not already selected
        if (!selectedCategories.includes(categoryId)) {
            // Add the category id to the list of selected categories
            // (the ... makes a copy of the array that we can add to)
            // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    // Function to open the sort petition dialog
    const handleSortDialogOpen = () => {
        setOpenSortDialog(true);
    };

    // Function to close the sort petition dialog
    const handleSortDialogClose = () => {
        setOpenSortDialog(false);
    };

    // function to handle removing a category id from the category id list
    const handleRemoveCategory = (categoryId: number) => {
        // Copies over all ids in selectedCategories, except for the given category id
        // if found, which is ignored.
        const updatedCategories = selectedCategories.filter(
            (id) => id !== categoryId);
        // update the selectedCategories state variable
        setSelectedCategories(updatedCategories);
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
                    {/* Dropdown to select categories */}
                    {/* Resource used:
                     https://mui.com/material-ui/react-text-field/
                     (Select prop section)*/}
                    {/* Could be updated to use https://mui.com/material-ui/react-select/
                     Multiple select, Chip in the future? */}
                    <div id="category-filter-dropdown">
                        <TextField
                            select
                            label="Select Category"
                            value=""
                            onChange={(e) => handleCategorySelection(Number(e.target.value))}
                            variant="outlined"
                        >
                            <MenuItem value="" disabled>
                                Select Category
                            </MenuItem>

                            {/* Display each category in the dropdown */}
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {/* Display as "{id} - {name}" */}
                                    {`${category.id} - ${category.name}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    {/* Container containing the chips for all of the selected
                    categories (the tags showing which have been selected) */}
                    {/* Resource used for creating deletable chips:
                    https://mui.com/material-ui/react-chip/*/}
                    <div id="category-chip-container">
                        {selectedCategories.map((categoryId) => (
                            <Chip
                                key={categoryId}
                                // label the chip with the category's name
                                label={categories.find((category) => category.id === categoryId)?.name || ""}
                                onDelete={() => handleRemoveCategory(categoryId)}
                                style={{ margin: "5px" }}
                            />
                        ))}
                    </div>

                    {/* Maximum support cost input field*/}
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
                    {/* Filter Button */}
                    <Button variant="outlined" endIcon={<Filter/>}
                            onClick={() => {
                                getPetitions(); // refresh the list with the new filter
                                handleFilterDialogClose(); // close the filter dialog
                            }} autoFocus>
                        Filter
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Sort Petition Dialog */}
            <Dialog
                open={openSortDialog}
                onClose={handleSortDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Sort Petitions"}
                </DialogTitle>
                <DialogContent>
                    {/* TODO */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSortDialogClose}>Cancel</Button>
                    {/* Sort Button */}
                    <Button variant="outlined" endIcon={<Sort />}
                            onClick={() => {
                                getPetitions(); // refresh the list with the new sorting
                                handleSortDialogClose(); // close the sort dialog
                            }} autoFocus>
                        Sort
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

                {/* Sort button which opens the sort dialog */}
                <Button variant="outlined" endIcon={<Sort />}
                        onClick={handleSortDialogOpen}>
                    Sort
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