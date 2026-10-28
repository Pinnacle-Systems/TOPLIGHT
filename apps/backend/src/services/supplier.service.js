import { getConnection } from '../constants/dbConnection.js';
import { logServiceError } from "../utils/logger.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  try {
    const result = await connection.execute(`
      SELECT partyName, partymastid FROM partymast
      WHERE partycat = 'SUPPLIER'
    `);
    const resp = result.rows.map(po => ({
      supplier: po[0],
      partyMastId: po[1],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    logServiceError('SupplierService:get', err, req);
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection?.close();
  }
}

// ── Standard Descriptive Aliases ─────────────────────────────────────────────
export const getSuppliers = get;
