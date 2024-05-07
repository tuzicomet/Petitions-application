import axios from 'axios';
import React from "react";
import CSS from 'csstype';
import { Paper, AlertTitle, Alert } from "@mui/material";
import PetitionListObject from "./PetitionListObject";
import {usePetitionStore} from "../store";

const PetitionList = () => {
    // const [petitions, setPetitions] = React.useState<Array<Petition>>([])
    // use the PetitionStore state from store/index.ts
    const petitions = usePetitionStore(state => state.petitions)
    const setPetitions = usePetitionStore(state => state.setPetitions)

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    React.useEffect(() => {
        const getPetitions = () => {
            axios.get('http://localhost:4941/api/v1/petitions')
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setPetitions(response.data.petitions)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString() + " defaulting to old petitions changes app may not work as expected")
                })
        }
        getPetitions()
    }, [setPetitions])

    const petition_rows = () => petitions.map((petition: PetitionFull) => <PetitionListObject key={
        petition.petitionId + petition.title
    } petition={petition} />)

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",
        width: "fit-content"
    }

    return (
        <Paper elevation={3} style={card} >
            <h1>PetitionList </h1>
            <div style={{ display: "inline-block", maxWidth: "965px", minWidth: "320" }}>
                {errorFlag?
                    <Alert severity = "error">
                        <AlertTitle> Error </AlertTitle>
                        { errorMessage }
                    </Alert>: ""}
                { petition_rows() }
            </div>
        </Paper>
    )
}

export default PetitionList;
