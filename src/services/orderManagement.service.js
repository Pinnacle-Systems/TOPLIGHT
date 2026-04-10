import { getConnection } from "../constants/db.connection.js";
export async function get(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear } = req.query;
        console.log(filterYear, 'filterYear');

        const sql =
            `
            SELECT 
            COUNT(A.ORDERNO) AS NOOFORD,
            A.FINYR,
            (SELECT COUNT(B.ORDERNO) 
             FROM MISORDSALESVAL B 
             WHERE B.STATUS NOT IN ('Cancel')
             AND NVL(B.SHIPQTY,0) > 0
             AND B.FINYR = '${filterYear}'
             GROUP BY B.FINYR) AS ShipDone,
             (SELECT COUNT(C.ORDERNO) 
             FROM MISORDSALESVAL C 
             WHERE C.STATUS NOT IN ('Cancel','Completed')
             AND NVL(C.SHIPQTY,0) = 0 
             AND C.FINYR =  '${filterYear}'
             GROUP BY C.FINYR) AS NotDone,
                (SELECT COUNT(D.ORDERNO) 
             FROM MISORDSALESVAL D 
             WHERE D.status = 'Cancel' AND D.FINYR =  '${filterYear}'
             GROUP BY D.FINYR) AS Canceled
          FROM MISORDSALESVAL A 
          where A.finYr =  '${filterYear}' 
          GROUP BY A.FINYR
          ORDER BY NOOFORD
          
     `

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            orders: po[0],
            finYR: po[1],
            shipDone: po[2],
            inHand: po[3],
            canceled: po[4]
        }))

        return res.json({ statusCode: 0, data: resp })

    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getShippedData(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear } = req.query;


        const sql =
            `
            SELECT COUNT(A.ORDERNO) NOOFORD,A.FINYR,
            (
            SELECT COUNT(B.ORDERNO) NOOFORD FROM MISORDSALESVAL B 
            WHERE B.STATUS NOT IN ('Cancel','Completed')
            AND B.FINYR = '${filterYear}' 
             AND NVL(B.SHIPQTY,0) > 0 
            ) as PLNotTaken,
            (SELECT COUNT(C.ORDERNO) NOOFORD FROM MISORDSALESVAL C 
            WHERE C.STATUS = 'Completed'
            And C.finyr = '${filterYear}'
            ) as PlTAken,
            (SELECT COUNT(D.ORDERNO) NOOFORD FROM MISORDSALESVAL D 
             WHERE ( D.COCR = 'NO' OR D.POCR = 'NO' OR D.YFOCR = 'NO') AND D.SHIPQTY > 0  AND D.STATUS NOT IN ('Completed','Cancel') 
             And D.finyr = '${filterYear}'
          ) as ocrPend
             FROM MISORDSALESVAL A 
            WHERE A.STATUS NOT IN ('Cancel')
             AND NVL(A.SHIPQTY,0) > 0 
            AND A.FINYR = '${filterYear}' 
            GROUP BY A.FINYR
            ORDER BY 1
            
     `

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            shipped: po[0],
            finYR: po[1],
            plNotTaken: po[2],
            plTaken: po[3],
            ocrPend: po[4]

        }))

        return res.json({ statusCode: 0, data: resp })

    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}
