import axios from 'axios';
import React from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Snackbar, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

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

    // Function to close the Snackbar
    const handleSnackClose = () => {
        setSnackOpen(false);
    };

    React.useEffect(() => {
        // Function to fetch petition details
        const getPetition = () => {
            axios.get<PetitionFull>(`http://localhost:4941/api/v1/petitions/${id}`, {
                headers: {
                    // Include the savedAuthToken in the request header as X-Authorization
                    'X-Authorization': savedAuthToken
                }
            })
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setPetition(response.data);
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        };

        // Function to retrieve the petition's saved image (if it exists)
        const getPetitionImage = async () => {
            try {
                // Send a request to retrieve the petition's image
                const response = await axios.get(`http://localhost:4941/api/v1/petitions/${id}/image`, {
                    // Treat the response as binary data
                    responseType: 'arraybuffer',
                    // Send the saved authentication token in the header
                    headers: {
                        'X-Authorization': savedAuthToken
                    }
                });
                // Create a blob object containing the image data, along with its MIME (content) type
                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                // Create a URL for the blob object to use it as the image URL
                const imageUrl = URL.createObjectURL(blob);
                // Set the image URL in the state to display the image
                setPetitionImage(imageUrl);
            } catch (error) {
                // TODO: if petition has no image, must give a default image
                console.error("Error fetching petition image:", error);
            }
        };

        getPetition();
        getPetitionImage();
    }, [id]);

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
            {/* Show error Alert if errorFlag is there */}
            {errorFlag &&
                <Alert severity="error">
                    {errorMessage}
                </Alert>
            }

            <h1>Petition</h1>

            {/* Display petition's image if available */}
            {petitionImage && (
                <img
                    src={petitionImage}
                    alt="Petition Profile"
                    style={{ width: 100, height: 100, borderRadius: "10%" }}
                />
            )}

            <div>
                <strong>petitionId:</strong> {petition.petitionId}<br/>
                <strong>Title:</strong> {petition.title}<br/>
                <strong>categoryId:</strong> {petition.categoryId}<br/>
                <strong>creationDate:</strong> {petition.creationDate}<br/>
                <strong>ownerId:</strong> {petition.ownerId}<br/>
                <strong>ownerFirstName:</strong> {petition.ownerFirstName}<br/>
                <strong>ownerLastName:</strong> {petition.ownerLastName}<br/>
                <strong>numberOfSupporters:</strong> {petition.numberOfSupporters}<br/>
                <strong>description:</strong> {petition.description}<br/>
                <strong>moneyRaised:</strong> {petition.moneyRaised}<br/>
                {/* TODO: need to show all support tiers */}
            </div>

            <Link to={"/petitions"}>Back to petitions</Link>

            <Button variant="outlined" startIcon={<EditIcon/>} onClick={() => setOpenEditDialog(true)}>
                Edit
            </Button>

            {/* Edit Petition Dialog */}
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
            >
                <DialogTitle>Edit Petition</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Make changes to petition details:
                    </DialogContentText>
                    <TextField
                        label="Title"
                        value={editPetitionDetails.title || ""}
                        onChange={(e) => setEditPetitionDetails({ ...editPetitionDetails, title: e.target.value })}
                    /><br />
                    <TextField
                        label="Description"
                        value={editPetitionDetails.description || ""}
                        onChange={(e) => setEditPetitionDetails({ ...editPetitionDetails, description: e.target.value })}
                    /><br />
                    <TextField
                        label="CategoryId"
                        value={editPetitionDetails.categoryId || ""}
                        onChange={(e) =>
                            setEditPetitionDetails({
                                ...editPetitionDetails,
                                categoryId: parseInt(e.target.value, 10)
                            })} // TODO: maybe a selector instead?
                    /><br />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={editPetition}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar component */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={6000}
                onClose={handleSnackClose}
                message={snackMessage}
            />
        </div>
    );
};

export default Petition;
