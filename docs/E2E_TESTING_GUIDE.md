# TopLight E2E Test Automation Guide

This guide describes the End-to-End (E2E) testing framework for the TopLight monorepo, covering both the **React Native Android Mobile App** (via Appium / Selenium WebDriver) and the **Express.js Backend** (via Node.js Native Test Runner).

---

## 📑 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Folder & Directory Structure](#2-folder--directory-structure)
3. [Prerequisites & Environment Setup](#3-prerequisites--environment-setup)
4. [How to Run the Tests](#4-how-to-run-the-tests)
5. [Backend Express.js E2E Testing](#5-backend-expressjs-e2e-testing)
6. [Mobile React Native Appium Testing](#6-mobile-react-native-appium-testing)
7. [Testing Slow Networks & DNS Issues](#7-testing-slow-networks--dns-issues)
8. [How to Add New Test Cases](#8-how-to-add-new-test-cases)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Overview & Architecture

TopLight uses a two-tier E2E testing architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TopLight E2E Test Suite                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  Mobile Frontend (Appium)    │              │   Backend (Express.js API)   │
│  - Driver: UiAutomator2      │              │  - Runner: node:test (v22)   │
│  - Protocol: W3C WebDriver   │              │  - Ephemeral test server     │
│  - Targets: Real APK on phone│              │  - Target: REST APIs, Auth,  │
│    or Android Emulator       │              │    Oracle & Prisma DB checks │
└──────────────────────────────┘              └──────────────────────────────┘
```

---

## 2. Folder & Directory Structure

```
c:/MOB/TOPLIGHT/
├── docs/                                  # Documentation Directory
│   ├── README.md                          # Docs entry point
│   └── E2E_TESTING_GUIDE.md               # This complete guide
│
├── e2e/                                   # Root End-to-End Test Workspace
│   ├── runner.js                          # Unified CLI test runner (runs backend + mobile)
│   └── mobile/                            # Appium Mobile Automation
│       ├── appium.config.js               # Capabilities for Android UiAutomator2 & package info
│       ├── helpers/
│       │   ├── baseScreen.js              # Base Page Object Model (POM) with selectors & helpers
│       │   └── driver.js                  # Appium remote WebDriver session manager
│       └── specs/                         # Mobile UI Test Specifications
│           ├── 01_auth_login.spec.js      # Splash & Login flow, company code, validations
│           ├── 02_onduty_entry.spec.js    # OnDuty form, Base Location card, reasons, photo
│           ├── 03_onduty_lifecycle.spec.js# Active trip card, departure time, reached & checkout
│           ├── 04_attendance.spec.js      # Attendance Punch In/Out, HOD Team view
│           ├── 05_leave_permission_approvals.spec.js # Leave & Permission entry + approval flows
│           ├── 06_dashboards_reports.spec.js# MIS Dashboard KPI cards, Reports & Masters tabs
│           ├── 07_user_roles_and_logs.spec.js # User Profile, Role allocation & Device Audit Logs
│           ├── 08_settings_and_tracking_map.spec.js # Settings screen & Live GPS route Leaflet map
│           └── 09_network_resilience.spec.js# Offline error card, Retry button & DNS cache flush
│
├── apps/
│   ├── backend/
│   │   ├── package.json                   # Backend test script ("test:e2e")
│   │   └── tests/
│   │       ├── setup.js                   # Test environment variables (NODE_ENV=test)
│   │       ├── helpers/
│   │       │   └── testServer.js          # Ephemeral Express test server & HTTP client helper
│   │       └── e2e/                       # Backend API Test Suites
│   │           ├── health.e2e.test.js     # Health check, DNS, and database diagnostic E2E
│   │           ├── auth.e2e.test.js       # Login validation, roles on page, designations
│   │           ├── onduty.e2e.test.js     # DocID generator, reasons, approvals, active trip
│   │           ├── attendance.e2e.test.js # Punch In/Out, validation, and status endpoint
│   │           ├── leave_permission.e2e.test.js # Leave DocID, FinYear, codes & notifications
│   │           ├── mis_and_reports.e2e.test.js # MIS metrics, headcount, gender count, masters
│   │           └── network_resilience.e2e.test.js # Abort timeouts, DNS latency & retry recovery
│   │
│   └── frontend/
│       ├── android/                       # Native Android Project (com.frontend.MainActivity)
│       └── src/
│           ├── components/utils/DnsResolver.js # Cloudflare DoH resolver with TTL cache & retries
│           ├── navigation/Routes.js       # All 22 screen routes covered by the test suites
│           └── screens/                   # UI Screens under test
│
└── package.json                           # Root scripts (test:e2e, test:e2e:backend, test:e2e:mobile)
```

---

## 3. Prerequisites & Environment Setup

### 3.1 Node.js
* Node.js `>= 22.11.0` (Native `node:test` runner included out of the box).
* `pnpm` installed globally.

### 3.2 For Backend E2E Tests
No extra software required. The backend test suite runs natively in Node.js using built-in modules (`node:test`, `node:assert`, `fetch`).

### 3.3 For Mobile Appium E2E Tests
To execute mobile tests against a live physical Android phone or emulator:

1. **Android SDK & ADB**:
   * Ensure `adb` is in your PATH.
   * Verify your device is connected:
     ```bash
     adb devices
     ```
2. **Appium 2.x & UiAutomator2 Driver**:
   Install Appium and the Android UiAutomator2 driver globally:
   ```bash
   npm install -g appium
   appium driver install uiautomator2
   ```
3. **Start the Appium Server**:
   ```bash
   appium
   ```
   *(By default, Appium listens on `http://127.0.0.1:4723`)*

---

## 4. How to Run the Tests

Execute tests from the project root directory:

### Run Everything (Backend + Mobile)
```bash
pnpm test:e2e
```

### Run Only Backend Express.js API Tests
```bash
pnpm test:e2e:backend
```

### Run Only Mobile Appium Tests
```bash
pnpm test:e2e:mobile
```

---

## 5. Backend Express.js E2E Testing

* [`apps/backend/tests/helpers/testServer.js`](file:///c:/MOB/TOPLIGHT/apps/backend/tests/helpers/testServer.js) boots an HTTP server on port `0` (port dynamically assigned by the OS, preventing `EADDRINUSE` port collision).
* The `apiRequest(endpoint, options)` helper sends requests directly to the ephemeral instance and automatically parses JSON.

---

## 6. Mobile React Native Appium Testing

* [`e2e/mobile/appium.config.js`](file:///c:/MOB/TOPLIGHT/e2e/mobile/appium.config.js) targets `com.frontend` and `com.frontend.MainActivity`.
* [`e2e/mobile/helpers/baseScreen.js`](file:///c:/MOB/TOPLIGHT/e2e/mobile/helpers/baseScreen.js) implements the **Page Object Model (POM)**:
  * `findByText(text)`: Locates views using Android UiSelector `textContains`.
  * `findByExactText(text)`: Locates views using exact text matching.
  * `tapText(text)`: Clicks an element.
  * `typeInto(element, value)`: Clears and types into a `TextInput`.
  * `takeScreenshot(name)`: Captures a PNG screenshot on test failure.

---

## 7. Testing Slow Networks & DNS Issues

TopLight incorporates built-in defensive layers for handling slow connections and DNS failure:

### 7.1 How the App Behaves During Network / DNS Problems:
1. **Cloudflare DNS-over-HTTPS (DoH)**:
   * [`apps/frontend/src/components/utils/DnsResolver.js`](file:///c:/MOB/TOPLIGHT/apps/frontend/src/components/utils/DnsResolver.js) queries Cloudflare (`1.1.1.1`) over HTTPS.
   * If a DNS lookup times out or fails, it performs exponential backoff retries (300ms, 600ms) up to 2 times.
   * Successful resolutions are saved in an in-memory TTL cache (up to 10 minutes) so subsequent requests don't repeatedly make DNS queries.
2. **Slow Network / Latency Handling**:
   * UI displays loading spinners (`ActivityIndicator`) and disables action buttons (`disabled={isSubmitting}`) to prevent duplicate clicks and double submissions.
3. **Connection Failure / Timeout UI**:
   * If the network drops completely, screens render a dedicated **Connection Error** card with a `wifi-off` icon and a **"Retry Connection"** button (allowing users to recover without restarting the app).
4. **Manual DNS Cache Clear**:
   * Users can navigate to the Settings screen and tap "DNS Cache Clear" to flush stale IP resolutions.

### 7.2 Automated E2E Tests for Network Resilience:
* **Backend E2E**: [`apps/backend/tests/e2e/network_resilience.e2e.test.js`](file:///c:/MOB/TOPLIGHT/apps/backend/tests/e2e/network_resilience.e2e.test.js) tests client-side abort timeouts (`AbortController`), DNS health check thresholds, and consecutive retry recovery.
* **Mobile Appium Spec**: [`e2e/mobile/specs/09_network_resilience.spec.js`](file:///c:/MOB/TOPLIGHT/e2e/mobile/specs/09_network_resilience.spec.js) tests the "Connection Error" card, "Retry Connection" button, and DNS cache reset trigger.

### 7.3 Simulating Slow Network / Offline on Android Emulator:
You can simulate network throttling and packet loss via ADB:
```bash
# Set network speed to slow 2G (GPRS)
adb emu network speed gprs

# Add network latency delay (400ms)
adb emu network delay gprs

# Simulate complete offline / airplane mode
adb shell svc data disable
adb shell svc wifi disable

# Restore full speed network
adb emu network speed full
adb emu network delay none
adb shell svc data enable
adb shell svc wifi enable
```

---

## 8. How to Add New Test Cases

### To Add a Backend API Test:
1. Create a new test file in `apps/backend/tests/e2e/my_new_feature.e2e.test.js`.
2. Import `startTestServer`, `stopTestServer`, and `apiRequest` from `../helpers/testServer.js`.
3. Add your `describe` and `it` blocks asserting HTTP status codes and response bodies.
4. Run `pnpm test:e2e:backend` to verify.

### To Add a Mobile Screen Test:
1. Create a new spec file in `e2e/mobile/specs/10_my_new_screen.spec.js`.
2. Initialize `BaseScreen(driver)`.
3. Use `screen.findByText()`, `screen.tapText()`, or `screen.findByTestId()` to interact with elements on screen.
4. Run `pnpm test:e2e:mobile` to verify.

---

## 9. Troubleshooting & FAQs

### Q: Appium says "Could not find a connected Android device"
* Run `adb devices` in PowerShell. Ensure your phone shows as `device` (not `unauthorized` or `offline`).
* Enable **USB Debugging** in Android Developer Options.

### Q: Backend test fails with database connection error
* The test harness handles degraded DB states gracefully (returns 207 or 500 without crashing).
* Check your `.env` database connection strings (`DATABASE_URL`, `ORACLE_CONN_STRING`).

### Q: How do I run only a single backend test file?
```bash
node --test apps/backend/tests/e2e/auth.e2e.test.js
```

### Q: How do I run only a single mobile spec?
```bash
node --test e2e/mobile/specs/01_auth_login.spec.js
```
