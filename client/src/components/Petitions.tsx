import axios from 'axios';
import React from "react";
import {Link} from 'react-router-dom';

const Petitions = () => {
    const [petitions, setPetitions] = React.useState < Array < Petition >> ([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    // React.useEffect hook, which in this case, simply fetches all petitions when the page loads
    React.useEffect(() => {
        getPetitions()
    }, [])

    const getPetitions = () => {
        axios.get('http://localhost:4941/api/v1/petitions')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                // the response data from this request will be in two parts:
                // an array of petitions, and a count of petitions
                // Set our petitions array using only the 'petitions' part
                setPetitions(response.data.petitions)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const list_of_petitions = () => {
        return petitions.map((item: Petition) =>
            <tr key={item.petitionId}>
                <th scope="row">{item.petitionId}</th>
                <td>{item.title}</td>
                <td><Link to={"/petitions/" + item.petitionId}>Go to
                    petition</Link></td>
                <td>
                    <button type="button">Delete</button>
                    <button type="button">Edit</button>
                </td>
            </tr>
        )
    }

    if (errorFlag) {
        return (
            <div>
                <h1>Petitions</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
            </div>
        )
    } else { // if there is no error flag, proceed
        return (
            <div>
                <h1>Petitions</h1>
                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">title</th>
                        <th scope="col">link</th>
                        <th scope="col">actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Call this method to get all table rows based on petitions */}
                    {list_of_petitions()}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Petitions;