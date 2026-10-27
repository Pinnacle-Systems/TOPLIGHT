import { prisma_Connector } from "../../index.js";
import { getConnection } from "../constants/dbConnection.js";
import bcrypt from "bcryptjs";
import { mapUser } from "../utils/responseMapper.js";


export async function get(req, res) {
    const connection = await getConnection(res)
    try {
        const result = await connection.execute(`
        select * from (select finyr  from GTFINANCIALYEAR order by finyr desc) finyr     
        where rownum <= 3
     `)
        let resp = result.rows.map(po => ({
            finYear: po[0]
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

export async function getBuyer(req, res) {
    const connection = await getConnection(res)
    try {
        const result = await connection.execute(`
        SELECT C.COMPCODE,COUNT(*) TOT FROM HREMPLOYMAST A 
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE
WHERE B.IDACTIVE = 'YES'
GROUP BY C.COMPCODE
     `)
        let resp = result.rows.map(po => ({
            buyerName: po[0]
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


export async function getMonthData(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear, filterBuyer } = req.query;
        const result = await connection.execute(`
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
              WHERE A.finyr = '${filterYear}' 
GROUP BY A.PAYPERIOD
      ORDER BY TO_DATE(A.PAYPERIOD, 'Month YYYY')        
     `)
        console.log(result, 'res');
        let resp = result.rows.map(po => ({
            month: po[0]
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

export async function getCompCodeData(req, res) {
    const connection = await getConnection(res)
    try {
        const { } = req.query;
        const sql =
            `
       SELECT C.COMPCODE,COUNT(*) TOT FROM HREMPLOYMAST A 
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE
WHERE B.IDACTIVE = 'YES'
GROUP BY C.COMPCODE`
        console.log(sql, '84');
        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({
            com: po[0]
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



export async function chat(req, res) {
    const compCode = String(req?.headers?.compcode).toUpperCase()
    const chat_data = req?.body || {}
    
    try {
        const chat_ = await prisma_Connector?.chat?.create({
            data: { ...chat_data, compCode }
        })

        if (chat_?.id) {
            res?.json({ status: 1, data: chat_ })
        } else {
            res?.json({ status: 0, data: {} })
        }
    } catch (err) {
        console.log(err);
        res?.json({ status: 0, data: {} })
    }
}




export async function get_chat(req, res) {
    const compCode = String(req?.headers?.compcode).toUpperCase()
    const DEPARTMENT = req?.query?.DEPARTMENT
    
    try {
        const chat_ = await prisma_Connector?.chat?.findMany({
            where: {
                compCode,
                groupId: DEPARTMENT
            },
            include: { userData: true }
        })

        if (chat_) {
            res?.json({ status: 1, data: chat_ })
        } else {
            res?.json({ status: 0, data: {} })
        }
    } catch (err) {
        console.log(err);
        res?.json({ status: 0, data: {} })
    }
}

const getModel = (t) => {
    if (!t) return null;
    return prisma_Connector?.[t] ||
           prisma_Connector?.[t.charAt(0).toLowerCase() + t.slice(1)] ||
           prisma_Connector?.[t.charAt(0).toUpperCase() + t.slice(1)];
};

// Helper function to map where/data objects from frontend names to schema names
function mapPayloadFields(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const mapped = { ...obj };
    if ('COMPCODE' in mapped) {
        mapped.compCode = mapped.COMPCODE;
        delete mapped.COMPCODE;
    }
    if ('Idcard' in mapped) {
        mapped.idCard = mapped.Idcard;
        delete mapped.Idcard;
    }
    if ('idcard' in mapped) {
        mapped.idCard = mapped.idcard;
        delete mapped.idcard;
    }
    if ('username' in mapped) {
        mapped.userName = mapped.username;
        delete mapped.username;
    }
    if ('ptype' in mapped) {
        mapped.pType = mapped.ptype;
        delete mapped.ptype;
    }
    if ('GCOMP' in mapped) {
        mapped.gComp = mapped.GCOMP;
        delete mapped.GCOMP;
    }
    return mapped;
}

export async function delete_Common_Data(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();
    const onlywhere = req?.body?.onlywhere;
    const where = mapPayloadFields(req?.body?.where || {});
    const table = req?.body?.table;

    try {
        if (table && String(table).toLowerCase() === 'user') {
            const rawId = where.id || where.userId || req?.body?.where?.id;
            const userId = Number(rawId);
            if (!userId) {
                return res.json({ status: 0, message: "Invalid user ID" });
            }

            const userRecord = await prisma_Connector.user.findUnique({ where: { id: userId } });
            if (!userRecord) {
                return res.json({ status: 0, message: "User not found" });
            }

            try {
                // Remove dependent notifications
                await prisma_Connector.notification.deleteMany({
                    where: { OR: [{ senderId: userId }, { receiverId: userId }] }
                }).catch(() => {});

                // Remove company allocations and settings for this user's idCard
                if (userRecord.idCard) {
                    await prisma_Connector.companyCode.deleteMany({
                        where: { idCard: userRecord.idCard }
                    }).catch(() => {});
                    await prisma_Connector.settings.deleteMany({
                        where: { userId: userRecord.idCard }
                    }).catch(() => {});
                }

                // Attempt hard delete
                const result = await prisma_Connector.user.delete({ where: { id: userId } });
                return res.json({ status: 1, data: result, message: "User deleted successfully" });
            } catch (deleteErr) {
                console.warn('[delete_Common_Data] User hard delete failed, executing soft-delete:', deleteErr?.message);
                const result = await prisma_Connector.user.update({
                    where: { id: userId },
                    data: {
                        active: false,
                        userName: `${userRecord.userName}_deleted_${Date.now()}`
                    }
                });
                return res.json({ status: 1, data: result, message: "User deleted successfully" });
            }
        }

        const model = getModel(table);
        const queryWhere = onlywhere ? { ...where } : { compCode: COMPCODE, ...where };
        const result = await model?.delete({ where: queryWhere });
        res.json({ status: 1, data: result });
    }
    catch (err) {
        console.log(err);
        res.json({ status: 0, data: {}, error: err?.message });
    }
}


export async function Update_Common_Data_prisma(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase()
    const where = mapPayloadFields(req?.body?.where || {})
    const onlywhere = req?.body?.onlywhere
    const table = req?.body?.table
    const data = { ...req?.body?.data }
    const Comp_data = req?.body?.data?.Compcodes
    const user_updation = req?.body?.data?.user_updation

    if (data?.password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data?.password, saltRounds);
        data.password = hashedPassword;
    }

    if (Comp_data && user_updation) {
        const userTargetIdCard = data?.idCard || data?.Idcard;
        const userTargetGComp = data?.gComp || data?.GCOMP || COMPCODE;
        
        const delete_succesued = await prisma_Connector?.companyCode?.deleteMany({
            where: { idCard: userTargetIdCard, gComp: userTargetGComp }
        });

        if (delete_succesued?.count > 0 || delete_succesued?.count == 0) {
            try {
                const { GCOMP, gComp, user_updation, Compcodes, Companies, Idcard, idcard, username, otpemail, ...reset } = data;
                
                const normalizedCompanies = Array.isArray(Comp_data) ? Comp_data.map(item => ({
                    companyCode: item.companyCode,
                    companyId: String(item.companyid || item.companyId || ''),
                    gComp: item.GCOMP || item.gComp || userTargetGComp
                })) : [];

                const userUpdateData = {
                    ...reset,
                    ...(userTargetIdCard ? { idCard: userTargetIdCard } : {}),
                    ...(username ? { userName: username } : {}),
                    ...(otpemail ? { otpEmail: otpemail } : {}),
                    companies: { create: normalizedCompanies }
                };

                const queryWhere = onlywhere ? { ...where } : { compCode: COMPCODE, ...where };
                const model = getModel(table);
                const result = await model?.update({
                    data: userUpdateData,
                    where: queryWhere
                });

                res.json({ status: 1, data: mapUser(result) });
            }
            catch (err) {
                console.log(err);
                res.json({ status: 0, data: {} });
            }
        }
    } else {
        try {
            const model = getModel(table);
            const mappedData = mapPayloadFields(data);
            const queryWhere = onlywhere ? { ...where } : { compCode: COMPCODE, ...where };
            const result = await model?.update({
                data: mappedData,
                where: queryWhere
            });

            // Map response back if user table or contains user fields
            const responseData = (table?.toLowerCase() === 'user') ? mapUser(result) : result;
            res.json({ status: 1, data: responseData });
        }
        catch (err) {
            console.log(err);
            res.json({ status: 0, data: {} });
        }
    }
}