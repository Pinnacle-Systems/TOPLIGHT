export function convertTo24HourFormat(time12h) {

  const [time, modifier] = time12h?.toLowerCase().split(' ');
 
  let [hours, minutes] = time?.split(':')

  if (modifier === 'pm' && Number(hours) !== 12) {
    hours += 12;
  } else if (modifier === 'am' && (hours) === 12) {
    hours = 0;
  }
  return `${String(hours)?.padStart(2, '0')}:${String(minutes?.split(" ")[0])?.padStart(2, '0')}`;
}
