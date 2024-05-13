// Page for creating a new petition

import React, {useState} from "react";
import axios from "axios"; // axios library for making HTTP requests
import {useNavigate} from 'react-router-dom';
import {
    Button, Paper, TextField, Alert, AlertTitle, InputAdornment, IconButton, MenuItem
} from "@mui/material"; // Material-UI components for styling
// icons for the password visibility toggle button
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CSS from 'csstype';
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

    const navigate = useNavigate(); // navigation function for navigating to different pages

    // Function to handle category selection
    const handleCategorySelection = (selectedCategoryId : number) => {
        setCategoryId(selectedCategoryId); // set the selected category id
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

            {/* Petition table section */}
            <Paper elevation={3} className="card">

                {/* Page Title */}
                <h1>Create Petition</h1>

                {/* Add petition form */}
                <form
                    // handle form submission
                    onSubmit={(e) => {
                        e.preventDefault();
                        // Call createPetition function to handle creating the petition
                        createPetition(
                            title,
                            description,
                            categoryId,
                            [],
                            setErrorFlag,
                            setErrorMessage
                        );
                    }}
                >
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