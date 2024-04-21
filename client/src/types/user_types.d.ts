/**
 * user_types.d.ts
 *
 * This file defines TypeScript types for representing user data structures.
 * It specifies the structure of a user object.
 *
 * @module user_types
 */

// Define a custom type named User
// this represents the structure of a user object
type User = {
    // Numeric field representing the user's ID
    userId: number;
    // String field representing the user's email
    email: string;
    // String field representing the user's first name
    firstName: string;
    // String field representing the user's last name
    lastName: string;
    // Optional (?) string field representing the user's image filename
    imageFilename?: string;
    // String field representing the user's password hash
    password: string;
    // Optional (?) string field representing the user's authentication token
    authToken?: string;
};
