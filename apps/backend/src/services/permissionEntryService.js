import { prisma_Connector } from "../../index.js";
import { getConnection } from "../constants/dbConnection.js";
import { convert12to24 } from "../utils/timeConverter24h.js";
import formatDateToOracle from "../utils/oracleDateFormat.js";
import { generateUniqueId_Number } from "../utils/idGenerator.js";
import { mapPermission, mapPermissionSingle, mapPermissionMaster, mapPermissionMasterList } from "../utils/responseMapper.js";
import { logServiceError } from "../utils/logger.js";


export async function get__per(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();
    const hod = req.query?.hod;
    const id = req.query?.id;

    try {
        const result = await prisma_Connector.permissionEntry.findMany({
            where: hod
                ? { compCode: COMPCODE, OR: [{ hod: hod }, { hr: hod }] }
                : { compCode: COMPCODE, userId: id },
            include: {
                createdByUser: { select: { userName: true, idCard: true } },
                modifiedByUser: { select: { userName: true, idCard: true } }
            }
        });
        res.json({ status: 1, data: result.map(mapPermission) });
    } catch (err) {
        logServiceError('PermissionEntryService:get__per', err, req);
        console.log(err);
    }
}




export async function get__per_category(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();
    const Qtype = req?.query?.type;

    try {
        const result = await prisma_Connector.permissionMaster.findMany({
            where: { AND: [{ compCode: COMPCODE }, { pType: Qtype }] }
        });
        console.log(result);

        var filter_data = result?.map((data) => { return { label: data.name, value: data.id } });
        res.json({ status: 1, data: filter_data });
    } catch (err) {
        logServiceError('PermissionEntryService:get__per_category', err, req);
        console.log(err);
        res.json({ status: 0, data: [] });
    }
}


export async function addPermission_master(req, res) {
    const data = req?.body?.data || {};
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();
    try {
        const mappedData = {
            ...data,
            compCode: COMPCODE,
            pType: data.ptype || data.pType,
        };
        delete mappedData.ptype;

        const result = await prisma_Connector.permissionMaster.create({ data: mappedData });
        if (result?.id) {
            return res.json({ status: 1, data: mapPermissionMaster(result) });
        } else {
            return res.json({ status: 0, data: null });
        }
    } catch (err) {
        logServiceError('PermissionEntryService:addPermission_master', err, req);
        console.log(err);
        return res.json({ status: 0, message: err?.message || 'Failed to add permission master', data: null });
    }
}




export async function get_user_Permission(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();
    const IdCard = req.query?.IdCard;

    try {
        const result = await prisma_Connector.permissionEntry.findFirst({
            where: { userId: IdCard, compCode: COMPCODE }
        });
        res.json({ status: 1, data: result });
    } catch (err) {
        logServiceError('PermissionEntryService:get_user_Permission', err, req);
        console.log(err);
    }
}


export async function getDocId(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();

    try {
        const result = await prisma_Connector.permissionEntry.findFirst({
            orderBy: {
                id: 'desc',
            },
            select: {
                id: true,
            },
            where: { compCode: COMPCODE }
        });

        res.json({ status: 1, data: { count: Number(result?.id || 0) + 1 } });
    } catch (err) {
        logServiceError('PermissionEntryService:getDocId', err, req);
        console.log(err);
    }
}



