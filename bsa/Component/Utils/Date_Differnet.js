import moment from "moment";
import { Alert } from "react-native";

export const calculateDateDifference = (startDate, endDate, inclusive = true, useCurrentDate = false) => {
  // If useCurrentDate is true, replace endDate with current date
  const effectiveEndDate = useCurrentDate ? moment().format('DD/MM/YYYY') : endDate;

  if (!startDate || !effectiveEndDate) {
    console.error("One or both date inputs are undefined.");
    return 0;
  }

  const start = moment(startDate, 'DD/MM/YYYY', true);
  const end = moment(effectiveEndDate, 'DD/MM/YYYY', true);

  if (!start.isValid() || !end.isValid()) {
    console.error("Invalid date format. Expected DD/MM/YYYY.");
    return 0;
  }

  // Calculate difference in days
  let difference = end.diff(start, 'days');
  
  // Add one day if inclusive is true (to include both start and end dates)
  if (inclusive) {
    difference += 1;
  }

  return difference;
};