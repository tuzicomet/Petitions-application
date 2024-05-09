import axios from 'axios'; // used for making HTTP requests
import React from "react";
import CSS from 'csstype';
import { Paper, AlertTitle, Alert } from "@mui/material";
import PetitionListObject from "./PetitionListObject"; // import PetitionListObject component
import {usePetitionStore} from "../store";

/**
 * PetitionList component displays a list of petitions.
 * It fetches petitions from the server and renders them using PetitionListObject component.
 * If there's an error during the fetch operation, it displays an error message.
 */
const PetitionList = () => {
    const petitions = usePetitionStore(state => state.petitions);
    const setPetitions = usePetitionStore(state => state.setPetitions);

    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    React.useEffect(() => {
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
