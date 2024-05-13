// Petition Service
// contains methods for to getting or modifying petition-related data

import axios from "axios";

// Function to fetch petitions from API, which match the specifications given
export const getPetitions = async (searchQuery: string, selectedCategories: number[],
                                   supportCostQuery: string, sortQuery: string,
                                   setPetitions: Function, setErrorFlag: Function,
                                   setErrorMessage: Function) => {
    // Initialize an object to hold the query parameters
    // Query parameters will be passed in only if they are given
    const queryParams: Record<string, string | number[]> = {};

    // Check if there's a search query
    // If there is no search query/the field is empty, do not add it
    if (searchQuery !== "") {
        queryParams['q'] = searchQuery; // Add the search query parameter
    }

    // check if there are any categories selected
    if (selectedCategories.length !== 0) {
        // if so, pass in the array of selected category ids as parameters
        queryParams['categoryIds'] = selectedCategories;
    }

    // If there is a maximum support cost filter query given
    if (supportCostQuery !== "") {
        // pass in the support cost query directly, it is parsed by backend
        queryParams['supportingCost'] = supportCostQuery;
    }

    // check if a sorting method was selected
    if (sortQuery !== "") {
        queryParams['sortBy'] = sortQuery; // add as the sortBy parameter
    }

    axios.get('http://localhost:4941/api/v1/petitions', {
        // parameters to filter the petition list with
        params: queryParams
    })
        .then((response) => {
            setErrorFlag(false);
            setErrorMessage("");
            setPetitions(response.data.petitions);
        }, (error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString());
        });
};

// Function to get the hero image for the petition with the given id
export const getPetitionImage = async ( id: number ) => {
    try {
        // send a request to retrieve the given petition's image
        const response = await axios.get(
            `http://localhost:4941/api/v1/petitions/${id}/image`, {
                // treat the response as binary data
                responseType: 'arraybuffer'
            });
        // Create blob object containing the image data, along with its MIME (content) type
        const blob = new Blob([response.data], {
            type: response.headers['content-type']
        });
        // Create an image url out of the blob object, and return it
        return URL.createObjectURL(blob);
    } catch (error) {
        // if petition has no image, or the petition's image cannot be retrieved
        return;
    }
}

// Function to add a new petition
export const createPetition = async (title: string,
                                     description: string,
                                     categoryId: number,
                                     supportTiers: SupportTier[],
                                     setErrorFlag: Function,
                                     setErrorMessage: Function) => {
    // Make a post request to the petition endpoint with the entered in values
    axios.post("http://localhost:4941/api/v1/petitions", {
        title,
        description,
        categoryId,
        supportTiers
    })
        // if petition creation was successful
        .then((response) => {
            console.log("Petition successfully created ", response.data);
            setErrorFlag(false);
            setErrorMessage("");
        })
        // if there was an error with the registration
        .catch((error) => {
            console.error("Petition creation failed: ", error);
            // if the response had an error message
            if (error.response && error.response.data) {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            } else { // if not, just set a generic error message
                setErrorFlag(true);
                setErrorMessage(error.toString());

            }
        });
};