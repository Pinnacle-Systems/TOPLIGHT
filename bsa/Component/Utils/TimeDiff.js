export function calculateTimeDiff(startTime, endTime) {
  if (!startTime || !endTime || typeof startTime !== 'string' || typeof endTime !== 'string') {
    console.error('Invalid input types');
    return null;
  }

  const parseTime = (timeStr) => {
    const time = timeStr.trim();
    console.log('Parsing:', time);
    
    let hours, minutes, period;
    
    // Check for AM/PM
    const hasPeriod = /(AM|PM)/i.test(time);
    const parts = time.split(/:|\s/).filter(Boolean);
    
    if (hasPeriod && parts.length !== 3) {
      console.error('Missing time parts with AM/PM');
      return null;
    } else if (!hasPeriod && parts.length !== 2) {
      console.error('Missing time parts in 24h format');
      return null;
    }
    
    try {
      if (hasPeriod) {
        [hours, minutes, period] = parts;
        period = period.toUpperCase();
      } else {
        [hours, minutes] = parts;
      }
      
      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.error('NaN in time parsing');
        return null;
      }
      
      // Convert 12h to 24h
      if (hasPeriod) {
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
      }
      
      // Validate ranges
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error('Time out of range');
        return null;
      }
      
      return { hours, minutes };
    } catch (e) {
      console.error('Parsing error:', e);
      return null;
    }
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  if (!start || !end) {
    console.error('Failed to parse one or both times');
    return null;
  }

  // ... rest of your calculation ...
}