import dns from 'node:dns';

/**
 * Configure Cloudflare DNS servers (1.1.1.1 = primary, 1.0.0.1 = fallback).
 * Ensures resilient DNS resolution across environments.
 */
export function initializeDns() {
  dns.setServers(['1.1.1.1', '1.0.0.1']);

  dns.resolve4('cloudflare.com', (err, addresses) => {
    if (err) {
      console.error('[DNS] ❌ Cloudflare DNS resolution test FAILED:', err.message);
    } else {
      console.log('[DNS] ✅ Cloudflare DNS working. cloudflare.com →', addresses.join(', '));
    }
  });
}

export default initializeDns;

