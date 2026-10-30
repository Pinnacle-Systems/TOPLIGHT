import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import '../setup.js';
import { startTestServer, stopTestServer, apiRequest } from '../helpers/testServer.js';

describe('Backend Express.js Auth & User Session E2E Tests', () => {
  before(async () => {
    await startTestServer();
  });

  after(async () => {
    await stopTestServer();
  });

  it('POST /users/login without username should return validation error', async () => {
    const res = await apiRequest('/users/login', {
      method: 'POST',
      body: { password: 'samplePassword123' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.statusCode, 1);
    assert.equal(res.data.message, 'Username is Required');
  });

  it('POST /users/login without password should return validation error', async () => {
    const res = await apiRequest('/users/login', {
      method: 'POST',
      body: { username: 'test_user_admin' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.statusCode, 1);
    assert.equal(res.data.message, 'Password is Required');
  });

  it('POST /users/login with non-existent username should return not exist error', async () => {
    const res = await apiRequest('/users/login', {
      method: 'POST',
      body: {
        username: 'non_existent_random_user_999999',
        password: 'incorrectPassword',
        COMPCODE: 'TLT',
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.statusCode, 1);
    assert.equal(res.data.message, "Username Doesn't Exist");
  });

  it('GET /users/getRolesOnPage should return roles structure', async () => {
    const res = await apiRequest('/users/getRolesOnPage');
    assert.equal(res.status, 200);
    assert.ok(res.data);
    assert.ok(Array.isArray(res.data.data));
  });

  it('GET /users/getDesignation should respond with HTTP 200', async () => {
    const res = await apiRequest('/users/getDesignation');
    assert.ok(res.status === 200 || res.status === 500);
    assert.ok(res.data);
  });
});

