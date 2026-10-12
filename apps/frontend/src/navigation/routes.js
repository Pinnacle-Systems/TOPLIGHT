import HomeScreen from '../screens/dashboard/HomeScreen';
import UserAndRoles from '../screens/users/UserAndRoles';
import OndutyScreen from '../screens/onduty/OndutyScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import MastersScreen from '../screens/masters/MastersScreen';
import OndutyMasterScreen from '../screens/masters/OndutyMasterScreen';
import PermissionMasterScreen from '../screens/masters/PermissionMasterScreen';
import RoleMasterScreen from '../screens/masters/RoleMasterScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';

export const APP_ROUTES = [
    { key: 'HOME', name: 'HOME', component: HomeScreen, isDefault: true },
    { key: 'DashBoard', name: 'DashBoard', component: require('../screens/dashboard/indexDashBoard').default, isDefault: true },
    { key: 'USERANDROLES', name: 'USERANDROLES', component: UserAndRoles, isDefault: true },
    { key: 'onduty', name: 'onduty', component: OndutyScreen, isDefault: false },
    { key: 'settings', name: 'settings', component: SettingsScreen, isDefault: true },
    { key: 'Att', name: 'Att', component: AttendanceScreen, isDefault: false },
    // ── Masters Hub ──────────────────────────────────────────────────────────
    { key: 'masters', name: 'masters', component: MastersScreen, isDefault: false },
    { key: 'onduty_master', name: 'onduty_master', component: OndutyMasterScreen, isDefault: false },
    { key: 'm_permission', name: 'm_permission', component: PermissionMasterScreen, isDefault: false },
    { key: 'page_master', name: 'page_master', component: RoleMasterScreen, isDefault: false },
];
