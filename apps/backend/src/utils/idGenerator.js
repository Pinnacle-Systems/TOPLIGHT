/**
 * idGenerator.js
 *
 * Centralized numeric and unique ID generation utility.
 * Provides safe numeric identifiers for Oracle columns and Prisma BigInt / String keys.
 */

/**
 * Generates a 15-digit unique numeric ID based on timestamp and random suffix.
 * Suitable for primary keys and tracking record numbers.
 * @returns {number}
 */
export function generateUniqueIdNumber() {
  const timestamp = Date.now(); // 13-digit millisecond timestamp
  const random = Math.floor(Math.random() * 90 + 10); // 2-digit random number
  return Number(`${timestamp}${random}`); // total: 15 digits
}

/**
 * Generates a numeric ID within Oracle INTEGER limits (max 2,147,483,647).
 * Suitable for Oracle INTEGER primary key columns.
 * @returns {number}
 */
export function generateOracleIntegerId() {
  const timestampPart = Date.now() % 1000;
  const randomPart = Math.floor(Math.random() * 900000) + 100;
  const id = parseInt(`${timestampPart}${randomPart}`, 10);
  return Math.min(id, 2147483647);
}

// ── Backwards-Compatible Aliases ─────────────────────────────────────────────
export const generateUniqueId_Number = generateUniqueIdNumber;
export const generateNumericId = generateOracleIntegerId;
export const generateNumericId2 = generateOracleIntegerId;

export default {
  generateUniqueIdNumber,
  generateOracleIntegerId,
  generateUniqueId_Number,
  generateNumericId,
  generateNumericId2,
};

