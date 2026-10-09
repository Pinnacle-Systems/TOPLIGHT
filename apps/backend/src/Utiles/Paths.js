import path from "path";
import formatDateToOracle from "./OracleDateFormat.js";



const currentDate = formatDateToOracle(new Date()).split(' ')[0];
export const jsonFilePaths =(date)=> date ? path.join(process.cwd(),".",'Locations', `${date}.json`) :  path.join(process.cwd(),".",'Locations', `${currentDate}.json`);
export const compressedFilePaths=(date)=> date ? path.join(process.cwd(),".",'Locations', `${date}.text.gz`)  : path.join(process.cwd(),".",'Locations', `${currentDate}.text.gz`)