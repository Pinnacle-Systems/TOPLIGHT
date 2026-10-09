import { currentDate } from "../Helpers/helper.js";

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

export async function getEmployees(
  connection,
  type = "Value",
  filterYear,
  filterBuyer,
  lstMnthOverride
) {
  let result = "";
  if (type === "Value") {
    const sql = `SELECT 
SUM(MALE) AS MALE,
SUM(FEMALE) AS FEMALE,
SUM(MALE) + SUM(FEMALE) AS TOTAL,
COMPCODE
FROM (
SELECT
CASE WHEN A.GENDER = 'MALE' THEN 1 ELSE 0 END AS MALE,
CASE WHEN A.GENDER = 'FEMALE' THEN 1 ELSE 0 END AS FEMALE,
A.COMPCODE
FROM MISTABLE A 
WHERE
1=1
AND A.PAYCAT = 'STAFF' 
AND A.DOJ <= (
SELECT MIN(AA.ENDT)
FROM MONTHLYPAYFRQ AA
WHERE AA.PAYPERIOD = '${currentDt}'
)
AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT)
FROM MONTHLYPAYFRQ AA
WHERE AA.PAYPERIOD = '${currentDt}'
))
) A
GROUP BY COMPCODE
 `;
    console.log(sql, "sql for Employee total");
    result = await connection.execute(sql);
  }

  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}

export async function getEmployees1(
  connection,
  type = "Value",
  filterYear,
  filterBuyer,
  lstMnthOverride
) {
  let result = "";
  if (type === "Value") {
    const sql = `SELECT 
SUM(MALE) AS MALE,
SUM(FEMALE) AS FEMALE,
SUM(MALE) + SUM(FEMALE) AS TOTAL,
COMPCODE
FROM (
SELECT
CASE WHEN A.GENDER = 'MALE' THEN 1 ELSE 0 END AS MALE,
CASE WHEN A.GENDER = 'FEMALE' THEN 1 ELSE 0 END AS FEMALE,
A.COMPCODE
FROM MISTABLE A 
WHERE
1=1
AND A.PAYCAT <> 'STAFF' 
AND A.DOJ <= (
SELECT MIN(AA.ENDT)
FROM MONTHLYPAYFRQ AA
WHERE AA.PAYPERIOD = '${currentDt}'
)
AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT)
FROM MONTHLYPAYFRQ AA
WHERE AA.PAYPERIOD = '${currentDt}'
))
) A
GROUP BY COMPCODE

 `;
    console.log(sql, "sql for empDet");
    result = await connection.execute(sql);
  }

  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}

export async function getProfit(
  connection,
  type = "YEAR",
  filterYear,
  filterBuyer,
  filterMonth
) {
  console.log(filterBuyer, "filterBuyer mis ");
  let result;
  const filterBuyerList = filterBuyer
    .split(",")
    .map((buyer) => `'${buyer.trim()}'`)
    .join(",");

  const sql = `SELECT SUM(A.MALE) MALE,
SUM(A.FEMALE) FEMALE,
 SUM(A.MALE) + SUM(A.FEMALE) AS TOTAL,
A.COMPCODE FROM
(SELECT B.PAYPERIOD,A.COMPCODE, B.STDT,CASE WHEN A.GENDER = 'MALE' THEN COUNT(*) ELSE 0 END MALE,
CASE WHEN A.GENDER = 'FEMALE' THEN COUNT(*) ELSE 0 END FEMALE
FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON B.COMPCODE = A.COMPCODE
AND B.PAYPERIOD ='${lstMnth}'AND A.PAYCAT = 'STAFF'
AND A.COMPCODE IN (${filterBuyerList})
AND A.DOL BETWEEN B.STDT AND B.ENDT
GROUP BY B.PAYPERIOD, B.STDT, A.COMPCODE,A.GENDER
) A
GROUP BY A.PAYPERIOD, A.STDT,A.COMPCODE
ORDER BY 2
`;
  console.log(sql, "sql for attr");

  result = await connection.execute(sql);

  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}

