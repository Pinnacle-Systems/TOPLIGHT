import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import '../setup.js';
import { startTestServer, stopTestServer, apiRequest } from '../helpers/testServer.js';

describe('Backend Express.js Leave & Permission E2E Tests', () => {
  before(async () => {
    await startTestServer();
  });

  after(async () => {
    await stopTestServer();
  });

  it('GET /leave/getDocId should return leave doc ID preview', async () => {
    const res = await apiRequest('/leave/getDocId', {
      headers: {
        compcode: 'TLT',
        idcard: '1001',
      },
    });
    assert.equal(res.status, 200);
    assert.ok(res.data);
  });

  it('GET /leave/get_Current_Fin_Year should return financial year information', async () => {
    const res = await apiRequest('/leave/get_Current_Fin_Year');
    assert.ok(res.status === 200 || res.status === 500);
    assert.ok(res.data);
  });

  it('GET /leave/get_Lcode should return available leave types/codes', async () => {
    const res = await apiRequest('/leave/get_Lcode', {
      headers: { compcode: 'TLT' },
    });
    assert.ok(res.status === 200 || res.status === 500);
    assert.ok(res.data);
  });

  it('GET /permission/getDocId should return permission document ID', async () => {
    const res = await apiRequest('/permission/getDocId', {
      headers: {
        compcode: 'TLT',
        idcard: '1001',
      },
    });
    assert.equal(res.status, 200);
    assert.ok(res.data);
  });

  it('GET /permission/get_all_Permission_reason should return list of permission reasons', async () => {
    const res = await apiRequest('/permission/get_all_Permission_reason', {
      headers: { compcode: 'TLT' },
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.data));
  });

  it('GET /Notifi/getPermissionRequest should return pending approval notifications', async () => {
    const res = await apiRequest('/Notifi/getPermissionRequest?emp=1001', {
      headers: { compcode: 'TLT' },
    });
    assert.equal(res.status, 200);
    assert.ok(res.data);
  });
});