export async function requestPermission(req, res) {
    const data = req?.body?.data;
    const approvalType = String(data?.approval || req?.body?.approval || 'HOD').toUpperCase();
    if (data && 'approval' in data) {
        delete data.approval;
    }

    const hodVal = data?.hod && String(data.hod).trim() !== '' && data.hod !== 'null' && data.hod !== 'undefined' && data.hod !== '0' ? String(data.hod).trim() : null;
    const hrVal = data?.hr && String(data.hr).trim() !== '' && data.hr !== 'null' && data.hr !== 'undefined' && data.hr !== '0' ? String(data.hr).trim() : null;

    if (approvalType === 'BOTH') {
        if (!hodVal && !hrVal) {
            return res.json({
                status: 0,
                message: "Neither HOD nor HR is assigned to your profile in User Control. Dual approval requires both HOD and HR."
            });
        }
        if (!hodVal) {
            return res.json({
                status: 0,
                message: "Reporting HOD is not assigned to your profile in User Control. Dual approval requires an HOD."
            });
        }
        if (!hrVal) {
            return res.json({
                status: 0,
                message: "Reporting HR is not assigned to your profile in User Control. Dual approval requires an HR."
            });
        }
    } else if (approvalType === 'HR') {
        if (!hrVal && !hodVal) {
            return res.json({
                status: 0,
                message: "Reporting HR is not assigned to your profile. Please contact your administrator to assign an HR in User Control before submitting."
            });
        }
    } else {
        if (!hodVal) {
            return res.json({
                status: 0,
                message: "Reporting HOD is not assigned to your profile. Please contact your administrator to assign an HOD in User Control before submitting."
            });
        }
    }

    if (!data?.userId || String(data.userId).trim() === '' || data.userId === 'null') {
        return res.json({
            status: 0,
            message: "Employee ID is missing from your profile. Please log out and sign in again, or contact your administrator."
        });
    }

    // Set effective hod so Prisma foreign key relation on PermissionEntry(hod) is satisfied
    if (!data.hod && hrVal) {
        data.hod = hrVal;
    }

    // Ensure assigned HOD and HR exist in the database to satisfy foreign key relations
    try {
        const hodIdStr = String(data.hod).trim();
        const hodUser = await prisma_Connector.user.findFirst({
            where: { idCard: hodIdStr }
        });
        if (!hodUser) {
            await prisma_Connector.user.create({
                data: {
                    userName: `hod_${hodIdStr}_${Date.now()}`,
                    idCard: hodIdStr,
                    level: 'hod',
                }
            });
        }
        if (hrVal && hrVal !== hodIdStr) {
            const hrUser = await prisma_Connector.user.findFirst({
                where: { idCard: hrVal }
            });
            if (!hrUser) {
                await prisma_Connector.user.create({
                    data: {
                        userName: `hr_${hrVal}_${Date.now()}`,
                        idCard: hrVal,
                        level: 'hr',
                    }
                });
            }
        }
    } catch (checkErr) {
        logServiceError('PermissionEntryService:requestPermission', checkErr, req);
        console.warn("HOD/HR user auto-ensure warning:", checkErr);
    }

    // Ensure current user exists in the database
    try {
        const userIdStr = String(data.userId).trim();
        const currentUser = await prisma_Connector.user.findFirst({
            where: { idCard: userIdStr }
        });
        if (!currentUser) {
            await prisma_Connector.user.create({
                data: {
                    userName: data.username || `emp_${userIdStr}_${Date.now()}`,
                    idCard: userIdStr,
                    level: 'user',
                }
            });
        }
    } catch (checkErr) {
        logServiceError('PermissionEntryService:requestPermission', checkErr, req);
        console.warn("Current user auto-ensure warning:", checkErr);
    }

    // Ensure createdBy and modified_By exist in User table
    try {
        const createdByStr = String(data.createdBy || data.userId).trim();
        if (createdByStr && createdByStr !== String(data.userId).trim()) {
            const cbUser = await prisma_Connector.user.findFirst({ where: { idCard: createdByStr } });
            if (!cbUser) {
                await prisma_Connector.user.create({
                    data: { userName: `user_${createdByStr}_${Date.now()}`, idCard: createdByStr, level: 'user' }
                });
            }
        }
        const modifiedByStr = String(data.modified_By || data.userId).trim();
        if (modifiedByStr && modifiedByStr !== createdByStr && modifiedByStr !== String(data.userId).trim()) {
            const mbUser = await prisma_Connector.user.findFirst({ where: { idCard: modifiedByStr } });
            if (!mbUser) {
                await prisma_Connector.user.create({
                    data: { userName: `user_${modifiedByStr}_${Date.now()}`, idCard: modifiedByStr, level: 'user' }
                });
            }
        }
    } catch (checkErr) {
        logServiceError('PermissionEntryService:requestPermission', checkErr, req);
        console.warn("permission createdBy/modified_By auto-ensure warning:", checkErr);
    }

    // Ensure category exists in PermissionMaster to satisfy foreign key relations
    try {
        const catId = Number(data.category);
        if (catId) {
            const catExists = await prisma_Connector.permissionMaster.findFirst({ where: { id: catId } });
            if (!catExists) {
                const firstCat = await prisma_Connector.permissionMaster.findFirst();
                if (firstCat) {
                    data.category = firstCat.id;
                }
            }
        }
    } catch (catErr) {
        logServiceError('PermissionEntryService:requestPermission', catErr, req);
        console.warn("permission category auto-ensure warning:", catErr);
    }

    let connection;
    try {
        connection = await getConnection(res);
    } catch (connErr) {
        logServiceError('PermissionEntryService:requestPermission', connErr, req);
        console.error("Database connection failed:", connErr);
        return res.json({
            status: 0,
            message: "ERP database connection failed. Please ensure the organization server is reachable and try again.",
            error: connErr?.message || connErr
        });
    }

    try {
        const tempDocid = `TEMP-${Date.now()}-${Math.random()}`;
        const { docid, username, thrs, modified_By, ...cleanData } = data;
        const initialResult = await prisma_Connector.permissionEntry.create({
            data: {
                ...cleanData,
                docId: tempDocid,
                userName: username || data.userName || '',
                totalHrs: String(thrs || data.totalHrs || ''),
                modifiedBy: String(modified_By || data.modifiedBy || data.userId || ''),
                permissionId: String(generateUniqueId_Number()),
            }
        });
        const paddedId = initialResult.id.toString().padStart(6, '0');
        const finalDocid = `PER-${paddedId}`;
        const result = await prisma_Connector.permissionEntry.update({
            where: { id: initialResult.id },
            data: { docId: finalDocid }
        });

        const Ttime_24 = convert12to24(result?.tTime);
        const FTime_24 = convert12to24(result?.fTime);

        var auvit_data = {
            PERMISSIONID: result?.permissionId,
            USERID: result?.userName || data?.username,
            THRS: result?.totalHrs || data?.thrs,
            APPROVALSTATUS: String(result?.approvalStatus),
            DOCID: String(result?.docId),
            REASON: result?.reason,
            TTIME: Ttime_24,
            FTIME: FTime_24,
            COMPCODE: String(result?.compCode),
            CREATED_BY: String(result?.createdBy),
            CREATED_ON: formatDateToOracle(result?.createdOn),
            MODIFIED_BY: result?.modifiedBy || result?.createdBy,
            MODIFIED_ON: formatDateToOracle(result?.modifiedOn),
            IDCARD: Number(result?.userId),
            DOCDATE: formatDateToOracle(result?.docDate),
            IS_CANCELLED: 'false'
        };

        if (result?.id) {
            const sql = `
                INSERT INTO permission (
                    PERMISSIONID, THRS, APPROVALSTATUS, DOCID, REASON,
                    TTIME, FTIME, COMPCODE, CREATED_BY, CREATED_ON,
                    MODIFIED_BY, MODIFIED_ON, IDCARD, DOCDATE, IS_CANCELLED, USERID
                )
                VALUES (
                    :PERMISSIONID, :THRS, :APPROVALSTATUS, :DOCID, :REASON,
                    :TTIME,
                    :FTIME,
                    :COMPCODE, :CREATED_BY,
                    TO_DATE(:CREATED_ON, 'YYYY-MM-DD HH24:MI:SS'),
                    :MODIFIED_BY,
                    TO_DATE(:MODIFIED_ON, 'YYYY-MM-DD HH24:MI:SS'),
                    :IDCARD, TO_DATE(:DOCDATE, 'YYYY-MM-DD HH24:MI:SS'), :IS_CANCELLED, :USERID
                )
            `;
            const result_auvit = await connection.execute(sql, auvit_data);
            if (result_auvit?.rowsAffected > 0) {
                await prisma_Connector?.permissionEntry?.update({ where: { docId: result?.docId }, data: { create: 1 } });
                return res.json({ status: 1, data: mapPermission({ ...result, count: result?.id }) });
            } else {
                await prisma_Connector?.permissionEntry?.delete({ where: { id: result?.id } });
                return res.json({ status: 0, message: "Could not save permission record to ERP database. Please try again." });
            }
        }
    } catch (err) {
        logServiceError('PermissionEntryService:requestPermission', err, req);
        console.error("requestPermission error:", err);
        let friendlyMsg = "Unable to save permission request. Please try again.";
        const errMsg = String(err?.message || err || '');
        if (err?.code === 'P2003' || errMsg.includes('PermissionHod') || errMsg.includes('hod')) {
            friendlyMsg = `The assigned HOD (ID: ${data?.hod || 'not found'}) is not registered in User Control. Please ask your administrator to register or reassign your HOD.`;
        } else if (err?.code === 'P2002' || errMsg.includes('docid')) {
            friendlyMsg = "A permission request with this document number already exists. Please refresh and try again.";
        } else if (errMsg.includes('permision_Category') || errMsg.includes('category')) {
            friendlyMsg = "The selected permission category is invalid. Please select another category.";
        } else if (errMsg.includes('ORA-') || errMsg.includes('NJS-')) {
            friendlyMsg = "ERP database error: " + (errMsg.split('\n')[0] || 'Oracle database error');
        } else if (err?.message) {
            friendlyMsg = err.message;
        }
        return res.json({ status: 0, message: friendlyMsg, error: errMsg });
    } finally {
        try {
            if (connection) {
                await connection?.commit();
                await connection.close();
            }
        } catch (closeErr) {
            logServiceError('PermissionEntryService:requestPermission', closeErr, req);
            console.warn("Connection close warning:", closeErr);
        }
    }
}

