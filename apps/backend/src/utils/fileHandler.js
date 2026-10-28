import fs from 'fs';
import path from 'path';

/**
 * Ensures the target Locations directory exists and executes the provided callback.
 * @param {(dirPath: string) => Promise<void> | void} callback
 * @returns {Promise<any>}
 */
export default async function FileHandlerAndWrite(callback) {
  const locDir = path.join(process.cwd(), 'Locations');
  if (!fs.existsSync(locDir)) {
    fs.mkdirSync(locDir, { recursive: true });
  }
  return callback(locDir);
}
