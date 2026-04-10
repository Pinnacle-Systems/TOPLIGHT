import { fetchActiveFinYearFromDB, getConnection } from "../constants/db.connection.js";
import { IN_HAND } from "../constants/dbConstants.js";
import { currentDate, tommorowDate } from "../Helpers/helper.js";
import {
  getTopCustomers,
  getProfit,
  getEmployees,
  getNewCustomers,
  getLoss,
  getLoss1,
  getEmployees1,
  getProfit1,
  getLoss11,
  getLoss01,
} from "../queries/misDashboard.js";
import moment from "moment";
import { prisma_Connector } from "../../index.js";
import formatDateToOracle from "../Utiles/OracleDateFormat.js";

const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const d = new Date();
const monthName = month[d.getMonth()];
const yearName = d.getFullYear();

const lastMonthDate = new Date(d.getFullYear(), d.getMonth() - 1, d.getDate());
const lastMonthName = month[lastMonthDate.getMonth()];
const lastMonthYear = lastMonthDate.getFullYear();

const currentDt = [monthName, yearName].join(" ");
const lstMnth = [lastMonthName, lastMonthYear].join(" ");

function getFinYear1(monthName, year) {
  const mIndex = month.indexOf(monthName); // 0–11

  let startYear, endYear;

  // Jan=0, Feb=1, Mar=2 → previous FY
  if (mIndex <= 2) {
    startYear = year - 1;
    endYear = year;
  } else {
    startYear = year;
    endYear = year + 1;
  }

  const shortStart = startYear.toString().slice(-2);
  const shortEnd = endYear.toString().slice(-2);

  return `${shortStart}-${shortEnd}`;
}

const currentFinYear = getFinYear1(monthName, yearName);