export async function getProfit1(
  connection,
  type = "YEAR",
  filterYear,
  filterBuyer,
  filterMonth
) {
  console.log(filterBuyer, "filterBuyerfr ");
  let result;
  const filterBuyerList = filterBuyer
    .split(",")
    .map((buyer) => `'${buyer.trim()}'`)
    .join(",");

  const sql = `SELECT SUM(A.MALE) MALE,
SUM(A.FEMALE) FEMALE,
 SUM(A.MALE) + SUM(A.FEMALE) AS TOTAL,
A.COMPCODE FROM
(SELECT B.PAYPERIOD,A.COMPCODE, B.STDT,CASE WHEN A.GENDER = 'MALE' THEN COUNT(*) ELSE 0 END MALE,
CASE WHEN A.GENDER = 'FEMALE' THEN COUNT(*) ELSE 0 END FEMALE
FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON B.COMPCODE = A.COMPCODE
AND B.PAYPERIOD ='${lstMnth}'AND A.PAYCAT <> 'STAFF'
AND A.COMPCODE IN (${filterBuyerList})
AND A.DOL BETWEEN B.STDT AND B.ENDT
GROUP BY B.PAYPERIOD, B.STDT, A.COMPCODE,A.GENDER
) A
GROUP BY A.PAYPERIOD, A.STDT,A.COMPCODE
ORDER BY 2
`;
  console.log(sql, "sql for attri");

  result = await connection.execute(sql);

  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}

export async function getNewCustomers(
  connection,
  type = "YEAR",
  filterYear,
  filterBuyer,
  filterMonth
) {
  let result;
  if (type === "YEAR") {
    const sql = `
         SELECT SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL,COMPCODE FROM (

SELECT A.COMPCODE,CASE WHEN AA.GENDER = 'MALE' THEN A.NETPAY ELSE 0 END MALE,

CASE WHEN AA.GENDER = 'FEMALE' THEN A.NETPAY ELSE 0 END FEMALE FROM HPAYROLL A

JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD

JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID

JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND AND CC.BANDID <> 'STAFF'

WHERE A.PCTYPE = 'ACTUAL' AND  A.PAYPERIOD = '${lstMnth}') group by COMPCODE `;
    console.log(sql, "sql salary today");

    result = await connection.execute(sql);
  } else if (type === "MONTH") {
    result = await connection.execute(`
        select
        COALESCE(ROUND(prevValue), 0) as prevValue,
            COALESCE(ROUND(currentValue), 0) as currentValue
        from(
            select
                (select sum(actsalval) 
        from MISORDSALESVAL
        where extract(YEAR from bpodate) = extract(YEAR from CURRENT_DATE)
        and extract(MONTH from bpodate) = extract(MONTH from CURRENT_DATE)
        and extract(YEAR from CUSCRDT) = extract(YEAR from CURRENT_DATE)
         and extract(MONTH from CUSCRDT) = extract(MONTH from CURRENT_DATE)
                ) as currentValue,
            (select sum(actsalval) 
        from MISORDSALESVAL
        where extract(YEAR from bpodate) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, -1))
        and extract(MONTH from bpodate) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, -1))
        and extract(YEAR from CUSCRDT) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, -1))
         and extract(MONTH from CUSCRDT) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, -1))
        ) as prevValue
        from dual) a
            `);
  }
  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));

  console.log(result, "result salary today");

  return result;
}

