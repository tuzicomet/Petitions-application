import axios from 'axios'; // Import Axios for making HTTP requests
import React from "react"; // Import React library
import CSS from 'csstype'; // Import CSSType for defining CSS properties
import { Paper, AlertTitle, Alert } from "@mui/material"; // Import Paper, AlertTitle, and Alert components from Material-UI
import PetitionListObject from "./PetitionListObject"; // Import PetitionListObject component
import {usePetitionStore} from "../store"; // Import custom hook from store

/**
 * PetitionList component displays a list of petitions.
 * It fetches petitions from the server and renders them using PetitionListObject component.
 * If there's an error during the fetch operation, it displays an error message.
 */
const PetitionList = () => {
    // use the PetitionStore state from store/index.ts
    const petitions = usePetitionStore(state => state.petitions); // Retrieve petitions from store
    const setPetitions = usePetitionStore(state => state.setPetitions); // Function to update petitions in the store

    const [errorFlag, setErrorFlag] = React.useState(false); // State for error flag
    const [errorMessage, setErrorMessage] = React.useState(""); // State for error message

    React.useEffect(() => {
        // Fetch petitions when component mounts or when setPetitions changes
        const getPetitions = () => {
            axios.get('http://localhost:4941/api/v1/petitions') // Make GET request to fetch petitions
                .then((response) => {
                    setErrorFlag(false); // Reset error flag
                    setErrorMessage(""); // Reset error message
                    setPetitions(response.data.petitions); // Update petitions in the store
                }, (error) => {
                    setErrorFlag(true); // Set error flag
                    // Set error message and inform the user that the app may not work as expected
                    setErrorMessage(error.toString() + " defaulting to old petitions changes app may not work as expected");
                });
        };
        getPetitions(); // Call getPetitions function
    }, [setPetitions]); // Dependencies for useEffect hook

    // Function to render petition rows
    const petition_rows = () => petitions.map((petition: PetitionFull) => (
        <PetitionListObject key={petition.petitionId + petition.title} petition={petition} />
    ));

    // CSS properties for the card style
    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",
        width: "fit-content"
    };

    return (
        // Render PetitionList component
        <Paper elevation={3} style={card}>
            <h1>PetitionList</h1> {/* Heading for the PetitionList */}
            <div style={{ display: "inline-block", maxWidth: "965px", minWidth: "320" }}>
                {/* Render error alert if errorFlag is true */}
                {errorFlag && (
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>
                )}
                {/* Render petition rows */}
                {petition_rows()}
            </div>
        </Paper>
    );
};

export default PetitionList;
