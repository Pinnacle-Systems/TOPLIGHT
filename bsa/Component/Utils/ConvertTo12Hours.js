export function convertTo12HourFormat(time24h) {
  // Check if input is valid
  if (!time24h || typeof time24h !== 'string') return '';
  
  // Extract hours and minutes
  const [hours, minutes] = time24h.split(':');
  
  // Convert to numbers
  const hourNum = parseInt(hours, 10);
  const minuteNum = minutes ? parseInt(minutes, 10) : 0;
  
  // Determine AM/PM
  const period = hourNum >= 12 ? 'pm' : 'am';
  
  // Convert hour to 12-hour format
  let hour12 = hourNum % 12;
  hour12 = hour12 === 0 ? 12 : hour12; // Handle midnight (0 becomes 12)
  
  // Format minutes with leading zero if needed
  const formattedMinutes = String(minuteNum).padStart(2, '0');
  
  return `${hour12}:${formattedMinutes} ${period}`;
}