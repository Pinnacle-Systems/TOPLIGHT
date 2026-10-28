import fs from 'fs';
import path from 'path';
import nodeCron from 'node-cron';
import { gzipSync } from 'fflate';
import { PrismaClient } from '../generated/prisma/client.js';
import FileHandlerAndWrite from '../utils/fileHandler.js';
import formatDateToOracle from '../utils/oracleDateFormat.js';

/**
 * locationArchive.cron.js
 *
 * Nightly cron job running at 23:50.
 * Exports daily employee GPS tracking records into a compressed GZIP archive (.text.gz)
 * and purges archived location data from the database to keep table sizes lean.
 */
export function scheduleLocationArchiveCron() {
  nodeCron.schedule('50 23 * * *', async () => {
    const prisma = new PrismaClient();
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const currentDate = formatDateToOracle(new Date()).split(' ')[0];

    console.log(`[Cron:LocationArchive] Starting nightly archive for ${currentDate}...`);

    try {
      await FileHandlerAndWrite(async (dirPath) => {
        const jsonFilePath = path.join(dirPath, `${currentDate}.json`);
        const compressedFilePath = path.join(dirPath, `${currentDate}.text.gz`);

        const jsonWriteStream = fs.createWriteStream(jsonFilePath);
        const batchSize = 1000;
        let skip = 0;
        let recordCount = 0;
        let isFirstRecord = true;

        jsonWriteStream.write('[');

        try {
          while (true) {
            const records = await prisma.location.findMany({
              skip,
              take: batchSize,
              where: { createdAt: { gte: startOfDay, lte: endOfDay } },
            });

            if (records.length === 0) break;

            for (const record of records) {
              const prefix = isFirstRecord ? '' : ',\n';
              const line = prefix + JSON.stringify(record);

              if (!jsonWriteStream.write(line)) {
                await new Promise((resolve) => jsonWriteStream.once('drain', resolve));
              }

              recordCount++;
              isFirstRecord = false;
            }

            skip += batchSize;
          }

          jsonWriteStream.write(']');
          await new Promise((resolve) => jsonWriteStream.end(resolve));

          const fileData = await fs.promises.readFile(jsonFilePath);
          const compressed = gzipSync(fileData, { level: 9 });
          await fs.promises.writeFile(compressedFilePath, compressed);

          console.log(`[Cron:LocationArchive] ✅ Successfully archived ${recordCount} records. Compressed size: ${compressed.length} bytes.`);
        } finally {
          try {
            if (fs.existsSync(jsonFilePath)) {
              fs.unlinkSync(jsonFilePath);
              await prisma.location.deleteMany({});
              console.log('[Cron:LocationArchive] ✅ Cleaned up temporary JSON file and purged database records.');
            }
          } catch (cleanupError) {
            console.error('[Cron:LocationArchive] ❌ Error cleaning up JSON file:', cleanupError);
          }
        }
      });
    } catch (error) {
      console.error('[Cron:LocationArchive] ❌ Error in location archive cron job:', error);
    } finally {
      await prisma.$disconnect().catch((e) => console.error('[Cron:LocationArchive] Error disconnecting Prisma:', e));
    }
  });

  console.log('[Cron] Location archive cron job registered (runs daily at 23:50).');
}

export default scheduleLocationArchiveCron;