export async function getOcrPending(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear } = req.query;


        const sql =
            `
            SELECT COUNT(A.ORDERNO) NOOFORD,A.FINYR,
            (SELECT COUNT(B.ORDERNO) NOOFORD FROM MISORDSALESVAL B 
           WHERE B.COCR = 'NO' AND B.SHIPQTY > 0  AND B.STATUS NOT IN ('Completed','Cancel') 
           ) as cutOcrPend,
           (SELECT COUNT(C.ORDERNO) NOOFORD FROM MISORDSALESVAL C 
           WHERE C.POCR = 'NO' AND C.SHIPQTY > 0  AND C.STATUS NOT IN ('Completed','Cancel') 
           ) as proOcrPend,
           (SELECT COUNT(D.ORDERNO) NOOFORD FROM MISORDSALESVAL D 
           WHERE D.YFOCR = 'NO' AND D.SHIPQTY > 0  AND D.STATUS NOT IN ('Completed','Cancel') 
           )as fabOcrPend FROM MISORDSALESVAL A 
           WHERE ( A.COCR = 'NO' OR A.POCR = 'NO' OR A.YFOCR = 'NO') AND A.SHIPQTY > 0 
            AND A.STATUS NOT IN ('Completed','Cancel') 
            AND A.finYr = '${filterYear}'
           GROUP BY A.FINYR
           ORDER BY 1
           
            
     `

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            ocrPend: po[0],
            finYr: po[1],
            cutOcrPend: po[2],
            proOcrPend: po[3],
            fabOcrPend: po[4]


        }))

        return res.json({ statusCode: 0, data: resp })

    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}
export async function getWIPData(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear } = req.query;


        const sql =
            `
            SELECT  COUNT(A.ORDERNO) NOOFORD,
            (SELECT COUNT(B.ORDERNO) NOOFORD FROM MISORDSALESVAL B 
           WHERE B.FABST = 'NO'  AND B.STATUS NOT IN ('Completed','Cancel') AND  B.FINYR = '${filterYear}'
           AND NVL(B.SHIPQTY,0) = 0
           )WIPFAB,
           (SELECT COUNT(C.ORDERNO) NOOFORD FROM MISORDSALESVAL C 
           WHERE C.CUTST = 'NO' AND C.STATUS NOT IN ('Completed','Cancel') AND C.FINYR = '${filterYear}'
           AND NVL(C.SHIPQTY,0) = 0
           ) AS WIPCUT,
           (SELECT COUNT(D.ORDERNO) NOOFORD FROM MISORDSALESVAL D 
           WHERE D.PRODST = 'NO' AND NVL(D.SHIPQTY,0) = 0 AND D.STATUS NOT IN ('Completed','Cancel')  AND D.FINYR = '${filterYear}') AS PRODCUT
            FROM MISORDSALESVAL A WHERE NVL(A.SHIPQTY,0) = 0 AND A.STATUS NOT IN ('Completed','Cancel') 
           AND A.FINYR = '${filterYear}' GROUP BY A.FINYR
           
            
     `

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            noOfOrd: po[0],
            wipFab: po[1],
            wipCut: po[2],
            wipPro: po[3],



        }))

        return res.json({ statusCode: 0, data: resp })

    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}
export async function getPreBudget(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear } = req.query;


        const sql =
            `
            SELECT 
            A.FINYR,
             COUNT(A.ORDERNO) NOOFORD,
            COUNT(CASE WHEN A.APPROVALSTATUS = 'APPROVED' THEN A.ORDERNO END) AS NOOFORD_APPROVED,
            COUNT(CASE WHEN A.APPROVALSTATUS <> 'APPROVED' OR A.APPROVALSTATUS IS NULL THEN A.ORDERNO END) AS NOOFORD_APPROVAL_PENDING,
            COUNT(CASE WHEN A.APPROVALSTATUS = 'APPROVED' AND A.STATUS = 'Cancel' THEN A.ORDERNO END) AS NOOFORD_AFTER_APPROVAL_CANCEL
        FROM 
            MISORDSALESVAL A
        WHERE 
            A.PREBUD = 'YES' and A.finyr = '${filterYear}'
        GROUP BY 
            A.FINYR
        ORDER BY 
            A.FINYR
     `

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({


            finYr: po[0],
            noOfOrd: po[1],
            approved: po[2],
            appPending: po[3],
            cancelAfterApp: po[4],


        }))

        return res.json({ statusCode: 0, data: resp })

    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}
// chart data
export async function getProfitLossData(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear } = req.query;
        console.log(filterYear, 'filterYear');
        const sql =
            `
            SELECT customer, PROFIT
            FROM (
                SELECT customer, SUM(ACTPROFIT) AS PROFIT
                FROM MISORDSALESVAL
                WHERE finyr = '${filterYear}'
                GROUP BY customer
                ORDER BY PROFIT DESC
            ) p
            WHERE  PROFIT IS NOT NULL
     `

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            customer: po[0],
            profit: po[1],
        }))
        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}
