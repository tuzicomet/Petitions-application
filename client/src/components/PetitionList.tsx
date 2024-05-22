import React from "react";
import { Link } from 'react-router-dom';
import defaultImage from "../assets/default_picture.jpg"; // default user image
import defaultPetitionImage from "../assets/default_petition_image.jpg";
import { datetimeToDDMMYYYY } from "../utils/Utils";
import {getPetitionImage, getPetitionSupportCost} from "../services/PetitionService";
import { getUserImage } from "../services/UserService";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

// interface for table head cell
interface HeadCell {
    id: string;
    label: string;
}

// Function to create the petition list
const PetitionList = ({ petitions }: { petitions: Array<PetitionFull> }) => {
    // State variable to hold the petition rows in the petition list
    const [petitionRows, setPetitionRows] = React.useState<React.ReactNode[]>([]);
    // Define table head cells
    // (the columns in the petitions list)
    const headCells: readonly HeadCell[] = [
        { id: 'image', label: 'Image' },
        { id: 'title', label: 'Title' },
        { id: 'creationDate', label: 'Creation Date' },
        { id: 'supportingCost', label: 'Supporting Cost' },
        { id: 'category', label: 'Category' },
        { id: 'owner', label: 'Owner' }
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

    // React.useEffect hook, runs whenever petitions changes
    React.useEffect(() => {
        // create the rows for the petition list
        const createPetitionRows = async () => {
            // store all rows in this variable, Promise.all is used to wait until all of them are finished
            const rows = await Promise.all(
                // Map through each petition in the petitions array, so we can make a TableRow for each
                petitions.map(async (petition: PetitionFull) => {
                    // Convert the creation-date column (in timestamp format), into DD/MM/YYYY (NZ time)
                    const creationDate = datetimeToDDMMYYYY(petition.creationDate);
                    // Get the supporting cost for the petition's cheapest tier:
                    const supportingCost = await getPetitionSupportCost(petition.petitionId);
                    // get the petition image url, using the getPetitionImage
                    // method from PetitionService
                    const imageUrl = await getPetitionImage(petition.petitionId);
                    // get the image url for the petition owner's profile picture, using getUserImage
                    // method from UserService
                    const ownerImageUrl = await getUserImage(petition.ownerId.toString());

                    return (
                        // TableRow created for each petition, with the petition id as the key
                        <TableRow key={petition.petitionId} className="petition-row">

                            {/* Petition Hero Image */}
                            <TableCell>
                                {/* If the petition's imageUrl is present, display it, otherwise show default */}
                                {/* (all petitions should have an image, but we can do this to be safe) */}
                                <img src={imageUrl || defaultPetitionImage}
                                     alt="Petition Image"
                                />

                            </TableCell>

                            {/* Petition title */}
                            <TableCell>
                                <div className="name-link">
                                    {/* Clicking the title links the client to that petition's page */}
                                    <Link to={`/petitions/${petition.petitionId}`}>
                                        {petition.title}
                                    </Link>
                                </div>
                            </TableCell>

                            {/* Petition creation date */}
                            <TableCell>
                                {creationDate}
                            </TableCell>

                            {/* Petition minimum support cost */}
                            <TableCell>
                                {supportingCost}
                            </TableCell>


                            {/* Petition category */}
                            <TableCell>
                                {/* From the categories array, find the record where the
                                 id value matches the petition.categoryId value */}
                                {/* See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
                                under 'Using arrow function and destructuring'*/}
                                {categories.find(
                                    category =>
                                        category.id === petition.categoryId
                                )?.name} {/* Use optional chaining to select the 'name' value, if the category exists */}
                                {/* see https://www.geeksforgeeks.org/how-to-use-optional-chaining-with-arrays-and-functions-in-typescript/ */}
                            </TableCell>

                            {/* Petition owner's profile picture */}
                            <TableCell className="petition-owner-tablecell">
                                {/* Clicking the owner's name links to their user page */}
                                <Link to={`/users/${petition.ownerId}`}>
                                    {/* If owner has no image (imageUrl is null),
                                     display the default image */}
                                    <img src={ownerImageUrl || defaultImage}
                                         alt="Owner Profile Picture"
                                    />
                                </Link>
                            </TableCell>

                            {/* Petition owner name */}
                            <TableCell>
                                <div className="name-link">
                                    {/* Clicking the owner's name links to their user page */}
                                    <Link to={`/users/${petition.ownerId}`}>
                                        {petition.ownerFirstName} {petition.ownerLastName}
                                    </Link>
                                </div>
                            </TableCell>

                        </TableRow>
                    );
                })
            );
            setPetitionRows(rows);
        };

        createPetitionRows();
    }, [petitions]);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {headCells.map((headCell) => (
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
                    {/* Display the petition rows */}
                    {petitionRows}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PetitionList;