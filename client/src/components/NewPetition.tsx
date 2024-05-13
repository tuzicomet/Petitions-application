// Page for creating a new petition

import React from "react";
import {useNavigate} from 'react-router-dom';
import { Button, Paper, TextField, Alert, AlertTitle, MenuItem } from "@mui/material"; // Material-UI components for styling
import Navbar from "./Navbar";
import {changePetitionImage, createPetition} from "../services/PetitionService";
import defaultImage from "../assets/default_picture.jpg";

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

    const [petitionImage, setPetitionImage] = React.useState<File | null>(null); // State variable for petition image file
    const supportedTypes = ['image/png', 'image/jpeg', 'image/gif']; // allowed MIME types for uploaded images
    // reference to the hidden file input element
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Function to handle change in petition image input
    const handleChangePetitionImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            // the uploaded file must be an accepted type (png, jpeg, gif)
            if (supportedTypes.includes(event.target.files[0].type)) {
                setPetitionImage(event.target.files[0]); // Set the selected image file
            } // TODO: display an error message otherwise
        }
    };

    // Function to handle updating a field value for a specific support tier
    const handleTierChange = (index: number, field: string, value: string) => {
        // create a copy of supportTiers
        const newSupportTiers = [...supportTiers];
        // if the field is cost
        if (field === 'cost') {
            // if the entered value is a number
            if (!isNaN(parseInt(value)) ) {
                // turn the value into an int and save it to the correct field
                (newSupportTiers[index] as any)[field] = parseInt(value);
            } else {
                // otherwise clear it
                (newSupportTiers[index] as any)[field] = "";
            }
        } else {
            // otherwise, save the full input to the correct field
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
        // An image must have been uploaded in order to attempt submission
        if (petitionImage !== null) {
            // Call createPetition function to handle creating the petition
            const createdPetitionId = await createPetition(savedAuthToken, title, description, categoryId, supportTiers,
                setErrorFlag, setErrorMessage);
            // If the result was not null (i.e. was successful, thus returning the created petition's id)
            if (createdPetitionId !== null) {
                // Change the petition's image with the uploaded image
                await changePetitionImage(petitionImage, createdPetitionId, savedAuthToken, setErrorFlag, setErrorMessage)

                // navigate to the newly created petition's page
                navigate(`/petitions/${createdPetitionId}`);
            }
        }
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

                        {/* Preview of petition image. When clicked, prompts user to upload an image */}
                        {/* Resource used: https://medium.com/web-dev-survey-from-kyoto/how-to-customize-the-file-upload-button-in-react-b3866a5973d8 */}
                        <div id="petition-image-preview"
                             onClick={() => fileInputRef.current?.click()}>
                            {petitionImage ? (
                                // If the user has uploaded an image (petitionImage exists)
                                <img
                                    // create a URL from the uploaded petitionImage to display
                                    src={URL.createObjectURL(petitionImage)}
                                    alt="Petition Preview"
                                />
                            ) : (
                                // Otherwise, display a default image
                                // TODO: change default image
                                <img
                                    src={defaultImage}
                                    alt="Default"
                                />
                            )}
                        </div>

                        {/* Hidden petition image upload input */}
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef} // variable which references this element
                            style={{ display: 'none' }} // Hide the input
                            onChange={handleChangePetitionImage}
                        />

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