/**
 * Formats a Date to "YYYY-MM-DD HH:mm:ss" in UTC.
 * All time fields stored by the backend (in_time, out_time, atttime)
 * are UTC strings so the frontend can safely apply a UTC→local conversion.
 */
function formatDateToOracle(dateInput) {
  const pad = (n) => String(n).padStart(2, '0');

  try {
    if (!dateInput) throw new Error("No date input provided");

    const date = new Date(dateInput);

    if (isNaN(date.getTime())) throw new Error("Invalid date input");

    const year    = date.getUTCFullYear();
    const month   = pad(date.getUTCMonth() + 1); // Months are 0-based
    const day     = pad(date.getUTCDate());
    const hours   = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.warn("Date formatting error:", error.message);
    return null; // Return null or handle gracefully
  }
}

export default formatDateToOracle;
