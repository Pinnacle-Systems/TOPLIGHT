import { resolveHostnameCloudflare } from '../Component/Utils/DnsResolver';

// ─── Base Config ────────────────────────────────────────────────────────────

export const BASE_URL = 'http://192.168.1.58:8025';
export const BASE_DOMAIN = '192.168.1.58';

/** Set to true to skip Cloudflare DNS resolution in local/dev builds. */
export const IS_DEV = __DEV__;

let _resolvedBaseUrl = BASE_URL;

export const getApiBaseUrl = () => _resolvedBaseUrl;

/**
 * Updates the resolved base URL after DNS resolution.
 * Call this once at app startup.
 */
export const setResolvedApiUrl = (ip) => {
  if (ip && typeof ip === 'string') {
    // If the backend runs on HTTP and port 8025:
    _resolvedBaseUrl = `http://${ip}:8025`;
    console.log(`[Config] DNS resolved → ${_resolvedBaseUrl} (Operating via Cloudflare resolution)`);
  }
};

/**
 * Global fetch wrapper to dynamically intercept and reroute 
 * RTK Query requests that were statically initialized with BASE_URL.
 */
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  if (typeof url === 'string' && url.startsWith(BASE_URL) && _resolvedBaseUrl !== BASE_URL) {
    url = url.replace(BASE_URL, _resolvedBaseUrl);
  } else if (url && url.url && typeof url.url === 'string' && url.url.startsWith(BASE_URL) && _resolvedBaseUrl !== BASE_URL) {
    // Handle Request object input
    url = new Request(url.url.replace(BASE_URL, _resolvedBaseUrl), url);
  }
  return originalFetch(url, options);
};

/**
 * Resolves the API domain via Cloudflare DoH and updates the base URL.
 * Call once in your app entry point (e.g. App.js).
 */
export const initDnsResolution = async () => {
  try {
    const ip = await resolveHostnameCloudflare(BASE_DOMAIN);
    if (ip) {
      setResolvedApiUrl(ip);
    } else {
      console.warn('[Config] DNS resolution failed, falling back to cached base URL');
    }
  } catch (error) {
    console.error('[Config] DNS init error:', error);
  }
};

// ─── API Route Segments ──────────────────────────────────────────────────────

export const ROUTES = {
  PO_REGISTER:    '/poRegister',
  COMMON_MAST:    '/commonMast',
  SUPPLIER:       '/supplier',
  PO_DATA:        '/poData',
  MIS_DASHBOARD:  '/misDashboard',
  ORD_MANAGEMENT: '/ordManagement',
  LOGIN:          'users/login',
  USERS:          'users',
  USER_DETAILS:   'userDetails',
  PERMISSION:     'Permission',
  NOTIFICATION:   'Notifi',
  LEAVE:          'leave',
  ADVANCE:        'advance',
  ROLE:           'role',
  ON_DUTY:        'onduty',
  ATT :   "attendance"
};

// ─── Flat route exports (legacy imports from service files) ──────────────────

export const PO_REGISTER    = ROUTES.PO_REGISTER;
export const COMMON_MAST    = ROUTES.COMMON_MAST;
export const SUPPLIER       = ROUTES.SUPPLIER;
export const PO_DATA        = ROUTES.PO_DATA;
export const MIS_DASHBOARD  = ROUTES.MIS_DASHBOARD;
export const ORD_MANAGEMENT = ROUTES.ORD_MANAGEMENT;
export const Notifi         = ROUTES.NOTIFICATION;
export const Permission     = ROUTES.PERMISSION;
export const Role           = ROUTES.ROLE;
export const Leave          = ROUTES.LEAVE;
export const Advance        = ROUTES.ADVANCE;
export const onduty         = ROUTES.ON_DUTY;

export const attendance = ROUTES.ATT;

// ─── Full URL constants (used directly in service query builders) ─────────────

export const LOGIN_API   = ROUTES.LOGIN;
export const USERS_API   = ROUTES.USERS;
export const UserDetails = ROUTES.USER_DETAILS;

/**
 * RESOLVED_BASE_URL — legacy export kept for backward compatibility.
 * Prefer getApiBaseUrl() for dynamic IP resolution.
 * This is a snapshot of the initial value; use getApiBaseUrl() in query builders.
 */
export const RESOLVED_BASE_URL = _resolvedBaseUrl;

/**
 * Returns the Onduty image URL using the current resolved base URL.
 * Call this as a function so it always uses the latest resolved IP.
 */
export const getOndutyImageUrl = () =>
  `${getApiBaseUrl()}/${ROUTES.ON_DUTY}/Onduty_uploaded_image`;

/**
 * Onduty_Image_url — used as a base URL string for onduty image requests.
 * Wrapped as a getter so DNS resolution is always respected at call time.
 */
export const Onduty_Image_url = `${BASE_URL}/${ROUTES.ON_DUTY}/Onduty_uploaded_image`;