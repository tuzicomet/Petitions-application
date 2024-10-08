import React from "react";
import {Link} from 'react-router-dom';
import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Paper, TextField, Alert, AlertTitle, Snackbar,
    Chip, MenuItem, InputLabel, Select
} from "@mui/material"; // Material-UI components for styling
// import icons from MUI
import { Search, Filter, Sort } from "@mui/icons-material";
import Navbar from "./Navbar";
import defaultImage from "../assets/default_picture.jpg"; // default user image
import { getPetitions, getPetitionImage, getNumberOfPetitions, getPetitionSupportCost } from "../services/PetitionService";
import PetitionList from './PetitionList';

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

    const [openSearchDialog, setOpenSearchDialog] = React.useState(false);
    // query to search the petition list with
    const [searchQuery, setSearchQuery] = React.useState("");
    // temporary query to store as the user is still modifying their query
    // (NOTE: these temporary queries are to make sure that queries only apply if the user confirms them)
    const [tempSearchQuery, setTempSearchQuery] = React.useState("");

    const [openFilterDialog, setOpenFilterDialog] = React.useState(false);
    const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]); // categories to filter petitions by
    const [tempSelectedCategories, setTempSelectedCategories] = React.useState<number[]>([]);
    const [supportCostQuery, setSupportCostQuery] = React.useState(""); // queried support cost filter
    const [tempSupportCostQuery, setTempSupportCostQuery] = React.useState("");

    const [openSortDialog, setOpenSortDialog] = React.useState(false);
    const [sortQuery, setSortQuery] = React.useState(""); // rule to sort the petition list by
    const [tempSortQuery, setTempSortQuery] = React.useState("");

    // State variables for pagination
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10); // number of petitions per page
    const [totalPetitions, setTotalPetitions] = React.useState(0); // number of petitions

    const [snackOpen, setSnackOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("");

    const savedAuthToken = localStorage.getItem("savedAuthToken"); // Get the saved authToken from local storage

    // Function to handle pagination
    const handlePagination = (action: string) => {
        switch (action) {
            case 'next':
                setCurrentPage((prevPage) => prevPage + 1);
                break;
            case 'prev':
                setCurrentPage((prevPage) => prevPage - 1);
                break;
            case 'first':
                setCurrentPage(1);
                break;
            case 'last':
                setCurrentPage(Math.ceil(totalPetitions / pageSize));
                break;
            default:
                break;
        }
    };

    // Function to get petitions, using pagination
    const getPetitionsWithPagination = () => {
        const startIndex = (currentPage - 1) * pageSize;
        // Call getNumberOfPetitions to get he total number of petitions
        getNumberOfPetitions(
            searchQuery,
            selectedCategories,
            supportCostQuery,
            sortQuery
        ).then(totalCount => {
            // set the result to the totalPetitions variable
            setTotalPetitions(totalCount);
        });
        // get petitions with pagination
        getPetitions(
            searchQuery,
            selectedCategories,
            supportCostQuery,
            sortQuery,
            setPetitions,
            setErrorFlag,
            setErrorMessage,
            pageSize,
            startIndex
        );
    };

    // React.useEffect hook to get petitions when page changes (when any of the dependencies change)
    React.useEffect(() => {
        getPetitionsWithPagination();
    }, [currentPage, pageSize, searchQuery, selectedCategories, supportCostQuery, sortQuery]);

    // Function to change to the selected page size (number of petitions per page)
    // based on what the user selects from the dropdown select element
    const handleChangePageSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = parseInt(e.target.value, 10);
        setPageSize(newPageSize);
    };

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
            setErrorMessage,
            pageSize);
    }, []);

    // Function to open the search petition dialog
    const handleSearchDialogOpen = () => {
        // reset the temporary search query
        setTempSearchQuery(searchQuery);
        setOpenSearchDialog(true);
    };

    // Function to close the search petition dialog
    const handleSearchDialogClose = () => {
        setOpenSearchDialog(false);
    };

    // Function to update the temporary search query state
    const updateTempSearchQueryState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempSearchQuery(e.target.value);
    };

    // Function to handle confirming the search action
    const handleSearch = () => {
        setSearchQuery(tempSearchQuery); // Update search query
        getPetitions(tempSearchQuery, selectedCategories, supportCostQuery, sortQuery, setPetitions, setErrorFlag, setErrorMessage); // Perform search
    };

    // Function to open the filter petition dialog
    const handleFilterDialogOpen = ()  => {
        // reset the temporary filter values
        setTempSelectedCategories(selectedCategories);
        setTempSupportCostQuery(supportCostQuery);
        setOpenFilterDialog(true);
    };

    // Function to close the filter petition dialog
    const handleFilterDialogClose = () => {
        setOpenFilterDialog(false);
    };

    // Function to handle when a category id is selected from the dropdown
    const handleTempCategorySelection = (categoryId: number) => {
        // if the category (given by id) is not already selected
        if (!tempSelectedCategories.includes(categoryId)) {
            // Add the category id to the list of selected categories
            // (the ... makes a copy of the array that we can add to)
            // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
            setTempSelectedCategories([...tempSelectedCategories, categoryId]);
        } else {
            // otherwise, un-select the category
            handleRemoveTempCategory(categoryId);
        }
    };

    // function to handle removing a category id from the temporary category id list
    const handleRemoveTempCategory = (categoryId: number) => {
        // Copies over all ids in tempSelectedCategories, except for the given category id
        // if found, which is ignored.
        const updatedCategories = tempSelectedCategories.filter(
            (id) => id !== categoryId);
        // update the tempSelectedCategories state variable
        setTempSelectedCategories(updatedCategories);
    };

    // Function to handle confirming the filter action
    const handleFilter = () => {
        setSelectedCategories(tempSelectedCategories); // Update selected categories
        setSupportCostQuery(tempSupportCostQuery); // Update support cost query
        getPetitions(searchQuery, tempSelectedCategories, tempSupportCostQuery, sortQuery, setPetitions, setErrorFlag, setErrorMessage); // Perform filter
    };

    // Function to update the temporary support cost filter query state, based on the given input
    const updateTempSupportCostQueryState = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempSupportCostQuery(e.target.value);
    };

    // Function to open the sort petition dialog
    const handleSortDialogOpen = () => {
        // reset the temporary sort query
        setTempSortQuery(sortQuery);
        setOpenSortDialog(true);
    };

    // Function to close the sort petition dialog
    const handleSortDialogClose = () => {
        setOpenSortDialog(false);
    };

    // Function to handle the confirm sort action
    const handleSort = () => {
        setSortQuery(tempSortQuery); // Update sort query
        getPetitions(searchQuery, selectedCategories, supportCostQuery, tempSortQuery, setPetitions, setErrorFlag, setErrorMessage); // Perform sort
    };

    return (
        <div>
            {/* Navigation Bar */}
            <Navbar/>

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
                        value={tempSearchQuery}
                        onChange={updateTempSearchQueryState}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSearchDialogClose}>Cancel</Button>
                    {/* Search Button */}
                    <Button variant="outlined" endIcon={<Search/>}
                            onClick={() => {
                                handleSearch();
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
                            onChange={(e) => handleTempCategorySelection(Number(e.target.value))}
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
                                          id={tempSelectedCategories.includes(category.id) ? 'selected-category' : ''}
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
                        {tempSelectedCategories.map((categoryId) => (
                            <Chip
                                key={categoryId}
                                // label the chip with the category's name
                                label={categories.find((category) => category.id === categoryId)?.name || ""}
                                onDelete={() => handleRemoveTempCategory(categoryId)}
                                style={{margin: "5px"}}
                            />
                        ))}
                    </div>

                    {/* Maximum support cost input field*/}
                    <TextField
                        id="outlined-basic"
                        label="Maximum Support Cost"
                        variant="outlined"
                        value={tempSupportCostQuery}
                        onChange={updateTempSupportCostQueryState}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleFilterDialogClose}>Cancel</Button>
                    {/* Filter Button */}
                    <Button variant="outlined" endIcon={<Filter/>}
                            onClick={() => {
                                // apply the filter and refresh the list
                                handleFilter();
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
                            value={tempSortQuery}
                            // update temporary sortQuery to whatever (value) is picked
                            onChange={(e) => setTempSortQuery(e.target.value)}
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
                    <Button variant="outlined" endIcon={<Sort/>}
                            onClick={() => {
                                // set the temp sort query values to the actual query variable and refresh
                                handleSort();
                                handleSortDialogClose(); // close the sort dialog
                            }} autoFocus>
                        Sort
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Petition table section */}
            <Paper elevation={3} className="card">

                {/* Title */}
                <h1>Petitions</h1>

                {/* Only show if client is logged in as a user (has an auth token) */}
                {savedAuthToken &&
                    <div id="button-to-create-petition">
                        {/* Link to create a petition */}
                        <Link to="/petitions/create">
                            <Button variant="outlined">
                                Add Petition
                            </Button>
                        </Link>
                    </div>
                }

                {/* Search button which opens the search dialog */}
                <Button variant="outlined" endIcon={<Search/>}
                        onClick={handleSearchDialogOpen}>
                    Search
                </Button>

                {/* Filter button which opens the filter dialog */}
                <Button variant="outlined" endIcon={<Filter/>}
                        onClick={handleFilterDialogOpen}>
                    Filter
                </Button>

                {/* Sort button which opens the sort dialog */}
                <Button variant="outlined" endIcon={<Sort/>}
                        onClick={handleSortDialogOpen}>
                    Sort
                </Button>

                {/* Petition table */}
                <PetitionList petitions={petitions} />
            </Paper>

            Petitions per page:
            {/* Dropdown to allow user to select the number of petitions to display */}
            <select id="perPage" value={pageSize} onChange={handleChangePageSize}>
                {/* Allow user to select an option from 5-10 (inclusive) */}
                {[5, 6, 7, 8, 9, 10].map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>

            <div className="pagination-controls">
                {/* Button to go to first page */}
                <Button
                    onClick={() => handlePagination('first')}
                    disabled={currentPage === 1}
                >
                    First
                </Button>

                {/* Button to go to previous page */}
                <Button
                    onClick={() => handlePagination('prev')}
                    disabled={currentPage === 1}
                >
                    Prev
                </Button>

                {/* Display current page index */}
                <span>Page {currentPage}</span>

                {/* Button to go to next page */}
                <Button
                    onClick={() => handlePagination('next')}
                    disabled={currentPage === Math.ceil(totalPetitions / pageSize)}
                >
                    Next
                </Button>

                {/* Button to go to last page */}
                <Button
                    onClick={() => handlePagination('last')}
                    disabled={currentPage === Math.ceil(totalPetitions / pageSize)}
                >
                    Last
                </Button>
            </div>


            {/* Snackbar component to wrap the error Alert in */}
            {/* This displays a pop-up message on screen informing the user of the error */}
            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}
            >
                <Alert onClose={handleSnackClose} severity="success" sx={{width: '100%'}}>
                    {snackMessage}
                </Alert>
            </Snackbar>

        </div>
    );
}

export default Petitions;