import 'dotenv/config';
import http from 'http';
import { initializeDns } from './src/config/dns.config.js';
import { prisma_Connector } from './src/config/prisma.config.js';
import { createApp } from './src/app.js';
import { initializeSocket } from './src/sockets/socket.handler.js';
import { scheduleLocationArchiveCron } from './src/jobs/locationArchive.cron.js';
import { logServiceError } from './src/utils/logger.js';

// ── 0. Process-Level Global Error Catch ──────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logServiceError('Process:UnhandledRejection', reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', (error) => {
  logServiceError('Process:UncaughtException', error);
});

// ── 1. Initialize Network & DNS ──────────────────────────────────────────────
initializeDns();

// ── 2. Create Express Application ────────────────────────────────────────────
const app = createApp();

// ── 3. Create HTTP & WebSocket Server ────────────────────────────────────────
const server = http.createServer(app);
const io = initializeSocket(server);

// ── 4. Schedule Background Jobs ──────────────────────────────────────────────
scheduleLocationArchiveCron();

// ── 5. Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[TopLight] 🚀 Server is running on port ${PORT}.`);
});

// ── Backward-Compatibility Exports ───────────────────────────────────────────
export { prisma_Connector };
export { getCommonData } from './src/controllers/common.controller.js';
export { app, server, io };
export default server;