export async function get(req, res) {
  const connection = await getConnection(res);
  try {
    const { type, filterYear, filterBuyer, filterMonth, search, payCat } =
      req.query;

    const totalTurnOver = await getEmployees(
      connection,
      type,
      filterYear,
      filterBuyer,
      filterMonth
    );
    const totalTurnOver1 = await getEmployees1(
      connection,
      type,
      filterYear,
      filterBuyer,
      filterMonth
    );

    const profit = await getProfit(
      connection,
      type,
      filterYear,
      filterBuyer,
      filterMonth
    );
    const profit1 = await getProfit1(
      connection,
      type,
      filterYear,
      filterBuyer,
      filterMonth
    );

    const newCustomers = await getNewCustomers(
      connection,
      type,
      filterYear,
      filterBuyer,
      filterMonth
    );
    const topCustomers = await getTopCustomers(
      connection,
      type,
      filterYear,
      filterBuyer,
      filterMonth
    );

    const loss = await getLoss(connection, type, filterYear, filterMonth);
    const loss01 = await getLoss01(connection, type, filterYear, filterMonth);

    const loss1 = await getLoss1(connection, type, filterYear, filterMonth);
    const loss11 = await getLoss11(connection, type, filterYear, filterMonth);

    return res.json({
      statusCode: 0,
      data: {
        totalTurnOver,
        totalTurnOver1,
        profit,
        newCustomers,
        topCustomers,
        loss,
        loss1,
        profit1,
        loss11,
        loss01,
      },
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getInsuranceData(req, res) {
    const connection = await getConnection(res)
    const COMPCODE=String(req.headers?.compcode).toUpperCase()
    try {
        


        const sql = ` 

        SELECT ROWNUM SNO,AA.*
FROM(
SELECT A.DOCID,A.DOCDATE,C.INSURANCEDESC DESCOFINSASSET,B.OWNERSHIPP,D.VEHICLENO,D.VEHICLENAME,E.INSCOMPNAME INSUREDBY,
B.INSREFNO POLICYNO,B.VALIDFROM,B.VALIDTO,B.VALIDTO-TO_DATE(SYSDATE) DUEDAYS,
B.INSPREMIUMVALUE,B.TOTALPREMIUM,B.PAYMENTDETAILS,B.PAYMENTMODE,'' USEDBY
FROM GTINSURANCE A
JOIN GTINSURANCEDET B ON A.GTINSURANCEID=B.GTINSURANCEID
JOIN GTINSDESCMAST C ON B.DESCOFINSASSET=C.GTINSDESCMASTID
LEFT JOIN HRVEHMAST D ON B.VEHICLENO=D.HRVEHMASTID
JOIN GTINSCOMPMAST E ON B.INSUREDBY=E.GTINSCOMPMASTID
JOIN GTCOMPMAST F ON A.COMPGROUP=F.COMPCODE
WHERE F.COMPCODE='${COMPCODE}'  AND B.VALIDTO-TO_DATE(SYSDATE) >= 0
ORDER BY DUEDAYS
)AA
`
        console.log(sql, 'sql60');
        let result = await connection.execute(sql);
        result = result.rows.map(row => ({
            sno: row[0], docId: row[1], docDate: row[2], discoFinAsset: row[3], ownership: row[4], vehNo: row[5], vehName: row[6],
            insuredby: row[7], policyNo: row[8], validFrom: row[9],
            validTo: row[10], dueDays: row[11], insPremiumValue: row[12],
            totalPremium: row[13], paymentDetails: row[14], paymentMode: row[
                15],
                 usedby: row[16]

        }))

       
        
        return res.json({
            statusCode: 0, data: result
        })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}



export async function getInsuranceData_Alert(req, res) {
    const connection = await getConnection(res)
    const COMPCODE=String(req.headers?.compcode).toUpperCase()
    try {
        

        const sql = ` 
SELECT ROWNUM SNO,AA.*
FROM(SELECT A.DOCID,A.DOCDATE,C.INSURANCEDESC DESCOFINSASSET,B.OWNERSHIPP,D.VEHICLENO,D.VEHICLENAME,E.INSCOMPNAME INSUREDBY,
B.INSREFNO POLICYNO,B.VALIDFROM,B.VALIDTO,B.VALIDTO-TO_DATE(SYSDATE) DUEDAYS,
B.INSPREMIUMVALUE,B.TOTALPREMIUM,B.PAYMENTDETAILS,B.PAYMENTMODE,B.USEDBY
FROM GTINSURANCE A
JOIN GTINSURANCEDET B ON A.GTINSURANCEID=B.GTINSURANCEID
JOIN GTINSDESCMAST C ON B.DESCOFINSASSET=C.GTINSDESCMASTID
LEFT JOIN HRVEHMAST D ON B.VEHICLENO=D.HRVEHMASTID
JOIN GTINSCOMPMAST E ON B.INSUREDBY=E.GTINSCOMPMASTID
JOIN GTCOMPMAST F ON A.COMPCODE=F.GTCOMPMASTID
WHERE F.COMPCODE='${COMPCODE}'  AND B.VALIDTO-TO_DATE(SYSDATE) between  0 and 30
ORDER BY DUEDAYS)AA
`
        console.log(sql, 'sql60');
        let result = await connection.execute(sql);
        result = result.rows.map(row => ({
            sno: row[0], docId: row[1], docDate: row[2], discoFinAsset: row[3], ownership: row[4], vehNo: row[5], vehName: row[6],
            insuredby: row[7], policyNo: row[8], validFrom: row[9],
            validTo: row[10], dueDays: row[11], insPremiumValue: row[12],
            totalPremium: row[13], paymentDetails: row[14], paymentMode: row[
                15],
                 usedby: row[16]

        }))

       
        
        return res.json({
            statusCode: 0, data: result
        })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}







export async function getTotalStrength(req, res) {
    const connection = await getConnection(res)
     const COMPCODE=String(req.headers?.compcode).toUpperCase()
    const { date } = req.query;
   
    const currentDate =moment(formatDateToOracle(date)).format('DD-MM-YYYY')
    const tommorowDate = moment(formatDateToOracle(date)).add(1, 'days').format('DD-MM-YYYY');
  
    
    try {
        const sql =
            `
  SELECT A.*,DENSE_RANK() OVER(ORDER BY A.BANDID,A.DEPTNAME) SNO FROM 
(SELECT A.*,DECODE(A.TOTALMALE,0,0,ROUND((A.ABSMALE/A.TOTALMALE) *100,2)) APMALE,
DECODE(A.TOTALFEMALE,0,0,ROUND((A.ABSFEMALE/A.TOTALFEMALE) *100,2)) APFEMALE,
DECODE(A.TOTALFEMALE + A.TOTALMALE ,0,0,ROUND(((A.ABSFEMALE+A.ABSMALE)/(A.TOTALFEMALE + TOTALMALE )) *100,2)) TOTABPER
FROM (
SELECT AA.BANDID,AA.DEPTNAME,SUM(AA.TOTALMALE) TOTALMALE,SUM(TOTALFEMALE) TOTALFEMALE,SUM(PREMALE) PREMALE,SUM(PREFEMALE) PREFEMALE ,
SUM(AA.TOTALMALE)-SUM(PREMALE) ABSMALE,SUM(TOTALFEMALE)-SUM(PREFEMALE) ABSFEMALE,
SUM(TOTALFEMALE +TOTALMALE) GENDERTOT,(SUM(TOTALFEMALE)-SUM(PREFEMALE))+(SUM(AA.TOTALMALE)-SUM(PREMALE)) ABTOT,SUM(PREMALE+PREFEMALE) PRETOT
FROM 
(
SELECT CASE WHEN 'Desig Wise1' = 'Desig Wise' THEN AA.DEPT ELSE AA.BANDID END BANDID,AA.DEPTNAME,SUM(AA.TOTALMALE) TOTALMALE,SUM(TOTALFEMALE) TOTALFEMALE,SUM(PREMALE) PREMALE,SUM(PREFEMALE) PREFEMALE ,
SUM(AA.TOTALMALE)-SUM(PREMALE) ABSMALE,SUM(TOTALFEMALE)-SUM(PREFEMALE) ABSFEMALE,
SUM(TOTALFEMALE +TOTALMALE) GENDERTOT,(SUM(TOTALFEMALE)-SUM(PREFEMALE))+(SUM(AA.TOTALMALE)-SUM(PREMALE)) ABTOT,SUM(PREMALE+PREFEMALE) PRETOT
FROM 
(
SELECT E.DESIGNATION DEPT,C.BANDID,F.MNNAME1 DEPTNAME,CASE WHEN A.GENDER = 'MALE' THEN COUNT(B.IDCARD) ELSE 0 END TOTALMALE
,CASE WHEN A.GENDER = 'FEMALE' THEN COUNT(B.IDCARD) ELSE 0 END TOTALFEMALE,0 PREMALE,0 PREFEMALE
FROM HREMPLOYMAST A,HREMPLOYDETAILS B,HRBANDMAST C,GTCOMPMAST D,GTDESIGNATIONMAST E,GTDEPTDESGMAST F 
WHERE A.HREMPLOYMASTID = B.HREMPLOYMASTID AND B.BAND = C.HRBANDMASTID 
AND B.DESIGNATION = E.GTDESIGNATIONMASTID AND F.GTDEPTDESGMASTID = B.DEPTNAME
AND D.GTCOMPMASTID = A.COMPCODE AND B.IDACTIVE = 'YES' AND B.DOJ <= TO_DATE(:DOCDATE, 'DD/MM/YYYY')  AND LOWER('group role1') = 'group role' and a.EMPTYPE = 'Permanent'
AND ( D.COMPCODE = :COMPCODE OR 'ALL' = :COMPCODE ) AND ( F.MNNAME1 = :DEPT OR 'ALL' = :DEPT ) AND ( C.BANDID = :PAYCAT OR :PAYCAT = 'ALL')
GROUP BY A.GENDER,C.BANDID,E.DESIGNATION,F.MNNAME1
UNION ALL
SELECT E.DESIGNATION DEPT,C.BANDID,F.MNNAME1 DEPTNAME,CASE WHEN A.GENDER = 'MALE' THEN COUNT(B.IDCARD) ELSE 0 END TOTALMALE
,CASE WHEN A.GENDER = 'FEMALE' THEN COUNT(B.IDCARD) ELSE 0 END TOTALFEMALE,0 PREMALE,0 PREFEMALE
FROM HREMPLOYMAST A,HREMPLOYDETAILS B,HRBANDMAST C,GTCOMPMAST D,GTDESIGNATIONMAST E,GTDEPTDESGMAST F 
WHERE A.HREMPLOYMASTID = B.HREMPLOYMASTID AND B.BAND = C.HRBANDMASTID 
AND B.DESIGNATION = E.GTDESIGNATIONMASTID AND F.GTDEPTDESGMASTID = B.DEPTNAME
AND D.GTCOMPMASTID = A.COMPCODE AND B.IDACTIVE = 'YES' AND B.DOJ <= TO_DATE(:DOCDATE, 'DD/MM/YYYY')  AND LOWER('group role1') <> 'group role' 
AND ( D.COMPCODE = :COMPCODE OR 'ALL' = :COMPCODE ) AND ( F.MNNAME1 = :DEPT OR 'ALL' = :DEPT )  AND ( C.BANDID = :PAYCAT OR :PAYCAT = 'ALL')
GROUP BY A.GENDER,C.BANDID,E.DESIGNATION,F.MNNAME1
UNION ALL
SELECT AA.DEPT,AA.BANDID,AA.DEPTNAME,0 TOTALMALE,0 TOTALFEMALE,CASE WHEN AA.GENDER = 'MALE' THEN COUNT(AA.IDCARD) ELSE 0 END PREMALE,
CASE WHEN AA.GENDER = 'FEMALE' THEN COUNT(AA.IDCARD) ELSE 0 END PREFEMALE FROM
(
SELECT H.BANDID,D.GENDER,C.IDCARD,F.DESIGNATION DEPT,I.MNNAME1 DEPTNAME 
FROM HRONDUTY A,HRONDUTYDET B,HREMPLOYDETAILS C,HREMPLOYMAST D,GTDESIGNATIONMAST F,GTCOMPMAST G,HRBANDMAST H,GTDEPTDESGMAST I
WHERE A.HRONDUTYID = B.HRONDUTYID AND B.IDCARD = C.HREMPLOYDETAILSID AND D.HREMPLOYMASTID = C.HREMPLOYMASTID
AND C.DESIGNATION = F.GTDESIGNATIONMASTID AND G.GTCOMPMASTID = D.COMPCODE AND C.BAND = H.HRBANDMASTID AND I.GTDEPTDESGMASTID = C.DEPTNAME
AND C.DOJ <= TO_DATE(:DOCDATE, 'DD/MM/YYYY')   AND ( G.COMPCODE = :COMPCODE OR 'ALL' = :COMPCODE ) AND ( I.MNNAME1 = :DEPT OR 'ALL' = :DEPT ) 
AND LOWER('group role1') = 'group role' and D.EMPTYPE = 'Permanent' AND ( H.BANDID = :PAYCAT OR :PAYCAT = 'ALL')
AND B.ODATE = TO_DATE(:DOCDATE, 'DD/MM/YYYY') 
UNION 
SELECT H.BANDID,D.GENDER,C.IDCARD,F.DESIGNATION DEPT,I.MNNAME1 DEPTNAME 
FROM HRONDUTY A,HRONDUTYDET B,HREMPLOYDETAILS C,HREMPLOYMAST D,GTDESIGNATIONMAST F,GTCOMPMAST G,HRBANDMAST H,GTDEPTDESGMAST I
WHERE A.HRONDUTYID = B.HRONDUTYID AND B.IDCARD = C.HREMPLOYDETAILSID AND D.HREMPLOYMASTID = C.HREMPLOYMASTID
AND C.DESIGNATION = F.GTDESIGNATIONMASTID AND G.GTCOMPMASTID = D.COMPCODE AND C.BAND = H.HRBANDMASTID AND I.GTDEPTDESGMASTID = C.DEPTNAME
AND C.DOJ <= TO_DATE(:DOCDATE, 'DD/MM/YYYY')   AND ( G.COMPCODE = :COMPCODE OR 'ALL' = :COMPCODE ) AND ( I.MNNAME1 = :DEPT OR 'ALL' = :DEPT ) AND LOWER('group role1') <> 'group role' 
AND B.ODATE = TO_DATE(:DOCDATE, 'DD/MM/YYYY')  AND ( H.BANDID = :PAYCAT OR :PAYCAT = 'ALL')
UNION
SELECT  BANDID,GENDER,IDCARD,DESIGNATION DEPT,DEPTNAME FROM (
SELECT A.IDCARD,B.FNAME,MIN(TO_TIMESTAMP(A.ATTDATE||' '||A.ATTTIME,'DD/MM/YY HH24:MI:SS')) INDT ,D.BANDID ,B.GENDER,F.DESIGNATION,I.MNNAME1 DEPTNAME
FROM ${COMPCODE}ATT A,HREMPLOYMAST B,HREMPLOYDETAILS C,HRBANDMAST D,GTDESIGNATIONMAST  F,GTDEPTDESGMAST I
WHERE A.HREMPLOYMASTID = B.HREMPLOYMASTID AND C.HREMPLOYMASTID = B.HREMPLOYMASTID AND C.PAYCAT = D.HRBANDMASTID AND I.GTDEPTDESGMASTID = C.DEPTNAME
AND C.DESIGNATION=F.GTDESIGNATIONMASTID AND A.COMPCODE = '${COMPCODE}' AND ( :COMPCODE = '${COMPCODE}' OR 'ALL' = :COMPCODE ) AND ( I.MNNAME1 = :DEPT OR 'ALL' = :DEPT ) 
AND A.PMNO IN ( SELECT B.MACNO FROM HRMACIPENTRY A JOIN HRMACIPENTRYDET B ON A.HRMACIPENTRYID = B.HRMACIPENTRYID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE AND C.COMPCODE = '${COMPCODE}' AND B.MTYPE IN ('IN','IN/OUT'))
AND TO_TIMESTAMP(A.ATTDATE||' '||A.ATTTIME,'DD/MM/YY HH24:MI:SS') BETWEEN
(
SELECT TO_TIMESTAMP( TO_DATE(:DOCDATE, 'DD/MM/YYYY') ||' '||MIN(A.STST),'DD/MM/YY HH24:MI:SS') - NUMTODSINTERVAL( :ADNLT ,'HOUR')  STST 
FROM HRSHIFTTEMPDETAIL A,HRSHIFTTEMP B,GTCOMPMAST C WHERE A.HRSHIFTTEMPID = B.HRSHIFTTEMPID  AND B.COMPCODE = C.GTCOMPMASTID
AND C.COMPCODE = '${COMPCODE}'  AND A.NDAY = 'NO' 
)
AND 
(
SELECT TO_TIMESTAMP( TO_DATE(:DDDATE, 'DD/MM/YYYY') ||' '||MIN(A.STST),'DD/MM/YY HH24:MI:SS') - NUMTODSINTERVAL( :ADNLT ,'HOUR')  STST 
FROM HRSHIFTTEMPDETAIL A,HRSHIFTTEMP B,GTCOMPMAST C WHERE A.HRSHIFTTEMPID = B.HRSHIFTTEMPID  AND B.COMPCODE = C.GTCOMPMASTID
AND C.COMPCODE = '${COMPCODE}'  AND A.NDAY = 'NO'
)
GROUP BY A.IDCARD,B.FNAME,D.BANDID ,B.GENDER,F.DESIGNATION,I.MNNAME1
UNION ALL
SELECT A.IDCARD,B.FNAME,MIN(TO_TIMESTAMP(A.ATTDATE||' '||A.ATTTIME,'DD/MM/YY HH24:MI:SS')) INDT ,D.BANDID ,B.GENDER,F.DESIGNATION,I.MNNAME1 DEPTNAME
FROM ${COMPCODE}ATT A,HREMPLOYMAST B,HREMPLOYDETAILS C,HRBANDMAST D,GTDESIGNATIONMAST  F,GTDEPTDESGMAST I
WHERE A.HREMPLOYMASTID = B.HREMPLOYMASTID AND C.HREMPLOYMASTID = B.HREMPLOYMASTID AND C.PAYCAT = D.HRBANDMASTID AND I.GTDEPTDESGMASTID = C.DEPTNAME
AND C.DESIGNATION=F.GTDESIGNATIONMASTID AND A.COMPCODE = :COMPCODE AND ( :COMPCODE = :COMPCODE OR 'ALL' = :COMPCODE ) 
AND ( I.MNNAME1 = :DEPT OR 'ALL' = :DEPT ) AND LOWER('group role1') = 'group role' and B.EMPTYPE = 'Permanent'  AND ( D.BANDID = :PAYCAT OR :PAYCAT = 'ALL')
AND A.PMNO IN ( SELECT B.MACNO FROM HRMACIPENTRY A JOIN HRMACIPENTRYDET B ON A.HRMACIPENTRYID = B.HRMACIPENTRYID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE AND C.COMPCODE = :COMPCODE AND B.MTYPE IN ('IN','IN/OUT'))
AND TO_TIMESTAMP(A.ATTDATE||' '||A.ATTTIME,'DD/MM/YY HH24:MI:SS') BETWEEN
(
SELECT TO_TIMESTAMP( TO_DATE(:DOCDATE, 'DD/MM/YYYY') ||' '||MIN(A.STST),'DD/MM/YY HH24:MI:SS') - NUMTODSINTERVAL( :ADNLT ,'HOUR')  STST 
FROM HRSHIFTTEMPDETAIL A,HRSHIFTTEMP B,GTCOMPMAST C WHERE A.HRSHIFTTEMPID = B.HRSHIFTTEMPID  AND B.COMPCODE = C.GTCOMPMASTID
AND C.COMPCODE = :COMPCODE  AND A.NDAY = 'NO' 
)
AND 
(
SELECT TO_TIMESTAMP( TO_DATE(:DDDATE, 'DD/MM/YYYY') ||' '||MIN(A.STST),'DD/MM/YY HH24:MI:SS') - NUMTODSINTERVAL( :ADNLT ,'HOUR')  STST 
FROM HRSHIFTTEMPDETAIL A,HRSHIFTTEMP B,GTCOMPMAST C WHERE A.HRSHIFTTEMPID = B.HRSHIFTTEMPID  AND B.COMPCODE = C.GTCOMPMASTID
AND C.COMPCODE = :COMPCODE  AND A.NDAY = 'NO'
)
GROUP BY A.IDCARD,B.FNAME,D.BANDID ,B.GENDER,F.DESIGNATION,I.MNNAME1
UNION
SELECT A.IDCARD,B.FNAME,MIN(TO_TIMESTAMP(A.ATTDATE||' '||A.ATTTIME,'DD/MM/YY HH24:MI:SS')) INDT ,D.BANDID ,B.GENDER,F.DESIGNATION,I.MNNAME1 DEPTNAME
FROM   ${COMPCODE}ATT A,HREMPLOYMAST B,HREMPLOYDETAILS C,HRBANDMAST D,GTDESIGNATIONMAST  F,GTDEPTDESGMAST I
WHERE A.HREMPLOYMASTID = B.HREMPLOYMASTID AND C.HREMPLOYMASTID = B.HREMPLOYMASTID AND C.PAYCAT = D.HRBANDMASTID AND I.GTDEPTDESGMASTID = C.DEPTNAME
AND C.DESIGNATION=F.GTDESIGNATIONMASTID AND A.COMPCODE = :COMPCODE AND ( :COMPCODE = :COMPCODE OR 'ALL' = :COMPCODE ) 
AND ( I.MNNAME1 = :DEPT OR 'ALL' = :DEPT ) AND ( D.BANDID = :PAYCAT OR :PAYCAT = 'ALL') 
AND A.PMNO IN ( SELECT B.MACNO FROM HRMACIPENTRY A JOIN HRMACIPENTRYDET B ON A.HRMACIPENTRYID = B.HRMACIPENTRYID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE AND C.COMPCODE = :COMPCODE AND B.MTYPE IN ('IN','IN/OUT'))
AND TO_TIMESTAMP(A.ATTDATE||' '||A.ATTTIME,'DD/MM/YY HH24:MI:SS') BETWEEN
(
SELECT TO_TIMESTAMP( TO_DATE(:DOCDATE, 'DD/MM/YYYY') ||' '||MIN(A.STST),'DD/MM/YY HH24:MI:SS') - NUMTODSINTERVAL( :ADNLT ,'HOUR')  STST 
FROM HRSHIFTTEMPDETAIL A,HRSHIFTTEMP B,GTCOMPMAST C WHERE A.HRSHIFTTEMPID = B.HRSHIFTTEMPID  AND B.COMPCODE = C.GTCOMPMASTID
AND C.COMPCODE = :COMPCODE  AND A.NDAY = 'NO' 
)
AND 
(
SELECT TO_TIMESTAMP( TO_DATE(:DDDATE, 'DD/MM/YYYY') ||' '||MIN(A.STST),'DD/MM/YY HH24:MI:SS') - NUMTODSINTERVAL( :ADNLT ,'HOUR')  STST 
FROM HRSHIFTTEMPDETAIL A,HRSHIFTTEMP B,GTCOMPMAST C WHERE A.HRSHIFTTEMPID = B.HRSHIFTTEMPID  AND B.COMPCODE = C.GTCOMPMASTID
AND C.COMPCODE = :COMPCODE  AND A.NDAY = 'NO'
)
AND LOWER('group role1') <> 'group role' 
GROUP BY A.IDCARD,B.FNAME,D.BANDID ,B.GENDER,F.DESIGNATION,I.MNNAME1
) XX
) AA
GROUP BY AA.GENDER,AA.BANDID,AA.DEPT,AA.DEPTNAME
) AA
GROUP BY AA.DEPT,AA.BANDID,AA.DEPTNAME
) AA
GROUP BY AA.BANDID,AA.DEPTNAME
)A) A
ORDER BY A.BANDID,A.DEPTNAME
        `

    

        const params = {

            COMPCODE:  COMPCODE,
            DEPT:  'ALL' ,
            PAYCAT: 'ALL' ,
            ADNLT:  '0.5' ,
            DDDATE:  tommorowDate ,
            DOCDATE:  currentDate ,

        };

        let result = await connection.execute(sql,
            params
        );
        console.log(result, 'res');

        result = result.rows.map(row => ({
            BANDID: row[0],
            DEPTNAME: row[1],
            TOTALMALE: row[2],
            TOTALFEMALE: row[3],
            PREMALE: row[4],
            PREFEMALE: row[5],
            ABSMALE: row[6],
            ABSFEMALE: row[7],
            GENDERTOT: row[8],
            ABTOT: row[9],
            PRETOT: row[10],
            APMALE: row[11],
            APFEMALE: row[12],
            TOTABPER: row[13],


        }))


        return res.json({
            statusCode: 0, data: result
        })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


export async function getActualVsBudgetValueMonthWise(req, res) {
  const connection = await getConnection(res);
  try {
    const monthArr = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map(
      (i) =>
        `
            select 
            to_char(ADD_MONTHS(CURRENT_DATE, ${i}), 'Mon-YYYY') as monthYear ,
            to_char(ADD_MONTHS(CURRENT_DATE, ${i}), 'MM') as monthOnly ,
            to_char(ADD_MONTHS(CURRENT_DATE, ${i}), 'YYYY') as yearOnly ,
            (
                select round(COALESCE(sum(PLANSALESVAL),0)) from MISORDSALESVAL
            where extract(YEAR from BPODATE) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, ${i}))
            and extract(MONTH from BPODATE) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, ${i}))
            ) AS PLANNED,
            (
                select round(COALESCE(sum(ACTSALVAL),0)) from MISORDSALESVAL
            where extract(YEAR from BPODATE) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, ${i}))
            and extract(MONTH from BPODATE) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, ${i}))
            ) AS ACTUAL
            FROM DUAL
        `
    );
    const sql = monthArr.join("union");
    let result = await connection.execute(
      `select * from (${sql}) order by yearOnly,monthOnly`
    );
    result = result.rows.map((row) => ({
      date: row[0],
      planned: row[3],
      actual: row[4],
    }));
    return res.json({
      statusCode: 0,
      data: result,
      sql,
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}
export async function getYearlyComp(req, res) {
  const connection = await getConnection(res);

  try {
    const { filterBuyer = "" } = req.query || {};
    let filterBuyerList = "";

    if (filterBuyer && filterBuyer.trim() !== "") {
      filterBuyerList = filterBuyer
        .split(",")
        .map((buyer) => `'${buyer.trim()}'`)
        .join(",");
    }

    let companyFilter = "";
    if (filterBuyerList) {
      companyFilter = `AND A.COMPCODE IN (${filterBuyerList})`;
    }
    // console.log(currentDt, "currentDt yearly");

    const sql = `
      SELECT A.COMPCODE,
             SUM(MALE) MALE,
             SUM(FEMALE) FEMALE,
             SUM(MALE) + SUM(FEMALE) TOTAL
      FROM (
        SELECT A.COMPCODE,
               CASE WHEN A.GENDER = 'MALE' THEN 1 ELSE 0 END MALE,
               CASE WHEN A.GENDER = 'FEMALE' THEN 1 ELSE 0 END FEMALE
        FROM MISTABLE A
        WHERE A.DOJ <= (
          SELECT MIN(AA.STDT)
          FROM MONTHLYPAYFRQ AA
          WHERE AA.PAYPERIOD = '${currentDt}'
        )
        AND (A.DOL IS NULL OR A.DOL <= (
          SELECT MIN(AA.ENDT)
          FROM MONTHLYPAYFRQ AA
          WHERE AA.PAYPERIOD = '${currentDt}'
        ))
        ${companyFilter}  
      ) A
      GROUP BY A.COMPCODE
      
    `;
    console.log(sql, "sqlgetYearlyComp")
    const result = await connection.execute(sql);

    const resp = result.rows.map((po) => ({
      customer: po[0],
      male: po[1],
      female: po[2],
      total: po[3],
    }));

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}
export async function getBuyerWiseRevenue(req, res) {
  const connection = await getConnection(res);
  try {
    const { filterYear, filterSupplier } = req.query;
    const supplierArray = filterSupplier.split(",");
    const sepComName = supplierArray.join("");
    const supplierList = supplierArray
      .map((supplier) => `'${supplier}'`)
      .join(",");
    const sql = `
         SELECT A.PAYPERIOD,A.STDT,ROUND(A.CLOSING/A.OPENING*100,2) RETENTIONPER,A.CLOSING,A.OPENING FROM (
SELECT A.PAYPERIOD,A.STDT,SUM(A.OPENING) OPENING,SUM(A.ATTRITION) ATTRITION,SUM(A.OPENING) - SUM(A.ATTRITION) + SUM(A.JOINERS) CLOSING FROM (
SELECT B.PAYPERIOD,B.STDT,0 OPENING,COUNT(*) ATTRITION,0 JOINERS FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE
AND B.FINYR ='${filterYear}' AND A.COMPCODE IN '${filterSupplier}'
AND A.DOL BETWEEN B.STDT AND B.ENDT
GROUP BY B.PAYPERIOD,B.STDT,A.COMPCODE
UNION ALL
SELECT B.PAYPERIOD,B.STDT,0 OPENING,0 ATTRITION,COUNT(*) JOINERS FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE
AND B.FINYR ='${filterYear}' AND A.COMPCODE  IN '${filterSupplier}'
AND A.DOJ BETWEEN B.STDT AND B.ENDT
GROUP BY B.PAYPERIOD,B.STDT,A.COMPCODE
UNION ALL
SELECT B.PAYPERIOD,B.STDT,COUNT(*) OPENING,0 ATTRITION,0 JOINERS FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE
AND B.FINYR ='${filterYear}' AND A.COMPCODE  IN '${filterSupplier}'
AND A.DOJ < B.STDT
GROUP BY B.PAYPERIOD,B.STDT
) A
GROUP BY A.PAYPERIOD,A.STDT
) A
ORDER BY 2
     `;

    const result = await connection.execute(sql);
    let resp = result.rows.map((po) => ({
      payPeriod: po[0],
      stdt: po[1],
      retention: po[2],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}




export async function getTotalHeadCount(req, res) { 
    const COMPCODE=String(req.headers?.compcode).toUpperCase()
    const department=req?.query?.dep

// correct Query

//  SELECT 
//     DD.DESIGNATION AS "label",
//     COUNT(*) AS "value"
// FROM 
//     HREMPLOYMAST BB
// JOIN 
//     HREMPLOYDETAILS CC ON BB.HREMPLOYMASTID = CC.HREMPLOYMASTID
// JOIN 
//     GTDESIGNATIONMAST DD ON DD.GTDESIGNATIONMASTID = CC.DESIGNATION
// WHERE 
//     CC.DOJ <= (
//         SELECT MIN(AA.STDT)
//         FROM MONTHLYPAYFRQ AA
//         WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
//     )
//     AND 
//     (
//         CC.LASTWORKDAY IS NULL 
//         OR CC.LASTWORKDAY >= (
//             SELECT MIN(AA.ENDT)
//             FROM MONTHLYPAYFRQ AA
//             WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
//         )
//     )
// GROUP BY 
//     DD.DESIGNATION
// ORDER BY 
//     DD.DESIGNATION


    const connection = await getConnection(res)
      try {
        console.log('sdsfdsd4444444444444444444444444444444444');
        
        const sql =
            `
SELECT A."label",COUNT(A."value") "value",SUM(A.MALE) MALE,
SUM(A.FEMALE) FEMALE  
FROM (
SELECT DD.DESIGNATION AS "label",COUNT(*) AS "value",CASE WHEN BB.GENDER = 'MALE' THEN 1 ELSE 0 END MALE,
CASE WHEN BB.GENDER = 'FEMALE' THEN 1 ELSE 0 END FEMALE
FROM HREMPLOYMAST BB
JOIN HREMPLOYDETAILS CC ON BB.HREMPLOYMASTID = CC.HREMPLOYMASTID
JOIN GTDEPTDESGMAST FF ON FF.GTDEPTDESGMASTID=CC.DEPTNAME
JOIN GTDESIGNATIONMAST DD ON DD.GTDESIGNATIONMASTID = CC.DESIGNATION
JOIN GTCOMPMAST EE ON EE.GTCOMPMASTID = BB.COMPCODE
WHERE CC.DOJ <= TO_DATE(SYSDATE) AND (CC.LASTWORKDAY <= TO_DATE(SYSDATE) OR CC.LASTWORKDAY IS NULL)
AND EE.COMPCODE = :COMPCODE    ${department  ? ' AND FF.MNNAME1=:DEPT' : ''}
GROUP BY DD.DESIGNATION,BB.GENDER
) A
GROUP BY A."label"
ORDER BY A."label"
`


     
        const result = await connection.execute(sql,department ? {COMPCODE,DEPT:department} : {COMPCODE})
      
       
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getGenderCount(req, res) { 
    const COMPCODE=String(req.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
      try {
        const sql =
            `select em.GENDER,Count(*) count from HREMPLOYMAST em,GTCOMPMAST cm where cm.COMPCODE=:COMPCODE and cm.ACTIVE='T' group by GENDER,cm.COMPCODE`
            
        const result = await connection.execute(sql,{COMPCODE})
       
      
          
          return res.json({ statusCode: 0, data:result?.rows })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getTotalPA(req, res) { 
  const COMPCODE=String(req.headers?.compcode).toUpperCase()
  const USERNAME=req?.query?.USERNAME
   
    const connection = await getConnection(res)
      try {
        const sql =
            `SELECT SUM(A.TOTAL) TOTAL,SUM(A.MALE) TMALE,SUM(A.FEMALE) TFEMALE,

SUM(A.PTOTAL) PTOTAL,SUM(A.PMALE) PMALE,SUM(A.PFEMALE) PFEMALE,

SUM(A.TOTAL)-SUM(A.PTOTAL) ATOTAL,SUM(A.MALE)-SUM(A.PMALE) AMALE,SUM(A.FEMALE)-SUM(A.PFEMALE) AFEMALE FROM

(

SELECT COUNT(*) TOTAL,CASE WHEN B.GENDER = 'MALE' THEN COUNT(*) ELSE 0 END MALE,

CASE WHEN B.GENDER = 'FEMALE' THEN COUNT(*) ELSE 0 END FEMALE,0 PTOTAL,0 PMALE,0 PFEMALE  FROM HREMPLOYDETAILS A

JOIN HREMPLOYMAST B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID

JOIN GTCOMPMAST C ON C.GTCOMPMASTID = B.COMPCODE

WHERE A.DOJ <= TO_DATE(SYSDATE)

AND (A.LASTWORKDAY <=  TO_DATE(SYSDATE) OR A.LASTWORKDAY IS NULL)

AND C.COMPCODE = :COMPCODE

AND A.IDCARD=:IDCARD
GROUP BY B.GENDER

UNION ALL

SELECT 0 TOTAL,0 MALE,0 FEMALE,COUNT(*) PTOTAL,CASE WHEN B.GENDER = 'MALE' THEN COUNT(*) ELSE 0 END PMALE,

CASE WHEN B.GENDER = 'FEMALE' THEN COUNT(*) ELSE 0 END PFEMALE  FROM HREMPLOYDETAILS A

JOIN HREMPLOYMAST B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID

JOIN GTCOMPMAST C ON C.GTCOMPMASTID = B.COMPCODE

WHERE A.DOJ <= TO_DATE(SYSDATE)

AND (A.LASTWORKDAY <=  TO_DATE(SYSDATE) OR A.LASTWORKDAY IS NULL)

AND C.COMPCODE = :COMPCODE AND A.IDCARD IN (SELECT DISTINCT AA.IDCARD FROM  ${COMPCODE}ATT AA WHERE AA.ATTDATE = TO_DATE(SYSDATE) )

AND A.IDCARD=:IDCARD

GROUP BY B.GENDER

) A`
            
            const result = await connection.execute(sql,{IDCARD:USERNAME,COMPCODE})
       
            const transformedResult = result?.rows?.map(row => {
                const keyValuePair = {};
                // Assuming the first row contains the column names
                result.metaData.forEach((col, index) => {
                  keyValuePair[col.name] = row[index];
                });
                return keyValuePair;
               });
              
              return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getFilterEmployees(req,res) {
            //  const COMPCODE=String(req.headers?.compcode).toUpperCase() 
            const hod=req?.query?.hod
             const admin=req?.query?.admin
              try {
              
                const result =await prisma_Connector.user.findMany({select:{Idcard:true},where:admin ? {Idcard:{not:"undefined"}} : {hod}})

                console.log("userlog",result);
                
                  return res.json({ statusCode: 0, data: result })
                 
            }
            catch (err) {
                console.error('Error retrieving data:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
            
        }


export async function getCateogryToTSalary(req,res) { 
 
    const year=req.query.payperiod
    const DEPARTMENT=req.query.dep
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
      try {
        const sql =
            `
            SELECT  C.DESIGNATION,SUM(A.NETPAY ) "NETPAY"
FROM ${COMPCODE}HPAYROLL A 
JOIN HREMPLOYDETAILS B ON A.EMPID = B.IDCARD
JOIN GTDESIGNATIONMAST C ON C.GTDESIGNATIONMASTID = B.DESIGNATION
JOIN GTDEPTDESGMAST D ON D.GTDEPTDESGMASTID=B.DEPTNAME and D.MNNAME1=:DEPARTMENT
WHERE A.PAYPERIOD=:PAYPERIOD 
AND A.PCTYPE = 'ACTUAL'
GROUP BY A.PAYPERIOD,C.DESIGNATION
ORDER BY C.DESIGNATION`
            console.log(sql,year);
            
        const result = await connection.execute(sql,{payperiod:year,DEPARTMENT})
        

          
          return res.json({ statusCode: 0, data: result?.rows })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getOverTime(req,res) { 
    const payperiod=req.query.payperiod
    const IDCARD=req.query.Idcard
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
      try {
        const sql =
            `SELECT to_char(A.DOCDATE,'DD-MM-YYYY') DOCDATE,A.OT,
A.OT*ROUND((
SELECT CASE WHEN AA.SAL = 'MONTH' THEN SUM(BB.FORMULA)/30 ELSE SUM(BB.FORMULA) END  TOTSAL FROM HREPINFOMAST AA
JOIN HREPINFODETAIL BB ON AA.HREPINFOMASTID=BB.HREPINFOMASTID
JOIN HRPAYCOMPONENTS CC ON BB.PAYCODE = CC.HRPAYCOMPONENTSID
WHERE AA.EFFDATE IN (SELECT MAX (AAA.EFFDATE) FROM HREPINFOMAST AAA  WHERE AAA.IDNO=AA.IDNO AND AAA.ACTUAL = AA.ACTUAL AND AAA.EFFDATE <= A.DOCDATE )
AND AA.ACTUAL='T' AND AA.IDNO=A.EMPID 
GROUP BY AA.IDNO,AA.SAL
)/8,2) OTAMT FROM ${COMPCODE}HDATTA A WHERE A.DOCDATE BETWEEN 
(
SELECT MIN(AA.STDT) FROM MONTHLYPAYFRQ AA WHERE AA.PAYPERIOD = :PAYPERIOD AND AA.COMPCODE = :COMPCODE
) AND 
(
SELECT MAX(AA.ENDT) FROM MONTHLYPAYFRQ AA WHERE AA.PAYPERIOD = :PAYPERIOD AND AA.COMPCODE = :COMPCODE
)
AND A.EMPID = :IDCARD
 AND A.OT > 0 
ORDER BY A.DOCDATE`

   
        const result = await connection.execute(sql,{PAYPERIOD:payperiod,IDCARD,COMPCODE})
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getEachOverTimeWages(req,res) { 
    const payperiod=req.query.payperiod
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const months = [
        { label: 'January', value: 1},
        { label: 'February', value:2 },
        { label: 'March', value: 3 },
        { label: 'April', value: 4 },
        { label: 'May', value: 5 },
        { label: 'June', value: 6},
        { label: 'July', value:7},
        { label: 'August', value: 8 },
        { label: 'September', value: 9},
        { label: 'October', value: 10},
        { label: 'November', value:11},
        { label: 'December', value:12},
      ];

      var Year=payperiod?.split(" ")[1]
      var Month=payperiod?.split(" ")[0]
       var Mothval=months?.find((data)=>data?.label==Month)
    

    
    const IDCARD=req.query.Idcard
    const connection = await getConnection(res)
      try {
        const sql =
            `select a.OT,to_char(a.DOCDATE,'DD/MM/YYYY')  DOCDATE,(select max(b.gross) from ${COMPCODE}hpayroll b where b.PAYPERIOD=a.PAYPERIOD and b.EMpid=a.EMPID ) gross  from  hrepinfomast h,bpphdatta a where  h.IDNO=a.ID and h.IDNO=:IDCARD  and EXTRACT(month FROM a.DOCDATE )=:MONTH and EXTRACT(year FROM a.DOCDATE )=:YEAR and  a.COMPCODE='BPP' and h.ACTUAL='T' and h.BUYER='F'  order by a.DOCDATE `
        const result = await connection.execute(sql,{IDCARD,MONTH:Mothval?.value,YEAR:Year})
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


export async function getOverTimeWages(req,res) { 
    const payperiod=req.query.payperiod
    const IDCARD=req.query.Idcard
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
      try {
        const sql =
            `select  sum(OTWAGES) otwages,payperiod from ${COMPCODE}HPAYROLL where PCTYPE='ACTUAL' and ID=:IDCARD and payperiod=:payperiod group by payperiod`

   
        const result = await connection.execute(sql,{payperiod,IDCARD})
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}





export async function getMoreDetails(req,res) { 
    const IDCARD=req.query.Idcard
    const COMPCODE=String(req.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
      try {
        const sql =
            ` select em.AADHAARNAME,em.DISABILITY,em.GENDER,em.LANGUAGE,ed.HOSTEL,ed.ESI,ed.PF,ed.IDCARD,to_char(ed.DOJ,'DD-MM-YYYY') DOJ,ed.SALBY,em.FNAME from HREMPLOYMAST em join HREMPLOYDETAILS ed  on ed.HREMPLOYMASTID=em.HREMPLOYMASTID join GTCOMPMAST gc on gc.GTCOMPMASTID=em.COMPCODE where ed.IDCARD=:IDCARD and  gc.COMPCODE=:COMPCODE`
   
        const result = await connection.execute(sql,{IDCARD,COMPCODE})
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getESI(req,res) { 
    const payperiod=req.query.payperiod
    const IDCARD=req.query.Idcard
    const type=req?.query?.type
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
      try {

        var whereparams= type=="M" || !type ? {PAYPERIOD:payperiod,IDCARD} : {IDCARD}
         const sql = type=="M" || !type ?
            `SELECT  SUM(A.ESI) "esi",A.PAYPERIOD
FROM ${COMPCODE}HPAYROLL A WHERE A.EMPID=:IDCARD 
AND A.PAYPERIOD=:PAYPERIOD 
AND A.PCTYPE = 'ACTUAL'
GROUP BY A.PAYPERIOD` :
`SELECT 
    SUM(A.ESI) AS "esi", 
    SUM(A.pf) AS "pf", 
    A.PAYPERIOD
FROM 
   ${COMPCODE}HPAYROLL A 
WHERE 
    A.EMPID = :IDCARD 
    AND A.PCTYPE = 'ACTUAL'
    AND A.PAYPERIOD LIKE '%${payperiod?.split(" ")[1]}'
GROUP BY 
    A.PAYPERIOD`

   
        const result = await connection.execute(sql,whereparams)
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}



export async function getMonthESIPF(req,res) { 
    const payperiod=req.query.payperiod
    const IDCARD=req.query.Idcard
    const type=req?.query?.type
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
      try {
        var whereparams= type=="M" || !type ? {PAYPERIOD:payperiod,IDCARD} : {IDCARD}
        const sql =type=="M" || !type ?
            `SELECT  SUM(A.ESI) "esi",SUM(A.pf) "pf",A.PAYPERIOD
FROM ${COMPCODE}HPAYROLL A WHERE A.EMPID=:IDCARD 
AND A.PAYPERIOD=:PAYPERIOD 
AND A.PCTYPE = 'ACTUAL'
GROUP BY A.PAYPERIOD`:`SELECT 
    SUM(A.ESI) AS "esi", 
    SUM(A.pf) AS "pf", 
    A.PAYPERIOD
FROM 
    ${COMPCODE}HPAYROLL A 
WHERE 
    A.EMPID = :IDCARD 
    AND A.PCTYPE = 'ACTUAL'
    AND A.PAYPERIOD LIKE '%${payperiod?.split(" ")[1]}'
GROUP BY 
    A.PAYPERIOD`

   
        const result = await connection.execute(sql,whereparams)
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}





export async function getInOut(req,res) { 
    const payperiod=req.query.payperiod
    const IDCARD=req.query.Idcard
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    //A.PER
    const connection = await getConnection(res)
      try {
      const sql =
            `select A.EMPID,to_char(A.INDT,'DD/MM/YYYY') INDT,A.INTIME,to_char(A.OUTDT,'DD/MM/YYYY') OUTDT,A.OUTTIME,A.SHIFTCNT,A.OT from ${COMPCODE}hdatta a where A.EMPID = :IDCARD
AND A.DOCDATE BETWEEN (
SELECT A.STDT FROM MONTHLYPAYFRQ A WHERE A.COMPCODE = :COMPCODE AND A.PAYPERIOD = :PAYPERIOD
) AND (
SELECT A.ENDT FROM MONTHLYPAYFRQ A WHERE A.COMPCODE = :COMPCODE AND A.PAYPERIOD = :PAYPERIOD
)
ORDER BY A.DOCDATE`

   
        const result = await connection.execute(sql,{IDCARD,PAYPERIOD:payperiod,COMPCODE})
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getUserMobData(req,res) { 
    const GCOMPCODE=String(req?.headers?.compcode).toUpperCase()
    const Idcard=req.query.Idcard
    const connection = await getConnection(res)
      try {
        const sql =
            `SELECT * FROM MOBUSERVIEW  where IDCARD=:Idcard and GCOMPCODE=:GCOMPCODE`
        const fcm_data=await prisma_Connector?.user?.findUnique({where:{Idcard:Idcard},select:{fcm:true,level:true}})
        
   
        const result = await connection.execute(sql,{GCOMPCODE,Idcard})
        console.log(""+result.rows);
        
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
        
        
          
          return res.json({ statusCode: 0, data: {...transformedResult,...fcm_data} })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}





export async function getDep_wise_Attence_Data(req,res) { 
    const GCOMPCODE=String(req?.headers?.compcode).toUpperCase()
    
   // const Idcard=req.query.Idcard
    const connection = await getConnection(res)
      try {
        const sql =
            `SELECT SUM(A.TOTAL) TOTAL,SUM(A.MALE) TMALE,SUM(A.FEMALE) TFEMALE,
SUM(A.PTOTAL) PTOTAL,SUM(A.PMALE) PMALE,SUM(A.PFEMALE) PFEMALE,
SUM(A.TOTAL)-SUM(A.PTOTAL) ATOTAL,SUM(A.MALE)-SUM(A.PMALE) AMALE,SUM(A.FEMALE)-SUM(A.PFEMALE) AFEMALE FROM
(
SELECT COUNT(*) TOTAL,CASE WHEN B.GENDER = 'MALE' THEN COUNT(*) ELSE 0 END MALE,
CASE WHEN B.GENDER = 'FEMALE' THEN COUNT(*) ELSE 0 END FEMALE,0 PTOTAL,0 PMALE,0 PFEMALE  FROM HREMPLOYDETAILS A
JOIN HREMPLOYMAST B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = B.COMPCODE
JOIN GTDEPTDESGMAST D ON D.GTDEPTDESGMASTID = A.DEPTNAME 
WHERE A.DOJ <= TO_DATE(SYSDATE)
AND (A.LASTWORKDAY <=  TO_DATE(SYSDATE) OR A.LASTWORKDAY IS NULL)
AND C.COMPCODE = :COMPCODE
AND D.MNNAME1 = :DEPARTMENT
GROUP BY B.GENDER
UNION ALL
SELECT 0 TOTAL,0 MALE,0 FEMALE,COUNT(*) PTOTAL,CASE WHEN B.GENDER = 'MALE' THEN COUNT(*) ELSE 0 END PMALE,
CASE WHEN B.GENDER = 'FEMALE' THEN COUNT(*) ELSE 0 END PFEMALE  FROM HREMPLOYDETAILS A
JOIN HREMPLOYMAST B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = B.COMPCODE
JOIN GTDEPTDESGMAST D ON D.GTDEPTDESGMASTID = A.DEPTNAME 
WHERE A.DOJ <= TO_DATE(SYSDATE)
AND (A.LASTWORKDAY <=  TO_DATE(SYSDATE) OR A.LASTWORKDAY IS NULL)
AND C.COMPCODE = :COMPCODE AND A.IDCARD IN (SELECT DISTINCT AA.IDCARD FROM  ${GCOMPCODE}ATT AA WHERE AA.ATTDATE = TO_DATE(SYSDATE) )
AND D.MNNAME1 = :DEPARTMENT
GROUP BY B.GENDER
) A`
      
       
        
   
        const result = await connection.execute(sql,{GCOMPCODE,DEPARTMENT})

        
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
        
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


export async function getDepData(req,res) { 
    const GCOMPCODE=String(req?.headers?.compcode).toUpperCase()
    
   // const Idcard=req.query.Idcard
    const connection = await getConnection(res)
      try {
        const sql =
            `SELECT A.GTDEPTDESGMASTID "id",A.MNNAME1 "name"
      FROM GTDEPTDESGMAST A
          JOIN GTCOMPMAST B ON B.GTCOMPMASTID=A.COMPCODE
             WHERE B.COMPCODE=:GCOMPCODE
          ORDER BY A.MNNAME1`
      
       
        
   
        const result = await connection.execute(sql,{GCOMPCODE})

        
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
        
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}






export async function ToTexpenses(req,res) {  
    const year=req.query.payperiod
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
    
      try {
        const sql =
            `select SUM(NETPAY) salary,'salaries'
       from ${COMPCODE}HPAYROLL a   where a.PAYPERIOD=:payperiod and a.PCTYPE = 'ACTUAL' group by a.PAYPERIOD`
            console.log(sql,year);
            
        const result = await connection.execute(sql,{payperiod:year})
        
          return res.json({ statusCode: 0, data: result?.rows })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getLastMonthSalary(req, res) {
    const Idcard=req?.query?.Idcard
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()


    
  
    const options = {
        year: 'numeric',    // Day of the month (e.g., 3)
        month: 'long'      // Full month name (e.g., September)
      };
     
       const currentDate = new Date();
     currentDate?.setDate(1)
      currentDate.setMonth(currentDate.getMonth() - 1); // Subtract 1 month
      
      // Format the date using toLocaleDateString
      const formattedDate = currentDate.toLocaleDateString('en-GB', options);
 
    const connection = await getConnection(res)
    //sum(A.PERWAGES) Sum(A.EBASIC)
      try {
        const sql =
            ` SELECT SUM(A.NETPAY) SALARY,SUM(A.EGROSS) GROSS,SUM(A.CONV) CONV,sum(A.BASIC) BASIC,sum(A.OTHERS) others,SUM(A.LOP) LOP,sum(A.DA) DA,sum(A.HRA) HRA,sum(A.MED) MED,A.PAYPERIOD,A.SALTYPE,sum(A.WDAYS) WDAYS,sum(A.OT) OT,sum(A.OTWAGES) OTWAGES,sum(A.ADV) ADV,sum(A.TOTDED) TOTDED${COMPCODE=="AGFMGII" ? `,`:`,sum(A.LOAN) LOAN,`}sum(A.MDAYs) MDAYS,sum(A.Pf) PF,sum(A.ESI) ESI
           FROM ${COMPCODE}HPAYROLL A WHERE A.EMPID=:IdCard AND A.PAYPERIOD=:payperiod
          AND A.PCTYPE = 'ACTUAL'  group by A.PAYPERIOD,A.SALTYPE`
 
        const result = await connection.execute(sql,{payperiod:formattedDate,IdCard:Idcard})



         const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           })

           const transform_to_frontend=transformedResult?.map((data)=>{return {...data,salary: data?.SALARY,gross:data?.GROSS,payperiod:data?.PAYPERIOD,saltype:data?.SALTYPE,wd:data?.WDAYS,ot:data?.OT,otamt:data?.OTWAGES,adv:data?.ADV,deb:data?.TOTDED,loan:data?.LOAN,mw:data?.MDAYS,pf:data?.PF,esi:data?.ESI,pwage:0,basic:0} })
          
        return res.json({ statusCode: 0, data:transform_to_frontend?.length>0 ? transform_to_frontend[0] : {}}) 
       // return res.json({ statusCode: 0, data:{salary: result?.rows[0][0],gross:result?.rows[0][1],payperiod:result?.rows[0][2],saltype:result?.rows[0][3],wd:result?.rows[0][4],ot:result?.rows[0][5],otamt:result?.rows[0][6],adv:result?.rows[0][7],deb:result?.rows[0][8],loan:result?.rows[0][9],mw:result?.rows[0][10],pf:result?.rows[0][11],esi:result?.rows[0][12],mw:result?.rows[0][10],pwage:0,basic:0} })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getCurrentMonthLeaves(req, res) {
    const Idcard=req?.query?.Idcard
    const Year=req?.query?.Year
    const  COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const options = {
        year: 'numeric',    // Day of the month (e.g., 3)
        month: 'long'      // Full month name (e.g., September)
      };

     
     
       const currentDate = new Date();
     currentDate?.setDate(1)
      currentDate.setMonth(currentDate.getMonth()); // Subtract 1 month
      
      // Format the date using toLocaleDateString
      const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        var year= Year ||  formattedDate?.slice(-2)
       const connection = await getConnection(res)

       const getActivefin=await fetchActiveFinYearFromDB(connection)
    

    console.log(req?.query)
      try {
        const sql =
            `SELECT IDCARD,FNAME,PAYCAT,LCODE,LDESC,SUM(LCOUNT) AVL,SUM(LT) LT,SUM(LCOUNT)-SUM(LT) LBAL 
FROM (SELECT A.FINYEAR FINYR,A.LCODE, A.LDESC,D.IDCARD,DD.FNAME,B.LDAYS AVL,0 LT,B.LDAYS LCOUNT,C.BANDID PAYCAT FROM HRLEAVEMAST A
JOIN HRLEAVEDEPTDET B ON A.HRLEAVEMASTID = B.HRLEAVEMASTID
JOIN HRBANDMAST C ON C.HRBANDMASTID = A.PAYCAT
JOIN HREMPLOYDETAILS D ON D.IDACTIVE = 'YES' AND D.DOJ < A.STDT
JOIN HREMPLOYMAST DD ON D.HREMPLOYMASTID = DD.HREMPLOYMASTID  
JOIN HRBANDMAST E ON D.BAND = E.HRBANDMASTID AND E.BANDID = C.BANDID  
JOIN GTDEPTDESGMAST F ON F.GTDEPTDESGMASTID = D.DEPTNAME AND ( F.MNAME = B.DEPT OR 'All' = B.DEPT) AND DD.COMPCODE = F.COMPCODE
JOIN GTCOMPMAST G ON G.GTCOMPMASTID = F.COMPCODE AND B.COMPCODE1 = G.COMPCODE  
WHERE A.FINYEAR = :FINYEAR AND B.COMPCODE1 = :COMPCODE
UNION ALL
SELECT A.FINYEAR FINYR,B.LCODE,B.LDESC,D.IDCARD,C.FNAME, CASE WHEN A.LTYPE IN 'OPB' THEN A.OPBAL ELSE 0 END AVL,
CASE WHEN A.LTYPE NOT IN 'OPB' THEN CASE WHEN A.LTYPE NOT IN 'LRQ' THEN (0-A.OPBAL) ELSE A.OPBAL END ELSE 0 END LT,
 CASE WHEN A.LTYPE IN 'OPB' THEN A.OPBAL ELSE 0 END  LCOUNT,A.PAYCAT
FROM HRLEAVEREGMAST A,HRLEAVECODEMAST B,HREMPLOYMAST C,HREMPLOYDETAILS D
WHERE A.LEAVETYPE=B.LCODE AND C.HREMPLOYMASTID=D.HREMPLOYMASTID AND A.IDCARD=C.HREMPLOYMASTID
AND A.FINYEAR=:FINYEAR AND A.COMPCODE = :COMPCODE
UNION ALL
SELECT A.FINYEAR FINYR,A.LCODE, A.LDESC,D.IDCARD,DD.FNAME,
((12-TO_NUMBER(TO_CHAR(ADD_MONTHS((LAST_DAY(TO_DATE(D.DOJ))+1),-1),'mm')))*B.FRM1)+
CASE WHEN TO_NUMBER(TO_CHAR(D.DOJ,'dd'))<16 THEN B.FRM1 ELSE B.FRM2 END  AVL,0 LT,
((12-TO_NUMBER(TO_CHAR(ADD_MONTHS((LAST_DAY(TO_DATE(D.DOJ))+1),-1),'mm')))*B.FRM1)+
CASE WHEN TO_NUMBER(TO_CHAR(D.DOJ,'dd'))<16 THEN B.FRM1 ELSE B.FRM2 END LCOUNT,C.BANDID PAYCAT FROM HRLEAVEMAST A
JOIN HRLEAVEDEPTDET B ON A.HRLEAVEMASTID = B.HRLEAVEMASTID
JOIN HRBANDMAST C ON C.HRBANDMASTID = A.PAYCAT
JOIN HREMPLOYDETAILS D ON D.IDACTIVE = 'YES' AND D.DOJ BETWEEN A.STDT AND A.ENDT
JOIN HREMPLOYMAST DD ON D.HREMPLOYMASTID = DD.HREMPLOYMASTID  
JOIN HRBANDMAST E ON D.BAND = E.HRBANDMASTID AND E.BANDID = C.BANDID  
JOIN GTDEPTDESGMAST F ON F.GTDEPTDESGMASTID = D.DEPTNAME AND ( F.MNAME = B.DEPT OR 'All' = B.DEPT)
JOIN GTCOMPMAST G ON G.GTCOMPMASTID = F.COMPCODE AND B.COMPCODE1 = G.COMPCODE AND DD.COMPCODE = F.COMPCODE  
WHERE A.FINYEAR = :FINYEAR AND B.COMPCODE1 = :COMPCODE AND B.FRM1 > 0
)
GROUP BY LCODE,LDESC,IDCARD,FNAME,PAYCAT
ORDER BY TO_NUMBER(IDCARD),LCODE`
        const result = await connection.execute(sql,{FINYEAR:getActivefin,COMPCODE})


       


          const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
        
        
       var FilteredData=Idcard ? transformedResult?.find((data)=>data?.IDCARD==Idcard) : transformedResult
        
        
        
        return res.json({ statusCode: 0, data:FilteredData })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}





export async function getYearWiseToTSalary(req, res) {
    const  COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
    try {
     
        const sql =
            `SELECT 
    FINYEAR AS YEAR,  
    SUM(NETPAY) AS salary 
FROM 
    ${COMPCODE}HPAYROLL  
WHERE 
    ID > 0  
GROUP BY 
          FINYEAR
ORDER BY 
     FINYEAR`
       

        const result = await connection.execute(sql)
       
        
        return res.json({ statusCode: 0, data: result })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
      //  await connection.close()
    }
}



export async function getActualVsBudget(req, res) {
  const connection = await getConnection(res);
  try {
    const {
      filterMonth,
      filterSupplier,
      filterYear,
      filterAll = "Detailed",
    } = req.query;

    let sql = "";

    if (filterAll === "Detailed") {
      sql = `
              SELECT A.COMPCODE,SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL FROM (
SELECT A.COMPCODE,CASE WHEN A.GENDER = 'MALE' THEN 1 ELSE 0 END MALE,
CASE WHEN A.GENDER = 'FEMALE' THEN 1 ELSE 0 END FEMALE FROM MISTABLE A WHERE A.COMPCODE = '${filterBuyer}'
AND A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE AA.PAYPERIOD = '${currentDt}' 
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE AA.PAYPERIOD = '${currentDt}' 
) )
) A
GROUP BY A.COMPCODE`;
    } else {
      sql = `
                SELECT A.FINYR,ORDERNO,A.BUYERCODE,A.TYPENAME,A.YARNCOST,A.FABRICCOST,A.ACCCOST,A.CMTCOST,
                A.OTHERCOST,A.SALECOST,A.ACTPROFIT,A.ACTPROFITPER,A.ORD,A.MON,A.FINYR||A.MON GRP 
                FROM MISORDBUDACTCDETAILS A 
                WHERE A.TYPENAME <> 'Detailed1' AND A.BUYERCODE = :filterSupplier  
                AND A.Mon = :filterMonth AND A.finYr = :filterYear 
                ORDER BY BUYERCODE,ORDERNO,ORD`;
    }

    const result = await connection.execute(sql);
    let resp = result.rows.map((po) => ({
      finYr: po[0],
      orderNo: po[1],
      buyerCode: po[2],
      typeName: po[3],
      yarnCost: po[4],
      fabricCost: po[5],
      accCost: po[6],
      cmtCost: po[7],
      otherCost: po[8],
      saleCost: po[9],
      actProfit: po[10],
      actProfitPer: po[11],
      ord: po[12],
      mon: po[13],
    }));

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getShortShipmentRatio(req, res) {
  const connection = await getConnection(res);
  try {
    const { filterCat, filterBuyer } = req.query;
    let sql;
    if (filterCat === "Birthday") {
      sql = `
     SELECT A.COMPCODE,A.IDCARD,A.FNAME,A.GENDER,A.DOB,TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOB)/12) AGE,TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOJ)/12) EXP ,A.DOJ,A.MIDCARD FROM MISTABLE A 
WHERE TO_CHAR(SYSDATE, 'WW') = TO_CHAR(A.DOB, 'WW') 
 ${filterBuyer ? `AND A.COMPCODE = '${filterBuyer}'` : ""}
AND A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) )
ORDER BY TO_CHAR(A.DOB, 'MM-DD')

 `;
    } else {
      sql = `SELECT A.COMPCODE,A.IDCARD,A.FNAME,A.GENDER,A.DOB,TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOB)/12) AGE,TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOJ)/12) EXP ,A.DOJ,A.MIDCARD FROM MISTABLE A 
WHERE TO_CHAR(SYSDATE, 'WW') = TO_CHAR(A.DOJ, 'WW') 
 ${filterBuyer ? `AND A.COMPCODE = '${filterBuyer}'` : ""}
AND A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) )
ORDER BY TO_CHAR(A.DOB, 'MM-DD')
`;
    }

    const result = await connection.execute(sql);
    let resp = result.rows.map((po) => ({
      customer: po[0],
      idCard: po[1],
      name: po[2],
      gender: po[3],
      dob: po[4],
      age: po[5],
      exp: po[6],
      doj: po[7],
      mid: po[8],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}





export async function getDepWise_gender_attence(req,res) { 
    const department=req?.query?.dep
    const GCOMPCODE=String(req?.headers?.compcode).toUpperCase()

     
   // const Idcard=req.query.Idcard
    const connection = await getConnection(res)
      try {
        const sql =
            `SELECT SUM(A.TOTAL) TOTAL,SUM(A.MALE) TMALE,SUM(A.FEMALE) TFEMALE,
SUM(A.PTOTAL) PTOTAL,SUM(A.PMALE) PMALE,SUM(A.PFEMALE) PFEMALE,
SUM(A.TOTAL)-SUM(A.PTOTAL) ATOTAL,SUM(A.MALE)-SUM(A.PMALE) AMALE,SUM(A.FEMALE)-SUM(A.PFEMALE) AFEMALE FROM
(
SELECT COUNT(*) TOTAL,CASE WHEN B.GENDER = 'MALE' THEN COUNT(*) ELSE 0 END MALE,
CASE WHEN B.GENDER = 'FEMALE' THEN COUNT(*) ELSE 0 END FEMALE,0 PTOTAL,0 PMALE,0 PFEMALE  FROM HREMPLOYDETAILS A
JOIN HREMPLOYMAST B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = B.COMPCODE
JOIN GTDEPTDESGMAST D ON D.GTDEPTDESGMASTID = A.DEPTNAME 
WHERE A.DOJ <= TO_DATE(SYSDATE)
AND (A.LASTWORKDAY <=  TO_DATE(SYSDATE) OR A.LASTWORKDAY IS NULL)
AND C.COMPCODE = :COMPCODE
AND D.MNNAME1 = :DEPARTMENT
GROUP BY B.GENDER
UNION ALL
SELECT 0 TOTAL,0 MALE,0 FEMALE,COUNT(*) PTOTAL,CASE WHEN B.GENDER = 'MALE' THEN COUNT(*) ELSE 0 END PMALE,
CASE WHEN B.GENDER = 'FEMALE' THEN COUNT(*) ELSE 0 END PFEMALE  FROM HREMPLOYDETAILS A
JOIN HREMPLOYMAST B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = B.COMPCODE
JOIN GTDEPTDESGMAST D ON D.GTDEPTDESGMASTID = A.DEPTNAME 
WHERE A.DOJ <= TO_DATE(SYSDATE)
AND (A.LASTWORKDAY <=  TO_DATE(SYSDATE) OR A.LASTWORKDAY IS NULL)
AND C.COMPCODE = :COMPCODE AND A.IDCARD IN (SELECT DISTINCT AA.IDCARD FROM   ${GCOMPCODE}ATT AA WHERE AA.ATTDATE = TO_DATE(SYSDATE) )
AND D.MNNAME1 = :DEPARTMENT
GROUP BY B.GENDER
) A`
      
       
        
   
        const result = await connection.execute(sql,{COMPCODE:GCOMPCODE,DEPARTMENT:department})

        
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
        
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
       // res.status(500).json({ error: 'Internal Server Error' });
    }
   
}



export async function getPayslip(req,res) { 
    const IdCard=req?.query?.IdCard
     const PAYPERIOD=req?.query?.PAYPERIOD
    const GCOMPCODE=String(req?.headers?.compcode).toUpperCase()
    console.log(IdCard);
    
     
   // const Idcard=req.query.Idcard
    const connection = await getConnection(res)
      try {
        const sql =
            `SELECT * FROM   ${GCOMPCODE}HPAYROLL A
WHERE A.PCTYPE = 'ACTUAL' AND A.PAYPERIOD = :PAYPERIOD AND A.EMPID = :IdCard`
      
       
        

        const result = await connection.execute(sql,{IdCard,PAYPERIOD})

              console.log(PAYPERIOD);
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });

        
           
        
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}





export async function getAllEmployees_By_GENDER_BY_DEPARTMENT(req,res) { 
    const GCOMPCODE=String(req?.headers?.compcode).toUpperCase()
    const dep=req?.query?.dep
    const gender=req?.query?.gender


    console.log(req?.query);
    
     
   // const Idcard=req.query.Idcard
    const connection = await getConnection(res)
      try {
        const sql =
            `SELECT EE.COMPCODE,CC.IDCARD,BB.FNAME EMPNAME,BB.GENDER,GG.BANDID,FF.MNNAME1 DEPARTMENT,DD.DESIGNATION,CC.DOJ
FROM HREMPLOYMAST BB
JOIN HREMPLOYDETAILS CC ON BB.HREMPLOYMASTID = CC.HREMPLOYMASTID
JOIN GTDESIGNATIONMAST DD ON DD.GTDESIGNATIONMASTID = CC.DESIGNATION
JOIN GTCOMPMAST EE ON EE.GTCOMPMASTID = BB.COMPCODE
JOIN GTDEPTDESGMAST FF ON FF.GTDEPTDESGMASTID = CC.DEPTNAME
JOIN HRBANDMAST GG ON GG.HRBANDMASTID = CC.BAND
WHERE CC.DOJ <= TO_DATE(SYSDATE) AND (CC.LASTWORKDAY <= TO_DATE(SYSDATE) OR CC.LASTWORKDAY IS NULL)
AND EE.COMPCODE = :COMPCODE AND CC.IDACTIVE='YES'`




      
       
        
   
        const result = await connection.execute(sql,{COMPCODE:GCOMPCODE})

        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
        

           const filterData=transformedResult?.filter((data)=>data?.DEPARTMENT==dep && data?.GENDER==gender)
        
          
          return res.json({ statusCode: 0, data: filterData })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function executeProcedure(req, res) {
  const connection = await getConnection(res);
  try {
    await connection.execute(`BEGIN MISHR('aa'); END;`);

    res.json({ success: true, message: "Data refetch executed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function getSalaryAgewise(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer = "", search = {} } = req.query;

  let result = [];
  let filterBuyerList = "";

  if (filterBuyer && filterBuyer.trim() !== "") {
    filterBuyerList = filterBuyer
      .split(",")
      .map((buyer) => `'${buyer.trim()}'`)
      .join(",");
  }

  let whereClause = "1=1";
  if (filterBuyerList)
    whereClause += ` AND DD.COMPCODE IN (${filterBuyerList})`;

  if (search.FNAME)
    whereClause += ` AND LOWER(DD.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(DD.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD)
    whereClause += ` AND DD.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(DD.COMPCODE) = LOWER('${search.COMPCODE}')`;

  const sql = `
    SELECT 
        SLAP,
        PAYCAT,
        SUM(NETPAY) AS TOTAL_NETPAY,
        COUNT(EMPID) AS EMP_COUNT
    FROM (
        SELECT 
            A.IDCARD AS EMPID,
            A.FNAME,
            A.GENDER,
            A.DOJ,
            A.DEPARTMENT,
            A.PAYCAT,
            A.COMPCODE,
            A.EMPTYPE,
            A.DESIGNATION,
            A.NETPAY,

            FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), A.DOB) / 12) AS AGE,

            CASE 
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), A.DOB) / 12) BETWEEN 18 AND 25 THEN '18 - 25'
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), A.DOB) / 12) BETWEEN 25 AND 35 THEN '25 - 35'
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), A.DOB) / 12) BETWEEN 35 AND 45 THEN '35 - 45'
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), A.DOB) / 12) BETWEEN 45 AND 60 THEN '45 - 60'
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), A.DOB) / 12) > 60 THEN '60 Above'
            END AS SLAP

        FROM (
            SELECT
                DD.IDCARD,
                DD.FNAME,
                DD.GENDER,
                DD.DOJ,
                DD.DEPARTMENT,
                NVL(SUM(A.NETPAY), 0) AS NETPAY,
                DD.PAYCAT,
                DD.COMPCODE,
                AA.EMPTYPE,
                EE.DESIGNATION,
                DD.DOB
            FROM MISTABLE DD
            JOIN HPAYROLL A
                ON A.EMPID = DD.IDCARD
                AND A.PCTYPE = 'ACTUAL'
                AND A.PAYPERIOD = (
                    SELECT MAX(PAYPERIOD)
                    FROM HPAYROLL X
                    JOIN MISTABLE M ON X.EMPID = M.IDCARD
                    WHERE X.PCTYPE = 'ACTUAL'
                    AND M.COMPCODE = DD.COMPCODE
                )
            JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD
            JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
            JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
            JOIN GTDESIGNATIONMAST EE ON EE.GTDESIGNATIONMASTID = BB.DESIGNATION
            WHERE ${whereClause}
            GROUP BY 
                DD.IDCARD, DD.FNAME, DD.GENDER, DD.DOJ, DD.DEPARTMENT,
                DD.PAYCAT, DD.COMPCODE, DD.DOB,
                AA.EMPTYPE, EE.DESIGNATION
        ) A
    )
    WHERE SLAP IS NOT NULL
    GROUP BY SLAP, PAYCAT
    ORDER BY SLAP
`;

  try {
    const queryResult = await connection.execute(sql);
    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary details",
      error,
    });
  }
}

export async function getAgewiseESI(req, res) {
  const connection = await getConnection(res);

  const { filterBuyer = "", filterYear, search = {} } = req.query;

  // Build buyer list
  const buyerList = filterBuyer
    ? filterBuyer.split(",").map((b) => `'${b.trim()}'`).join(",")
    : null;

  // Guard: if no buyers provided, return empty result
  if (!buyerList) {
    return res.status(200).json({ success: true, data: [] });
  }

  // Build search filters — FF is MISTABLE alias in this query
  let searchClause = "";
  if (search.FNAME)
    searchClause += ` AND LOWER(FF.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    searchClause += ` AND LOWER(FF.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD)
    searchClause += ` AND FF.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    searchClause += ` AND LOWER(FF.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    searchClause += ` AND LOWER(A.COMPCODE) = LOWER('${search.COMPCODE}')`;

  const sql = `
    SELECT
        SLAP,
        PAYCAT,
        FINYR,
        SUM(NETPAY)  AS TOTAL_NETPAY,
        SUM(ESI)     AS TOTAL_ESI,
        SUM(PF)      AS TOTAL_PF,
        COUNT(EMPID) AS HEADCOUNT,
        STDT,
        STDT1,
        PAYPERIOD
    FROM (
        SELECT
            A.EMPID,
            A.NETPAY,
            A.ESI,
            A.PF,
            EE.FINYR,
            FF.PAYCAT,
            EE.PAYPERIOD,
            TO_CHAR(EE.STDT, 'MM')                               AS STDT,
            TO_CHAR(EE.STDT, 'YY')                               AS STDT1,
            FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), DD.DOB) / 12)   AS AGE,
            CASE
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), DD.DOB) / 12) BETWEEN 18 AND 25 THEN '18 - 25'
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), DD.DOB) / 12) BETWEEN 26 AND 35 THEN '26 - 35'
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), DD.DOB) / 12) BETWEEN 36 AND 45 THEN '36 - 45'
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), DD.DOB) / 12) BETWEEN 46 AND 60 THEN '46 - 60'
                WHEN FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE), DD.DOB) / 12) >= 61             THEN '61 +'
            END AS SLAP
        FROM HPAYROLL A
        JOIN HREMPLOYMAST DD    ON  A.EMPID       = DD.IDCARDNO
        JOIN HREMPLOYDETAILS BB ON  BB.HREMPLOYMASTID = DD.HREMPLOYMASTID
        -- HRBANDMAST removed: never used in SELECT
        JOIN MISTABLE FF        ON  FF.IDCARD      = DD.IDCARDNO
        JOIN MONTHLYPAYFRQ EE   ON  EE.PAYPERIOD   = A.PAYPERIOD
                                AND EE.COMPCODE     = A.COMPCODE
        WHERE EE.FINYR      = '${filterYear}'
          AND A.COMPCODE IN (${buyerList})
          AND A.PCTYPE    = 'BUYER'
          ${searchClause}
    ) T
    WHERE SLAP IS NOT NULL
    GROUP BY SLAP, PAYCAT, FINYR, STDT, STDT1, PAYPERIOD
    ORDER BY STDT1, STDT, SLAP, PAYCAT
  `;

  try {
    const queryResult = await connection.execute(sql);
    const result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, col, i) => {
        acc[col.name] = row[i];
        return acc;
      }, {})
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching agewise ESI details",
      error,
    });
  }
}

export async function getSalarydet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer = "", search = {} } = req.query;

  let result = [];
  let filterBuyerList = "";

  if (filterBuyer && filterBuyer.trim() !== "") {
    filterBuyerList = filterBuyer
      .split(",")
      .map((buyer) => `'${buyer.trim()}'`)
      .join(",");
  }

  let whereClause = "1=1";
  if (filterBuyerList)
    whereClause += ` AND DD.COMPCODE IN (${filterBuyerList})`;

  if (search.FNAME)
    whereClause += ` AND LOWER(DD.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(DD.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD)
    whereClause += ` AND DD.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(DD.COMPCODE) = LOWER('${search.COMPCODE}')`;

  const sql = `
 WITH LATEST_PERIOD AS (
    SELECT
        M.COMPCODE,
        MAX(X.PAYPERIOD) AS MAX_PAYPERIOD
    FROM HPAYROLL X
    JOIN MISTABLE M
        ON X.EMPID = M.IDCARD
    -- PCTYPE filter removed
    GROUP BY M.COMPCODE
)
SELECT *
FROM (
    SELECT
        DD.IDCARD                                            AS EMPID,
        DD.FNAME,
        DD.GENDER,
        DD.DOJ,
        DD.DEPARTMENT,
        DD.PAYCAT,
        DD.COMPCODE,
        AA.EMPTYPE,
        EE.DESIGNATION,
        NVL(SUM(A.NETPAY), 0)                              AS NETPAY,
        TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE), DD.DOB) / 12) AS AGE_YEARS
    FROM MISTABLE DD
    JOIN LATEST_PERIOD LP
        ON LP.COMPCODE = DD.COMPCODE
    JOIN HPAYROLL A
        ON A.EMPID      = DD.IDCARD
        AND A.PAYPERIOD  = LP.MAX_PAYPERIOD
        -- PCTYPE filter removed here too
    JOIN HREMPLOYDETAILS BB
        ON BB.IDCARD = A.EMPID
    JOIN HREMPLOYMAST AA
        ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
    JOIN GTDESIGNATIONMAST EE
        ON EE.GTDESIGNATIONMASTID = BB.DESIGNATION
    WHERE ${whereClause}
    GROUP BY
        DD.IDCARD,
        DD.FNAME,
        DD.GENDER,
        DD.DOJ,
        DD.DEPARTMENT,
        DD.PAYCAT,
        DD.COMPCODE,
        AA.EMPTYPE,
        EE.DESIGNATION,
        DD.DOB
) A
ORDER BY A.EMPID
  `;

  try {
    const queryResult = await connection.execute(sql);
    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary details",
      error,
    });
  }
}

export async function getLastSalarydet(req, res) {
  const connection = await getConnection(res);
  const sql = `
   WITH LAST_MONTH AS (
SELECT A.COMPCODE,MAX(EE.STDT) AS LAST_STDT
FROM HPAYROLL A
JOIN MONTHLYPAYFRQ EE
ON EE.PAYPERIOD = A.PAYPERIOD
AND EE.COMPCODE = A.COMPCODE
WHERE A.PCTYPE = 'BUYER' AND A.COMPCODE <> 'FLF'
AND A.NETPAY > 0
GROUP BY A.COMPCODE
)
SELECT
A.COMPCODE,
A.PAYPERIOD,
A.FINYR,
SUM(A.NETPAY) AS NETPAY,
COUNT(A.EMPID) AS HEADCOUNT,
A.STDT,
A.STDT1
FROM
(
SELECT
A.COMPCODE,
A.PAYPERIOD,
EE.FINYR,
A.NETPAY,
A.EMPID,
TO_CHAR(EE.STDT,'MM') AS STDT,
TO_CHAR(EE.STDT,'YY') AS STDT1
FROM HPAYROLL A
JOIN HREMPLOYMAST AA ON A.EMPID = AA.IDCARDNO
JOIN HREMPLOYDETAILS BB ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD = A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE
JOIN ( SELECT Z.LAST_STDT,Z.COMPCODE FROM LAST_MONTH Z ) Z ON EE.STDT = Z.LAST_STDT AND A.COMPCODE = Z.COMPCODE 
AND Z.COMPCODE = EE.COMPCODE
WHERE A.PCTYPE = 'BUYER'
AND A.NETPAY > 0
) A
GROUP BY
A.COMPCODE, A.FINYR, A.PAYPERIOD, A.STDT, A.STDT1
ORDER BY
A.STDT1, A.STDT
  `;

  try {
    const result = await connection.execute(sql);
    // console.log(result, "result");

    let resp = result.rows.map((po) => ({
      customer: po[0],
      month: po[1],
      Year: po[2],
      netpay: po[3],
      headCount: po[4],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary details",
      error,
    });
  }
}

export async function getOTwagesdet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {}, filterYear } = req.query;

  // Guard: buyer required for this query
  if (!filterBuyer || filterBuyer.trim() === "") {
    return res.status(200).json({ success: true, data: [] });
  }

  let searchClause = "";
  if (search.FNAME)
    searchClause += ` AND LOWER(DD.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    searchClause += ` AND LOWER(DD.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD)
    searchClause += ` AND DD.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    searchClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    searchClause += ` AND LOWER(DD.COMPCODE) = LOWER('${search.COMPCODE}')`;

  const sql = `
    SELECT
        DD.IDCARD                                           AS EMPID,
        DD.FNAME,
        DD.GENDER,
        DD.DOJ,
        DD.DEPARTMENT,
        FF.DESIGNATION,
        AA.EMPTYPE,
        A.PAYPERIOD,
        A.OTWAGES,
        EE.FINYR,
        TO_CHAR(EE.STDT, 'MM')                             AS STDT,
        TO_CHAR(EE.STDT, 'YY')                             AS STDT1,
        TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE), DD.DOB) / 12) AS AGE
    FROM MISTABLE DD
    JOIN HPAYROLL A
        ON  A.EMPID   = DD.IDCARD
        AND A.PCTYPE  = 'BUYER'          -- remove if PCTYPE doesn't exist
        AND A.OTWAGES > 0
    JOIN HREMPLOYMAST AA
        ON  AA.IDCARDNO = A.EMPID
    JOIN HREMPLOYDETAILS BB
        ON  BB.HREMPLOYMASTID = AA.HREMPLOYMASTID
    JOIN MONTHLYPAYFRQ EE
        ON  EE.PAYPERIOD = A.PAYPERIOD
        AND EE.COMPCODE  = A.COMPCODE
        AND EE.FINYR     = '${filterYear}'
    JOIN GTDESIGNATIONMAST FF
        ON  FF.GTDESIGNATIONMASTID = BB.DESIGNATION
    WHERE A.COMPCODE = '${filterBuyer}'
    ${searchClause}
    ORDER BY
        TO_CHAR(EE.STDT, 'YY'),
        TO_CHAR(EE.STDT, 'MM')
  `;

  try {
    const queryResult = await connection.execute(sql);
    const result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, col, i) => {
        acc[col.name] = row[i];
        return acc;
      }, {})
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching OT wages details",
      error,
    });
  }
}

export async function getpfdet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {}, filterPeriod } = req.query; // ← pass payperiod as param

  // Guard: prevent IN () crash
  if (!filterBuyer || filterBuyer.trim() === "") {
    return res.status(200).json({ success: true, data: [] });
  }

  const buyerList = filterBuyer
    .split(",")
    .map((b) => `'${b.trim()}'`)
    .join(",");

  let searchClause = "";
  if (search.FNAME)
    searchClause += ` AND LOWER(AA.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    searchClause += ` AND LOWER(AA.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD)
    searchClause += ` AND A.EMPID LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    searchClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    searchClause += ` AND LOWER(DD.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
    SELECT
        A.EMPID,
        AA.FNAME,
        AA.GENDER,
        AA.DOJ,                  -- DOJ lives in HREMPLOYMAST, not HREMPLOYDETAILS
        DD.DEPARTMENT,
        A.PF        AS NETPAY,
        DD.PAYCAT,
        DD.COMPCODE
    FROM HPAYROLL A
    JOIN HREMPLOYMAST AA
        ON  AA.IDCARDNO       = A.EMPID
    JOIN HREMPLOYDETAILS BB
        ON  BB.HREMPLOYMASTID = AA.HREMPLOYMASTID
    -- HRBANDMAST removed: never used in SELECT
    JOIN MISTABLE DD
        ON  DD.IDCARD         = A.EMPID
    WHERE A.PCTYPE             = 'BUYER'          -- remove if PCTYPE doesn't exist
      AND A.PAYPERIOD LIKE '%${filterPeriod}%'    -- passed as query param, not lstMnth
      AND A.PF                > 0
      AND DD.COMPCODE         IN (${buyerList})
      ${searchClause}
    ORDER BY DD.COMPCODE, A.EMPID
  `;

  try {
    const queryResult = await connection.execute(sql);
    const result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, col, i) => {
        acc[col.name] = row[i];
        return acc;
      }, {})
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getpfdet:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getesidet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {} } = req.query;
  let result = [];
  let filterBuyerList = "";

  try {
    const payPeriodQuery = `SELECT MAX(PAYPERIOD) AS LATEST_PERIOD FROM HPAYROLL`;
    const payPeriodResult = await connection.execute(payPeriodQuery);
    const lstMnth = payPeriodResult.rows?.[0]?.[0] || "";

    if (!lstMnth) {
      return res
        .status(400)
        .json({ success: false, message: "No PAYPERIOD found in HPAYROLL" });
    }

    if (filterBuyer && filterBuyer.trim() !== "") {
      filterBuyerList = filterBuyer
        .split(",")
        .map((buyer) => `'${buyer.trim()}'`)
        .join(",");
    }

    let whereClause = "1=1";
    if (filterBuyerList) {
      whereClause += ` AND DD.COMPCODE IN (${filterBuyerList})
                       AND A.PCTYPE = 'BUYER'
                       AND A.PAYPERIOD = '${lstMnth}'
                       AND A.ESI > 0`;
    }

    if (search.FNAME)
      whereClause += ` AND LOWER(AA.FNAME) LIKE LOWER('%${search.FNAME}%')`;
    if (search.GENDER)
      whereClause += ` AND LOWER(AA.GENDER) LIKE LOWER('${search.GENDER}%')`;
    if (search.MIDCARD) whereClause += ` AND A.EMPID LIKE '${search.MIDCARD}'`;
    if (search.DEPARTMENT)
      whereClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
    if (search.COMPCODE)
      whereClause += ` AND LOWER(DD.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

    const sql = `
      SELECT A.EMPID, AA.FNAME, AA.GENDER, BB.DOJ,
             DD.DEPARTMENT, A.ESI AS NETPAY, DD.PAYCAT, DD.COMPCODE
      FROM HPAYROLL A
      JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD
      JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
      JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
      JOIN MISTABLE DD ON A.EMPID = DD.IDCARD
      WHERE ${whereClause}
      ORDER BY A.EMPID`;

    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res
      .status(200)
      .json({ success: true, data: result, payPeriodUsed: lstMnth });
  } catch (error) {
    console.error("Error in getesidet:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getattdet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, filterYear, search = {} } = req.query;
  let result = [];
  const filterBuyerList = filterBuyer
    .split(",")
    .map((buyer) => `'${buyer.trim()}'`)
    .join(",");

  let whereClause = `A.COMPCODE IN (${filterBuyerList}) 
                       AND B.FINYR = '${filterYear}'`;

  if (search.FNAME)
    whereClause += ` AND LOWER(A.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(A.GENDER) = LOWER('${search.GENDER}')`;
  if (search.MIDCARD) whereClause += ` AND A.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(A.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(A.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
    SELECT 
        A.IDCARD EMPID,
        A.PAYCAT,
        A.FNAME,
        A.GENDER,
        A.DOJ,
        B.PAYPERIOD,
        A.DEPARTMENT,
        (SELECT LISTAGG(C.REMARKS, ',') WITHIN GROUP (ORDER BY C.REMARKS)
         FROM EMPDESGENTRY C 
         WHERE C.IDCARDNO = A.IDCARD 
         AND C.LWORKDAY = A.DOL) AS REASON,
        A.COMPCODE,
        A.DOL
    FROM MISTABLE A
    JOIN MONTHLYPAYFRQ B ON B.COMPCODE = A.COMPCODE 
        AND A.DOL BETWEEN B.STDT AND B.ENDT
    WHERE ${whereClause}
    ORDER BY A.COMPCODE, 1, 2, 3`;

  try {
    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getattdet:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getnewjoin(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, filterYear, search = {} } = req.query;
  let result = [];

  let whereClause = `A.COMPCODE = '${filterBuyer}' 
  AND B.FINYR = '${filterYear}'
                       `;

  if (search.FNAME)
    whereClause += ` AND LOWER(A.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(A.GENDER) = LOWER('${search.GENDER}')`;
  if (search.MIDCARD) whereClause += ` AND A.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(A.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(A.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
    SELECT 
        A.IDCARD EMPID,
        A.PAYCAT,
        A.FNAME,
        A.GENDER,
        A.DOJ,
        A.DEPARTMENT,
        A.COMPCODE,
        A.DOL,
        A.STATE,
        B.PAYPERIOD
    FROM MISTABLE A
    JOIN MONTHLYPAYFRQ B ON B.COMPCODE = A.COMPCODE 
        AND A.DOJ BETWEEN B.STDT AND B.ENDT
    WHERE ${whereClause}
    ORDER BY A.COMPCODE, 1, 2, 3`;

  try {
    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getnewjoin:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getattdetTable(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {}, filterYear } = req.query;
  let result = [];

  let whereClause = `C.IDCARDNO = A.IDCARD 
         AND C.LWORKDAY = A.DOL) AS REASON,
        A.COMPCODE,
        A.DOL
            FROM MISTABLE A
            JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE 
            AND B.FINYR = '${filterYear}' 
            AND A.COMPCODE IN '${filterBuyer}'
            AND A.DOL BETWEEN B.STDT AND B.ENDT`;

  if (search.FNAME)
    whereClause += ` AND LOWER(A.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(A.GENDER) = LOWER('${search.GENDER}')`;
  if (search.MIDCARD) whereClause += ` AND A.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(A.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(A.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
   SELECT B.PAYPERIOD, B.STDT ,B.PAYPERIOD,
  A.IDCARD EMPID,
        A.PAYCAT,
        A.FNAME,
        A.GENDER,
        A.DOJ,
        A.DEPARTMENT,
        (SELECT LISTAGG(C.REMARKS, ',') WITHIN GROUP (ORDER BY C.REMARKS)
         FROM EMPDESGENTRY C 
    WHERE ${whereClause}
   `;

  try {
    const queryResult = await connection.execute(sql);

    result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing SQL:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getretdetTable(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {}, filterYear } = req.query;
  let result = [];

  // Initialize whereClause
  let whereClause = "";

  // Add filters dynamically
  if (search.FNAME)
    whereClause += ` AND LOWER(A.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(A.GENDER) = LOWER('${search.GENDER}')`;
  if (search.MIDCARD) whereClause += ` AND A.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(A.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(A.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  // Build final SQL query
  const sql = `
    SELECT * FROM (
      SELECT
        A.IDCARD AS EMPID,
        A.PAYCAT,
        A.FNAME,
        A.GENDER,
        A.DOJ,
        A.DEPARTMENT,
        B.PAYPERIOD,
        B.STDT,
        A.COMPCODE
      FROM MISTABLE A
      JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE
      WHERE A.COMPCODE = '${filterBuyer}'
        AND B.FINYR = '${filterYear}'
        AND A.DOJ < B.STDT
        AND (A.DOL <= B.ENDT OR A.DOL IS NULL)
        AND NOT EXISTS (
          SELECT 'X' FROM (
            SELECT AA.IDCARD, AB.PAYPERIOD, AB.COMPCODE
            FROM MISTABLE AA
            JOIN MONTHLYPAYFRQ AB ON AA.COMPCODE = AB.COMPCODE AND AB.FINYR = '${filterYear}'
            WHERE AA.DOL BETWEEN AB.STDT AND AB.ENDT
          ) ZA
          WHERE ZA.IDCARD = A.IDCARD AND ZA.PAYPERIOD = B.PAYPERIOD AND A.COMPCODE = ZA.COMPCODE
        )

      UNION

      SELECT
        A.IDCARD AS EMPID,
        A.PAYCAT,
        A.FNAME,
        A.GENDER,
        A.DOJ,
        A.DEPARTMENT,
        B.PAYPERIOD,
        B.STDT,
        A.COMPCODE
      FROM MISTABLE A
      JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE AND B.FINYR = '${filterYear}'
      WHERE A.COMPCODE = '${filterBuyer}'
        AND EXISTS (
          SELECT 'X' FROM (
            SELECT AA.IDCARD, AB.PAYPERIOD, AB.COMPCODE
            FROM MISTABLE AA
            JOIN MONTHLYPAYFRQ AB ON AA.COMPCODE = AB.COMPCODE AND AB.FINYR = '${filterYear}'
            WHERE AA.DOJ BETWEEN AB.STDT AND AB.ENDT
          ) ZA
          WHERE ZA.IDCARD = A.IDCARD AND ZA.PAYPERIOD = B.PAYPERIOD AND A.COMPCODE = ZA.COMPCODE
        )
        AND NOT EXISTS (
          SELECT 'X' FROM (
            SELECT AA.IDCARD, AB.PAYPERIOD, AB.COMPCODE
            FROM MISTABLE AA
            JOIN MONTHLYPAYFRQ AB ON AA.COMPCODE = AB.COMPCODE AND AB.FINYR = '${filterYear}'
            WHERE AA.DOL BETWEEN AB.STDT AND AB.ENDT
          ) ZA
          WHERE ZA.IDCARD = A.IDCARD AND ZA.PAYPERIOD = B.PAYPERIOD AND A.COMPCODE = ZA.COMPCODE
        )
    ) A
    WHERE 1=1 ${whereClause}
    ORDER BY EMPID, STDT
  `;

  try {
    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing SQL:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getagedet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {} } = req.query;
  let result = [];
  let whereClause = `AA.COMPCODE IN ('${filterBuyer}')
  AND AA.DOB <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
) AND (AA.DOL IS NULL OR AA.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
) )`;

  if (search.FNAME)
    whereClause += ` AND LOWER(AA.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(AA.GENDER) = LOWER('${search.GENDER}')`;
  if (search.MIDCARD)
    whereClause += ` AND AA.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(AA.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(AA.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
    SELECT AA.IDCARD AS EMPID,AA.FNAME,AA.PAYCAT,MONTHS_BETWEEN(TRUNC(SYSDATE),AA.DOB)/12 AS AGEMON,
AA.COMPCODE,AA.DEPARTMENT,AA.GENDER FROM MISTABLE AA
JOIN HREMPLOYMAST BB ON AA.IDCARD = BB.IDCARDNO
JOIN HREMPLOYDETAILS CC ON BB.HREMPLOYMASTID = CC.HREMPLOYMASTID
WHERE ${whereClause}
    `;

  try {
    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getexpdet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {} } = req.query;
  let result = [];

  let whereClause = `AA.COMPCODE IN ('${filterBuyer}')
AND AA.DOJ <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
) AND (AA.DOL IS NULL OR AA.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
) ) ORDER BY EXPMON ASC `;

  if (search.FNAME)
    whereClause += ` AND LOWER(AA.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(AA.GENDER) = LOWER('${search.GENDER}')`;
  if (search.MIDCARD)
    whereClause += ` AND AA.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(AA.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(AA.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
        SELECT AA.IDCARD AS EMPID,AA.FNAME,AA.PAYCAT,
MONTHS_BETWEEN(TRUNC(SYSDATE),AA.DOJ)/12 AS EXPMON,
AA.COMPCODE,
AA.DEPARTMENT,
AA.GENDER
FROM MISTABLE AA
JOIN HREMPLOYMAST BB ON AA.IDCARD = BB.IDCARDNO
JOIN HREMPLOYDETAILS CC ON BB.HREMPLOYMASTID = CC.HREMPLOYMASTID
WHERE 
${whereClause}
    `;

  try {
    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getbgdet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {} } = req.query;
  let result = [];

  let whereClause = `AA.COMPCODE IN ('${filterBuyer}')
AND AA.BGF IS NOT NULL AND AA.DOJ <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
) AND (AA.DOL IS NULL OR AA.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
) )
ORDER BY 2 DESC,1`;

  if (search.FNAME)
    whereClause += ` AND LOWER(AA.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(AA.GENDER) = LOWER('${search.GENDER}')`;
  if (search.MIDCARD)
    whereClause += ` AND AA.IDCARD LIKE '%${search.MIDCARD}%'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(AA.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(AA.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
   SELECT AA.IDCARD AS EMPID,AA.FNAME,AA.PAYCAT,AA.COMPCODE,AA.DEPARTMENT,AA.GENDER,CC.BGF AS BLOODGROUP
FROM MISTABLE AA
JOIN HREMPLOYMAST bb on AA.IDCARD = BB.IDCARDNO
JOIN HRBGMAST CC ON BB.BG = CC.HRBGMASTID
WHERE  ${whereClause}
    `;

  try {
    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPfDataDet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {}, selectedYear } = req.query;
  let result = [];
  let whereClause = `DD.COMPCODE IN ('${filterBuyer}') AND A.PCTYPE = 'BUYER' and EE.FINYR  = '${selectedYear}' AND A.PF> 0
    `;

  if (search.FNAME)
    whereClause += ` AND LOWER(AA.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(AA.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD) whereClause += ` AND A.EMPID LIKE '${search.MIDCARD}'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(DD.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
      SELECT A.EMPID,AA.FNAME,AA.GENDER,BB.DOJ,DD.DEPARTMENT,A.PF AS NETPAY, DD.PAYCAT, DD.COMPCODE,A.PAYPERIOD,TO_CHAR(EE.STDT,'MM') DAY,TO_CHAR(EE.STDT,'YYYY') YEAR
FROM HPAYROLL A
JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD
JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
JOIN MISTABLE  DD ON A.EMPID = DD.IDCARD
JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD = A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE

WHERE ${whereClause}
ORDER BY A.EMPID,YEAR,DAY
 `;

  try {
    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getEsiDataDet(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {}, selectedYear } = req.query;
  let result = [];
  let whereClause = `DD.COMPCODE IN ('${filterBuyer}') AND A.PCTYPE = 'BUYER' and EE.FINYR  = '${selectedYear}' AND A.ESI> 0
    `;

  if (search.FNAME)
    whereClause += ` AND LOWER(AA.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(AA.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD) whereClause += ` AND A.EMPID LIKE '${search.MIDCARD}'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(DD.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
      SELECT A.EMPID,AA.FNAME,AA.GENDER,BB.DOJ,DD.DEPARTMENT,A.ESI AS NETPAY, DD.PAYCAT, DD.COMPCODE,A.PAYPERIOD,TO_CHAR(EE.STDT,'MM') DAY,TO_CHAR(EE.STDT,'YYYY') YEAR
FROM HPAYROLL A
JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD
JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
JOIN MISTABLE  DD ON A.EMPID = DD.IDCARD
JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD = A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE

WHERE ${whereClause}
ORDER BY A.EMPID,YEAR,DAY
 `;

  try {
    const queryResult = await connection.execute(sql);

    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getEmployeesDetail(req, res) {
  const connection = await getConnection(res);
  const { filterBuyer, search = {} } = req.query;
  const filterBuyerList = filterBuyer
    .split(",")
    .map((buyer) => `'${buyer.trim()}'`)
    .join(",");

  let whereClause = `
          A.DOJ <= (
                SELECT MIN(AA.ENDT)
                FROM MONTHLYPAYFRQ AA
                WHERE AA.PAYPERIOD = '${currentDt}'
            )
            AND (A.DOL IS NULL OR A.DOL <= (
                SELECT MIN(AA.ENDT)
                FROM MONTHLYPAYFRQ AA
                WHERE AA.PAYPERIOD = '${currentDt}'
            ))
        `;

  if (search.FNAME)
    whereClause += ` AND LOWER(A.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(A.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD) whereClause += ` AND A.MIDCARD LIKE '${search.MIDCARD}'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(A.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(A.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
           SELECT FNAME, GENDER, MIDCARD, DEPARTMENT, COMPCODE, PAYCAT
            FROM MISTABLE A
            WHERE
            A.COMPCODE IN  (${filterBuyerList}) 
            AND ${whereClause} ORDER BY TO_NUMBER(A.MIDCARD) ASC
        `;
  const countSql = `
            SELECT COUNT(*) AS TOTAL_COUNT
            FROM MISTABLE A  
            WHERE A.COMPCODE IN (${filterBuyerList}) AND ${whereClause}
        `;

  try {
    const queryResult = await connection.execute(sql);
    let result = queryResult.rows.map((row) => {
      return queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {});
    });
    const countResult = await connection.execute(countSql);
    let totalCount = countResult.rows[0][0];
    res.status(200).json({ success: true, data: result, totalCount });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
      await connection.close();
  }
}

export async function getEmployeesDetail1(req, res) {
  const connection = await getConnection(res);
  const { search = {} } = req.query;
  let whereClause = `
            A.DOJ <= (
                SELECT MIN(AA.ENDT)
                FROM MONTHLYPAYFRQ AA
                WHERE AA.PAYPERIOD = '${currentDt}'
            )
            AND (A.DOL IS NULL OR A.DOL <= (
                SELECT MIN(AA.ENDT)
                FROM MONTHLYPAYFRQ AA
                WHERE AA.PAYPERIOD = '${currentDt}'
            ))
        `;

  if (search.FNAME)
    whereClause += ` AND LOWER(A.FNAME) LIKE LOWER('%${search.FNAME}%')`;
  if (search.GENDER)
    whereClause += ` AND LOWER(A.GENDER) LIKE LOWER('${search.GENDER}%')`;
  if (search.MIDCARD) whereClause += ` AND A.MIDCARD LIKE '${search.MIDCARD}'`;
  if (search.DEPARTMENT)
    whereClause += ` AND LOWER(A.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
  if (search.COMPCODE)
    whereClause += ` AND LOWER(A.COMPCODE) LIKE LOWER('%${search.COMPCODE}%')`;

  const sql = `
           SELECT FNAME, GENDER, MIDCARD, DEPARTMENT, COMPCODE, PAYCAT
            FROM MISTABLE A
            WHERE
         ${whereClause}  ORDER BY TO_NUMBER(A.MIDCARD) ASC
        `;

  try {
    const queryResult = await connection.execute(sql);
    let result = queryResult.rows.map((row) => {
      return queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {});
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
      await connection.close();
  }
}

export async function getOrdersInHand(req, res) {
  const connection = await getConnection(res);
  try {
    const { filterBuyer } = req.query;

    const sql = ` 
SELECT X.SLAP,X.PAYCAT,COUNT(X.SLAP) VAL FROM (
SELECT CASE WHEN X.AGE BETWEEN 18 AND 25 THEN '18 - 25'
WHEN X.AGE BETWEEN 26 AND 35 THEN '26 - 35'
WHEN X.AGE BETWEEN 36 AND 45 THEN '36 - 45'
WHEN X.AGE BETWEEN 46 AND 60 THEN '46 - 60'
WHEN X.AGE >=61 THEN '61 +'  END SLAP,X.PAYCAT FROM (
SELECT FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOB)/12) AGE,A.PAYCAT FROM MISTABLE A WHERE A.COMPCODE = '${filterBuyer}'
AND A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT
) )
) X
) X
WHERE X.SLAP IS NOT NULL
GROUP BY X.SLAP,X.PAYCAT
ORDER BY 1
`;
    const queryResult = await connection.execute(sql);
    let resultArr = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: resultArr });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection?.close();
  }
}

export async function getOrdersInHandMonthWise(req, res) {
  const connection = await getConnection(res);
  try {
    const { filterYear, filterBuyer } = req.query;
    const monthArr = `
        SELECT B.PAYPERIOD,B.STDT,A.COMPCODE,COUNT(*) ATTRITION FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE 
AND B.FINYR = :FINYEAR AND A.COMPCODE IN (${filterBuyer ? `'${filterBuyer}'` : "''"})
AND A.DOL BETWEEN B.STDT AND B.ENDT
GROUP BY B.PAYPERIOD,B.STDT,A.COMPCODE
ORDER BY 2
        `;

    let result = await connection.execute(monthArr, { FINYEAR: filterYear });
    let mappedResult = result.rows.map((row) => ({
      date: row[0],
      planned: row[3],
      actual: 0,
    }));
    return res.json({
      statusCode: 0,
      data: mappedResult,
      sql: monthArr,
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getregionCount(req, res) {
  const connection = await getConnection(res);

  try {
    const { filterBuyer } = req.query;

    let whereClause = "1=1";

    if (filterBuyer) {
      whereClause += ` AND A.COMPCODE = '${filterBuyer}'`;
    }

    const sql = `
   SELECT 
    COMPCODE,
    
   
    SUM(CASE WHEN STATE = 'TAMILNADU' THEN MALE ELSE 0 END) AS TN_MALE,
    SUM(CASE WHEN STATE = 'TAMILNADU' THEN FEMALE ELSE 0 END) AS TN_FEMALE,
    SUM(CASE WHEN STATE = 'TAMILNADU' THEN MALE + FEMALE ELSE 0 END) AS TN_TOTAL,

 
    SUM(CASE WHEN STATE <> 'TAMILNADU' THEN MALE ELSE 0 END) AS NON_TN_MALE,
    SUM(CASE WHEN STATE <> 'TAMILNADU' THEN FEMALE ELSE 0 END) AS NON_TN_FEMALE,
    SUM(CASE WHEN STATE <> 'TAMILNADU' THEN MALE + FEMALE ELSE 0 END) AS NON_TN_TOTAL

FROM (
    SELECT 
        A.COMPCODE,
        A.STATE,
        
        CASE WHEN A.GENDER = 'MALE' THEN 1 ELSE 0 END MALE,
        CASE WHEN A.GENDER = 'FEMALE' THEN 1 ELSE 0 END FEMALE
    FROM MISTABLE A
    WHERE A.DOJ <= (
        SELECT MIN(AA.STDT)
        FROM MONTHLYPAYFRQ AA
        WHERE AA.PAYPERIOD = '${currentDt}'
    )
    AND (A.DOL IS NULL OR A.DOL <= (
        SELECT MIN(AA.ENDT)
        FROM MONTHLYPAYFRQ AA
        WHERE AA.PAYPERIOD = '${currentDt}'
    ))
) A
 WHERE ${whereClause}
GROUP BY COMPCODE
ORDER BY COMPCODE

    `;

    const result = await connection.execute(sql);

    const resp = result.rows.map((po) => ({
      customer: po[0],
      tn_male: po[1],
      tn_female: po[2],
      tn_total: po[3],
      non_male: po[4],
      non_female: po[5],
      non_total: po[6],
    }));

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getESIPF(req, res) {
  const connection = await getConnection(res);
  try {
    const { filterSupplier, filterYear, search = {} } = req.query;
    let sql;

    let whereClause = "1=1";

    if (search.FNAME)
      whereClause += ` AND LOWER(DD.FNAME) LIKE LOWER('%${search.FNAME}%')`;
    if (search.GENDER)
      whereClause += ` AND LOWER(DD.GENDER) LIKE LOWER('${search.GENDER}%')`;
    if (search.MIDCARD)
      whereClause += ` AND DD.IDCARD LIKE '%${search.MIDCARD}%'`;
    if (search.DEPARTMENT)
      whereClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
    if (search.COMPCODE)
      whereClause += ` AND LOWER(DD.COMPCODE) = LOWER('${search.COMPCODE}')`;

    sql = `
 SELECT
  A.EMPID,
  A.FNAME,
  A.GENDER,
  A.COMPCODE,
  A.DOJ,
  A.DEPARTMENT,
  A.PAYPERIOD,
  A.FINYR,
  A.PF,
  A.STDT,
  A.STDT1,
  A.DESIGNATION,
  A.PAYCAT,
  A.AGE,
  A.EMPTYPE,
   A.EMPLOYER_CON
FROM
(
  SELECT
    DD.IDCARD AS EMPID,
    DD.FNAME,
    DD.GENDER,
    DD.DOJ,
    DD.DEPARTMENT,
    DD.PAYCAT,
    FF.DESIGNATION,
    A.COMPCODE,
    A.PAYPERIOD,
    AA.EMPTYPE,
    MONTHS_BETWEEN(TRUNC(SYSDATE),DD.DOB)/12 AS AGE,
    EE.FINYR,
    A.PF,
     CASE 
        WHEN A.EGROSS <= 15000 THEN A.EGROSS * 0.12
        ELSE 1800
    END AS EMPLOYER_CON,
    
    TO_CHAR(EE.STDT,'MM') AS STDT,
    TO_CHAR(EE.STDT,'YY') AS STDT1
  FROM MISTABLE DD
  JOIN HPAYROLL A ON A.EMPID = DD.IDCARD
  JOIN HREMPLOYMAST AA ON A.EMPID = AA.IDCARDNO
  JOIN HREMPLOYDETAILS BB ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
  JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
  JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD = A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE
  JOIN GTDESIGNATIONMAST FF ON FF.GTDESIGNATIONMASTID = BB.DESIGNATION
  WHERE EE.FINYR = '${filterYear}'
  AND A.COMPCODE = '${filterSupplier}'
  AND ${whereClause}
  
  AND A.PCTYPE = 'BUYER'
  AND A.PF > 0
  
) A
 
GROUP BY
  A.EMPID,
  A.FNAME,
  A.GENDER,
  A.DOJ,
  A.DEPARTMENT,
  A.PAYPERIOD,
  A.FINYR,
  A.STDT,
  A.STDT1,
  A.DESIGNATION,
  A.PAYCAT,
  A.AGE,
  A.EMPTYPE,
   A.EMPLOYER_CON,
   A.PF,
    A.COMPCODE
ORDER BY A.STDT1, A.STDT  
`;

    const queryResult = await connection.execute(sql);
    let resultArr = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: resultArr });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getSalarydet1(req, res) {
  const connection = await getConnection(res);
  try {
    const { filterSupplier, filterYear, search = {} } = req.query;
    let sql;

    let whereClause = "1=1";

    if (search.FNAME)
      whereClause += ` AND LOWER(DD.FNAME) LIKE LOWER('%${search.FNAME}%')`;
    if (search.GENDER)
      whereClause += ` AND LOWER(DD.GENDER) LIKE LOWER('${search.GENDER}%')`;
    if (search.MIDCARD)
      whereClause += ` AND DD.IDCARD LIKE '%${search.MIDCARD}%'`;
    if (search.DEPARTMENT)
      whereClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
    if (search.COMPCODE)
      whereClause += ` AND LOWER(DD.COMPCODE) = LOWER('${search.COMPCODE}')`;

    sql = `
    SELECT
  A.EMPID,
  A.FNAME,
  A.GENDER,
  A.DOJ,
  A.DEPARTMENT,
  A.PAYPERIOD,
  A.FINYR,
  A.NETPAY,
  A.STDT,
  A.STDT1,
  A.DESIGNATION,
  A.PAYCAT,
  A.AGE,
  A.EMPTYPE
   
FROM
(
  SELECT
    DD.IDCARD AS EMPID,
    DD.FNAME,
    DD.GENDER,
    DD.DOJ,
    DD.DEPARTMENT,
    DD.PAYCAT,
    FF.DESIGNATION,
    A.COMPCODE,
    A.PAYPERIOD,
    AA.EMPTYPE,
    MONTHS_BETWEEN(TRUNC(SYSDATE),DD.DOB)/12 AS AGE,
    EE.FINYR,
    A.NETPAY,
    TO_CHAR(EE.STDT,'MM') AS STDT,
    TO_CHAR(EE.STDT,'YY') AS STDT1
  FROM MISTABLE DD
  JOIN HPAYROLL A ON A.EMPID = DD.IDCARD
  JOIN HREMPLOYMAST AA ON A.EMPID = AA.IDCARDNO
  JOIN HREMPLOYDETAILS BB ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
  JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
  JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD = A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE
  JOIN GTDESIGNATIONMAST FF ON FF.GTDESIGNATIONMASTID = BB.DESIGNATION
  WHERE EE.FINYR = '${filterYear}'
  AND A.COMPCODE = '${filterSupplier}'
  AND ${whereClause}
  AND A.PCTYPE = 'BUYER'
  AND A.NETPAY > 0
  
) A
 
GROUP BY
  A.EMPID,
  A.FNAME,
  A.GENDER,
  A.DOJ,
  A.DEPARTMENT,
  A.PAYPERIOD,
  A.FINYR,
  A.STDT,
  A.STDT1,
  A.DESIGNATION,
  A.PAYCAT,
  A.AGE,
  A.EMPTYPE,
   A.NETPAY  
ORDER BY A.STDT1, A.STDT  
`;
    const queryResult = await connection.execute(sql);
    let result = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getESIPF1(req, res) {
  const connection = await getConnection(res);
  try {
    const { filterSupplier, filterYear, search = {} } = req.query;
    let sql;

    let whereClause = "1=1";

    if (search.FNAME)
      whereClause += ` AND LOWER(DD.FNAME) LIKE LOWER('%${search.FNAME}%')`;
    if (search.GENDER)
      whereClause += ` AND LOWER(DD.GENDER) LIKE LOWER('${search.GENDER}%')`;
    if (search.MIDCARD)
      whereClause += ` AND DD.IDCARD LIKE '%${search.MIDCARD}%'`;
    if (search.DEPARTMENT)
      whereClause += ` AND LOWER(DD.DEPARTMENT) LIKE LOWER('%${search.DEPARTMENT}%')`;
    if (search.COMPCODE)
      whereClause += ` AND LOWER(DD.COMPCODE) = LOWER('${search.COMPCODE}')`;

    sql = `
    SELECT
  A.EMPID,
  A.FNAME,
  A.GENDER,
  A.DOJ,
  A.DEPARTMENT,
  A.PAYPERIOD,
  A.FINYR,
  A.ESI,
  A.STDT,
  A.STDT1,
  A.DESIGNATION,
  A.PAYCAT,
  A.AGE,
  A.EMPTYPE,
   A.EMPLOYER_CON
FROM
(
  SELECT
    DD.IDCARD AS EMPID,
    DD.FNAME,
    DD.GENDER,
    DD.DOJ,
    DD.DEPARTMENT,
    DD.PAYCAT,
    FF.DESIGNATION,
    A.COMPCODE,
    A.PAYPERIOD,
    AA.EMPTYPE,
    MONTHS_BETWEEN(TRUNC(SYSDATE),DD.DOB)/12 AS AGE,
    EE.FINYR,
    A.ESI,
    ROUND(A.EGROSS*3.25/100,0) AS EMPLOYER_CON,
    TO_CHAR(EE.STDT,'MM') AS STDT,
    TO_CHAR(EE.STDT,'YY') AS STDT1
  FROM MISTABLE DD
  JOIN HPAYROLL A ON A.EMPID = DD.IDCARD
  JOIN HREMPLOYMAST AA ON A.EMPID = AA.IDCARDNO
  JOIN HREMPLOYDETAILS BB ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
  JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
  JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD = A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE
  JOIN GTDESIGNATIONMAST FF ON FF.GTDESIGNATIONMASTID = BB.DESIGNATION
  WHERE EE.FINYR = '${filterYear}'
  AND A.COMPCODE = '${filterSupplier}'
  AND ${whereClause}
  AND A.PCTYPE = 'BUYER'
  AND A.ESI > 0
  
) A
 
GROUP BY
  A.EMPID,
  A.FNAME,
  A.GENDER,
  A.DOJ,
  A.DEPARTMENT,
  A.PAYPERIOD,
  A.FINYR,
  A.STDT,
  A.STDT1,
  A.DESIGNATION,
  A.PAYCAT,
  A.AGE,
  A.EMPTYPE,
   A.EMPLOYER_CON,
   A.ESI  
ORDER BY A.STDT1, A.STDT  
`;
    const queryResult = await connection.execute(sql);
    let resultArr = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: resultArr });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getESIlastmonth(req, res) {
  const connection = await getConnection(res);

  try {
    const sql = `WITH LAST_MONTH AS (
SELECT A.COMPCODE,MAX(EE.STDT) AS LAST_STDT
FROM HPAYROLL A
JOIN MONTHLYPAYFRQ EE
ON EE.PAYPERIOD = A.PAYPERIOD
AND EE.COMPCODE = A.COMPCODE
WHERE A.PCTYPE = 'BUYER' AND A.COMPCODE <> 'FLF'
AND A.ESI > 0
GROUP BY A.COMPCODE
)
SELECT
A.COMPCODE,
A.PAYPERIOD,
A.FINYR,
SUM(A.ESI) AS ESI,
COUNT(A.EMPID) AS HEADCOUNT,
A.STDT,
A.STDT1
FROM
(
SELECT
A.COMPCODE,
A.PAYPERIOD,
EE.FINYR,
A.ESI,
A.EMPID,
TO_CHAR(EE.STDT,'MM') AS STDT,
TO_CHAR(EE.STDT,'YY') AS STDT1
FROM HPAYROLL A
JOIN HREMPLOYMAST AA ON A.EMPID = AA.IDCARDNO
JOIN HREMPLOYDETAILS BB ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD = A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE
JOIN ( SELECT Z.LAST_STDT,Z.COMPCODE FROM LAST_MONTH Z ) Z ON EE.STDT = Z.LAST_STDT AND A.COMPCODE = Z.COMPCODE 
AND Z.COMPCODE = EE.COMPCODE
WHERE A.PCTYPE = 'BUYER'
AND A.ESI > 0
) A
GROUP BY
A.COMPCODE, A.FINYR, A.PAYPERIOD, A.STDT, A.STDT1
ORDER BY
A.STDT1, A.STDT`;

    const result = await connection.execute(sql);

    let resp = result.rows.map((po) => ({
      customer: po[0],
      month: po[1],
      Year: po[2],
      esi: po[3],
      headCount: po[4],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error fetching ESI last month:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.close();
  }
}

export async function getPFlastmonth(req, res) {
  const connection = await getConnection(res);

  try {
    const sql = `WITH LAST_MONTH AS (
SELECT A.COMPCODE,MAX(EE.STDT) AS LAST_STDT
FROM HPAYROLL A
JOIN MONTHLYPAYFRQ EE
ON EE.PAYPERIOD = A.PAYPERIOD
AND EE.COMPCODE = A.COMPCODE
WHERE A.PCTYPE = 'BUYER' AND A.COMPCODE <> 'FLF'
AND A.PF > 0
GROUP BY A.COMPCODE
)
SELECT
A.COMPCODE,
A.PAYPERIOD,
A.FINYR,
SUM(A.PF) AS PF,
COUNT(A.EMPID) AS HEADCOUNT,
A.STDT,
A.STDT1
FROM
(
SELECT
A.COMPCODE,
A.PAYPERIOD,
EE.FINYR,
A.PF,
A.EMPID,
TO_CHAR(EE.STDT,'MM') AS STDT,
TO_CHAR(EE.STDT,'YY') AS STDT1
FROM HPAYROLL A
JOIN HREMPLOYMAST AA ON A.EMPID = AA.IDCARDNO
JOIN HREMPLOYDETAILS BB ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD = A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE
JOIN ( SELECT Z.LAST_STDT,Z.COMPCODE FROM LAST_MONTH Z ) Z ON EE.STDT = Z.LAST_STDT AND A.COMPCODE = Z.COMPCODE 
AND Z.COMPCODE = EE.COMPCODE
WHERE A.PCTYPE = 'BUYER'
AND A.PF > 0
) A
GROUP BY
A.COMPCODE, A.FINYR, A.PAYPERIOD, A.STDT, A.STDT1
ORDER BY
A.STDT1, A.STDT`;

    const result = await connection.execute(sql);

    let resp = result.rows.map((po) => ({
      customer: po[0],
      month: po[1],
      Year: po[2],
      pf: po[3],
      headCount: po[4],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error fetching PF last month:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.close();
  }
}

export async function getLeaveAvailable(req, res) {
  const connection = await getConnection(res);
  try {
    const { compCode, filterYear } = req.query;
    const sql = `
  SELECT IDCARD,MIDCARD,FNAME,PAYCAT,LCODE,LDESC,SUM(LCOUNT) AVL,SUM(LT) LT,SUM(LCOUNT)-SUM(LT) LBAL 
FROM (SELECT A.FINYEAR FINYR,A.LCODE, A.LDESC,D.IDCARD,D.MIDCARD,DD.FNAME,B.LDAYS AVL,0 LT,B.LDAYS LCOUNT,C.BANDID PAYCAT FROM HRLEAVEMAST A
JOIN HRLEAVEDEPTDET B ON A.HRLEAVEMASTID = B.HRLEAVEMASTID
JOIN HRBANDMAST C ON C.HRBANDMASTID = A.PAYCAT
JOIN HREMPLOYDETAILS D ON D.IDACTIVE = 'YES' AND D.DOJ < A.STDT
JOIN HREMPLOYMAST DD ON D.HREMPLOYMASTID = DD.HREMPLOYMASTID  
JOIN HRBANDMAST E ON D.BAND = E.HRBANDMASTID AND E.BANDID = C.BANDID  
JOIN GTDEPTDESGMAST F ON F.GTDEPTDESGMASTID = D.DEPTNAME AND ( F.MNAME = B.DEPT OR 'All' = B.DEPT) AND DD.COMPCODE = F.COMPCODE
JOIN GTCOMPMAST G ON G.GTCOMPMASTID = F.COMPCODE AND B.COMPCODE1 = G.COMPCODE  
WHERE A.FINYEAR ='${filterYear}' AND B.COMPCODE1 = '${compCode}'
UNION ALL
SELECT A.FINYEAR FINYR,B.LCODE,B.LDESC,D.IDCARD,D.MIDCARD,C.FNAME, CASE WHEN A.LTYPE IN 'OPB' THEN A.OPBAL ELSE 0 END AVL,
CASE WHEN A.LTYPE NOT IN 'OPB' THEN CASE WHEN A.LTYPE NOT IN 'LRQ' THEN (0-A.OPBAL) ELSE A.OPBAL END ELSE 0 END LT,
 CASE WHEN A.LTYPE IN 'OPB' THEN A.OPBAL ELSE 0 END  LCOUNT,A.PAYCAT
FROM HRLEAVEREGMAST A,HRLEAVECODEMAST B,HREMPLOYMAST C,HREMPLOYDETAILS D
WHERE A.LEAVETYPE=B.LCODE AND C.HREMPLOYMASTID=D.HREMPLOYMASTID AND A.IDCARD=C.HREMPLOYMASTID
AND A.FINYEAR= '${filterYear}' AND A.COMPCODE ='${compCode}' AND D.IDACTIVE = 'YES'
UNION ALL
SELECT A.FINYEAR FINYR,A.LCODE, A.LDESC,D.IDCARD,D.MIDCARD,DD.FNAME,
((12-TO_NUMBER(TO_CHAR(ADD_MONTHS((LAST_DAY(TO_DATE(D.DOJ))+1),-1),'mm')))*B.FRM1)+
CASE WHEN TO_NUMBER(TO_CHAR(D.DOJ,'dd'))<16 THEN B.FRM1 ELSE B.FRM2 END  AVL,0 LT,
((12-TO_NUMBER(TO_CHAR(ADD_MONTHS((LAST_DAY(TO_DATE(D.DOJ))+1),-1),'mm')))*B.FRM1)+
CASE WHEN TO_NUMBER(TO_CHAR(D.DOJ,'dd'))<16 THEN B.FRM1 ELSE B.FRM2 END LCOUNT,C.BANDID PAYCAT FROM HRLEAVEMAST A
JOIN HRLEAVEDEPTDET B ON A.HRLEAVEMASTID = B.HRLEAVEMASTID
JOIN HRBANDMAST C ON C.HRBANDMASTID = A.PAYCAT
JOIN HREMPLOYDETAILS D ON D.IDACTIVE = 'YES' AND D.DOJ BETWEEN A.STDT AND A.ENDT
JOIN HREMPLOYMAST DD ON D.HREMPLOYMASTID = DD.HREMPLOYMASTID AND D.BAND = A.PAYCAT   
JOIN GTDEPTDESGMAST F ON F.GTDEPTDESGMASTID = D.DEPTNAME AND ( F.MNAME = B.DEPT OR 'All' = B.DEPT)
JOIN GTCOMPMAST G ON G.GTCOMPMASTID = A.COMPCODE AND B.COMPCODE1 = G.COMPCODE 
WHERE A.FINYEAR ='${filterYear}' AND B.COMPCODE1 = '${compCode}' AND B.FRM1 > 0
)
GROUP BY LCODE,LDESC,IDCARD,MIDCARD,FNAME,PAYCAT
ORDER BY TO_NUMBER(IDCARD),LCODE
    `;

    const result = await connection.execute(sql);
    let resp = result.rows.map((po) => ({
      id: po[0],
      mid: po[1],
      fname: po[2],
      paycat: po[3],
      lcode: po[4],
      ldesc: po[5],
      Avl: po[6],
      lt: po[7],
      lbal: po[8],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error fetching leave availability:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.close();
  }
}

export async function getlongAbsent(req, res) {
  const connection = await getConnection(res);
  try {
    const { compCode, docdate, docdate1 } = req.query;

    const sql = `
   SELECT DENSE_RANK() OVER (ORDER BY TO_NUMBER(C.IDCARD)) SNO,E.COMPCODE COMPCODE1,
D.BANDID,G.MNNAME1 DEPARTMENT,H.DESIGNATION,
TO_NUMBER(C.IDCARD) IDCARD,C.MIDCARD MIDCARD,B.FNAME EMPNAME,C.DOJ,
Z.CONTACTNO CONNO,
ZZ.DATEE LWDA
FROM HREMPLOYMAST B
JOIN HREMPLOYDETAILS C ON B.HREMPLOYMASTID = C.HREMPLOYMASTID AND C.IDACTIVE = 'YES'
JOIN HRBANDMAST D ON C.BAND = D.HRBANDMASTID
JOIN GTCOMPMAST E ON B.COMPCODE = E.GTCOMPMASTID
JOIN GTDEPTDESGMAST G ON C.DEPTNAME = G.GTDEPTDESGMASTID
JOIN GTDESIGNATIONMAST  H ON H.GTDESIGNATIONMASTID = C.DESIGNATION
LEFT JOIN HRECONTACTDETAILS Z ON Z.HREMPLOYMASTID = B.HREMPLOYMASTID
LEFT JOIN (
SELECT MAX(ZZ.ATTDATE) DATEE,ZZ.IDCARD FROM (
SELECT DISTINCT AA.EMPID IDCARD,AA.DOCDATE ATTDATE FROM
AGF_CATT AA WHERE AA.DOCDATE <= TO_DATE('${docdate}','DD/MM/YYYY')
) ZZ GROUP BY ZZ.IDCARD ) ZZ ON ZZ.IDCARD = C.IDCARD
WHERE  E.COMPCODE ='${compCode}'
AND C.DOJ <= TO_DATE('${docdate1}','DD/MM/YYYY')
AND NOT EXISTS 
( 
SELECT 'X' FROM (
SELECT AA.IDCARD FROM (
SELECT DISTINCT TO_CHAR(AA.IDCARD) IDCARD FROM (
SELECT DISTINCT A.EMPID IDCARD,B.FNAME,A.DOCDATE ATTDATE
FROM AGF_CATT A,HREMPLOYMAST B,HREMPLOYDETAILS C,HRBANDMAST D,GTDEPTDESGMAST E,GTDESIGNATIONMAST F
WHERE A.EMPMAID = B.HREMPLOYMASTID AND C.HREMPLOYMASTID = B.HREMPLOYMASTID AND C.PAYCAT = D.HRBANDMASTID
AND C.DEPTNAME = E.GTDEPTDESGMASTID AND F.GTDESIGNATIONMASTID = C.DESIGNATION
AND A.COMPCODE = '${compCode}' AND A.DOCDATE BETWEEN TO_DATE('${docdate}','DD/MM/YYYY')  AND TO_DATE('${docdate1}','DD/MM/YYYY')   
) AA
UNION
SELECT BB.IDCARDNO IDCARD
FROM HRONDUTY AAA, HRONDUTYDET AA,HREMPLOYMAST BB,GTCOMPMAST C
WHERE AAA.HRONDUTYID=AA.HRONDUTYID AND C.GTCOMPMASTID = AAA.COMPCODE AND C.COMPCODE = '${compCode}'
AND AA.ODATE BETWEEN TO_DATE('${docdate}','DD/MM/YYYY')  AND TO_DATE('${docdate1}','DD/MM/YYYY')
UNION
SELECT A.IDCARD FROM (
SELECT A.IDCARD,SUM(A.STKOPBAL) STOCK,A.LRDATE
FROM HRLEAVEREGMAST A WHERE A.LRDATE BETWEEN TO_DATE('${docdate}','DD/MM/YYYY')  AND TO_DATE('${docdate1}','DD/MM/YYYY')  AND A.COMPCODE = 'AGF'
GROUP BY A.IDCARD,A.LRDATE
) A
) AA
) AA
WHERE C.IDCARD = AA.IDCARD
)
ORDER BY 1

    `;

    const result = await connection.execute(sql);
    let resp = result.rows.map((po) => ({
      sno: po[0],
      company: po[1],
      fname: po[2],
      department: po[3],
      designation: po[4],
      idCard: po[5],
      midCard: po[6],
      empName: po[7],
      doj: po[8],
      contactNumber: po[9],
      lwda: po[10],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error fetching long absent:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.close();
  }
}

export async function getFullPrasent(req, res) {
  const connection = await getConnection(res);
  try {
    const { compCode, payPeriod } = req.query;

    const sql = `
SELECT DENSE_RANK() OVER(ORDER BY A.EMPID) SNO,A.EMPID IDCARD,C.FNAME EMPNAME,G.MNNAME1 DEPARTMENT,H.DESIGNATION 
FROM AGFHPAYROLL A 
JOIN HREMPLOYDETAILS B ON A.EMPID = B.IDCARD
JOIN HREMPLOYMAST C ON C.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTDEPTDESGMAST G ON G.GTDEPTDESGMASTID = B.DEPTNAME
JOIN GTDESIGNATIONMAST  H ON H.GTDESIGNATIONMASTID = B.DESIGNATION
WHERE A.PAYPERIOD = '${payPeriod}'
 AND A.COMPCODE = '${compCode}'
AND A.MDAYS = (A.WDAYS-A.LEAVE)
ORDER BY A.EMPID
    `;

    const result = await connection.execute(sql);
    let resp = result.rows.map((po) => ({
      sno: po[0],
      idCard: po[1],
      empName: po[2],
      department: po[3],
      designation: po[4],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error fetching full present:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.close();
  }
}

export async function getPayPeriod(req, res) {
  const connection = await getConnection(res);
  try {
    const { finYear } = req.query;

    const sql = `
SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A WHERE A.COMPCODE = 'AGF' AND A.FINYR ='${finYear}' ORDER BY A.STDT
    `;

    const result = await connection.execute(sql);
    let resp = result.rows.map((po) => ({
      payperiod: po[0],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error fetching pay period:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.close();
  }
}

export async function getFinYear(req, res) {
  const connection = await getConnection(res);
  try {
    const sql = `
SELECT A.FINYR FROM GTFINANCIALYEAR A ORDER BY 1    `;

    const result = await connection.execute(sql);
    let resp = result.rows.map((po) => ({
      finYear: po[0],
    }));
    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error fetching fin year:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.close();
  }
}

export async function getEmployeeHeadCount(req, res) {
  const connection = await getConnection(res);

  try {
    let { compCode } = req.query;

    const sql = `
      SELECT A.DEPARTMENT, COUNT(*) AS HC 
      FROM MISTABLE A 
      WHERE A.COMPCODE = :compCode
      
      GROUP BY A.DEPARTMENT
      ORDER BY 1
    `;

    const result = await connection.execute(sql, { compCode });
    const resp = result.rows.map((po) => ({
      department: po[0],
      headCount: po[1],
    }));

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error fetching employee head count:", err);
    return res
      .status(500)
      .json({ statusCode: 1, message: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getHeadDetail(req, res) {
  const connection = await getConnection(res);

  try {
    let result = [];
    let { compCode } = req.query;

    const sql = `
     SELECT
      A.IDCARD,
 A.FNAME,
 A.GENDER,
 A.COMPCODE,
 A.DEPARTMENT,
 A.DOB,
 A.DOJ,
 A.STATE,
 A.BGF,
 CC.DESIGNATION,
 DD.EMPTYPE,
 A.PAYCAT,
 FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOB) / 12) AS AGE,
 FLOOR(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOJ) / 12) AS EXP
     FROM MISTABLE A 
     JOIN HREMPLOYDETAILS BB ON BB.HREMPLOYMASTID = A.HREMPLOYMASTID
 JOIN HREMPLOYMAST DD ON DD.HREMPLOYMASTID = A.HREMPLOYMASTID
JOIN GTDESIGNATIONMAST CC ON CC.GTDESIGNATIONMASTID = BB.DESIGNATION
WHERE A.COMPCODE = '${compCode}'
AND  A.DOJ <= (
          SELECT MIN(AA.STDT)
          FROM MONTHLYPAYFRQ AA
          WHERE AA.PAYPERIOD = '${currentDt}'
        )
        AND (A.DOL IS NULL OR A.DOL <= (
          SELECT MIN(AA.ENDT)
          FROM MONTHLYPAYFRQ AA
          WHERE AA.PAYPERIOD = '${currentDt}'
))
          GROUP BY 
A.IDCARD,
A.FNAME,
 A.GENDER,
 A.COMPCODE,
 A.DEPARTMENT,
 A.DOB,
 A.DOJ,
 A.STATE,
 A.BGF,
 A.PAYCAT,
 CC.DESIGNATION,
 DD.EMPTYPE
    `;

    const queryResult = await connection.execute(sql);
    let mappedResult = queryResult.rows.map((row) =>
      queryResult.metaData.reduce((acc, column, index) => {
        acc[column.name] = row[index];
        return acc;
      }, {})
    );

    res.status(200).json({ success: true, data: mappedResult });
  } catch (err) {
    console.error("Error fetching head detail:", err);
    return res
      .status(500)
      .json({ statusCode: 1, message: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getStateWiseHeadCount(req, res) {
  const connection = await getConnection(res);

  try {
    const { filterBuyer, currentDt } = req.query;

    if (!filterBuyer || filterBuyer.trim() === "") {
      return res.json({ statusCode: 0, data: [] });
    }

    const sql = `
      SELECT
          A.COMPCODE,
          NVL(TRIM(A.STATE), 'NA')                                        AS STATE,
          SUM(CASE WHEN A.GENDER = 'MALE'             THEN 1 ELSE 0 END)  AS MALE,
          SUM(CASE WHEN A.GENDER = 'FEMALE'           THEN 1 ELSE 0 END)  AS FEMALE,
          SUM(CASE WHEN A.GENDER IN ('MALE','FEMALE') THEN 1 ELSE 0 END)  AS TOTAL
      FROM MISTABLE A
      CROSS JOIN (
          SELECT MIN(STDT) AS PERIOD_START,
                 MAX(ENDT) AS PERIOD_END
          FROM   MONTHLYPAYFRQ
          WHERE  PAYPERIOD = '${currentDt}'
      ) P
      WHERE A.COMPCODE         = '${filterBuyer}'
        AND A.DOJ             <= P.PERIOD_START
        AND (A.DOL IS NULL OR A.DOL >= P.PERIOD_START)
      GROUP BY
          A.COMPCODE,
          NVL(TRIM(A.STATE), 'NA')
      ORDER BY
          NVL(TRIM(A.STATE), 'NA')
    `;

    const result = await connection.execute(sql);

    const resp = result.rows.map((po) => ({
      COMPCODE : po[0],
      STATE    : po[1],
      MALE     : po[2],
      FEMALE   : po[3],
      TOTAL    : po[4],
    }));

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}



