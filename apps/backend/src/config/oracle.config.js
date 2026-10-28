import 'dotenv/config';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const oracledb = require('oracledb');

if (process.env.ORACLE_CLIENT_PATH) {
    try {
        oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
    } catch (err) {
        console.warn('Failed to initialize Oracle Client (falling back to Thin mode):', err.message);
    }
}

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
};

/**
 * Get an active Oracle database connection.
 * Handles graceful error responses if Express response object is passed.
 * @param {import('express').Response} [res]
 * @returns {Promise<oracledb.Connection>}
 */
export async function getConnection(res) {
    try {
        const connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        });
        return connection;
    } catch (err) {
        console.error("Oracle Database Connection Failed:", err.message);
        if (res && typeof res.status === 'function' && typeof res.json === 'function') {
            return res.status(503).json({ statusCode: 1, message: "Database Connection Failed" });
        }
        throw err;
    }
}

/**
 * Fetch active financial year string from Oracle GTFINANCIALYEAR table.
 * @param {oracledb.Connection} connection
 * @returns {Promise<string|null>}
 */
export async function fetchActiveFinYearFromDB(connection) {
    try {
        const sql = `SELECT A.FINYR FROM GTFINANCIALYEAR A WHERE A.CURRENTFINYR = 'T'`;
        const result = await connection.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows && result.rows.length > 0) {
            return result.rows[0].FINYR;
        }
    } catch (error) {
        console.error("Error fetching active financial year from DB:", error);
    }
    return null;
}

export default { getConnection, fetchActiveFinYearFromDB };

