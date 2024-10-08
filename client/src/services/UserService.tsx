// User Service
// contains methods for to getting or modifying user-related data

import axios from 'axios';

// Function to fetch user data
export const getUser = async (id: string | undefined, savedAuthToken: string | null,
                              setUser: Function,
                              setErrorFlag: Function, setErrorMessage: Function) => {
    // send a request to GET the user with the given id
    axios.get<User>(`http://localhost:4941/api/v1/users/${id}`, {
        headers: {
            // Include the savedAuthToken in the request header as X-Authorization
            'X-Authorization': savedAuthToken
        }
    })
        // if the request was successful
        .then((response) => {
            setErrorFlag(false);
            setErrorMessage("");
            setUser(response.data); // Set user data in state
        })
        .catch((error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString()); // Set error message
        });
};


// retrieve the saved image of a user, given by their id
export const getUserImage = async (id: string | undefined) => {
    try {
        // send a request to retrieve the user's image
        const response = await axios.get(
            `http://localhost:4941/api/v1/users/${id}/image`, {
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
        // if user has no image, or user's image cannot be retrieved, return null
        return null;
    }
};


// Function to edit user details
export const editUser = async (id: string | undefined, savedAuthToken: string | null,
                               editUserDetails: Partial<User>, setErrorFlag: (flag: boolean) => void,
                               setErrorMessage: (message: string) => void, setSnackMessage: (message: string) => void,
                               setSnackOpen: (isOpen: boolean) => void,
                               setOpenEditDialog: (isOpen: boolean) => void) => {
    axios.patch(`http://localhost:4941/api/v1/users/${id}`, editUserDetails, {
        headers: {
            // Include the savedAuthToken in the request header as X-Authorization
            'X-Authorization': savedAuthToken
        }
    })
        .then(() => {
            setOpenEditDialog(false); // Close edit dialog
            setSnackMessage("User details updated successfully"); // Set success message for snackbar
            setSnackOpen(true); // Open snackbar
        })
        .catch((error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString()); // Set error message
        });
};


// Function to handle uploading an image for a user profile picture
export const changeUserImage = async (uploadedImage: File,
                                 id: string | undefined, savedAuthToken: string | null,
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
            axios.put(`http://localhost:4941/api/v1/users/${id}/image`, fileData, {
                headers: {
                    'X-Authorization': savedAuthToken,
                    // Set the content type based on the type of the image file
                    'Content-Type': uploadedImage.type
                }
            })
                .then(() => {
                    // Refresh user image after successful upload
                    getUserImage(id)
                        .then(() => {
                            resolve();
                        })
                    // Display success message in Snackbar
                    setSnackMessage("Image uploaded successfully");
                    setSnackOpen(true);
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

// Function to handle uploading an image for a user (when creating a user)
export const uploadUserImage = async (uploadedImage: File,
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
            await axios.put(`http://localhost:4941/api/v1/users/${id}/image`, fileData, {
                headers: {
                    'X-Authorization': savedAuthToken,
                    // Set the content type based on the type of the image file
                    'Content-Type': uploadedImage.type
                }
            })
                .then(() => {
                    // Refresh petition image after successful upload
                    getUserImage(id.toString());
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