export async function getTopCustomers(
  connection,
  type = "YEAR",
  filterYear,
  filterBuyer,
  filterMonth
) {
  let result;
  if (type === "YEAR") {
    const sql = `SELECT SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL,COMPCODE FROM (
SELECT A.COMPCODE,CASE WHEN AA.GENDER = 'MALE' THEN A.NETPAY ELSE 0 END MALE,
CASE WHEN AA.GENDER = 'FEMALE' THEN A.NETPAY ELSE 0 END FEMALE FROM HPAYROLL A
JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD
JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND AND CC.BANDID = 'STAFF'
WHERE A.PCTYPE = 'ACTUAL' AND  A.PAYPERIOD = '${lstMnth}') group by COMPCODE 
`;
    result = await connection.execute(sql);
  } else if (type === "MONTH") {
    result = await connection.execute(`
        select
            (select round(sum(turnover)) 
        from(
                select customer, coalesce(sum(actsalval), 0) as turnover
        from MISORDSALESVAL
        where extract(YEAR from bpodate) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, -1))
          and extract(MONTH from bpodate) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, -1))
        group by customer order by turnover desc
            )
        where rownum <= 5
            ) as prevValue,
            (
                select round(sum(turnover))
        from(
            select customer, coalesce(sum(actsalval), 0) as turnover
        from MISORDSALESVAL
        where extract(YEAR from bpodate) = extract(YEAR from CURRENT_DATE)
        and extract(MONTH from bpodate) = extract(MONTH from CURRENT_DATE)
        group by customer order by turnover desc
        )
        where rownum <= 5
        ) as currentValue
        from dual
            `);
  }
  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}

export async function getLoss(
  connection,
  type = "YEAR",
  filterYear,
  filterBuyer,
  filterMonth
) {
  let result;
  if (type === "YEAR") {
    const sql = `SELECT SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL,COMPCODE FROM (

SELECT A.COMPCODE,CASE WHEN AA.GENDER = 'MALE' THEN A.PF ELSE 0 END MALE,

CASE WHEN AA.GENDER = 'FEMALE' THEN A.PF ELSE 0 END FEMALE FROM HPAYROLL A

JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD

JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID

JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND AND CC.BANDID <> 'STAFF'

WHERE A.PCTYPE = 'BUYER' AND

A.PAYPERIOD = '${lstMnth}'

)

GROUP BY COMPCODE`;
    console.log(sql, "sql125");
    result = await connection.execute(sql);
  } else if (type === "MONTH") {
    result = await connection.execute(`
        select
        COALESCE(ROUND(prevValue), 0) as prevValue,
            COALESCE(ROUND(currentValue), 0) as currentValue
        from(
            select
                (select sum(0 - actprofit) 
from MISORDSALESVAL
where extract(YEAR from bpodate) = extract(YEAR from CURRENT_DATE) 
and extract(MONTH from bpodate) = extract(MONTH from CURRENT_DATE)
and actprofit < 0) as currentValue,
            (select sum(0 - actprofit) 
from MISORDSALESVAL
where extract(YEAR from bpodate) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, -1)) 
  and extract(MONTH from bpodate) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, -1))
and actprofit < 0) as prevValue
from dual) a
            `);
  }
  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}

export async function getLoss01(
  connection,
  type = "YEAR",
  filterYear,
  filterBuyer,
  filterMonth
) {
  let result;
  if (type === "YEAR") {
    const sql = `SELECT SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL,COMPCODE FROM (

SELECT A.COMPCODE,CASE WHEN AA.GENDER = 'MALE' THEN A.PF ELSE 0 END MALE,

CASE WHEN AA.GENDER = 'FEMALE' THEN A.PF ELSE 0 END FEMALE FROM HPAYROLL A

JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD

JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID

JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND AND CC.BANDID = 'STAFF'

WHERE A.PCTYPE = 'BUYER' AND

A.PAYPERIOD = '${lstMnth}'

)

GROUP BY COMPCODE`;
    result = await connection.execute(sql);
  } else if (type === "MONTH") {
    result = await connection.execute(`
        select
        COALESCE(ROUND(prevValue), 0) as prevValue,
            COALESCE(ROUND(currentValue), 0) as currentValue
        from(
            select
                (select sum(0 - actprofit) 
from MISORDSALESVAL
where extract(YEAR from bpodate) = extract(YEAR from CURRENT_DATE) 
and extract(MONTH from bpodate) = extract(MONTH from CURRENT_DATE)
and actprofit < 0) as currentValue,
            (select sum(0 - actprofit) 
from MISORDSALESVAL
where extract(YEAR from bpodate) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, -1)) 
  and extract(MONTH from bpodate) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, -1))
and actprofit < 0) as prevValue
from dual) a
            `);
  }
  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}

