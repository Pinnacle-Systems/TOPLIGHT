/**
 * TopLight Unified Mobile E2E Test Suite
 *
 * Runs all test specs in a single persistent Appium session:
 * 1. App launches once
 * 2. Login & Company Code selection -> Lands on Home Screen
 * 3. OnDuty Entry & Vehicle KM -> Return to Home Screen
 * 4. OnDuty Active Trip Lifecycle -> Return to Home Screen
 * 5. Attendance Punch & Switch Tabs -> Return to Home Screen
 * 6. Leave & Permission Entry -> Return to Home Screen
 * 7. MIS Dashboard & Drawer Reports -> Return to Home Screen
 * 8. User Roles & Logs -> Return to Home Screen
 * 9. Settings & GPS Tracking Map -> Return to Home Screen
 * 10. Network Resilience & Recovery -> Return to Home Screen
 *
 * Eliminates unnecessary app closing, reloading, and activity thrashing!
 */

import { after } from 'node:test';
import { quitAppiumDriver } from './helpers/driver.js';

// Instruct driver to keep session persistent across all child specs
process.env.KEEP_APPIUM_SESSION = 'true';

// 1. Auth & Login Flow (Navigates to Home Screen)
import './specs/01_auth_login.spec.js';

// 2. OnDuty Entry Flow (Navigates to OnDuty, fills details, returns to Home Screen)
import './specs/02_onduty_entry.spec.js';

// 3. OnDuty Lifecycle Flow (Checks active session, returns to Home Screen)
import './specs/03_onduty_lifecycle.spec.js';

// 4. Attendance Flow (Navigates to Attendance, switches tabs, returns to Home Screen)
import './specs/04_attendance.spec.js';

// 5. Leave & Permission Approvals (Navigates to Leave/Perm, returns to Home Screen)
import './specs/05_leave_permission_approvals.spec.js';

// 6. Dashboards & Reports (Tests drawer/sidebar, returns to Home Screen)
import './specs/06_dashboards_reports.spec.js';

// 7. User Roles & Logs (Inspects roles, returns to Home Screen)
import './specs/07_user_roles_and_logs.spec.js';

// 8. Settings & Tracking Map (Toggles switches, returns to Home Screen)
import './specs/08_settings_and_tracking_map.spec.js';

// 9. Network Resilience (Tests offline banner & retry, returns to Home Screen)
import './specs/09_network_resilience.spec.js';

// Clean up Appium session only once at the very end of the entire suite
after(async () => {
  console.log('\n📱 [Mobile Suite] All test specs completed. Cleaning up Appium session...');
  await quitAppiumDriver(true);
});

