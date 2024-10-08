// Petition Service
// contains methods for to getting or modifying petition-related data

import axios from "axios";



// Function to fetch petitions from API, which match the specifications given
export const getPetitions = async (searchQuery: string, selectedCategories: number[],
                                   supportCostQuery: string, sortQuery: string,
                                   setPetitions: Function, setErrorFlag: Function,
                                   setErrorMessage: Function, count?: number,
                                   startIndex?: number,
                                   ) => {
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

    // If count is provided, add it to the queryParams
    if (count !== undefined) {
        queryParams['count'] = count.toString();
    }

    // If startIndex is provided, add it to the queryParams
    if (startIndex !== undefined) {
        queryParams['startIndex'] = startIndex.toString();
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

// Function to fetch petition data
export const getPetition = async (id: string | undefined, savedAuthToken: string | null,
                                  setPetition: Function,
                                  setErrorFlag: Function, setErrorMessage: Function) => {
    axios.get<PetitionFull>(`http://localhost:4941/api/v1/petitions/${id}`, {
        headers: {
            'X-Authorization': savedAuthToken
        }
    })
        .then((response) => {
            setErrorFlag(false);
            setErrorMessage("");
            setPetition(response.data); // Set petition data in state
        })
        .catch((error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString()); // Set error message
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
        // if petition has no image, or the petition's image cannot be retrieved, return null
        return null;
    }
}

// Function to add a new petition, returns the petition id if successful, otherwise null
export const createPetition = async  (savedAuthToken: string | null,
                                     title: string,
                                     description: string,
                                     categoryId: number,
                                     // supportTiers is an array made up of objects following this format:
                                     supportTiers: { title: string; description: string; cost: string }[],
                                     setErrorFlag: Function,
                                     setErrorMessage: Function,
                                     ): Promise<number | null> => {
    // initialize the variable to return
    let createdPetitionId: number | null = null;

    // Make a post request to the petition endpoint with the entered in values
    await axios.post("http://localhost:4941/api/v1/petitions", {
        title,
        description,
        categoryId,
        supportTiers
    }, {
        headers: {
            'X-Authorization': savedAuthToken
        }
    })
        // if petition creation was successful
        .then((response) => {
            console.log("Petition successfully created ", response.data);
            setErrorFlag(false);
            setErrorMessage("");
            // save the id of the created petition
            createdPetitionId = response.data.petitionId;
        })
        // if there was an error with the registration
        .catch((error) => {
            console.error("Petition creation failed: ", error);
            // if the response had an error message
            setErrorFlag(true);
            setErrorMessage(error.toString());
            return null;
        });
    return createdPetitionId;
};

// Function to handle uploading a new image for an existing petition
export const changePetitionImage = async (uploadedImage: File,
                                      petitionId: number, savedAuthToken: string | null,
                                      setErrorFlag: (flag: boolean) => void, setErrorMessage: (message: string) => void,
                                      setSnackMessage: (message: string) => void, setSnackOpen: (isOpen: boolean) => void,
                                    ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        // Resource used for turning the uploaded image into binary data
        // (which is what the image needs to be sent as to the server)
        // https://developer.mozilla.org/en-US/docs/Web/API/FileReader

        // Create a FileReader object to read the file content
        const fileReader = new FileReader();

        // Start reading the contents of the image file, with the result containing
        // an ArrayBuffer representing the file's data
        fileReader.readAsArrayBuffer(uploadedImage);

        // after file reading is complete
        fileReader.onload = () => {
            const fileData = fileReader.result as ArrayBuffer;
            // Send a PUT request to set the user's image,
            // with the raw binary data in the request body
            axios.put(`http://localhost:4941/api/v1/petitions/${petitionId}/image`, fileData, {
                headers: {
                    'X-Authorization': savedAuthToken,
                    // Set the content type based on the type of the image file
                    'Content-Type': uploadedImage.type
                }
            })
                .then(() => {
                    // Refresh petition image after successful upload
                    getPetitionImage(petitionId)
                        .then(() => {
                            resolve();
                        })
                    // Display success message in Snackbar
                    setSnackMessage("Image uploaded successfully");
                    setSnackOpen(true);
                    console.log("done");
                })
                .catch((error) => {
                    // Set error flag and message if upload fails
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                    reject(error);
                });
        };

        // if there was an error reading the file
        fileReader.onerror = () => {
            // Set error flag and message
            setErrorFlag(true);
            setErrorMessage("Error reading the file.");
            reject(new Error("Error reading the file."));
        };
    });
};

