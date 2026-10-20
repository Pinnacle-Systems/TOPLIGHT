
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.13.0
 * Query Engine version: b9a39a7ee606c28e3455d0fd60e78c3ba82b1a2b
 */
Prisma.prismaVersion = {
  client: "5.13.0",
  engine: "b9a39a7ee606c28e3455d0fd60e78c3ba82b1a2b"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.SettingsScalarFieldEnum = {
  SettingId: 'SettingId',
  UserId: 'UserId',
  Notification: 'Notification',
  BioMatrics: 'BioMatrics',
  COMPCODE: 'COMPCODE'
};

exports.Prisma.NotifyApprovalGroupScalarFieldEnum = {
  id: 'id',
  Idcard: 'Idcard',
  COMPCODE: 'COMPCODE'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  pic: 'pic',
  email: 'email',
  otpemail: 'otpemail',
  approval: 'approval',
  password: 'password',
  Idcard: 'Idcard',
  roleId: 'roleId',
  otp: 'otp',
  hod: 'hod',
  hr: 'hr',
  level: 'level',
  verificationOtp: 'verificationOtp',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  active: 'active',
  employeeId: 'employeeId',
  isAllParty: 'isAllParty',
  isAdmin: 'isAdmin',
  fcm: 'fcm'
};

exports.Prisma.OndutyScalarFieldEnum = {
  id: 'id',
  docid: 'docid',
  docdate: 'docdate',
  idcard: 'idcard',
  empname: 'empname',
  hod: 'hod',
  hr: 'hr',
  Svechilekm: 'Svechilekm',
  Evechilekm: 'Evechilekm',
  approvalStatus: 'approvalStatus',
  userId: 'userId',
  others: 'others',
  group: 'group',
  in_time: 'in_time',
  out_time: 'out_time',
  inout: 'inout',
  photo: 'photo',
  reject_reason: 'reject_reason',
  compCode: 'compCode',
  updatedOn: 'updatedOn',
  in_location: 'in_location',
  in_latitude: 'in_latitude',
  in_longtiude: 'in_longtiude',
  vechileno: 'vechileno',
  bunk: 'bunk',
  start_km: 'start_km',
  end_km: 'end_km',
  out_location: 'out_location',
  out_latitude: 'out_latitude',
  out_longtiude: 'out_longtiude',
  to_onduty: 'to_onduty',
  createdBy: 'createdBy',
  modified_By: 'modified_By',
  rejectBy: 'rejectBy',
  approvedBy: 'approvedBy',
  create: 'create',
  update: 'update',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  category: 'category'
};

exports.Prisma.AdvanceRequestScalarFieldEnum = {
  id: 'id',
  docid: 'docid',
  docdate: 'docdate',
  idcard: 'idcard',
  fromDate: 'fromDate',
  toDate: 'toDate',
  empname: 'empname',
  finyear: 'finyear',
  advtype: 'advtype',
  total: 'total',
  paytype: 'paytype',
  hod: 'hod',
  hr: 'hr',
  group: 'group',
  isCancelled: 'isCancelled',
  userId: 'userId',
  preloan: 'preloan',
  totalloan: 'totalloan',
  predue: 'predue',
  ins: 'ins',
  due: 'due',
  remark: 'remark',
  approvalStatus: 'approvalStatus',
  compCode: 'compCode',
  createdOn: 'createdOn',
  updatedOn: 'updatedOn',
  createdBy: 'createdBy',
  mobile: 'mobile',
  create: 'create',
  update: 'update',
  modified_By: 'modified_By',
  rejectBy: 'rejectBy',
  approvedBy: 'approvedBy',
  category: 'category',
  fincode: 'fincode',
  paycode: 'paycode'
};

exports.Prisma.CompanyCodeScalarFieldEnum = {
  id: 'id',
  Idcard: 'Idcard',
  companyCode: 'companyCode',
  GCOMP: 'GCOMP',
  companyid: 'companyid'
};

exports.Prisma.UserLogScalarFieldEnum = {
  id: 'id',
  User: 'User',
  MobileName: 'MobileName',
  date: 'date',
  MobileIP: 'MobileIP',
  type: 'type',
  Idcard: 'Idcard',
  COMPCODE: 'COMPCODE'
};

exports.Prisma.PermissionDocIDScalarFieldEnum = {
  id: 'id',
  count: 'count'
};

exports.Prisma.PermissionMasterScalarFieldEnum = {
  id: 'id',
  name: 'name',
  active: 'active',
  ptype: 'ptype',
  COMPCODE: 'COMPCODE'
};

exports.Prisma.OndutyMasterScalarFieldEnum = {
  id: 'id',
  name: 'name',
  active: 'active',
  COMPCODE: 'COMPCODE'
};

exports.Prisma.LocationScalarFieldEnum = {
  id: 'id',
  latitude: 'latitude',
  longitude: 'longitude',
  timestamp: 'timestamp',
  accuracy: 'accuracy',
  speed: 'speed',
  bearing: 'bearing',
  altitude: 'altitude',
  provider: 'provider',
  COMPCODE: 'COMPCODE',
  userId: 'userId',
  docId: 'docId',
  createdAt: 'createdAt'
};

exports.Prisma.PermissionEntryScalarFieldEnum = {
  id: 'id',
  createdOn: 'createdOn',
  createdBy: 'createdBy',
  modified_By: 'modified_By',
  modifiedOn: 'modifiedOn',
  group: 'group',
  isCancelled: 'isCancelled',
  userId: 'userId',
  compCode: 'compCode',
  docid: 'docid',
  docDate: 'docDate',
  fTime: 'fTime',
  tTime: 'tTime',
  thrs: 'thrs',
  mobile: 'mobile',
  create: 'create',
  update: 'update',
  approvedBy: 'approvedBy',
  rejectBy: 'rejectBy',
  permissionId: 'permissionId',
  username: 'username',
  reason: 'reason',
  approvalStatus: 'approvalStatus',
  hod: 'hod',
  hr: 'hr',
  category: 'category'
};

exports.Prisma.TrackersScalarFieldEnum = {
  id: 'id',
  UserId: 'UserId',
  isLive: 'isLive',
  COMPCODE: 'COMPCODE',
  docid: 'docid',
  empname: 'empname',
  endDocid: 'endDocid'
};

exports.Prisma.VechilekmScalarFieldEnum = {
  id: 'id',
  VEHICLENO: 'VEHICLENO',
  COMPCODE: 'COMPCODE',
  km: 'km'
};

exports.Prisma.LeaveEntryScalarFieldEnum = {
  id: 'id',
  createdOn: 'createdOn',
  createdBy: 'createdBy',
  modified_By: 'modified_By',
  modifiedOn: 'modifiedOn',
  isCancelled: 'isCancelled',
  userId: 'userId',
  compCode: 'compCode',
  group: 'group',
  finyear: 'finyear',
  docid: 'docid',
  docDate: 'docDate',
  fromDate: 'fromDate',
  toDate: 'toDate',
  totalDays: 'totalDays',
  hr: 'hr',
  ltype: 'ltype',
  fltype: 'fltype',
  tltype: 'tltype',
  mobile: 'mobile',
  reason: 'reason',
  approvalStatus: 'approvalStatus',
  approvedBy: 'approvedBy',
  rejectBy: 'rejectBy',
  hod: 'hod',
  leaveId: 'leaveId',
  create: 'create',
  empname: 'empname',
  update: 'update',
  category: 'category'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  COMPCODE: 'COMPCODE',
  active: 'active',
  defaultRole: 'defaultRole'
};

exports.Prisma.RoleOnPageScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  roleName: 'roleName',
  read: 'read',
  create: 'create',
  edit: 'edit',
  link: 'link',
  delete: 'delete',
  isdefault: 'isdefault'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  costingId: 'costingId',
  senderId: 'senderId',
  receiverId: 'receiverId',
  type: 'type',
  message: 'message',
  isRead: 'isRead'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  settings: 'settings',
  NotifyApprovalGroup: 'NotifyApprovalGroup',
  User: 'User',
  onduty: 'onduty',
  AdvanceRequest: 'AdvanceRequest',
  CompanyCode: 'CompanyCode',
  UserLog: 'UserLog',
  PermissionDocID: 'PermissionDocID',
  PermissionMaster: 'PermissionMaster',
  OndutyMaster: 'OndutyMaster',
  Location: 'Location',
  PermissionEntry: 'PermissionEntry',
  trackers: 'trackers',
  vechilekm: 'vechilekm',
  LeaveEntry: 'LeaveEntry',
  Role: 'Role',
  RoleOnPage: 'RoleOnPage',
  Notification: 'Notification'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
