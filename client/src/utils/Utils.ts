// Utils.ts
// file containing methods for general purpose use

// Function to convert datetime (SQL date format), to DDMMYYYY (NZ Time)
// Resource used: https://www.geeksforgeeks.org/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript/
export const datetimeToDDMMYYYY = (datetime: string) => {
    // convert the datetime string into an actual date
    const date = new Date(datetime);
    // extract the day, month, and year from the date
    let day: string = date.getDate().toString();
    let month: string = (date.getMonth() + 1).toString(); // +1 is needed as months are zero-indexed
    const year: string = date.getFullYear().toString();
    // if day or month is single-digit (i.e. under 10), add a 0 in front of it
    if (parseInt(day, 10) < 10) {
        day = '0' + day;
    }
    if (parseInt(month, 10) < 10) {
        month = '0' + month;
    }
    // return a string of the date in DD/MM/YYYY
    return `${day}/${month}/${year}`;
};
