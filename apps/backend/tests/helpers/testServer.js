import http from 'http';
import { createApp } from '../../src/app.js';

let serverInstance = null;
let baseUrl = '';

/**
 * Start an ephemeral Express test server
 */
export async function startTestServer() {
  if (serverInstance) return { server: serverInstance, baseUrl };

  const app = createApp();
  serverInstance = http.createServer(app);

  await new Promise((resolve) => {
    // Listen on port 0 to let OS assign an available port
    serverInstance.listen(0, '127.0.0.1', () => {
      const address = serverInstance.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  return { server: serverInstance, baseUrl };
}

/**
 * Stop the test server
 */
export async function stopTestServer() {
  if (!serverInstance) return;
  await new Promise((resolve, reject) => {
    serverInstance.close((err) => {
      if (err) return reject(err);
      serverInstance = null;
      baseUrl = '';
      resolve();
    });
  });
}

/**
 * Helper to make HTTP requests against the test server
 * @param {string} endpoint - e.g. '/health' or '/users/login'
 * @param {object} [options] - fetch options (method, headers, body)
 */
export async function apiRequest(endpoint, options = {}) {
  if (!baseUrl) {
    await startTestServer();
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const status = response.status;
  
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  return {
    status,
    ok: response.ok,
    headers: response.headers,
    data,
  };
}

