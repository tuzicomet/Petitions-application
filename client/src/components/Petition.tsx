import axios from 'axios';
import React from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
    Snackbar, Alert, AlertTitle, Paper, TableRow, TableCell, TableContainer, Table, TableHead,
    TableBody, MenuItem, IconButton
} from "@mui/material";
import { AddCircle, Edit } from "@mui/icons-material";
import Navbar from "./Navbar";
import { datetimeToDDMMYYYY } from "../utils/Utils";
import defaultImage from "../assets/default_picture.jpg"; // default user image
import {getUserImage} from "../services/UserService";
import {getPetition, getPetitionImage, changePetitionImage} from "../services/PetitionService";

// interface for table head cell
interface HeadCell {
    id: string;
    label: string;
}

// Define the head cells (column names) for the Support Tier list
const supportTierHeadCells: readonly HeadCell[] = [
    { id: 'title', label: 'Title' },
    { id: 'description', label: 'Description' },
    { id: 'cost', label: 'Cost' }
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
 * Petition component displays the details of a single petition.
 * It allows users to view, edit, and delete a petition.
 */
const Petition = () => {
    // Extracts the id parameter from the URL
    const { id } = useParams();
    // Navigates programmatically to other pages
    const navigate = useNavigate();
    // State variables for petition details and edit mode
    const [petition, setPetition] = React.useState<PetitionFull>({
        petitionId: 0,
        title: "",
        categoryId: 0,
        creationDate: "",
        ownerId: 0,
        ownerFirstName: "",
        ownerLastName: "",
        numberOfSupporters: 0,
        description: "",
        moneyRaised: 0,
        supportTiers: [],
    });
    const [editPetitionDetails, setEditPetitionDetails] = React.useState<Partial<PetitionFull>>({}); // Partial<PetitionFull> to allow only some fields to be edited
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("");
    const savedAuthToken = localStorage.getItem("savedAuthToken"); // Get the saved authToken from local storage
    // petitionImage should either accept string or null (if no image/unauthorized)
    const [petitionImage, setPetitionImage] = React.useState<string | null>(null);
    const [petitionOwnerImage, setPetitionOwnerImage] = React.useState<string | null>("");
    // State variable to hold the support tier rows in the petition list
    const [supportTierRows, setSupportTierRows] = React.useState<React.ReactNode[]>([]);
    // State variable boolean, true if the user is authenticated as the owner of the petition, false otherwise
    const [authenticatedAsOwner, setAuthenticatedAsOwner] = React.useState(false);
    const clientUserId = localStorage.getItem("clientUserId"); // get the client's user id from local storage
    // allowed MIME types for uploaded images
    const supportedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    // reference to the hidden file input element
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    // State variable for the uploaded petition image file
    const [uploadedPetitionImage, setUploadedPetitionImage] = React.useState<File | null>(null);

    // Function to handle change in petition image input
    const handleChangePetitionImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            // the uploaded file must be an accepted type (png, jpeg, gif)
            if (supportedTypes.includes(event.target.files[0].type)) {
                // Change the petition's image with the uploaded image
                await changePetitionImage(event.target.files[0], petition.petitionId, savedAuthToken,
                    setErrorFlag, setErrorMessage, setSnackMessage, setSnackOpen)

                // re-fetch the petition's image so the new image will be displayed
                const fetchPetitionImageUrl = async () => {
                    console.log("updating now")
                    // get the petition's hero image using getPetitionImage from PetitionService
                    const petitionImageUrl = await getPetitionImage(petition.petitionId);
                    // set the image to the petitionImage state variable
                    setPetitionImage(petitionImageUrl);
                }
                await fetchPetitionImageUrl();
            } else {
                setErrorFlag(true);
                setErrorMessage("Uploaded images must be of MIME type: image/png, image/jpeg, or image/gif")
            }
        }
    };

    // Function to close the Snackbar
    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    // React useEffect hook which runs whenever id changes
    React.useEffect(() => {
        if (id !== undefined) {
            // Function to fetch petition details
            getPetition(id, savedAuthToken, setPetition, setErrorFlag, setErrorMessage);

            // if the client is logged in as the owner of the petition whose page they are viewing
            if (clientUserId !== null) {
                if (parseInt(clientUserId, 10) == petition.ownerId) {
                    setAuthenticatedAsOwner(true);
                }
            }

            // get the petition's hero image and set its url in the petitionImage variable
            const fetchPetitionImageUrl = async () => {
                // get the petition's hero image using getPetitionImage from PetitionService
                const petitionImageUrl = await getPetitionImage(parseInt(id, 10));
                // set the image to the petitionImage state variable
                setPetitionImage(petitionImageUrl);
            }
            fetchPetitionImageUrl();
        }
    }, [id]);

    // React useEffect hook which runs whenever petition changes
    React.useEffect(() => {
        // get and set the petition owner's image url
        const findOwnerImageUrl = async () => {
            // get and set the petition owner's profile image
            setPetitionOwnerImage(await getUserImage(petition.ownerId.toString()));
        }
        // create the rows for the support tier list
        const createSupportTierRows = async () => {
            // Map through each row and make a TableRow for it with all necessary information
            const rows = await Promise.all(
                petition.supportTiers.map(async (supportTier) => {
                    return (
                        <TableRow key={supportTier.supportTierId} className="support-tier-row">
                            <TableCell>{supportTier.title}</TableCell>
                            <TableCell>{supportTier.description}</TableCell>
                            <TableCell>{supportTier.cost}</TableCell>
                        </TableRow>
                    );
                })
            );
            // save the rows to the support tier rows variable
            setSupportTierRows(rows);
        };
        findOwnerImageUrl();
        createSupportTierRows();

        // check whether client is authenticated as the owner of the petition they're viewing
        if (clientUserId !== null) {
            if (parseInt(clientUserId, 10) == petition.ownerId) {
                setAuthenticatedAsOwner(true);
            }
        }
    }, [petition]);

    // Function to edit the petition details
    const editPetition = () => {
        /* TODO: Filter out fields with empty values
        TODO: (otherwise, if you type in a field then delete it, it still submits as "")
        */

        axios.patch(`http://localhost:4941/api/v1/petitions/${id}`, editPetitionDetails, {
            headers: {
                // Include the savedAuthToken in the request header as X-Authorization
                'X-Authorization': savedAuthToken
            }
        })
            .then(() => {
                setOpenEditDialog(false);
                setSnackMessage("Petition details updated successfully");
                setSnackOpen(true);
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

            <div id="individual-petition-page">
                <Paper elevation={3} className="card">

                    {/* Header section for the petition page */}
                    <div id="petition-header">
                        {/* Use the petition image as the header background */}
                        <div id="petition-header-background">
                            {/* Display petition's image if available */}
                            {petitionImage && (
                                <img
                                    src={petitionImage}
                                    alt="Petition Profile"
                                />
                            )}
                        </div>
                        {/* Petition title as the page header */}
                        <div id="petition-header-title">
                            {petition.title}
                        </div>
                    </div>

                    {/* Container holding the petition image and the icon to edit it */}
                    <div className="image-container">
                        {/* Resource used: https://medium.com/web-dev-survey-from-kyoto/how-to-customize-the-file-upload-button-in-react-b3866a5973d8 */}

                        {/* Button to change petition image, only show to owner */}
                        {authenticatedAsOwner &&
                            <div className="add-image-icon-container">
                                <IconButton aria-label="add"
                                            onClick={() => fileInputRef.current?.click()}>
                                    <AddCircle className="add-image-icon"/>
                                </IconButton>
                            </div>
                        }

                        {/* Preview of petition image */}
                        {uploadedPetitionImage ? (
                            // If the user has uploaded an image (petitionImage exists)
                            <img
                                // create a URL from the uploaded petitionImage to display
                                src={URL.createObjectURL(uploadedPetitionImage)}
                                alt="Petition Preview"
                            />
                        ) : (
                            // Otherwise, display the petition's current image, if it exists
                            petitionImage && (
                                <img src={petitionImage} alt="Petition Profile" />
                            )
                        )}

                        {/* Hidden petition image upload input */}
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef} // variable which references this element
                            style={{display: 'none'}} // Hide the input
                            onChange={handleChangePetitionImage}
                        />
                    </div>

                    {/* Petition description section */}
                    <div id="petition-description">
                        {petition.description}
                    </div>

                    {/* Display information about the petition */}
                    <div id="petition-information">
                        <Paper elevation={1} className="card">
                            <h4>Information</h4>

                            {/* Only display if the client is authenticated as the owner fo the petition they're viewing */}
                            {authenticatedAsOwner &&
                                // Button to edit the petition's basic information, opens the edit dialog
                                <Button variant="outlined" startIcon={<Edit/>} onClick={() => setOpenEditDialog(true)}>
                                    Edit
                                </Button>
                            }

                            <Table>
                                <TableBody>
                                    {/* Display category name based on category id */}
                                    <TableRow>
                                        <TableCell><strong>Category:</strong></TableCell>
                                        <TableCell>{categories.find(category => category.id === petition.categoryId)?.name}</TableCell>
                                    </TableRow>
                                    {/* Display the petition creation date, in DD/MM/YYYY */}
                                    <TableRow>
                                        <TableCell><strong>Created:</strong></TableCell>
                                        <TableCell>{datetimeToDDMMYYYY(petition.creationDate)}</TableCell>
                                    </TableRow>
                                    {/* Display the petition's number of supporters */}
                                    <TableRow>
                                        <TableCell><strong>Number of Supporters:</strong></TableCell>
                                        <TableCell>{petition.numberOfSupporters}</TableCell>
                                    </TableRow>
                                    {/* Display the petition's total amount of money raised */}
                                    <TableRow>
                                        <TableCell><strong>Money Raised:</strong></TableCell>
                                        {/* If moneyRaised is null (no supporters), display 0, otherwise show the amount */}
                                        <TableCell>{petition.moneyRaised === null ? 0 :
                                            petition.moneyRaised}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Paper>
                    </div>

                    {/* Petition owner information section */}
                    <div id="petition-owner-section">
                        <Paper elevation={3} className="card">
                            <h4>Petition Owner</h4>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        {/* Petition owner's profile picture */}
                                        <TableCell className="petition-owner-tablecell" align="right">
                                            {/* Clicking the owner's name links to their user page */}
                                            <Link to={`/users/${petition.ownerId}`}>
                                                {/* If owner has no image (imageUrl is null),
                                                    display the default image */}
                                                <img src={petitionOwnerImage || defaultImage}
                                                     alt="Owner Profile Picture"
                                                />
                                            </Link>
                                        </TableCell>

                                        {/* Petition owner name */}
                                        <TableCell align="left">
                                            <div className="name-link">
                                                {/* Clicking the owner's name links to their user page */}
                                                <Link to={`/users/${petition.ownerId}`}>
                                                    {petition.ownerFirstName} {petition.ownerLastName}
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Paper>
                    </div>

                    {/* Edit Petition Dialog */}
                    <Dialog
                        open={openEditDialog}
                        onClose={() => setOpenEditDialog(false)}
                    >
                        <DialogTitle>Edit Petition</DialogTitle>
                        <DialogContent className="vertical-form-container">
                            <DialogContentText>
                                Make changes to petition details:
                            </DialogContentText>
                            <TextField
                                label="Title"
                                value={editPetitionDetails.title || ""}
                                onChange={(e) => setEditPetitionDetails({ ...editPetitionDetails, title: e.target.value })}
                            >
                            </TextField>
                            <TextField
                                label="Description"
                                value={editPetitionDetails.description || ""}
                                onChange={(e) => setEditPetitionDetails({ ...editPetitionDetails, description: e.target.value })}
                            >
                            </TextField>
                            <TextField
                                label="Category"
                                select
                                value={editPetitionDetails.categoryId || ""}
                                onChange={(e) => setEditPetitionDetails({ ...editPetitionDetails, categoryId: Number(e.target.value) })}
                                variant="outlined"
                            >
                                {/* Display each category in the dropdown */}
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                            <Button onClick={editPetition}>Save</Button>
                        </DialogActions>
                    </Dialog>

                    <h3> Support Tiers </h3>

                    {/* Support Tier table */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {supportTierHeadCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={'left'}
                                            padding={'normal'}
                                        >
                                            {headCell.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Display the petition's support tier rows */}
                                {supportTierRows}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Snackbar component */}
                    <Snackbar
                        open={snackOpen}
                        autoHideDuration={6000}
                        onClose={handleSnackClose}
                        message={snackMessage}
                    />
                </Paper>
            </div>
        </div>
    );
};

export default Petition;
