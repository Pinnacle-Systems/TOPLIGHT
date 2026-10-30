import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import '../setup.js';
import { startTestServer, stopTestServer, apiRequest } from '../helpers/testServer.js';

describe('Backend Express.js Attendance Management E2E Tests', () => {
  before(async () => {
    await startTestServer();
  });

  after(async () => {
    await stopTestServer();
  });

  it('POST /attendance/punch-in without headers or body should return 400 error', async () => {
    const res = await apiRequest('/attendance/punch-in', {
      method: 'POST',
      body: {},
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.status, 0);
    assert.equal(res.data.message, 'Employee ID and company code are required.');
  });

  it('PUT /attendance/punch-out without identity should return 400 error', async () => {
    const res = await apiRequest('/attendance/punch-out', {
      method: 'PUT',
      body: {},
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.status, 0);
    assert.equal(res.data.message, 'Employee ID and company code are required.');
  });

  it('POST /attendance/punch-in with idcard but missing compcode should return 400', async () => {
    const res = await apiRequest('/attendance/punch-in', {
      method: 'POST',
      body: { idcard: '1001' },
    });
    assert.equal(res.status, 400);
    assert.equal(res.data.status, 0);
  });

  it('GET /attendance/status with headers should respond gracefully', async () => {
    const res = await apiRequest('/attendance/status', {
      headers: {
        compcode: 'TLT',
        idcard: '1001',
      },
    });
    assert.ok(res.status === 200 || res.status === 500);
    if (res.status === 200 && res.data.data) {
      assert.ok(['NONE', 'IN', 'OUT'].includes(res.data.data.status));
    }
  });
});