export async function get_all_Permission_reason(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();

    try {
        const result = await prisma_Connector.permissionMaster.findMany({
            where: { compCode: COMPCODE }
        });
        res.json({ status: 1, data: mapPermissionMasterList(result) });
    } catch (err) {
        logServiceError('PermissionEntryService:get_all_Permission_reason', err, req);
        console.log(err);
        res.json({ status: 0, data: [] });
    }
}

export async function requestPermission_Approval(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();
    const docid = req?.body?.docid;
    const p_app = req?.body?.approval;
    const approvedBy = req?.body?.approvedBy;
    const rejectBy = req?.body?.rejectBy;
    const rejectRemark = req?.body?.rejectRemark || req?.body?.reject_reason || req?.body?.rejectReason || req?.body?.reason || '';
    const connection = await getConnection(res);
    if (!connection || res.headersSent) return;

    try {
        // 1. Update Oracle PERMISSION table
        let oracleUpdated = false;
        try {
            const sql = `UPDATE PERMISSION SET APPROVALSTATUS=:approvalStatus, APPROVED_BY=:approvedBy, REJECTED_BY=:rejectBy, REJECT_REASON=:rejectRemark WHERE DOCID=:docid`;
            const result_auvit = await connection.execute(sql, {
                approvalStatus: p_app,
                approvedBy: approvedBy || null,
                rejectBy: rejectBy || null,
                rejectRemark: rejectRemark || null,
                docid
            });
            oracleUpdated = (result_auvit?.rowsAffected > 0);
        } catch (oracleErr) {
            // Graceful fallback if Oracle PERMISSION table doesn't have REJECT_REASON column
            if (String(oracleErr?.message || '').includes('ORA-00904')) {
                const fallbackSql = `UPDATE PERMISSION SET APPROVALSTATUS=:approvalStatus, APPROVED_BY=:approvedBy, REJECTED_BY=:rejectBy WHERE DOCID=:docid`;
                const result_auvit = await connection.execute(fallbackSql, {
                    approvalStatus: p_app,
                    approvedBy: approvedBy || null,
                    rejectBy: rejectBy || null,
                    docid
                });
                oracleUpdated = (result_auvit?.rowsAffected > 0);
            } else {
                throw oracleErr;
            }
        }

        if (!oracleUpdated) {
            await connection.rollback();
            return res.status(404).json({ status: 0, message: "Permission request not found." });
        }

        // 2. Update Prisma database
        const result = await prisma_Connector.permissionEntry.update({
            where: { docId: docid },
            data: {
                approvalStatus: p_app,
                approvedBy: approvedBy || null,
                rejectBy: rejectBy || null,
                rejectReason: rejectRemark || null,
                update: 1
            }
        });

        await connection.commit();
        return res.json({ status: 1, data: mapPermission(result) });
    } catch (err) {
        logServiceError('PermissionEntryService:requestPermission_Approval', err, req);
        console.error('[requestPermission_Approval] Approval failed:', err);
        try {
            await connection.rollback();
        } catch (rollbackError) {
            logServiceError('PermissionEntryService:requestPermission_Approval', rollbackError, req);
            console.error('[requestPermission_Approval] Oracle rollback failed:', rollbackError);
        }
        if (!res.headersSent) {
            return res.status(500).json({
                status: 0,
                message: 'Could not update this permission request. Please try again or contact support.'
            });
        }
    } finally {
        try {
            await connection.close();
        } catch (closeError) {
            logServiceError('PermissionEntryService:requestPermission_Approval', closeError, req);
            console.error('[requestPermission_Approval] Oracle connection close failed:', closeError);
        }
    }
}

// ── Standard Function Aliases ────────────────────────────────────────────────
export const getPermissionEntries = get__per;
export const getPermissionDocId = getDocId;
export const getPermissionCategories = get__per_category;
export const getAllPermissionReasons = get_all_Permission_reason;
export const approvePermissionRequest = requestPermission_Approval;
export const addPermissionMaster = addPermission_master;
export const getUserPermissions = get_user_Permission;
