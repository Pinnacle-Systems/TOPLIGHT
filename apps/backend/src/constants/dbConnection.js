/**
 * dbConnection.js
 * Backwards-compatibility re-export from central oracle.config.js.
 */
export { getConnection, fetchActiveFinYearFromDB } from '../config/oracle.config.js';
import oracleConfig from '../config/oracle.config.js';
export default oracleConfig;
