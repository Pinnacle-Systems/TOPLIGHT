import { prisma_Connector } from "../../index.js";
import { mapRole, mapRoleList } from "../utils/responseMapper.js";
import { logServiceError } from "../utils/logger.js";

export async function createRoleOnPage_Master(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase();
    
    try {
        const data = req?.body?.data || {};
        const { COMPCODE: bodyComp, ...restData } = data;
        const compCode = bodyComp || COMPCODE;

        const crete_page = await prisma_Connector?.role?.create({
            data: { ...restData, compCode }
        });
      
        if (crete_page?.id) {
            return res.json({ status: 1, data: mapRole(crete_page) });
        } else {
            return res.json({ status: 0, data: {} });  
        }
    } catch (error) {
        logServiceError('RoleOnPageService:createRoleOnPage_Master', error, req);
        console.log(error);
        return res.json({ statusCode: 500, message: 'An error occurred while creating the role' });
    }
}

export async function get_all_Role_name(req, res) {
    const where = req?.query?.where;

    try {
        const compCodes = where ? where.split(",").filter(Boolean) : [];
        const queryWhere = compCodes.length > 0 ? { compCode: { in: compCodes } } : {};

        const result = await prisma_Connector.role.findMany({
            where: queryWhere,
            include: { roleOnPage: true }
        });

        res.json({ status: 1, data: mapRoleList(result) });
    }
    catch (err) {
        logServiceError('RoleOnPageService:get_all_Role_name', err, req);
        console.log(err);
        res.json({ status: 0, data: [] });
    }
}

// ── Standard Descriptive Aliases ─────────────────────────────────────────────
export const createRoleMaster = createRoleOnPage_Master;
export const getAllRoleNames = get_all_Role_name;
