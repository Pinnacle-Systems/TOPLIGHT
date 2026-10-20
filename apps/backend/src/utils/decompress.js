import { gunzipSync } from 'fflate';
import fs from "fs"
export function decompressFile_data(inputPath, outputPath,res) {
  try {
    const compressedData = fs.readFileSync(inputPath);
    const decompressed = gunzipSync(compressedData);
    fs.writeFileSync(outputPath, decompressed);
    return true;
  } catch (error) {
    console.error('Decompression failed:', error);
   // res.json({status:0,data:[]})
    return false;
  }
}