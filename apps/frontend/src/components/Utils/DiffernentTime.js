import moment from "moment";
export const calculateTimeDifference = (startTime, endTime) => {
    const format = 'HH:mm';
    const start = moment(startTime?.split(" ")[0], format);
    const end = moment(endTime?.split(" ")[0], format);
    const duration = moment.duration(end.diff(start));
  
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
  
    return `${hours}h ${minutes}m`;
  };
  