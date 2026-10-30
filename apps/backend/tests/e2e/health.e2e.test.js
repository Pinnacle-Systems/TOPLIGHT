import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import '../setup.js';
import { startTestServer, stopTestServer, apiRequest } from '../helpers/testServer.js';

describe('Backend Express.js Server Health & Infrastructure E2E', () => {
  before(async () => {
    await startTestServer();
  });

  after(async () => {
    await stopTestServer();
  });

  it('GET / should return root application info', async () => {
    const res = await apiRequest('/');
    assert.equal(res.status, 200);
    assert.ok(res.data);
    assert.equal(res.data.Name, 'TopLight Server');
    assert.equal(res.data.status, 'online');
  });

  it('GET /health should return 200 or 207 with diagnostic health report', async () => {
    const res = await apiRequest('/health');
    assert.ok(res.status === 200 || res.status === 207);
    assert.ok(res.data);
    assert.ok(res.data.status === 'ok' || res.data.status === 'degraded');
    assert.ok(res.data.timestamp);
    assert.ok(res.data.dns);
    assert.ok(res.data.database);
  });

  it('GET /unknown-route should return 404 with standard error format', async () => {
    const res = await apiRequest('/non-existent-endpoint-test-404');
    assert.equal(res.status, 404);
    assert.equal(res.data.error, 'Not Found');
  });
});