export async function getLoss1(
  connection,
  type = "YEAR",
  filterYear,
  filterBuyer,
  filterMonth
) {
  let result;
  if (type === "YEAR") {
    const sql = `SELECT SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL,COMPCODE FROM (
SELECT A.COMPCODE,CASE WHEN AA.GENDER = 'MALE' THEN A.ESI ELSE 0 END MALE,
CASE WHEN AA.GENDER = 'FEMALE' THEN A.ESI ELSE 0 END FEMALE FROM HPAYROLL A
JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD
JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND AND CC.BANDID <> 'STAFF'
WHERE A.PAYPERIOD ='${lstMnth}' AND A.PCTYPE = 'BUYER'
)
GROUP BY COMPCODE`;

    console.log(sql, "sql for esI");
    result = await connection.execute(sql);
  } else if (type === "MONTH") {
    result = await connection.execute(`
        select
        COALESCE(ROUND(prevValue), 0) as prevValue,
            COALESCE(ROUND(currentValue), 0) as currentValue
        from(
            select
                (select sum(0 - actprofit) 
from MISORDSALESVAL
where extract(YEAR from bpodate) = extract(YEAR from CURRENT_DATE) 
and extract(MONTH from bpodate) = extract(MONTH from CURRENT_DATE)
and actprofit < 0) as currentValue,
            (select sum(0 - actprofit) 
from MISORDSALESVAL
where extract(YEAR from bpodate) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, -1)) 
  and extract(MONTH from bpodate) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, -1))
and actprofit < 0) as prevValue
from dual) a
            `);
  }
  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}

export async function getLoss11(
  connection,
  type = "YEAR",
  filterYear,
  filterBuyer,
  filterMonth
) {
  let result;
  if (type === "YEAR") {
    const sql = `SELECT SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL,COMPCODE FROM (
SELECT A.COMPCODE,CASE WHEN AA.GENDER = 'MALE' THEN A.ESI ELSE 0 END MALE,
CASE WHEN AA.GENDER = 'FEMALE' THEN A.ESI ELSE 0 END FEMALE FROM HPAYROLL A
JOIN HREMPLOYDETAILS BB ON A.EMPID = BB.IDCARD
JOIN HREMPLOYMAST AA ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND AND CC.BANDID = 'STAFF'
WHERE A.PAYPERIOD ='${lstMnth}' AND A.PCTYPE = 'BUYER'
)
GROUP BY COMPCODE`;
    console.log(sql, "sql");

    result = await connection.execute(sql);
  } else if (type === "MONTH") {
    result = await connection.execute(`
        select
        COALESCE(ROUND(prevValue), 0) as prevValue,
            COALESCE(ROUND(currentValue), 0) as currentValue
        from(
            select
                (select sum(0 - actprofit) 
from MISORDSALESVAL
where extract(YEAR from bpodate) = extract(YEAR from CURRENT_DATE) 
and extract(MONTH from bpodate) = extract(MONTH from CURRENT_DATE)
and actprofit < 0) as currentValue,
            (select sum(0 - actprofit) 
from MISORDSALESVAL
where extract(YEAR from bpodate) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, -1)) 
  and extract(MONTH from bpodate) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, -1))
and actprofit < 0) as prevValue
from dual) a
            `);
  }
  result = result.rows.map((row) => ({
    prevValue: row[0],
    currentValue: row[1],
    currentQty: row[2],
    comCode: row[3],
  }));
  return result;
}
