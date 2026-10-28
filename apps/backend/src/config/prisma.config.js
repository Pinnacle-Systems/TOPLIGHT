import { PrismaClient } from '../generated/prisma/client.js';

/**
 * Singleton PrismaClient connection instance for MySQL database operations.
 */
export const prisma_Connector = new PrismaClient();

export default prisma_Connector;

