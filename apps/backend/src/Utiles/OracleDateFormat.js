/**
 * Formats a Date to "YYYY-MM-DD HH:mm:ss" in IST (UTC+5:30).
 *
 * WHY EXPLICIT OFFSET:
 *   The production server runs in UTC timezone, so date.getHours() returns
 *   UTC — identical to getUTCHours(). Using getHours() alone is NOT safe.
 *   We manually shift by +330 minutes and format via UTC getters so the
 *   result is always correct IST time on any server timezone.
 */
function formatDateToOracle(dateInput) {
  const pad = (n) => String(n).padStart(2, '0');

  try {
    if (!dateInput) throw new Error('No date input provided');

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) throw new Error('Invalid date input');

    // Shift timestamp by IST offset (+05:30 = 330 minutes = 19800 seconds)
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const ist = new Date(date.getTime() + IST_OFFSET_MS);

    // Now read as UTC on the shifted value → gives IST wall-clock time
    const year    = ist.getUTCFullYear();
    const month   = pad(ist.getUTCMonth() + 1);
    const day     = pad(ist.getUTCDate());
    const hours   = pad(ist.getUTCHours());
    const minutes = pad(ist.getUTCMinutes());
    const seconds = pad(ist.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.warn('Date formatting error:', error.message);
    return null;
  }
}

export default formatDateToOracle;