export async function getCapPlanData(req, res) {
    const connection = await getConnection(res);

    try {
        const { getByMonth, clickedMonth, filterCom } = req.query;

        // Log the query parameters to check their values
        console.log('Query Parameters:', { clickedMonth, filterCom });

        if (clickedMonth !== undefined) {
            const sql = `
                SELECT A.CUSTOMER, A.BUYERPONO, A.ORDERNO, SUM(A.ORDERQTY) ORDERQTY, SUM(A.OVALUE) OVALUE FROM (
                    SELECT A.CUSTOMER, A.BUYERPONO, A.ORDERNO, A.ORDERQTY ORDERQTY, (A.ORDERQTY * A.BUYERPRICE * A.CONVALUE) OVALUE 
                    FROM MISORDSALESVAL A 
                    WHERE A.PLANDELMON = :clickedMonth
                ) A
                GROUP BY A.CUSTOMER, A.BUYERPONO, A.ORDERNO
                ORDER BY 1, 2, 3, 4
            `;
            const result = await connection.execute(sql, { clickedMonth });
            const resp = result.rows.map(po => ({
                customer: po[0],
                buyerPo: po[1],
                ordNo: po[2],
                oQty: po[3],
                Oval: po[4]
            }));
            return res.json({ statusCode: 0, data: resp });
        } else if (filterCom !== undefined) {
            let sql
            sql = `
                SELECT B.*, A.PLANDELMON MONTH, A.ORDERQTY BOOKED, A.BUYERDELDATE FROM (
                    SELECT SUM(A.ORDERQTY) ORDERQTY, A.PLANDELMON, MAX(A.BUYERDELDATE) BUYERDELDATE 
                    FROM MISORDSALESVAL A 
                    WHERE A.STATUS NOT IN ('Completed', 'Cancel')
                    AND A.PLANDELMON IN (
                        SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
                        WHERE TO_DATE(SYSDATE) BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = '${filterCom}'
                        UNION
                        SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
                        WHERE LAST_DAY(TO_DATE(SYSDATE)) + 1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = '${filterCom}'
                        UNION
                        SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
                        WHERE LAST_DAY(LAST_DAY(TO_DATE(SYSDATE)) + 1) + 1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = '${filterCom}'
                        UNION
                        SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
                        WHERE LAST_DAY(LAST_DAY(LAST_DAY(TO_DATE(SYSDATE)) + 1) + 1) + 1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = '${filterCom}'
                        UNION
                        SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
                        WHERE LAST_DAY(LAST_DAY(LAST_DAY(LAST_DAY(TO_DATE(SYSDATE)) + 1) + 1) + 1) + 1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = '${filterCom}'
                        UNION
                        SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
                        WHERE LAST_DAY(LAST_DAY(LAST_DAY(LAST_DAY(LAST_DAY(TO_DATE(SYSDATE)) + 1) + 1) + 1) + 1) + 1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = '${filterCom}'
                    )  
                    GROUP BY A.PLANDELMON
                ) A
                CROSS JOIN (
                    SELECT LISTAGG(B.DPARAM, ',') WITHIN GROUP (ORDER BY 1) COMPANY, SUM(B.DVALUE) CAPACITY 
                    FROM MISREQTAB A
                    JOIN MISREQTABDET B ON A.MISREQTABID = B.MISREQTABID
                    WHERE A.TYPENAME = 'COMPANY CAPACITY'
                ) B
                ORDER BY BUYERDELDATE
            `;
            console.log('SQL Query:', sql);
            const result = await connection.execute(sql);
            const resp = result.rows.map(po => ({
                company: po[0],
                capacity: po[1],
                month: po[2],
                booked: po[3]
            }));
            return res.json({ statusCode: 0, data: resp });
        } else {
            return res.status(400).json({ error: 'Invalid query parameters' });
        }

    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}



export async function getFabStsData(req, res) {
    const connection = await getConnection(res)
    try {
        const { itemWise, modalContent, month } = req.query;
        if (itemWise) {
            const sql = `SELECT * FROM MISFABSTATUS A  WHERE A.PLANDELMON = '${month}' AND A.STATUS = '${modalContent}'
        ORDER BY 1,2,3,4,5,6,7`
            console.log(sql);
            const result = await connection.execute(sql)
            let resp = result.rows.map(po => ({
                ordNo: po[0],
                fabric: po[1],
                pDesign: po[2],
                pDia: po[3],
                pkDia: po[4],
                reqQty: po[5],
                inQty: po[6],
                balQty: po[7],
                plnMnth: po[8],
                plDt: po[9],
                sts: po[10],
            }))
            return res.json({ statusCode: 0, data: resp })
        } else {
            const sql =
                `
        SELECT A.PLANDELMON,A.NOOFORD,B.NOOFORD REC,A.NOOFORD-NVL(B.NOOFORD,0) BAL FROM (
            SELECT COUNT(A.ORDERNO) NOOFORD,A.PLANDELMON,MAX(A.PLANDT) DELDATE FROM MISFABSTATUS A 
            WHERE A.PLANDELMON IN (
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
            WHERE TO_DATE(SYSDATE) BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = 'BVK'
            UNION
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
            WHERE LAST_DAY(TO_DATE(SYSDATE))+1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = 'BVK'
            UNION
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
            WHERE LAST_DAY(LAST_DAY(TO_DATE(SYSDATE))+1)+1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = 'BVK'
            )  
            GROUP BY A.PLANDELMON
            ) A 
            LEFT JOIN (SELECT COUNT(A.ORDERNO) NOOFORD,A.PLANDELMON FROM MISFABSTATUS A WHERE A.BALQTY <= 0
            AND A.PLANDELMON IN (
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
            WHERE TO_DATE(SYSDATE) BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = 'BVK'
            UNION
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
            WHERE LAST_DAY(TO_DATE(SYSDATE))+1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = 'BVK'
            UNION
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
            WHERE LAST_DAY(LAST_DAY(TO_DATE(SYSDATE))+1)+1 BETWEEN A.STDT AND A.ENDT AND A.COMPCODE = 'BVK'
            )  
            GROUP BY A.PLANDELMON
            ) B ON A.PLANDELMON = B.PLANDELMON
            ORDER BY DELDATE
 `
            const result = await connection.execute(sql)
            let resp = result.rows.map(po => ({
                month: po[0],
                ord: po[1],
                rec: po[2],
                pend: po[3]
            }))
            return res.json({ statusCode: 0, data: resp })
        }
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getYFActVsPln(req, res) {
    const connection = await getConnection(res);
    try {
        const { filterMonth, filterSupplier, filterYear } = req.query;
        console.log(filterSupplier, 'fil');

        // Split the filterSupplier string into an array
        const supplierArray = filterSupplier.split(',');
        const sepComName = supplierArray.join('');
        const supplierList = supplierArray.map(supplier => `'${supplier}'`).join(',');

        const sql = `
            SELECT B.PAYPERIOD, B.STDT,  COUNT(*) ATTRITION 
            FROM MISTABLE A
            JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE 
            AND B.FINYR = '${filterYear}' 
            AND A.COMPCODE IN (${supplierList})
            AND A.DOL BETWEEN B.STDT AND B.ENDT
            GROUP BY B.PAYPERIOD, B.STDT, A.COMPCODE
            ORDER BY 2
        `;
        console.log(sql, '416');

        const result = await connection.execute(sql);
        let resp = result.rows.map(po => ({
            payPeriod: po[0],
            stdt: po[1],
            attrition: po[2],
        }));

        return res.json({ statusCode: 0, data: resp });
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}



export async function getOrderStatusBuyerWise(req, res) {
    const connection = await getConnection(res)
    try {
        const { } = req.query;

        const sql =
            `
            SELECT A.FINYR,A.CUSTOMER,SUM(NOOFORD) NOOFORD,SUM(PLTAKEN) PLTAKEN,SUM(CANORD) CANORD,SUM(OCRCOM) OCRCOM,SUM(OCRFOR) OCRFOR,SUM(ACTIVE) ACTIVE FROM 
            (SELECT A.FINYR,A.CUSTOMER,COUNT(A.ORDERNO) NOOFORD,0 PLTAKEN,0 CANORD,0 OCRCOM,0 OCRFOR,0 ACTIVE FROM MISORDSALESVAL A
            GROUP BY A.FINYR,A.CUSTOMER
            UNION ALL
            SELECT A.FINYR,A.CUSTOMER,0 NOOFORD,COUNT(A.ORDERNO) PLTAKEN,0 CANORD,0 OCRCOM,0 OCRFOR,0 ACTIVE FROM MISORDSALESVAL A
            WHERE A.ACTPROFIT IS NOT NULL
            GROUP BY A.FINYR,A.CUSTOMER
            UNION ALL
            SELECT A.FINYR,A.CUSTOMER,0 NOOFORD,0 PLTAKEN,COUNT(A.ORDERNO) CANORD,0 OCRCOM,0 OCRFOR,0 ACTIVE FROM MISORDSALESVAL A
            WHERE A.STATUS = 'Cancel'
            GROUP BY A.FINYR,A.CUSTOMER
            UNION ALL
            SELECT A.FINYR,A.CUSTOMER,0 NOOFORD,0 PLTAKEN,0 CANORD,COUNT(A.ORDERNO) OCRCOM,0 OCRFOR,0 ACTIVE FROM MISORDSALESVAL A
            WHERE A.COCR = 'YES' AND A.POCR = 'YES' AND A.YFOCR = 'YES' AND A.AOCR = 'YES' AND A.ACTPROFIT IS NULL
            GROUP BY A.FINYR,A.CUSTOMER
            UNION ALL
            SELECT A.FINYR,A.CUSTOMER,0 NOOFORD,0 PLTAKEN,0 CANORD,0 OCRCOM,COUNT(A.ORDERNO) OCRFOR,0 ACTIVE FROM MISORDSALESVAL A
            WHERE A.COCR <> 'YES' AND A.POCR <> 'YES' AND A.YFOCR <> 'YES' AND A.AOCR <> 'YES' AND A.ACTPROFIT IS NULL
            AND A.ORDERNO IN (SELECT A.IONO FROM GTOCRSMENTRYDET A)
            GROUP BY A.FINYR,A.CUSTOMER
            UNION ALL
            SELECT A.FINYR,A.CUSTOMER,0 NOOFORD,0 PLTAKEN,0 CANORD,0 OCRCOM,0 OCRFOR,COUNT(A.ORDERNO) ACTIVE FROM MISORDSALESVAL A
            WHERE A.STATUS = 'In Hand'
            GROUP BY A.FINYR,A.CUSTOMER
            ) A
            GROUP BY A.FINYR,A.CUSTOMER
            ORDER BY 1,2
     `

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            year: po[0],
            customer: po[1],
            orderQty: po[2],
            plTaken: po[3],
            cancelOrder: po[4],
            ocrCom: po[5],
            ocrFor: po[6],
            active: po[7],


        }))
        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}
export async function getPlanedVsActualSalesVal(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterMonth, filterSupplier, filterYear } = req.query;
        let sql
        if (filterMonth || filterYear || filterSupplier) {
            sql =
                `
        SELECT A.ORDERNO,A.PLANSALESVAL,A.ACTSALVAL, A.finyr FROM MISORDSALESVAL A
        WHERE A.CUSTOMER = '${filterSupplier}' AND A.PLANDELMON = '${filterMonth}' AND FINYR ='${filterYear}'
 `
        }

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            orderNo: po[0],
            planSalesVal: po[1],
            actSalesVal: po[2],
        }))
        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}