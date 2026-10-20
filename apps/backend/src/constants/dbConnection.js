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
// const dbConfig = {
//       user: "PSSJWIN",
//       password: "PSSJWIN_OCT2023",
//       connectString: "203.95.216.155:1555/AVT05p",

// };
// const dbConfig = {
//       user: "PSSDEMOGAR",
//       password: "PSSDEMOGAR_MAY2023",
//       connectString: "203.95.216.155:1555/AVT05p",
// };
// const dbConfig = {
//       user: "pssbsa",
//       password: "PSSBSA_MAY2023",
//       connectString: "203.95.216.155:1556/AVT06p",
// };
// const dbConfig = {
//       user: "pssbsa",
//       password: "PSSBSA_MAY2023",
//       connectString: "203.95.216.155:1556/AVT06p",
// };

// const dbConfig = {
//       user: "PSSSPIKE",
//       password: "PSSSPIKE_MAY2023",
//       connectString: "203.95.216.155:1555/avt05p",
// };



const dbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
};

//  const dbConfig = {  
//        user: "PSSBSA",
//        password: "PSSBSA_MAY2023",
//       connectString: "203.95.216.155:1556/avt06p",
//  };



//AGF
// Host - 103.130.205.178
// Port - 1555
// SID - AN01P
// Username - PSSPAYROLL
// Password - PSSPAYROLL_APR2023

// const dbConfig = {
//        user: "PSSPAYROLL",
//        password: "PSSPAYROLL_APR2023",
//       connectString: "103.130.205.178:1555/AN01P",
//  };

//BHARANI APP

// const dbConfig = {
//        user: "PSSBPO",
//        password: "PSSBPO_MAY2023",
//       connectString: "203.95.216.155:1555/AVT05p",
//  };

export async function getConnection(res) {
      let connection;
      try {
            connection = await oracledb.getConnection({
                  user: dbConfig.user,
                  password: dbConfig.password,
                  connectString: dbConfig.connectString
            });
console.log("succuss")
            return connection
      } catch (err) {
            return res.json({ statusCode: 1, message: "Database Connection Failed" })
      }
}

export async function fetchActiveFinYearFromDB(connection) {
    try {
        const sql = `SELECT A.FINYR FROM GTFINANCIALYEAR A WHERE A.CURRENTFINYR = 'T'`;
        const result = await connection.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows && result.rows.length > 0) {
            return result.rows[0].FINYR;
        }
    } catch (error) {
        console.error("Error fetching active FinYear from DB:", error);
        throw error;
    }
    throw new Error("No active Financial Year found in GTFINANCIALYEAR (CURRENTFINYR='T')");
}
