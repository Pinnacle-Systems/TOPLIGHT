import HomeScreen from '../screens/dashboard/HomeScreen';

// We will import the rest of the screens here once their internal imports are fixed.
// For now, we establish the bug-free mechanism to map allowed pages to screens.

export const APP_ROUTES = [
    { key: 'DashBoard', name: 'DashBoard', component: require('../screens/dashboard/indexDashBoard').default, isDefault: true },
    { key: 'HOME', name: 'Home', component: HomeScreen, isDefault: true },
    // Dashboard Modules
    // { key: 'INSURANCEREPORT', name: 'INSURANCEREPORT', component: require('../screens/reports/insuranceReport').default },
    // { key: 'ATTENDANCEREPORT', name: 'ATTENDANCEREPORT', component: require('../screens/reports/dailyAttendanceReport').default },
    // { key: 'onduty', name: 'onduty', component: require('../screens/reports/Onduty/Onduty_Report').default },
];
