import HomeScreen from '../screens/dashboard/HomeScreen';
import UserAndRoles from '../screens/users/UserAndRoles';
import OndutyScreen from '../screens/onduty/OndutyScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import MastersScreen from '../screens/masters/MastersScreen';
import OndutyMasterScreen from '../screens/masters/OndutyMasterScreen';
import PermissionMasterScreen from '../screens/masters/PermissionMasterScreen';
import RoleMasterScreen from '../screens/masters/RoleMasterScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import OndutyApprovalScreen from '../screens/onduty/approval/OndutyApprovalScreen';
import LeaveEntryScreen from '../screens/leave/LeaveEntryScreen';
import LeaveApprovalScreen from '../screens/leave/LeaveApprovalScreen';
import PermissionEntryScreen from '../screens/permission/PermissionEntryScreen';
import PermissionApprovalScreen from '../screens/permission/PermissionApprovalScreen';
import UserInfoScreen from '../screens/users/UserInfoScreen';
import UserLogsScreen from '../screens/users/UserLogsScreen';
import LocationTrackingScreen from '../screens/location/LocationTrackingScreen';

export const APP_ROUTES = [
    { key: 'HOME', name: 'HOME', component: HomeScreen, isDefault: true },
    { key: 'DashBoard', name: 'DashBoard', component: require('../screens/dashboard/indexDashBoard').default, isDefault: true },
    { key: 'USERANDROLES', name: 'USERANDROLES', component: UserAndRoles, isDefault: true },
    { key: 'onduty', name: 'onduty', component: OndutyScreen, isDefault: false },
    { key: 'onduty_approval', name: 'onduty_approval', component: OndutyApprovalScreen, isDefault: true },
    { key: 'settings', name: 'settings', component: SettingsScreen, isDefault: true },
    { key: 'Att', name: 'Att', component: AttendanceScreen, isDefault: false },
    { key: 'lentry', name: 'lentry', component: LeaveEntryScreen, isDefault: false },
    { key: 'l_approval', name: 'l_approval', component: LeaveApprovalScreen, isDefault: true },
    { key: 'pentry', name: 'pentry', component: PermissionEntryScreen, isDefault: false },
    { key: 'p_approval', name: 'p_approval', component: PermissionApprovalScreen, isDefault: true },
    { key: 'uinfo', name: 'uinfo', component: UserInfoScreen, isDefault: false },
    { key: 'logs', name: 'logs', component: UserLogsScreen, isDefault: false },
    { key: 'map', name: 'map', component: LocationTrackingScreen, isDefault: true },
    // ── Masters Hub ──────────────────────────────────────────────────────────
    { key: 'masters', name: 'masters', component: MastersScreen, isDefault: false },
    { key: 'onduty_master', name: 'onduty_master', component: OndutyMasterScreen, isDefault: false },
    { key: 'm_permission', name: 'm_permission', component: PermissionMasterScreen, isDefault: false },
    { key: 'page_master', name: 'page_master', component: RoleMasterScreen, isDefault: false },
];