// Function to handle uploading an image for a petition (when creating a petition)
export const uploadPetitionImage = async (uploadedImage: File,
                                      id: number, savedAuthToken: string | null,
                                      setErrorFlag: (flag: boolean) => void, setErrorMessage: (message: string) => void
                                      ) => {
    // wrap everything in a promise to ensure that everything must be finished before moving on
    return new Promise<void>((resolve, reject) => {

        // Resource used for turning the uploaded image into binary data
        // (which is what the image needs to be sent as to the server)
        // https://developer.mozilla.org/en-US/docs/Web/API/FileReader

        // Create a FileReader object to read the file content
        const fileReader = new FileReader();

        // Start reading the contents of the image file, with the result containing
        // an ArrayBuffer representing the file's data
        fileReader.readAsArrayBuffer(uploadedImage);

        // after file reading is complete
        fileReader.onload = async () => {
            const fileData = fileReader.result as ArrayBuffer;
            // Send a PUT request to set the petition's image,
            // with the raw binary data in the request body
            await axios.put(`http://localhost:4941/api/v1/petitions/${id}/image`, fileData, {
                headers: {
                    'X-Authorization': savedAuthToken,
                    // Set the content type based on the type of the image file
                    'Content-Type': uploadedImage.type
                }
            })
                .then(() => {
                    // Refresh petition image after successful upload
                    getPetitionImage(id);
                    // resolve the promise
                    resolve();
                })
                .catch((error) => {
                    // Set error flag and message if upload fails
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                    // reject the promise
                    reject();
                });
        };

        // if there was an error reading the file
        fileReader.onerror = () => {
            // Set error flag and message
            setErrorFlag(true);
            setErrorMessage("Error reading the file.");
        };
    });
};


// Function to fetch number of petitions matching the given specifications
// Similar to getPetitions but does not apply pagination, and only returns the number of results
export const getNumberOfPetitions = async (
    searchQuery: string,
    selectedCategories: number[],
    supportCostQuery: string,
    sortQuery: string
): Promise<number> => {
    // Initialize an object to hold the query parameters
    const queryParams: Record<string, string | number[]> = {};

    // Check if there's a search query
    if (searchQuery !== "") {
        queryParams['q'] = searchQuery;
    }

    // Check if there are any categories selected
    if (selectedCategories.length !== 0) {
        queryParams['categoryIds'] = selectedCategories;
    }

    // Check if a maximum support cost filter query is given
    if (supportCostQuery !== "") {
        queryParams['supportingCost'] = supportCostQuery;
    }

    // Check if a sorting method was selected
    if (sortQuery !== "") {
        queryParams['sortBy'] = sortQuery;
    }

    try {
        const response = await axios.get('http://localhost:4941/api/v1/petitions', {
            params: queryParams
        });
        console.log("Number of petitions: ", response.data.petitions.length)
        return response.data.petitions.length; // Return the number of petitions
    } catch (error) {
        console.error('Error fetching number of petitions:', error);
        return 0; // Return 0 in case of an error
    }
};

// Function to get the minimum supporting cost for a given petition's tiers
export const getPetitionSupportCost = async (petitionId: number): Promise<number> => {
    try {
        const response = await axios.get<PetitionFull>(
            `http://localhost:4941/api/v1/petitions/${petitionId}`
        );
        const petition = response.data;
        // Map through each of the petition's support tiers to get their cost, and get the minimum value
        const minCost = Math.min(
            ...petition.supportTiers.map(tier => tier.cost)
        );
        return minCost;
    } catch (error) {
        console.error('Error fetching number of petitions:', error);
        return 0; // Return 0 in case of an error
    }
};


// Function to add a new support tier to an existing petition
export const createSupportTier = async  (petitionId: number, savedAuthToken: string | null,
                                      title: string, description: string, cost: number,
                                      setErrorFlag: Function, setErrorMessage: Function,
                                      setSnackMessage: (message: string) => void, setSnackOpen: (isOpen: boolean) => void
) => {
    // Make a post request to the petition endpoint with the entered in values
    await axios.put(`http://localhost:4941/api/v1/petitions/${petitionId}/supportTiers`, {
        title,
        description,
        cost
    }, {
        headers: {
            'X-Authorization': savedAuthToken
        }
    })
        // if support tier creation was successful
        .then((response) => {
            console.log("Support tier successfully added ", response.data);
            setSnackMessage("Support tier added successfully"); // Set success message for snackbar
            setSnackOpen(true); // Open snackbar
            setErrorFlag(false);
        })
        // if there was an error with the creation
        .catch((error) => {
            console.error("Support tier creation failed: ", error);
            // if the response had an error message
            setErrorFlag(true);
            setErrorMessage(error.toString());
        });
};

