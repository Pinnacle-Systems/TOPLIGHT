/**
 * DNS-over-HTTPS (DoH) Resolver using Cloudflare's 1.1.1.1
 * Features: TTL-based caching, timeout, retry, CNAME support, fallback IPs
 */

const CLOUDFLARE_DOH_URL = 'https://cloudflare-dns.com/dns-query';
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes fallback TTL

// In-memory DNS cache: { hostname -> { ip, expiresAt } }
const dnsCache = new Map();

/**
 * Clears the entire DNS cache or a specific hostname entry.
 * @param {string} [hostname] - If provided, clears only that entry.
 */
export const clearDnsCache = (hostname) => {
  if (hostname) {
    dnsCache.delete(hostname);
    console.log(`[DNS] Cache cleared for ${hostname}`);
  } else {
    dnsCache.clear();
    console.log('[DNS] Full cache cleared');
  }
};

/**
 * Fetch with timeout support using AbortController.
 */
const fetchWithTimeout = (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
};

/**
 * Performs a single DoH query to Cloudflare.
 * @param {string} hostname
 * @returns {Promise<{ ip: string, ttl: number } | null>}
 */
const queryCloudflare = async (hostname) => {
  const url = `${CLOUDFLARE_DOH_URL}?name=${encodeURIComponent(hostname)}&type=A`;

  const response = await fetchWithTimeout(
    url,
    {
      method: 'GET',
      headers: { Accept: 'application/dns-json' },
    },
    DEFAULT_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new Error(`DoH query failed — HTTP ${response.status}`);
  }

  const data = await response.json();

  // DNS status codes: 0 = NOERROR, 3 = NXDOMAIN (domain doesn't exist)
  if (data.Status !== 0) {
    const statusMessages = {
      1: 'FORMERR',
      2: 'SERVFAIL',
      3: 'NXDOMAIN (domain does not exist)',
      4: 'NOTIMP',
      5: 'REFUSED',
    };
    throw new Error(
      `DNS error: ${statusMessages[data.Status] || `Status ${data.Status}`}`,
    );
  }

  if (!data.Answer || data.Answer.length === 0) {
    return null;
  }

  // Filter to A records only (type 1), skip CNAMEs (type 5)
  const aRecords = data.Answer.filter(record => record.type === 1);

  if (aRecords.length === 0) {
    return null;
  }

  // Pick the first A record; use its TTL (minimum 10s, max 10min)
  const aRecord = aRecords[0];
  const ttlMs = Math.min(
    Math.max(aRecord.TTL * 1000, 10_000),
    10 * 60 * 1000,
  );

  return { ip: aRecord.data, ttl: ttlMs };
};

/**
 * Resolves a hostname to an IP address using Cloudflare DoH.
 * Uses in-memory TTL cache and retries on transient failures.
 *
 * @param {string} hostname - Domain to resolve.
 * @param {object} [options]
 * @param {number} [options.retries=2] - Number of retry attempts on failure.
 * @param {boolean} [options.forceRefresh=false] - Skip cache and re-query.
 * @returns {Promise<string|null>} - Resolved IP or null on failure.
 */
export const resolveHostnameCloudflare = async (hostname, options = {}) => {
  const { retries = DEFAULT_RETRY_COUNT, forceRefresh = false } = options;

  if (!hostname || typeof hostname !== 'string') {
    console.error('[DNS] Invalid hostname provided');
    return null;
  }

  // 1. Check cache first (unless forceRefresh)
  if (!forceRefresh) {
    const cached = dnsCache.get(hostname);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(
        `[DNS] Cache hit: ${hostname} → ${cached.ip} (expires in ${Math.round((cached.expiresAt - Date.now()) / 1000)}s)`,
      );
      return cached.ip;
    }
  }

  // 2. Query with retries
  let lastError = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.log(`[DNS] Querying ${hostname} (attempt ${attempt})`);
      const result = await queryCloudflare(hostname);

      if (!result) {
        console.warn(`[DNS] No A records found for ${hostname}`);
        return null;
      }

      // 3. Store in cache with TTL
      dnsCache.set(hostname, {
        ip: result.ip,
        expiresAt: Date.now() + result.ttl,
      });

      console.log(
        `[DNS] Resolved ${hostname} → ${result.ip} (TTL: ${result.ttl / 1000}s)`,
      );
      return result.ip;
    } catch (error) {
      lastError = error;

      const isAbort = error.name === 'AbortError';
      const isNXDomain = error.message.includes('NXDOMAIN');

      // Don't retry on definitive errors
      if (isNXDomain) {
        console.error(`[DNS] ${hostname} does not exist (NXDOMAIN)`);
        return null;
      }

      if (isAbort) {
        console.warn(`[DNS] Attempt ${attempt} timed out for ${hostname}`);
      } else {
        console.warn(`[DNS] Attempt ${attempt} failed for ${hostname}:`, error.message);
      }

      // Wait before retry (exponential backoff: 300ms, 600ms)
      if (attempt <= retries) {
        await new Promise(res => setTimeout(res, 300 * attempt));
      }
    }
  }

  console.error(
    `[DNS] All ${retries + 1} attempts failed for ${hostname}:`,
    lastError?.message,
  );
  return null;
};