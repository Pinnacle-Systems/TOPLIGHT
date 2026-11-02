import { prisma_Connector } from "../../index.js";
import { mapPermission, mapLeave, mapOnduty } from "../utils/responseMapper.js";
import { logServiceError } from "../utils/logger.js";
import { getConnection } from "../constants/dbConnection.js";
import { fetchAttendanceApprovalItems } from "./attendanceService.js";



export async function getPermissionRequest(req, res) {
    const hod = req?.query?.hod;
    const hr = req?.query?.hr;
    const emp = req?.query?.emp;

    const COMPCODE = String(req?.headers?.compcode || '').toUpperCase();
    if (hod) {
        try {
            const result = await prisma_Connector?.permissionEntry?.findMany({
                where: { approvalStatus: "pending", create: 1, OR: [{ hr: hr }, { hod }] },
                include: {
                    userData: { select: { email: true, userName: true, idCard: true } },
                    categoryData: { select: { id: true, name: true, pType: true } },
                },
            });

            const result_Leave = await prisma_Connector?.leaveEntry?.findMany({
                where: { approvalStatus: "pending", create: 1, OR: [{ hr: hr }, { hod }] },
                include: {
                    userData: { select: { email: true, userName: true, idCard: true } },
                    categoryData: { select: { id: true, name: true, pType: true } },
                },
            });

            const onduty_request = await prisma_Connector?.onduty?.findMany({
                where: { approvalStatus: "pending", create: 1, OR: [{ hr: hr }, { hod }] },
                include: {
                    userData: { select: { email: true, userName: true, idCard: true } },
                    categoryData: { select: { id: true, name: true } },
                },
            });

            // 4. Attendance requests from PSSATT
            let mappedAttendance = [];
            try {
                const supervisorId = String(hod || hr || '').trim();
                const supervisorUser = await prisma_Connector?.user?.findFirst({
                    where: { OR: [{ idCard: supervisorId }, { userName: supervisorId }] },
                    select: { idCard: true, userName: true, level: true, companies: { select: { companyCode: true } } },
                });
                const sCard = supervisorUser?.idCard || supervisorId;
                const sName = supervisorUser?.userName || supervisorId;
                const sLevel = String(supervisorUser?.level || '').toLowerCase();

                let employees = await prisma_Connector?.user?.findMany({
                    where: {
                        OR: [
                            { hod: sCard }, { hod: sName }, { hod: supervisorId },
                            { hr: sCard }, { hr: sName }, { hr: supervisorId },
                        ],
                    },
                    select: { idCard: true, userName: true, email: true },
                });

                let conn = null;
                try {
                    conn = await getConnection();
                    if (conn) {
                        const allAttItems = await fetchAttendanceApprovalItems(conn);
                        if (sLevel === 'hr' || sLevel === 'admin' || !employees || employees.length === 0) {
                            mappedAttendance = allAttItems;
                        } else {
                            const empCardSet = new Set(employees.map(e => String(e.idCard || '').trim()));
                            const filtered = allAttItems.filter(item => empCardSet.has(String(item.idcard || '').trim()));
                            mappedAttendance = filtered.length > 0 ? filtered : allAttItems;
                        }
                    }
                } catch (connErr) {
                    console.warn('[NotificationService] Attendance query warning:', connErr?.message);
                } finally {
                    await conn?.close();
                }
            } catch (attErr) {
                console.warn('[NotificationService] Error fetching attendance notifications:', attErr?.message);
            }

            const mappedPermission = (result || []).map(mapPermission);
            const mappedLeave = (result_Leave || []).map(mapLeave);
            const mappedOnduty = (onduty_request || []).map(mapOnduty);

            return res.json({ statusCode: 0, data: [...mappedPermission, ...mappedLeave, ...mappedOnduty, ...mappedAttendance] });
        } catch (err) {
            logServiceError('NotificationService:getPermissionRequest', err, req);
            console.error('Error retrieving data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else if (emp) {
        return res.json({ statusCode: 0, data: [] });
    }
}


export async function getDocId(req, res) {
    console.log(req);

    try {
        const result = await (prisma_Connector.permissionDocId || prisma_Connector.permissionDocID).findFirst({})
        res.json({ status: 1, data: result })
    }
    catch (err) {
        logServiceError('NotificationService:getDocId', err, req);
        console.log(err);
    }

}



export async function requestPermission(req, res) {
    const data = req?.body?.data
    try {
        const result = await prisma_Connector.permissionEntry.create({ data: data })
        res.json({ status: 1, data: result })
    }
    catch (err) {
        logServiceError('NotificationService:requestPermission', err, req);
        console.log(err);

    }

}

// ── Standard Descriptive Aliases ─────────────────────────────────────────────
export const getPendingApprovalRequests = getPermissionRequest;
export const getPermissionDocId = getDocId;
export const submitPermissionRequest = requestPermission;






