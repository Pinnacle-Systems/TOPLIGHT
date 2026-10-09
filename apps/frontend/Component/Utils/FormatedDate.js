import moment from "moment";

  const today = new Date();
const day = String(today.getDate()).padStart(2, '0');
const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
const year = today.getFullYear();

export const formattedDate = `${day}/${month}/${year}`;


export const Current_moment_dataformat=(format)=>{

 var current_date = moment(formattedDate,"DD/MM/YYYY")


 return current_date?.format(format)


}