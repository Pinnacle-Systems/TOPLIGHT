import moment from 'moment';

export function parseDateStringToISO(dateStr) {
  try {
    if (typeof dateStr === 'string' && dateStr.trim() !== '') {
      const parsed = moment(dateStr, 'DD/MM/YYYY', true); // strict parsing
      if (parsed.isValid()) {
        // Append current time
        const now = moment();
        parsed.set({
          hour: now.hour(),
          minute: now.minute(),
          second: now.second()
        });
        return parsed.format('YYYY-MM-DD HH:mm:ss'); // MySQL & Oracle compatible
      } else {
        console.warn("Invalid date format:", dateStr);
      }
    }
    return "";
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return "";
  }
}
