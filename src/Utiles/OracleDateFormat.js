function formatDateToOracle(dateInput) {
  const pad = (n) => String(n).padStart(2, '0');

  try {
    if (!dateInput) throw new Error("No date input provided");

    const date = new Date(dateInput);

    if (isNaN(date.getTime())) throw new Error("Invalid date input");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.warn("Date formatting error:", error.message);
    return null; // Return null or handle gracefully
  }
}

export default formatDateToOracle;
