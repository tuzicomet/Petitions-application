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
import defaultPetitionImage from "../assets/default_petition_image.jpg";
import {getUserImage} from "../services/UserService";
import {
    getPetition,
    getPetitionImage,
    changePetitionImage,
    createSupportTier,
    removeSupportTier, getSimilarPetitions, supportGivenTier
} from "../services/PetitionService";
import PetitionList from "./PetitionList";

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

// support type definition
type Supporter = {
    supportId: number;
    supportTierId: number;
    message: string;
    supporterId: number;
    supporterFirstName: string;
    supporterLastName: string;
    timestamp: string;
};

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
    // State variable boolean, true if the user is authenticated as the owner of the petition, false otherwise
    const [authenticatedAsOwner, setAuthenticatedAsOwner] = React.useState(false);
    const clientUserId = localStorage.getItem("clientUserId"); // get the client's user id from local storage
    // allowed MIME types for uploaded images
    const supportedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    // reference to the hidden file input element
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    // State variable for the uploaded petition image file
    const [uploadedPetitionImage, setUploadedPetitionImage] = React.useState<File | null>(null);
    // State variable to hold the support tiers
    const [supportTiers, setSupportTiers] = React.useState<SupportTier[]>([
        { supportTierId: -1, title: "", description: "", cost: 0 }
    ]);
    const [supportedTierIds, setSupportedTierIds] = React.useState<number[]>([]);
    const [editMode, setEditMode] = React.useState<{[key: number]: boolean}>({});
    const [tempSupportTiers, setTempSupportTiers] = React.useState<SupportTier[]>([]);
    // State variables for Add Support Tier dialog
    const [openAddTierDialog, setOpenAddTierDialog] = React.useState(false);
    const [newSupportTier, setNewSupportTier] = React.useState({
        title: "",
        description: "",
        cost: 0
    });
    const [supporters, setSupporters] = React.useState<Supporter[]>([]);
    // State variable to hold the supporter rows in the petition list
    const [supporterRows, setSupporterRows] = React.useState<React.ReactNode[]>([]);
    const [similarPetitions, setSimilarPetitions] = React.useState<Array<PetitionFull>>([]);
    const [openSupportThisTierDialog, setOpenSupportThisTierDialog] = React.useState(false);
    const [supportMessage, setSupportMessage] = React.useState<string | null>("");
    // State variable to hold the currently selected support tier id
    const [selectedTierIdToSupport, setSelectedTierIdToSupport] = React.useState<number | null>(null);
    const [changeMade, setChangeMade] = React.useState(false);

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
            // get the petition's details and hero image and set its url in the petitionImage variable
            const fetchPetitionDetails = async () => {
                await getPetition(id, savedAuthToken, setPetition, setErrorFlag, setErrorMessage)

                // get the petition's hero image using getPetitionImage from PetitionService
                const petitionImageUrl = await getPetitionImage(parseInt(id, 10));
                // set the image to the petitionImage state variable
                setPetitionImage(petitionImageUrl);
            }
            fetchPetitionDetails();

            // if the client is logged in as the owner of the petition whose page they are viewing
            if (clientUserId !== null) {
                if (parseInt(clientUserId, 10) == petition.ownerId) {
                    setAuthenticatedAsOwner(true);
                }
            }

            // get the petition's supporters
            const fetchSupporters = async () => {
                try {
                    await axios.get(`http://localhost:4941/api/v1/petitions/${id}/supporters`)
                        .then((response) => {
                            setSupporters(response.data)
                        })
                } catch (error) {
                    console.error("Error fetching supporters:", error);
                }
            };

            fetchSupporters();
        }

        // reset the changeMade variable
        setChangeMade(false);
    }, [id, changeMade]);

    // React useEffect hook which runs whenever petition changes
    React.useEffect(() => {
        // initialise the supportTiers variable with the petition's support tiers
        if (petition && petition.supportTiers) {
            // Create a new array to hold the transformed support tiers
            const newSupportTiers = [];

            // Use a for loop to iterate over the petition.supportTiers array
            for (const tier of petition.supportTiers) {
                // Push the transformed object into the new array
                newSupportTiers.push({
                    supportTierId: tier.supportTierId,
                    title: tier.title,
                    description: tier.description,
                    cost: tier.cost
                });
            }

            // Update the state with the new array
            setSupportTiers(newSupportTiers);
        }

        // set petition details
        const setPetitionDetails = async () => {
            if (petition.ownerId !== 0) {
                // get and set the petition owner's profile image
                setPetitionOwnerImage(await getUserImage(petition.ownerId.toString()));
            }

            if (petition.categoryId !== 0) {
                // get and set the petitions similar to this one
                await getSimilarPetitions(petition.petitionId, petition.categoryId,
                    petition.ownerId, setSimilarPetitions);
                console.log("Similar petitions: ", similarPetitions);
            }
        }

        setPetitionDetails();

        // check whether client is authenticated as the owner of the petition they're viewing
        if (clientUserId !== null) {
            if (parseInt(clientUserId, 10) == petition.ownerId) {
                setAuthenticatedAsOwner(true);
            }
        }
    }, [petition]);

    // run when supporters changes
    React.useEffect(() => {
        createSupporterRows();

        const tierIds = new Set(supporters.map(supporter => supporter.supportTierId));
        setSupportedTierIds(Array.from(tierIds));
    }, [supporters]);

    // create the rows for the petition list
    const createSupporterRows = async () => {
        console.log("supporters: ", supporters);
        // store all rows in this variable, Promise.all is used to wait until all of them are finished
        const rows = await Promise.all(
            supporters.map(async (supporter: Supporter, index) => {

                // find the title of the tier they are supporting, by using the supportTiers variable
                const supportedTierTitle = supportTiers.find(tier =>
                    // search supportTiers to find the tier with the matching supportTierId
                    tier.supportTierId === supporter.supportTierId
                )?.title // get the title value

                // get the supporter's image url
                const supporterImageUrl = await getUserImage(supporter.supporterId.toString())

                // Convert the timestamp column (in timestamp format), into DD/MM/YYYY (NZ time)
                const timestamp = datetimeToDDMMYYYY(supporter.timestamp);

                return (
                    // TableRow created for each petition, with the petition id as the key
                    <TableRow key={supporter.supporterId} className="petition-row">

                        {/* Title of the tier which the supporter supports */}
                        <TableCell>{supportedTierTitle}</TableCell>

                        {/* Display the supporter's message if provided, otherwise empty string */}
                        <TableCell>{supporter.message || ""}</TableCell>

                        {/* The timestamp of when the supporter began supporting */}
                        <TableCell>{timestamp}</TableCell>

                        {/* Supporter Image */}
                        <TableCell>
                            {/* If the supporterImageUrl is present, display it, otherwise show default */}
                            <img src={supporterImageUrl || defaultImage}
                                 alt="Supporter Profile Image"/>
                        </TableCell>

                        <TableCell>
                            {supporter.supporterFirstName} {supporter.supporterLastName}
                        </TableCell>
                    </TableRow>
                )
            })
        )
        setSupporterRows(rows);
    };

    // Function to edit the petition details
    const editPetition = () => {
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
                setErrorFlag(false);
                setChangeMade(true);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    // Function to handle when the Edit button is clicked for a support tier
    const handleEditTierButton = (index: number) => {
        setEditMode({...editMode, [index]: true});
        setTempSupportTiers([...supportTiers]);
    };

    // Function to handle when the Cancel button is clicked when editing a support tier
    const handleCancelEditTiersButton = (index: number) => {
        setEditMode({...editMode, [index]: false});
        setTempSupportTiers([...supportTiers]);
    };

    // Function to update the temp support tier values when editing a support tier
    const handleTempTierChange = (index: number, field: string, value: string | number) => {
        const newTempSupportTiers = [...tempSupportTiers];
        newTempSupportTiers[index] = { ...newTempSupportTiers[index], [field]: value };
        setTempSupportTiers(newTempSupportTiers);
    };

    // Function to handle when the Save button is clicked when editing a tier
    const handleSaveTierEdits = async (index: number) => {
        const updatedTier = tempSupportTiers[index];
        try {
            await axios.patch(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${updatedTier.supportTierId}`, updatedTier, {
                headers: {
                    'X-Authorization': savedAuthToken
                }
            });
            // Update the support tiers state with the edited tier
            const newSupportTiers = [...supportTiers];
            newSupportTiers[index] = updatedTier;
            setSupportTiers(newSupportTiers);
            setEditMode({ ...editMode, [index]: false });
            setChangeMade(true);
        } catch (error: any) {
            setErrorFlag(true);
            setErrorMessage(error.toString());
        }
    };

    // Function to open the Support This Tier dialog
    const handleOpenSupportThisTierDialog = (supportTierId: number) => {
        // Reset the support message
        setSupportMessage("");
        // Set the selected support tier id for which the dialog is opened
        setSelectedTierIdToSupport(supportTierId);
        // Open the dialog
        setOpenSupportThisTierDialog(true);
    };

    // Function to close the Support This Tier dialog
    const handleCloseSupportThisTierDialog = () => {
        // Close the dialog
        setOpenSupportThisTierDialog(false);
    };

    // Function to handle what happens when the Support button for a tier (given by id) is clicked
    const handleSupportThisTier = () => {
        if (selectedTierIdToSupport !== null) {
            // attempt to support the tier
            supportGivenTier(petition.petitionId, savedAuthToken, selectedTierIdToSupport,
                supportMessage, setErrorFlag, setErrorMessage, setSnackMessage, setSnackOpen)
                .then(() => {
                    // if successful, close the dialog after submission
                    setOpenSupportThisTierDialog(false);
                })
        }
    }

    // Function to open the Add Support Tier dialog
    const handleOpenAddTierDialog = () => {
        setOpenAddTierDialog(true);
    };

    // Function to close the Add Support Tier dialog
    const handleCloseAddTierDialog = () => {
        setOpenAddTierDialog(false);
    };

    // Function to create a new support tier
    const handleCreateSupportTier = async () => {
        await createSupportTier(petition.petitionId, savedAuthToken,
            newSupportTier.title, newSupportTier.description, newSupportTier.cost,
            setErrorFlag, setErrorMessage, setSnackMessage, setSnackOpen)
            .then(() => {
                // close the add tier dialog
                handleCloseAddTierDialog();
                setChangeMade(true);
            })
    }

    // function to handle the remove button on a support tier
    const handleRemoveSupportTier = async (supportTierId: number) => {
        try {
            // remove the support tier
            await removeSupportTier(petition.petitionId, supportTierId, savedAuthToken,
                setErrorFlag, setErrorMessage, setSnackMessage, setSnackOpen)

            // remove from the local support tier list as well
            setSupportTiers(supportTiers.filter(tier => tier.supportTierId !== supportTierId));
            setChangeMade(true);
        } catch (error: any) {
            setErrorFlag(true);
            setErrorMessage(error.toString());
        }
    }



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
                            {/* If the petition's imageUrl is present, display it, otherwise show default */}
                            {/* (all petitions should have an image, but we can do this to be safe) */}
                            <img src={petitionImage || defaultPetitionImage}
                                 alt="Petition Image"
                            />
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
                            // Otherwise, display the petition's current image, or default if there is none
                            <img src={petitionImage || defaultPetitionImage}
                                alt="Petition Image"
                            />
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
                                onChange={(e) => setEditPetitionDetails({
                                    ...editPetitionDetails,
                                    title: e.target.value
                                })}
                            >
                            </TextField>
                            <TextField
                                label="Description"
                                value={editPetitionDetails.description || ""}
                                onChange={(e) => setEditPetitionDetails({
                                    ...editPetitionDetails,
                                    description: e.target.value
                                })}
                            >
                            </TextField>
                            <TextField
                                label="Category"
                                select
                                value={editPetitionDetails.categoryId || ""}
                                onChange={(e) => setEditPetitionDetails({
                                    ...editPetitionDetails,
                                    categoryId: Number(e.target.value)
                                })}
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

                    <div id="support-tiers-container">
                        <Paper elevation={3} className="card">
                            <h3>Support Tiers</h3>

                            {/* Only allow client to add a tier if they own the petition,
                             and there are less than 3 support tiers */}
                            {authenticatedAsOwner && supportTiers.length < 3 &&
                                <Button variant="outlined" onClick={handleOpenAddTierDialog}>
                                    Add Tier
                                </Button>
                            }

                            {supportTiers.map((tier, index) => (
                                <Paper elevation={3} className="support-tier-container-card">
                                    <div key={index} className="support-tier-card">
                                        {editMode[index] ? (
                                            <div className="support-tier-edit-fields">
                                                <TextField
                                                    label="Title"
                                                    value={tempSupportTiers[index].title}
                                                    onChange={(e) => handleTempTierChange(index, "title", e.target.value)}
                                                />
                                                <TextField
                                                    label="Description"
                                                    value={tempSupportTiers[index].description}
                                                    multiline
                                                    onChange={(e) => handleTempTierChange(index, "description", e.target.value)}
                                                />
                                                <TextField
                                                    label="Cost"
                                                    type="number"
                                                    value={tempSupportTiers[index].cost}
                                                    onChange={(e) => handleTempTierChange(index, "cost", Number(e.target.value))}
                                                />
                                                <Button variant="outlined" onClick={() => handleSaveTierEdits(index)}>
                                                    Save
                                                </Button>
                                                <Button variant="outlined" onClick={() => handleCancelEditTiersButton(index)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="support-tier-information">
                                                <Table>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell><strong>Title:</strong></TableCell>
                                                            <TableCell>{tier.title}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><strong>Description:</strong></TableCell>
                                                            <TableCell>{tier.description}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell><strong>Cost:</strong></TableCell>
                                                            <TableCell>{tier.cost}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                                {authenticatedAsOwner && tier.supportTierId !== -1
                                                && !supportedTierIds.includes(tier.supportTierId) ? (
                                                    <Button variant="outlined" onClick={() => handleEditTierButton(index)}>
                                                        Edit
                                                    </Button>
                                                ) : (
                                                    !authenticatedAsOwner && (
                                                    // If client does not own the petition, show the support button
                                                    <Button variant="outlined"
                                                            onClick={() => handleOpenSupportThisTierDialog(tier.supportTierId)}>
                                                        Support
                                                    </Button>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Only allow user to remove a tier if they own the petition
                                         and there are more than 1 support tiers*/}
                                        {authenticatedAsOwner && supportTiers.length > 1
                                            && !supportedTierIds.includes(tier.supportTierId) &&
                                            <Button className="delete-button" variant="outlined"
                                                    onClick={() => handleRemoveSupportTier(tier.supportTierId)}>
                                                Remove
                                            </Button>
                                        }
                                    </div>
                                </Paper>
                            ))}
                        </Paper>
                    </div>

                    {/* Add support tier dialog*/}
                    <Dialog
                        open={openAddTierDialog}
                        onClose={() => setOpenAddTierDialog(false)}
                    >
                        <DialogTitle>Add a Support Tier</DialogTitle>
                        <DialogContent className="vertical-form-container">
                            <TextField
                                label="Title"
                                value={newSupportTier.title || ""}
                                onChange={(e) => setNewSupportTier({ ...newSupportTier, title: e.target.value })}
                            />
                            <TextField
                                label="Description"
                                value={newSupportTier.description || ""}
                                multiline
                                onChange={(e) => setNewSupportTier({ ...newSupportTier, description: e.target.value })}
                            />
                            <TextField
                                label="Cost"
                                type="number"
                                value={newSupportTier.cost || ""}
                                onChange={(e) =>
                                    setNewSupportTier({ ...newSupportTier, cost: Number(e.target.value) })}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={handleCloseAddTierDialog}>Cancel</Button>
                            <Button variant="outlined" onClick={handleCreateSupportTier}>Create</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Dialog for supporting this tier */}
                    <Dialog open={openSupportThisTierDialog} onClose={handleCloseSupportThisTierDialog}>
                        {clientUserId ?
                            (<>
                                {/* If user is logged in, show the support form */}
                                <DialogTitle>Support This Tier</DialogTitle>
                                <DialogContent>
                                    {/* Text field for entering support message */}
                                    <TextField
                                        id="support-message"
                                        label="Support Message"
                                        type="text"
                                        multiline
                                        value={supportMessage}
                                        onChange={(event) => setSupportMessage(event.target.value)}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    {/* Button to cancel */}
                                    <Button variant="outlined" onClick={handleCloseSupportThisTierDialog}>
                                        Cancel
                                    </Button>
                                    {/* Button to confirm support */}
                                    <Button variant="outlined" onClick={handleSupportThisTier}>
                                        Submit
                                    </Button>
                                </DialogActions>
                            </>)
                            : (
                                <>
                                    {/* If user is not logged in, prompt them to register/login */}
                                    <DialogTitle>You must be logged in to support</DialogTitle>
                                    <DialogActions>
                                        <Link to="/register">
                                            <Button variant="outlined">
                                                Register
                                            </Button>
                                        </Link>
                                        <Link to="/login">
                                            <Button variant="outlined">
                                                Login
                                            </Button>
                                        </Link>
                                    </DialogActions>
                                </>
                            )
                        }
                    </Dialog>


                    {/* List of supporters */}
                    <TableContainer component={Paper}>
                        <h3>Supporters</h3>
                        {supporterRows.length === 0 ? (
                            // If there are no supporters
                            <p>This petition has no supporters</p>
                        ) : (
                            // Otherwise, display the supporter rows in a table
                            <Table>
                                <TableBody>
                                    {/* Display the supporter rows */}
                                    {supporterRows}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>


                    {/* Similar Petitions table */}
                    <Paper elevation={3} className="card">
                        <h3>Similar Petitions</h3>
                        {similarPetitions.length === 0 ? (
                            // If there are no similar petitions
                            <p>There are no similar petitions</p>
                        ) : (
                            // Otherwise, display the similar petitions in the petition list
                            <PetitionList petitions={similarPetitions} />
                        )}

                        {/* Snackbar component */}
                        <Snackbar
                            open={snackOpen}
                            autoHideDuration={6000}
                            onClose={handleSnackClose}
                            message={snackMessage}
                        />
                    </Paper>
                </Paper>
            </div>
        </div>
    );
};

export default Petition;