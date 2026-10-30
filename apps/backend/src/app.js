import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import {
  commonMast,
  misDashboard,
  user,
  Leave,
  Permission,
  Notification,
  Role,
  Onduty,
  attendance,
} from './routes/index.js';

import { getCommonData, getRootInfo, getHealthStatus } from './controllers/commonController.js';
import { logServiceError } from './utils/logger.js';

// BigInt JSON serialization patch
BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString(), 10);
};

export function createApp() {
  const app = express();
  const currentDir = dirname(fileURLToPath(import.meta.url));

  // ── Core Middleware ────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  app.use(
    cors({
      origin: '*',
      allowedHeaders: ['Content-Type', 'Authorization', 'compcode', 'Compcode', 'COMPCODE'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      exposedHeaders: ['Content-Disposition'],
    })
  );

  // ── Static Assets ──────────────────────────────────────────────────────────
  const webBuildPath = path.join(currentDir, '..', 'web-build');
  const uploadsPath = path.join(currentDir, '..', 'uploads');
  app.use(express.static(webBuildPath));
  app.use('/uploads', express.static(uploadsPath));

  // ── System & Diagnostic Endpoints ──────────────────────────────────────────
  app.get('/', getRootInfo);
  app.get('/health', getHealthStatus);
  app.post('/getCommon', getCommonData);

  // ── Domain API Routes ──────────────────────────────────────────────────────
  app.use('/users', user);
  app.use('/leave', Leave);
  app.use('/Permission', Permission);
  app.use('/permission', Permission); // Case-insensitive alias
  app.use('/onduty', Onduty);
  app.use('/attendance', attendance);
  app.use('/commonMast', commonMast);
  app.use('/role', Role);
  app.use('/misDashboard', misDashboard);
  app.use('/Notifi', Notification);
  app.use('/notifi', Notification); // Case-insensitive alias

  // ── 404 Handler ────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  // ── Global Error Handler ───────────────────────────────────────────────────
  app.use((err, req, res, next) => {
    logServiceError('GlobalErrorHandler', err, req);
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    });
  });

  return app;
}

export default createApp;
