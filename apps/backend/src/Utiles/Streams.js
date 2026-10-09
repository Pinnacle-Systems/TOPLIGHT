
import fs from "fs"

export const __readStream=(path,options)=>fs.createReadStream(path,options)
export const __WriteStream=(path,options)=>fs.createWriteStream(path,options)

