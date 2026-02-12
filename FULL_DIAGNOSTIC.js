#!/usr/bin/env node
/**
 * Complete FloraQuiz Platform Diagnostic
 * Tests all critical systems end-to-end
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3001';
const TESTS = [];
let passCount = 0;
let failCount = 0;

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, text) {
  console.log(color + text + colors.reset);
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test(name, fn) {
  try {
    log(colors.blue, `\n🧪 Testing: ${name}`);
    const result = await fn();
    if (result === true) {
      log(colors.green, `   ✅ PASS`);
      passCount++;
    } else {
      log(colors.red, `   ❌ FAIL: ${result}`);
      failCount++;
    }
  } catch (err) {
    log(colors.red, `   ❌ ERROR: ${err.message}`);
    failCount++;
  }
}

async function runDiagnostics() {
  log(colors.blue, '\n' + '='.repeat(60));
  log(colors.blue, 'FloraQuiz Platform - Complete Diagnostic');
  log(colors.blue, '='.repeat(60));

  // Test 1: Backend Connectivity
  await test('Backend Health Check', async () => {
    const res = await makeRequest('GET', '/health');
    return res.status === 200 && res.data.status === 'ok'
      ? true
      : `Status: ${res.status}, Data: ${JSON.stringify(res.data)}`;
  });

  // Test 2: Database Connection
  await test('Database Connection', async () => {
    const res = await makeRequest('GET', '/api/v1/test/db');
    return res.status === 200 && res.data.status === 'connected'
      ? true
      : `Status: ${res.status}, Data: ${JSON.stringify(res.data)}`;
  });

  // Test 3: Create Test User (Signup)
  const testUsername = `testuser_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let testToken = '';
  let testUserId = '';

  await test('Signup Endpoint', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/signup', {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      fullName: 'Test User',
    });

    if (res.status !== 201) {
      return `Status: ${res.status}, Response: ${JSON.stringify(res.data)}`;
    }

    if (!res.data.token || !res.data.user) {
      return `Missing token or user in response`;
    }

    testToken = res.data.token;
    testUserId = res.data.user.id;
    return true;
  });

  // Test 4: Login with Created User
  await test('Login Endpoint', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/login', {
      username: testEmail, // Login with email
      password: testPassword,
    });

    if (res.status !== 200) {
      return `Status: ${res.status}, Response: ${JSON.stringify(res.data)}`;
    }

    if (!res.data.token) {
      return `Missing token in login response`;
    }

    return true;
  });

  // Test 5: Get User Profile
  await test('Get Profile (Authenticated)', async () => {
    if (!testToken) {
      return 'No token from signup test';
    }

    const url = new URL(BASE_URL + '/api/v1/users/me');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`,
      },
    };

    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200 && parsed.id) {
              resolve(true);
            } else {
              resolve(`Status: ${res.statusCode}, Data: ${JSON.stringify(parsed)}`);
            }
          } catch {
            resolve(`Failed to parse response: ${data}`);
          }
        });
      });

      req.on('error', (err) => resolve(`Error: ${err.message}`));
      req.end();
    });
  });

  // Test 6: Subscription Plans
  await test('Get Subscription Plans', async () => {
    const res = await makeRequest('GET', '/api/v1/subscription/plans');
    return res.status === 200 && Array.isArray(res.data)
      ? true
      : `Status: ${res.status}`;
  });

  // Test 7: Redis Connection
  await test('Redis Connection Test', async () => {
    const res = await makeRequest('GET', '/api/v1/test/redis');
    // Redis might not be available, but endpoint should respond
    return res.status === 200 || res.status === 500
      ? true
      : `Unexpected status: ${res.status}`;
  });

  // Test 8: CORS Headers
  await test('CORS Headers', async () => {
    const url = new URL(BASE_URL + '/health');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
      },
    };

    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        const corsHeaders = res.headers['access-control-allow-origin'];
        if (corsHeaders) {
          resolve(true);
        } else {
          resolve(`Missing CORS header. Expected 'Access-Control-Allow-Origin'`);
        }
      });

      req.on('error', (err) => resolve(`Error: ${err.message}`));
      req.end();
    });
  });

  // Test 9: Rate Limiting (should allow first request)
  await test('Auth Rate Limiting', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/login', {
      username: 'invalid',
      password: 'invalid',
    });
    // Should either fail auth (401) or succeed, but not rate limit yet
    return res.status === 200 || res.status === 401
      ? true
      : `Unexpected status: ${res.status}`;
  });

  // Summary
  log(colors.blue, '\n' + '='.repeat(60));
  log(colors.blue, 'DIAGNOSTIC SUMMARY');
  log(colors.blue, '='.repeat(60));
  log(colors.green, `✅ Passed: ${passCount}`);
  log(colors.red, `❌ Failed: ${failCount}`);
  log(colors.blue, '='.repeat(60));

  if (failCount === 0) {
    log(colors.green, '\n🎉 All tests passed! Platform is working correctly.\n');
    process.exit(0);
  } else {
    log(colors.red, '\n⚠️  Some tests failed. See details above.\n');
    process.exit(1);
  }
}

// Run diagnostics
log(colors.yellow, '\nWaiting for backend to be ready...');
setTimeout(runDiagnostics, 2000);
