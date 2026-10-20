
import fs from "fs"



import  path, { dirname } from "path"
import { fileURLToPath } from "url";
import { isArray } from "util";


const __filename = fileURLToPath(import.meta.url);
const dirname_dir=dirname(__filename)


export default function FileHandlerAndWrite(callback){
 
  var Loc_dir=path.join(process.cwd(), 'Locations');
   if(!fs.existsSync(Loc_dir)){
      fs.mkdirSync(Loc_dir, { recursive: true })
      callback(Loc_dir)
   }

    callback(Loc_dir)

}