// function to remove a given support tier
export const removeSupportTier = async  (petitionId: number, tierId: number, savedAuthToken: string | null,
                                         setErrorFlag: Function, setErrorMessage: Function,
                                         setSnackMessage: (message: string) => void, setSnackOpen: (isOpen: boolean) => void
) => {
    // Make a post request to the petition endpoint with the entered in values
    await axios.delete(`http://localhost:4941/api/v1/petitions/${petitionId}/supportTiers/${tierId}`, {
        headers: {
            'X-Authorization': savedAuthToken
        }
    })
        // if support tier deletion was successful
        .then((response) => {
            console.log("Support tier successfully deleted ", response.data);
            setSnackMessage("Support tier deleted successfully"); // Set success message for snackbar
            setSnackOpen(true); // Open snackbar
            setErrorFlag(false);
        })
        // if there was an error with the deletion
        .catch((error) => {
            console.error("Support tier deletion failed: ", error);
            // if the response had an error message
            setErrorFlag(true);
            setErrorMessage(error.toString());
        });
}

// Given the category id and owner id of a petition, returns petitions which are the same in either
export const getSimilarPetitions = async (petitionId: number, categoryId: number,
                                          ownerId: number, setSimilarPetitions: Function) => {
    console.log("category id: ", categoryId, "owner id: ", ownerId);

    try {
        // get petitions with matching category ID
        const categoryResponse = await axios.get('http://localhost:4941/api/v1/petitions', {
            params: { categoryIds: categoryId }
        });

        // get petitions with matching owner ID
        const ownerResponse = await axios.get('http://localhost:4941/api/v1/petitions', {
            params: { ownerId: ownerId }
        });

        // Combine results together
        const combinedPetitions = [...categoryResponse.data.petitions, ...ownerResponse.data.petitions];

        // Remove any duplicates by making a set with the ids, and then turning it back into a petition array
        const uniquePetitions = Array.from(
            // Create a Set of unique petitionId values from the combinedPetitions array
            new Set(
                // Map the combinedPetitions array to an array of petitionId values
                combinedPetitions.map(petition => petition.petitionId)
            )
        ).map(
            // For each unique petitionId, find the corresponding petition object
            id => combinedPetitions.find(
                petition => petition.petitionId === id
            )
        );

        // Filter out the petition with the given petitionId
        const filteredPetitions = uniquePetitions.filter(petition => petition.petitionId !== petitionId);

        // save the result to similarPetitions
        setSimilarPetitions(filteredPetitions);
    } catch (error) {
        console.error("Fetching similar petitions failed: ", error);
    }
};


// Function to support a petition's support tier, given by its id
export const supportGivenTier = async  (petitionId: number, savedAuthToken: string | null,
                                         supportTierId: number, message: string | null,
                                         setErrorFlag: Function, setErrorMessage: Function,
                                         setSnackMessage: (message: string) => void, setSnackOpen: (isOpen: boolean) => void
) => {
    console.log("supporting tier with id: ", supportTierId)
    // Make a post request to the petition endpoint with the entered in values
    await axios.post(`http://localhost:4941/api/v1/petitions/${petitionId}/supporters`, {
        supportTierId: supportTierId,
        message: message
    }, {
        headers: {
            'X-Authorization': savedAuthToken
        }
    })
        // if support tier was successfully supported
        .then((response) => {
            console.log("Tier successfully supported ", response.data);
            setSnackMessage("Tier successfully supported"); // Set success message for snackbar
            setSnackOpen(true); // Open snackbar
            setErrorFlag(false);
        })
        // if there was an error with the creation
        .catch((error) => {
            console.error("Failed to support the tier: ", error);
            // if the response had an error message
            setErrorFlag(true);
            setErrorMessage(error.toString());
        });
};

// Get all petitions which belong to an owner, given by their user id
export const getPetitionsWithOwnerId = async (ownerId: number) => {
    try {
        // get petitions with matching owner ID
        const response = await axios.get(
            'http://localhost:4941/api/v1/petitions', {
            params: { ownerId: ownerId }
        });
        return response.data.petitions;
    } catch (error) {
        console.error("Fetching owned petitions failed: ", error);
    }
};

// Get all petitions which are supported by a user, given by their user id
export const getPetitionsSupportedByUserId = async (userId: number) => {
    try {
        const response = await axios.get(
            'http://localhost:4941/api/v1/petitions', {
                params: { supporterId: userId }
            });
        return response.data.petitions;
    } catch (error) {
        console.error("Fetching supported petitions failed: ", error);
    }
};