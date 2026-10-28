import { getConnection } from '../constants/dbConnection.js';
import { logServiceError } from "../utils/logger.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  try {
    const result = await connection.execute(`
      SELECT docId,
             docDate,
             duedate,
             supplier,
             totalQty,
             ptransaction,
             finYr,
             gtpodetId
      FROM YFPURREG
    `);
    const resp = result.rows.map(po => ({
      poNo: po[0],
      poDate: po[1],
      dueDate: po[2],
      supplier: po[3],
      totalQty: po[4],
      transaction: po[5],
      finYr: po[6],
      poId: po[7],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    logServiceError('PoRegisterService:get', err, req);
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection?.close();
  }
}

// ── Standard Descriptive Aliases ─────────────────────────────────────────────
export const getPoRegister = get;
