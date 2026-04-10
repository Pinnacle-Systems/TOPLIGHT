export function convert12to24(time12) {
  const time = String(time12).replace(/\s/,",")?.split(',');
  let [hours, minutes,seconds] = time[0].split(':');
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);


  if (hours === 12) {
    hours = 0;
  }

  if (time[1].toUpperCase() === 'PM') {
    hours += 12;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds || '00')}`;
}

export function convert24to12(time24) {
  let [hours, minutes] = time24.split(':');
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  const modifier = hours < 12 || hours === 24 ? 'AM' : 'PM';
  hours = hours % 12 || 12;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`;
}