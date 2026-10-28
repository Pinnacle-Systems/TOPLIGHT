import dns from 'node:dns';
import { getConnection } from '../config/oracle.config.js';
import { prisma_Connector } from '../config/prisma.config.js';
import { logServiceError } from '../utils/logger.js';

/**
 * Common dynamic Oracle query endpoint (`POST /getCommon`).
 * Executes a dynamic SELECT on Oracle tables with optional column-mapping.
 */
export async function getCommonData(req, res) {
  const table = req.body?.table;
  const where = req.body?.where;
  const fields = req.body?.fields;
  const map = req.body?.map;

  let connection = null;
  try {
    connection = await getConnection(res);
    if (!connection) return;

    const sql = `SELECT ${fields} FROM ${table} WHERE ${where}`;
    const result = await connection.execute(sql);

    if (map === 'true' || map === true) {
      const transformedResult = result?.rows?.map((row) => {
        const keyValuePair = {};
        result.metaData.forEach((col, index) => {
          keyValuePair[col.name] = row[index];
        });
        return keyValuePair;
      });
      return res.json({ statusCode: 0, data: transformedResult });
    } else {
      return res.json({ statusCode: 0, data: result?.rows || [] });
    }
  } catch (err) {
    logServiceError('CommonController:getCommonData', err, req);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    try {
      await connection?.close();
    } catch (_) {}
  }
}

/**
 * Root health and status ping (`GET /`).
 */
export function getRootInfo(req, res) {
  return res.status(200).json({
    Name: 'TopLight Server',
    Port: process.env.PORT,
    status: 'online',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Deep diagnostic health check (`GET /health`).
 * Checks DNS resolution, MySQL/Prisma connection, and Oracle DB connectivity.
 */
export async function getHealthStatus(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dns: { servers: dns.getServers(), status: 'unknown', resolvedIp: null },
    database: { mysql: 'unknown', oracle: 'unknown' },
  };

  // 1. DNS check
  try {
    await new Promise((resolve, reject) =>
      dns.resolve4('cloudflare.com', (err, addrs) => {
        if (err) reject(err);
        else {
          health.dns.status = 'ok';
          health.dns.resolvedIp = addrs[0];
          resolve();
        }
      })
    );
  } catch (e) {
    health.dns.status = 'error';
    health.dns.error = e.message;
    health.status = 'degraded';
  }

  // 2. MySQL / Prisma check
  try {
    await prisma_Connector.$queryRaw`SELECT 1`;
    health.database.mysql = 'ok';
  } catch (e) {
    health.database.mysql = 'error: ' + e.message;
    health.status = 'degraded';
  }

  // 3. Oracle DB check
  try {
    const conn = await getConnection();
    await conn.execute('SELECT 1 FROM DUAL');
    health.database.oracle = 'ok';
    await conn.close();
  } catch (e) {
    health.database.oracle = 'error: ' + e.message;
    health.status = 'degraded';
  }

  const httpCode = health.status === 'ok' ? 200 : 207;
  return res.status(httpCode).json(health);
}

export default {
  getCommonData,
  getRootInfo,
  getHealthStatus,
};

