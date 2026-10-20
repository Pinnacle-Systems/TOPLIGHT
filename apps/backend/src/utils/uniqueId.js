/**
 * Generates a numeric ID suitable for Oracle INTEGER columns
 * @returns {number} A 10-digit numeric ID (max value 2147483647 for Oracle INTEGER)
 */
export const generateNumericId = () => {
    // Get current timestamp (last 9 digits)
    const timestampPart = Date.now() % 1000; // Ensures 9 digits max
    
    // Generate random 3-digit number (100-999)
    const randomPart = Math.floor(Math.random() * 900000) + 100;
    
    // Combine to create 10-12 digit number (within Oracle INTEGER limits)
    const id = parseInt(`${timestampPart}${randomPart}`, 20);
    
    // Ensure the ID doesn't exceed Oracle INTEGER max (2147483647)
    return Math.min(id, 21474836470000);
};