import axios from 'axios'; // used for making HTTP requests
import React from "react";
import {Link} from 'react-router-dom';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Paper, TextField, TableContainer, Table, TableBody, TableHead,
    TableRow, TableCell, Stack, Alert, AlertTitle, Snackbar, IconButton,
    Chip, MenuItem, InputLabel, Select
} from "@mui/material"; // Material-UI components for styling
// import icons from MUI
import { Search, Filter, Sort } from "@mui/icons-material";
import CSS from 'csstype';
import Navbar from "./Navbar";
import defaultImage from "../assets/default_picture.jpg"; // default user image

import { getPetitions, getPetitionImage } from "../services/PetitionService";

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
 * This component fetches, displays, and creates petitions.
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
    const [sortQuery, setSortQuery] = React.useState(""); // rule to sort the petition list by

    const [snackOpen, setSnackOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("");

    // State variable to hold the petition rows in the petition list
    const [petitionRows, setPetitionRows] = React.useState<React.ReactNode[]>([]);


    // Function to close Snackbar
    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    // React.useEffect hook, runs whenever the page is rendered
    React.useEffect(() => {
        // get the petitions which match the current specifications,
        // using the getPetitions method from PetitionService
        getPetitions(
            searchQuery,
            selectedCategories,
            supportCostQuery,
            sortQuery,
            setPetitions,
            setErrorFlag,
            setErrorMessage);
    }, []);


    // React.useEffect hook, runs whenever the page is rendered
    React.useEffect(() => {
        // create the rows for the petition list
        const createPetitionRows = async () => {
            // store all rows in this variable, Promise.all is used to wait until all of them are finished
            const rows = await Promise.all(
                // Map through each petition in the petitions array, so we can make a TableRow for each
                petitions.map(async (petition: PetitionFull) => {
                    // get the petition image url, using the getPetitionImage
                    // method from PetitionService
                    const imageUrl = await getPetitionImage(
                        petition.petitionId,
                        setPetitionRows,
                        petitions
                    );
                    return (
                        // TableRow created for each petition, with the petition id as the key
                        <TableRow key={petition.petitionId} className="petition-row">

                            <TableCell>{petition.petitionId}</TableCell>

                            {/* Petition Hero Image */}
                            <TableCell>
                                {/* If the petition's imageUrl is present, display it */}
                                {/* (all petitions should have an image, but we can do this to be safe) */}
                                {imageUrl &&
                                    <img src={imageUrl} alt="Petition Image" />}
                            </TableCell>

                            {/* Petition title */}
                            <TableCell align="right">
                                {/* Clicking the title links the client to that petition's page */}
                                <Link to={`/petitions/${petition.petitionId}`}>
                                    {petition.title}
                                </Link>
                            </TableCell>

                            {/* Petition creation date */}
                            <TableCell align="right">
                                {/* TODO: parse timestamp to nz date*/}
                                {petition.creationDate}
                            </TableCell>

                            {/* Petition category */}
                            <TableCell align="right">
                                {/* TODO: make it show the actual category name */}
                                {petition.categoryId}
                            </TableCell>

                            {/* Petition owner name */}
                            <TableCell align="right">
                                {petition.ownerFirstName} {petition.ownerLastName}
                            </TableCell>

                        </TableRow>
                    );
                }));
            setPetitionRows(rows);
        };

        createPetitionRows();
    }, [petitions]);

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
        } else {
            // otherwise, un-select the category
            handleRemoveCategory(categoryId);
        }
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

    // Function to open the sort petition dialog
    const handleSortDialogOpen = () => {
        setOpenSortDialog(true);
    };

    // Function to close the sort petition dialog
    const handleSortDialogClose = () => {
        setOpenSortDialog(false);
    };

    // Function to add a new petition
    const addPetition = () => {
        axios.post('http://localhost:4941/api/v1/petitions', { title: newPetitionTitle })
            .then(() => {
                setNewPetitionTitle(""); // Reset the title field after submission
                getPetitions(
                    searchQuery,
                    selectedCategories,
                    supportCostQuery,
                    sortQuery,
                    setPetitions,
                    setErrorFlag,
                    setErrorMessage);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    return (
        <div>
            {/* Navigation Bar */}
            <Navbar />

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
                                getPetitions(
                                    searchQuery,
                                    selectedCategories,
                                    supportCostQuery,
                                    sortQuery,
                                    setPetitions,
                                    setErrorFlag,
                                    setErrorMessage); // perform the search
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
                    {/* Resource used: (Select prop section)
                     https://mui.com/material-ui/react-text-field/ */}
                    <div id="dropdown-container">
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
                                <MenuItem key={category.id}
                                          value={category.id}
                                          // if the category is already selected, then give it the selected-category
                                          // id, so it can be styled different to indicate that its already selected
                                          id={selectedCategories.includes(category.id) ? 'selected-category' : ''}
                                >
                                    {/* Display each option as "{id} - {name}" */}
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
                                getPetitions(
                                    searchQuery,
                                    selectedCategories,
                                    supportCostQuery,
                                    sortQuery,
                                    setPetitions,
                                    setErrorFlag,
                                    setErrorMessage); // refresh the list with the new filter
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
                    {/* Dropdown to select a sorting method */}
                    {/* Resource used: https://mui.com/material-ui/react-select/ (Basic select) */}
                    <InputLabel id="sort-label">Sort By</InputLabel>

                    {/*Dropdown to select a sorting method*/}
                    <div id="dropdown-container">
                        <Select
                            labelId="sort-label"
                            id="sort-select"
                            value={sortQuery}
                            // update sortQuery to whatever (value) is picked
                            onChange={(e) => setSortQuery(e.target.value)}
                            label="Sort By"
                        >
                            {/* Dropdown items, all available sorting methods */}
                            <MenuItem value="ALPHABETICAL_ASC">Alphabetical (A-Z)</MenuItem>
                            <MenuItem value="ALPHABETICAL_DESC">Alphabetical (Z-A)</MenuItem>
                            <MenuItem value="COST_ASC">Cost (Low to High)</MenuItem>
                            <MenuItem value="COST_DESC">Cost (High to Low)</MenuItem>
                            <MenuItem value="CREATED_ASC">Created (Oldest to Newest)</MenuItem>
                            <MenuItem value="CREATED_DESC">Created (Newest to Oldest)</MenuItem>
                        </Select>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSortDialogClose}>Cancel</Button>
                    {/* Sort Button */}
                    <Button variant="outlined" endIcon={<Sort />}
                            onClick={() => {
                                getPetitions(
                                    searchQuery,
                                    selectedCategories,
                                    supportCostQuery,
                                    sortQuery,
                                    setPetitions,
                                    setErrorFlag,
                                    setErrorMessage); // refresh the list with the new sorting
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
                            {/* Display the petition rows */}
                            {petitionRows}
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