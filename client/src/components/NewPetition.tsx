// Page for creating a new petition

import React from "react";
import {useNavigate} from 'react-router-dom';
import { Button, Paper, TextField, Alert, AlertTitle, MenuItem } from "@mui/material"; // Material-UI components for styling
import Navbar from "./Navbar";
import { createPetition } from "../services/PetitionService";

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

// NewPetition functional component
const NewPetition = () => {
    // Define state variables using useState hook, which are used to store and
    // manage data within React components
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    // state variables to hold inputted values from the form
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [categoryId, setCategoryId] = React.useState<number>(0);
    // Get the saved authToken from local storage
    const savedAuthToken = localStorage.getItem("savedAuthToken");

    const navigate = useNavigate(); // navigation function for navigating to different pages
    // state variable to hold objects, each containing information for a new support tier
    // (initialised for only one support tier, but up to two more can be added later)
    const [supportTiers, setSupportTiers] = React.useState([
        { title: "", description: "", cost: "" }
    ]);

    // Function to handle updating a field value for a specific support tier
    const handleTierChange = (index: number, field: string, value: string) => {
        // create a copy of supportTiers
        const newSupportTiers = [...supportTiers];
        // if the field is cost
        if (field === 'cost') {
            // turn the value into an int and save it to the correct field
            (newSupportTiers[index] as any)[field] = parseInt(value);
        } else {
            // otherwise, save the input to the correct field
            (newSupportTiers[index] as any)[field] = value;
        }
        // save changes by overwriting supportTiers
        setSupportTiers(newSupportTiers);
    };

    // Function to handle adding a new support tier
    const handleAddTier = () => {
        // Only allow if there are less than 3 support tiers already
        if (supportTiers.length <3) {
            // add a new support tier (object with values for it) to the existing supportTiers
            // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
            setSupportTiers([...supportTiers, { title: "", description: "", cost: "" }]);
        }
    };

    // Function to handle removing a specific support tier, given by its index
    const handleRemoveTier = (index: number) => {
        // Do not allow if there is only one support tier
        if (supportTiers.length > 1) {
            // use filter to get every support tier, where the index (i) they find is not the same
            // as the passed in index (the index of the tier we're removing)
            const upadtedSupportTiers = supportTiers.filter(
                (tier, i) => i !== index);
            setSupportTiers(upadtedSupportTiers);
        }
    };

    // Function to handle category selection
    const handleCategorySelection = (selectedCategoryId : number) => {
        setCategoryId(selectedCategoryId); // set the selected category id
    };

    // Function to handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Call createPetition function to handle creating the petition
        // if successful, it will redirect to the newly created petition's page
        await createPetition(savedAuthToken, title, description, categoryId, supportTiers,
                             setErrorFlag, setErrorMessage, navigate);
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

            {/* Petition form */}
            <Paper elevation={3} className="card">
                {/* Form title */}
                <h1>Create Petition</h1>
                <form onSubmit={handleSubmit}>

                    {/* Container for the form components */}
                    <div id="vertical-form-container">

                        {/* Title input field */}
                        <div id="title-input-field-container">
                            <TextField
                                id="title-input-field"
                                label="Title"
                                placeholder="..."
                                value={title}
                                // Update title state on input change
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Description input field */}
                        <div id="description-input-field-container">
                            <TextField
                                id="description-input-field"
                                label="Description"
                                placeholder="..."
                                value={description}
                                // allow the description to be over multiple lines & makes it extend vertically
                                // see https://mui.com/material-ui/react-text-field/ (Multiline section)
                                multiline
                                // Update description state on input change
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Category selection */}
                        {/* See https://mui.com/material-ui/react-text-field/ (Select section, example 1) */}
                        <div id="category-selection-field-container">
                            {/* Dropdown to select a single category */}
                            <TextField
                                id="category-selection-field"
                                select
                                label="Category"
                                value={categoryId}
                                onChange={(e) => handleCategorySelection(Number(e.target.value))}
                                variant="outlined"
                            >
                                {/* Display each category in the dropdown */}
                                {categories.map((category) => (
                                    // when selecting a category, the saved value is just the id
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.id} - {category.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        {/* Support Tiers section */}
                        <div id="support-tiers-container">
                            <h3>Support Tiers</h3>

                            {/* Only show if there are less than 3 support tiers */}
                            {supportTiers.length <3 &&
                                // Button to add a new Support Tier
                                <Button variant="outlined" onClick={handleAddTier}>
                                    Add Tier
                                </Button>
                            }

                            {/* For each object (tier) in the supportTiers state variable */}
                            {/* (if we add/remove tiers, it automatically updates) */}
                            {supportTiers.map((tier, index) => (
                                // Individual support tier
                                <Paper elevation={3} className="card">
                                    <div key={index} className="support-tier-creation-card">
                                        <div className="support-tier-creation-fields">
                                            <TextField
                                                label="Title"
                                                value={tier.title}
                                                // Changes the title value for its respective support tier
                                                onChange={(e) => handleTierChange(index, "title", e.target.value)}
                                            />
                                            <TextField
                                                label="Description"
                                                value={tier.description}
                                                multiline
                                                // Changes the description value for its respective support tier
                                                onChange={(e) => handleTierChange(index, "description", e.target.value)}
                                            />
                                            <TextField
                                                label="Cost"
                                                value={tier.cost}
                                                // Changes the cost value for its respective support tier
                                                onChange={(e) => handleTierChange(index, "cost", e.target.value)}
                                            />
                                        </div>

                                        {/* Only show if there are more than 1 support tiers */}
                                        {supportTiers.length > 1 &&
                                            // Button to remove the specific support tier
                                            <Button className="delete-button"
                                                    variant="outlined"
                                                    onClick={() => handleRemoveTier(index)}>
                                                Remove
                                            </Button>
                                        }
                                    </div>
                                </Paper>
                                ))}

                        </div>

                        {/* TODO: allow user to add image, needs separate request */}

                        {/* Submit registration form button */}
                        <div id="submit-button">
                            <Button variant="outlined" type="submit">
                                Create
                            </Button>
                        </div>
                    </div>
                </form>

            </Paper>

        </div>
);
};

export default NewPetition;