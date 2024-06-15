/**
 * Utility function to format a URL string
 * - Trims white spaces on both ends
 * - Replaces white spaces in between characters with "-"
 * - Lowercases the whole string
 * 
 * @param {string} inputString - The string to be formatted
 * @returns {string} - The formatted string
 */
function toURLString(inputString) {
    if (typeof inputString !== 'string') {
        throw new TypeError('Input must be a string');
    }

    // Trim white spaces on both ends, replace spaces in between with "-", and lowercase the string
    const formattedString = inputString.trim().replace(/\s+/g, '-').toLowerCase();

    return formattedString;
}

/**
 * Utility function to format a dashed string
 * - Replaces dashes with white spaces
 * - Capitalizes each word
 * 
 * @param {string} inputString - The string to be formatted
 * @returns {string} - The formatted string
 */
function toTitleString(inputString) {
    if (typeof inputString !== 'string') {
        throw new TypeError('Input must be a string');
    }

    // Replace dashes with spaces and capitalize each word
    const formattedString = inputString
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return formattedString;
}

module.exports = {
    toURLString,
    toTitleString
}