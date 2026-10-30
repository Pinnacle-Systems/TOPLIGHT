/**
 * responseMapper.js
 *
 * Central response field mapping layer.
 * Converts Prisma camelCase field names to the frontend-expected legacy field names.
 * The frontend is NEVER changed â€” only this mapper adapts the shape.
 *
 * Usage:
 *   import { mapLeave, mapPermission, mapOnduty } from '../utils/responseMapper.js';
 *   res.json({ status: 1, data: result.map(mapLeave) });
 */

// ─── User include sub-select mapper 
// Maps the User relation (createdByUser / modifiedByUser / userData) to the
// shape { Employee, username, Idcard } the frontend relies on, preserving both casings.
function mapUserSnippet(user) {
  if (!user) return null;
  const username = user.username ?? user.userName ?? user.empName ?? user.empname ?? user.Employee ?? '';
  const Idcard = user.Idcard ?? user.idCard ?? user.idcard ?? '';
  const Employee = user.Employee ?? user.empName ?? user.empname ?? user.pic ?? null;
  const mobile = user.mobile ?? user.phone ?? user.Mobile ?? '';
  return {
    ...user,
    Employee,
    username,
    userName: username,
    Idcard,
    idCard: Idcard,
    idcard: Idcard,
    mobile,
    phone: mobile,
  };
}

// LeaveEntry mapper 
export function mapLeave(row) {
  if (!row) return row;
  const docid = row.docId !== undefined ? row.docId : row.docid;
  const idcard = row.idCard !== undefined ? row.idCard : row.idcard;
  const empname = row.empName !== undefined ? row.empName : row.empname;
  const finyear = row.finYear !== undefined ? row.finYear : row.finyear;
  const categoryName = row.categoryData?.name || row.categoryName || (isNaN(Number(row.category)) ? row.category : null);
  const userdata = mapUserSnippet(row.userData || row.userdata) || {
    username: empname || idcard || '',
    userName: empname || idcard || '',
    Idcard: idcard || '',
    idCard: idcard || '',
    idcard: idcard || '',
    Employee: empname || null,
    empName: empname || null,
  };

  return {
    ...row,
    docid,
    docId: docid,
    idcard,
    idCard: idcard,
    empname,
    empName: empname,
    finyear,
    finYear: finyear,
    categoryName: categoryName || null,
    category_name: categoryName || null,
    categoryData: row.categoryData || (categoryName ? { name: categoryName } : null),
    userdata,
    userData: userdata,
    createdBy_user: mapUserSnippet(row.createdByUser || row.createdBy_user),
    modifiedBy_user: mapUserSnippet(row.modifiedByUser || row.modifiedBy_user),
  };
}

// PermissionEntry mapper 
export function mapPermission(row) {
  if (!row) return row;
  const docid = row.docId !== undefined ? row.docId : row.docid;
  const idcard = row.idCard !== undefined ? row.idCard : row.idcard;
  const username = row.userName !== undefined ? row.userName : (row.username || row.empName || row.empname);
  const totalHours = row.totalHrs !== undefined ? row.totalHrs : (row.thrs || row.totalHours);
  const categoryName = row.categoryData?.name || row.categoryName || (isNaN(Number(row.category)) ? row.category : null);
  const userdata = mapUserSnippet(row.userData || row.userdata) || {
    username: username || idcard || '',
    userName: username || idcard || '',
    Idcard: idcard || '',
    idCard: idcard || '',
    idcard: idcard || '',
    Employee: username || null,
    empName: username || null,
  };

  return {
    ...row,
    docid,
    docId: docid,
    idcard,
    idCard: idcard,
    username,
    userName: username,
    empname: username,
    empName: username,
    thrs: totalHours,
    totalHrs: totalHours,
    categoryName: categoryName || null,
    category_name: categoryName || null,
    categoryData: row.categoryData || (categoryName ? { name: categoryName } : null),
    userdata,
    userData: userdata,
    createdBy_user: mapUserSnippet(row.createdByUser || row.createdBy_user),
    modifiedBy_user: mapUserSnippet(row.modifiedByUser || row.modifiedBy_user),
  };
}

