
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
  settingId: 'settingId',
  userId: 'userId',
  notification: 'notification',
  bioMatrics: 'bioMatrics',
  compCode: 'compCode'
};

exports.Prisma.NotifyApprovalGroupScalarFieldEnum = {
  id: 'id',
  idCard: 'idCard',
  compCode: 'compCode'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  userName: 'userName',
  pic: 'pic',
  email: 'email',
  otpEmail: 'otpEmail',
  approval: 'approval',
  password: 'password',
  idCard: 'idCard',
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
  docId: 'docId',
  docDate: 'docDate',
  idCard: 'idCard',
  empName: 'empName',
  hod: 'hod',
  hr: 'hr',
  startVehicleKm: 'startVehicleKm',
  endVehicleKm: 'endVehicleKm',
  approvalStatus: 'approvalStatus',
  userId: 'userId',
  others: 'others',
  group: 'group',
  inTime: 'inTime',
  outTime: 'outTime',
  inOut: 'inOut',
  photo: 'photo',
  rejectReason: 'rejectReason',
  compCode: 'compCode',
  updatedOn: 'updatedOn',
  inLocation: 'inLocation',
  inLatitude: 'inLatitude',
  inLongtiude: 'inLongtiude',
  vehicleNo: 'vehicleNo',
  bunk: 'bunk',
  startKm: 'startKm',
  endKm: 'endKm',
  outLocation: 'outLocation',
  outLatitude: 'outLatitude',
  outLongtiude: 'outLongtiude',
  toOnduty: 'toOnduty',
  createdBy: 'createdBy',
  modifiedBy: 'modifiedBy',
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
  docId: 'docId',
  docDate: 'docDate',
  idCard: 'idCard',
  fromDate: 'fromDate',
  toDate: 'toDate',
  empName: 'empName',
  finYear: 'finYear',
  advType: 'advType',
  total: 'total',
  payType: 'payType',
  hod: 'hod',
  hr: 'hr',
  group: 'group',
  isCancelled: 'isCancelled',
  userId: 'userId',
  preLoan: 'preLoan',
  totalLoan: 'totalLoan',
  preDue: 'preDue',
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
  modifiedBy: 'modifiedBy',
  rejectBy: 'rejectBy',
  approvedBy: 'approvedBy',
  category: 'category',
  finCode: 'finCode',
  payCode: 'payCode'
};

exports.Prisma.CompanyCodeScalarFieldEnum = {
  id: 'id',
  idCard: 'idCard',
  companyCode: 'companyCode',
  gComp: 'gComp',
  companyId: 'companyId'
};

exports.Prisma.UserLogScalarFieldEnum = {
  id: 'id',
  user: 'user',
  mobileName: 'mobileName',
  date: 'date',
  mobileIp: 'mobileIp',
  type: 'type',
  idCard: 'idCard',
  compCode: 'compCode'
};

exports.Prisma.PermissionDocIdScalarFieldEnum = {
  id: 'id',
  count: 'count'
};

exports.Prisma.PermissionMasterScalarFieldEnum = {
  id: 'id',
  name: 'name',
  active: 'active',
  pType: 'pType',
  compCode: 'compCode'
};

exports.Prisma.OndutyMasterScalarFieldEnum = {
  id: 'id',
  name: 'name',
  active: 'active',
  compCode: 'compCode'
};

exports.Prisma.LocationScalarFieldEnum = {
  id: 'id',
  latitude: 'latitude',
  longitude: 'longitude',
  timeStamp: 'timeStamp',
  accuracy: 'accuracy',
  speed: 'speed',
  bearing: 'bearing',
  altitude: 'altitude',
  provider: 'provider',
  compCode: 'compCode',
  userId: 'userId',
  docId: 'docId',
  createdAt: 'createdAt'
};

exports.Prisma.PermissionEntryScalarFieldEnum = {
  id: 'id',
  createdOn: 'createdOn',
  createdBy: 'createdBy',
  modifiedBy: 'modifiedBy',
  modifiedOn: 'modifiedOn',
  group: 'group',
  isCancelled: 'isCancelled',
  userId: 'userId',
  compCode: 'compCode',
  docId: 'docId',
  docDate: 'docDate',
  fTime: 'fTime',
  tTime: 'tTime',
  totalHrs: 'totalHrs',
  mobile: 'mobile',
  create: 'create',
  update: 'update',
  approvedBy: 'approvedBy',
  rejectBy: 'rejectBy',
  permissionId: 'permissionId',
  userName: 'userName',
  reason: 'reason',
  approvalStatus: 'approvalStatus',
  hod: 'hod',
  hr: 'hr',
  category: 'category',
  rejectReason: 'rejectReason'
};

exports.Prisma.TrackersScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  isLive: 'isLive',
  compCode: 'compCode',
  docId: 'docId',
  empName: 'empName',
  endDocId: 'endDocId'
};

exports.Prisma.VechilekmScalarFieldEnum = {
  id: 'id',
  vehicleNo: 'vehicleNo',
  compCode: 'compCode',
  km: 'km'
};

exports.Prisma.LeaveEntryScalarFieldEnum = {
  id: 'id',
  createdOn: 'createdOn',
  createdBy: 'createdBy',
  modifiedBy: 'modifiedBy',
  modifiedOn: 'modifiedOn',
  isCancelled: 'isCancelled',
  userId: 'userId',
  compCode: 'compCode',
  group: 'group',
  finYear: 'finYear',
  docId: 'docId',
  docDate: 'docDate',
  fromDate: 'fromDate',
  toDate: 'toDate',
  totalDays: 'totalDays',
  hr: 'hr',
  lType: 'lType',
  flType: 'flType',
  tlType: 'tlType',
  mobile: 'mobile',
  reason: 'reason',
  approvalStatus: 'approvalStatus',
  approvedBy: 'approvedBy',
  rejectBy: 'rejectBy',
  hod: 'hod',
  leaveId: 'leaveId',
  create: 'create',
  empName: 'empName',
  update: 'update',
  category: 'category'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  compCode: 'compCode',
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
  isDefault: 'isDefault'
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
  Settings: 'Settings',
  NotifyApprovalGroup: 'NotifyApprovalGroup',
  User: 'User',
  Onduty: 'Onduty',
  AdvanceRequest: 'AdvanceRequest',
  CompanyCode: 'CompanyCode',
  UserLog: 'UserLog',
  PermissionDocId: 'PermissionDocId',
  PermissionMaster: 'PermissionMaster',
  OndutyMaster: 'OndutyMaster',
  Location: 'Location',
  PermissionEntry: 'PermissionEntry',
  Trackers: 'Trackers',
  Vechilekm: 'Vechilekm',
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
