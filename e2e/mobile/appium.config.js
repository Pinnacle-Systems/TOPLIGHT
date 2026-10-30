/**
 * Appium (Selenium WebDriver for Mobile) Configuration for TopLight React Native App
 */

export const APPIUM_HOST = process.env.APPIUM_HOST || '127.0.0.1';
export const APPIUM_PORT = parseInt(process.env.APPIUM_PORT || '4723', 10);

export const ANDROID_CAPABILITIES = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
  'appium:appPackage': 'com.frontend',
  'appium:appActivity': 'com.frontend.MainActivity',
  'appium:noReset': true,
  'appium:fullReset': false,
  'appium:forceAppLaunch': false,
  'appium:dontStopAppOnReset': true,
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 240,
  'appium:uiautomator2ServerInstallTimeout': 60000,
  'appium:uiautomator2ServerLaunchTimeout': 60000,
  'appium:adbExecTimeout': 60000,
};

export const DRIVER_OPTIONS = {
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: '/',
  capabilities: ANDROID_CAPABILITIES,
  logLevel: 'warn',
  strictSelectors: false,
};

export default {
  APPIUM_HOST,
  APPIUM_PORT,
  ANDROID_CAPABILITIES,
  DRIVER_OPTIONS,
};