// Onduty mapper 
export function mapOnduty(row) {
  if (!row) return row;
  const docid = row.docId !== undefined ? row.docId : row.docid;
  const idcard = row.idCard !== undefined ? row.idCard : row.idcard;
  const empname = row.empName !== undefined ? row.empName : row.empname;
  const inout = row.inOut !== undefined ? row.inOut : row.inout;
  const in_location = row.inLocation !== undefined ? row.inLocation : row.in_location;
  const out_location = row.outLocation !== undefined ? row.outLocation : row.out_location;
  const categoryName = row.categoryData?.name || row.categoryName || (isNaN(Number(row.category)) ? row.category : null);
  const userdata = mapUserSnippet(row.userData || row.userdata) || {
    username: empname || idcard || '',
    userName: empname || idcard || '',
    Idcard: idcard || '',
    idCard: idcard || '',
    idcard: idcard || '',
    Employee: empname || null,
    empName: empname || null,
  };

  return {
    ...row,
    docid,
    docId: docid,
    idcard,
    idCard: idcard,
    empname,
    empName: empname,
    inout,
    inOut: inout,
    in_time: row.inTime !== undefined ? row.inTime : row.in_time,
    inTime: row.inTime !== undefined ? row.inTime : row.in_time,
    out_time: row.outTime !== undefined ? row.outTime : row.out_time,
    outTime: row.outTime !== undefined ? row.outTime : row.out_time,
    in_location,
    inLocation: in_location,
    in_latitude: row.inLatitude !== undefined ? row.inLatitude : row.in_latitude,
    inLatitude: row.inLatitude !== undefined ? row.inLatitude : row.in_latitude,
    in_longtiude: row.inLongtiude !== undefined ? row.inLongtiude : row.in_longtiude,
    inLongtiude: row.inLongtiude !== undefined ? row.inLongtiude : row.in_longtiude,
    out_location,
    outLocation: out_location,
    out_latitude: row.outLatitude !== undefined ? row.outLatitude : row.out_latitude,
    outLatitude: row.outLatitude !== undefined ? row.outLatitude : row.out_latitude,
    out_longtiude: row.outLongtiude !== undefined ? row.outLongtiude : row.out_longtiude,
    outLongtiude: row.outLongtiude !== undefined ? row.outLongtiude : row.out_longtiude,
    start_km: row.startKm !== undefined ? row.startKm : row.start_km,
    startKm: row.startKm !== undefined ? row.startKm : row.start_km,
    end_km: row.endKm !== undefined ? row.endKm : row.end_km,
    endKm: row.endKm !== undefined ? row.endKm : row.end_km,
    Svechilekm: row.startVehicleKm !== undefined ? row.startVehicleKm : row.Svechilekm,
    startVehicleKm: row.startVehicleKm !== undefined ? row.startVehicleKm : row.Svechilekm,
    Evechilekm: row.endVehicleKm !== undefined ? row.endVehicleKm : row.Evechilekm,
    endVehicleKm: row.endVehicleKm !== undefined ? row.endVehicleKm : row.Evechilekm,
    vechileno: row.vehicleNo !== undefined ? row.vehicleNo : row.vechileno,
    vehicleNo: row.vehicleNo !== undefined ? row.vehicleNo : row.vechileno,
    to_onduty: row.toOnduty !== undefined ? row.toOnduty : row.to_onduty,
    toOnduty: row.toOnduty !== undefined ? row.toOnduty : row.to_onduty,
    reject_reason: row.rejectReason !== undefined ? row.rejectReason : row.reject_reason,
    rejectReason: row.rejectReason !== undefined ? row.rejectReason : row.reject_reason,
    docdate: row.docDate !== undefined ? row.docDate : row.docdate,
    docDate: row.docDate !== undefined ? row.docDate : row.docdate,
    userdata,
    userData: userdata,
    createdBy_user: mapUserSnippet(row.createdByUser || row.createdBy_user),
    modifiedBy_user: mapUserSnippet(row.modifiedByUser || row.modifiedBy_user),
  };
}

//  (for create/update responses)
export const mapLeaveSingle = (row) => mapLeave(row);
export const mapPermissionSingle = (row) => mapPermission(row);
export const mapOndutySingle = (row) => mapOnduty(row);
export const mapOndutyeSingle = (row) => mapOnduty(row);


// ─── User mapper ────────────────────────────────────────────────────────────
export function mapUser(user) {
  if (!user) return user;
  const mapped = {
    ...user,
    username: user.userName !== undefined ? user.userName : user.username,
    Idcard: user.idCard !== undefined ? user.idCard : user.Idcard,
    idcard: user.idCard !== undefined ? user.idCard : user.idcard,
    Employee: user.empName !== undefined ? user.empName : user.Employee,
    Companies: user.companies !== undefined ? user.companies : user.Companies,
  };
  return mapped;
}

export const mapUserList = (list) => (Array.isArray(list) ? list.map(mapUser) : list);

// ─── Role / RoleOnPage mapper ───────────────────────────────────────────────
export function mapRole(role) {
  if (!role) return role;
  const rolePages = role.roleOnPage || role.RoleOnPage;
  const mappedPages = Array.isArray(rolePages)
    ? rolePages.map((p) => ({
        ...p,
        isdefault: p.isDefault !== undefined ? p.isDefault : p.isdefault,
        dbid: p.id,
      }))
    : rolePages;

  return {
    ...role,
    COMPCODE: role.compCode !== undefined ? role.compCode : role.COMPCODE,
    RoleOnPage: mappedPages !== undefined ? mappedPages : role.RoleOnPage,
  };
}

export const mapRoleList = (list) => (Array.isArray(list) ? list.map(mapRole) : []);

// ─── PermissionMaster mapper ────────────────────────────────────────────────
export function mapPermissionMaster(row) {
  if (!row) return row;
  return {
    ...row,
    ptype: row.pType !== undefined ? row.pType : row.ptype,
    COMPCODE: row.compCode !== undefined ? row.compCode : row.COMPCODE,
  };
}

export const mapPermissionMasterList = (list) => (Array.isArray(list) ? list.map(mapPermissionMaster) : []);

// ─── OndutyMaster mapper ────────────────────────────────────────────────────
export function mapOndutyMaster(row) {
  if (!row) return row;
  return {
    ...row,
    COMPCODE: row.compCode !== undefined ? row.compCode : row.COMPCODE,
  };
}

export const mapOndutyMasterList = (list) => (Array.isArray(list) ? list.map(mapOndutyMaster) : []);
