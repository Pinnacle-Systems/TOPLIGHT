import { DRIVER_OPTIONS } from '../appium.config.js';

let driverInstance = null;

/**
 * Initialize or retrieve Appium remote WebDriver session
 * Automatically handles Appium 2.x (path: '/') and Appium 1.x (path: '/wd/hub')
 */
export async function getAppiumDriver(customCapabilities = {}) {
  if (driverInstance) return driverInstance;

  const { remote } = await import('webdriverio');

  // Try Appium 2.x root path first ('/')
  try {
    const options = {
      ...DRIVER_OPTIONS,
      path: '/',
      capabilities: {
        ...DRIVER_OPTIONS.capabilities,
        ...customCapabilities,
      },
    };
    driverInstance = await remote(options);
    return driverInstance;
  } catch (err) {
    // Fallback to legacy Appium 1.x path ('/wd/hub') if root path is not recognized
    if (err.message && (err.message.includes('unknown command') || err.message.includes('404'))) {
      try {
        const fallbackOptions = {
          ...DRIVER_OPTIONS,
          path: '/wd/hub',
          capabilities: {
            ...DRIVER_OPTIONS.capabilities,
            ...customCapabilities,
          },
        };
        driverInstance = await remote(fallbackOptions);
        return driverInstance;
      } catch (fallbackErr) {
        console.warn('[Appium Helper] Fallback to /wd/hub also failed:', fallbackErr.message);
      }
    }

    console.warn('[Appium Helper] Could not connect to live Appium server:', err.message);
    throw err;
  }
}

/**
 * Quit Appium remote session
 * Accepts an optional `force` boolean. When KEEP_APPIUM_SESSION is enabled,
 * the driver session is maintained across test specs without closing/reopening the app.
 */
export async function quitAppiumDriver(force = false) {
  if (process.env.KEEP_APPIUM_SESSION === 'true' && !force) {
    return;
  }
  if (driverInstance) {
    try {
      await driverInstance.deleteSession();
    } catch (_) {}
    driverInstance = null;
  }
}

export default {
  getAppiumDriver,
  quitAppiumDriver,
};
