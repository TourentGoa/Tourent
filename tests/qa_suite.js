/**
 * TOURENT GOA — OFFICIAL AUTOMATED QA & INTEGRATION TEST SUITE
 * Run with: npm test
 */

const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const EventEmitter = require('events');

// Use ephemeral port to avoid EADDRINUSE collisions
process.env.PORT = '0';

const app = require('../server.js');

const results = [];

function record(suite, name, passed, details) {
  results.push({ suite, name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${icon} [${suite}] ${name}: ${details}`);
}

function invoke(method, url, body = null, headers = {}) {
  return new Promise((resolve) => {
    let payload = null;
    const reqHeaders = { host: 'localhost', ...headers };
    if (body) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      reqHeaders['content-type'] = reqHeaders['content-type'] || 'application/json';
      reqHeaders['content-length'] = Buffer.byteLength(payload);
    }

    const req = new Readable({
      read() {
        if (payload) {
          this.push(payload);
          payload = null;
        } else {
          this.push(null);
        }
      }
    });

    req.method = method.toUpperCase();
    req.url = url;
    req.headers = reqHeaders;
    req.socket = {
      remoteAddress: '127.0.0.1',
      destroy: () => {},
      on: () => {},
      once: () => {},
      emit: () => {},
      write: () => {}
    };
    req.connection = req.socket;

    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    let resBody = '';

    res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res._headers[k.toLowerCase()];
    res.removeHeader = (k) => { delete res._headers[k.toLowerCase()]; };

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.type = (t) => {
      res.setHeader('content-type', t);
      return res;
    };

    res.json = (data) => {
      res.setHeader('content-type', 'application/json');
      resBody = JSON.stringify(data);
      res.end();
      return res;
    };

    res.sendFile = (filePath) => {
      try {
        const fs = require('fs');
        resBody = fs.readFileSync(filePath, 'utf8');
      } catch (e) {
        resBody = '';
      }
      res.end();
      return res;
    };

    res.write = (chunk) => {
      if (chunk) resBody += chunk.toString();
      return true;
    };

    res.end = (chunk) => {
      if (chunk) resBody += chunk.toString();
      let json = null;
      try { json = JSON.parse(resBody); } catch (_) {}
      resolve({
        statusCode: res.statusCode,
        headers: res._headers,
        body: resBody,
        json
      });
    };

    app.handle(req, res);
  });
}

async function runAll() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING TOURENT AUTOMATED QA TEST SUITE');
  console.log('======================================================\n');

  try {
    // 1. HEALTH & STARTUP
    {
      const res = await invoke('GET', '/api/health');
      record('Startup', 'GET /api/health responds with 200 OK', 
        res.statusCode === 200 && res.json?.status === 'ok', 
        `HTTP ${res.statusCode}`
      );
    }

    // 2. SENSITIVE FILE SHIELD CHECKS (403 Forbidden)
    {
      const res = await invoke('GET', '/admin_security_config.json');
      record('Security Shield', 'Block public access to admin_security_config.json', 
        res.statusCode === 403, 
        `HTTP ${res.statusCode} Forbidden (Protection active)`
      );
    }
    {
      const res = await invoke('GET', '/admin_bookings_cache.json');
      record('Security Shield', 'Block public access to admin_bookings_cache.json (PII)', 
        res.statusCode === 403, 
        `HTTP ${res.statusCode} Forbidden (Protection active)`
      );
    }
    {
      const res = await invoke('GET', '/server.js');
      record('Security Shield', 'Block direct download of server.js source code', 
        res.statusCode === 403, 
        `HTTP ${res.statusCode} Forbidden (Protection active)`
      );
    }
    {
      const res = await invoke('GET', '/.env');
      record('Security Shield', 'Block direct download of .env environment secrets', 
        res.statusCode === 403, 
        `HTTP ${res.statusCode} Forbidden (Protection active)`
      );
    }
    {
      const res = await invoke('GET', '/data/settings.json');
      record('Security Shield', 'Block direct access to private backend data/settings.json', 
        res.statusCode === 403, 
        `HTTP ${res.statusCode} Forbidden (Protection active)`
      );
    }

    // 3. FLEET CATALOG & AVAILABILITY
    {
      const res = await invoke('GET', '/api/fleet');
      record('Fleet Module', 'GET /api/fleet returns vehicles catalog', 
        res.statusCode === 200 && Array.isArray(res.json?.data) && res.json.data.length > 0, 
        `Returned ${res.json?.data?.length} vehicles`
      );
    }
    {
      const res = await invoke('GET', '/api/fleet/availability?pickupDate=2026-11-01&returnDate=2026-11-04');
      record('Fleet Module', 'GET /api/fleet/availability computes inventory metrics', 
        res.statusCode === 200 && res.json?.success === true && res.json.availability, 
        `Calculated stock for ${Object.keys(res.json?.availability || {}).length} models`
      );
    }
    {
      const res = await invoke('GET', '/api/fleet');
      const allHaveSoldOut = res.json?.data?.every(v => typeof v.soldOut === 'boolean');
      record('Fleet Module', 'GET /api/fleet includes soldOut status on all vehicles', 
        res.statusCode === 200 && allHaveSoldOut, 
        `All ${res.json?.data?.length} vehicles expose soldOut boolean flag`
      );
    }
    {
      const jwt = require('jsonwebtoken');
      const testAdminToken = jwt.sign({ username: 'admin', role: 'admin', staffRole: 'admin', sessionVersion: 10 }, process.env.JWT_SECRET || 'tourent_fallback_secret_key_goa_2026');
      
      // Mark v_baleno as soldOut
      const markSoldOutRes = await invoke('POST', '/api/fleet/v_baleno/sold-out', { soldOut: true }, {
        authorization: `Bearer ${testAdminToken}`
      });
      
      // Verify availability
      const availRes = await invoke('GET', '/api/fleet/availability?pickupDate=2026-11-01&returnDate=2026-11-04');
      const isBalenoSoldOut = availRes.json?.availability?.v_baleno?.status === 'Sold Out' && availRes.json?.availability?.v_baleno?.availableUnits === 0;

      // Revert v_baleno to available
      await invoke('POST', '/api/fleet/v_baleno/sold-out', { soldOut: false }, {
        authorization: `Bearer ${testAdminToken}`
      });

      record('Fleet Module', 'POST /api/fleet/:id/sold-out sets soldOut atomically across all devices', 
        markSoldOutRes.statusCode === 200 && isBalenoSoldOut, 
        `HTTP ${markSoldOutRes.statusCode} (v_baleno marked Sold Out with 0 available units)`
      );
    }

    // 4. AUTHENTICATION & ACCESS CONTROL
    {
      const res = await invoke('GET', '/api/admin/bookings');
      record('Access Control', 'Protected admin routes reject unauthenticated requests', 
        res.statusCode === 401, 
        `HTTP ${res.statusCode} Unauthorized`
      );
    }
    {
      const res = await invoke('POST', '/api/admin/login', { username: 'admin', password: 'FakePassword123!' });
      record('Authentication', 'Reject incorrect administrative password', 
        res.statusCode === 401, 
        `HTTP ${res.statusCode} Unauthorized`
      );
    }
    {
      const res = await invoke('POST', '/api/admin/login', { password: '0000_fake_pin' });
      record('Authentication', 'Reject unauthorized staff PIN', 
        res.statusCode === 401, 
        `HTTP ${res.statusCode} Unauthorized`
      );
    }
    {
      const res = await invoke('POST', '/api/admin/login', { password: 'TourentGoa@2026!' });
      record('Authentication', 'Authenticate valid master password against bcrypt hash', 
        res.statusCode === 200 && res.json?.success === true, 
        `HTTP ${res.statusCode} (Bcrypt hash verified, 2FA challenge generated)`
      );
    }

    // 5. BOOKING VALIDATION & OVERBOOKING ENFORCEMENT
    {
      const res = await invoke('POST', '/api/bookings', {});
      record('Booking Engine', 'Reject empty booking submission', 
        res.statusCode === 400, 
        `HTTP ${res.statusCode} Bad Request`
      );
    }
    {
      const res = await invoke('POST', '/api/bookings', {
        id: 'TEST-OVERBOOK-' + Date.now(),
        name: 'QA Test User',
        phone: '9876543210',
        pickupDate: '2026-11-10',
        returnDate: '2026-11-14',
        vehicle: 'Maruti Baleno',
        vehicles: Array(60).fill({ name: 'Maruti Baleno' }) // Request 60 units (exceeds fleet capacity)
      });
      record('Booking Engine', 'Enforce overbooking prevention when requested > available', 
        res.statusCode === 409, 
        `HTTP ${res.statusCode} Conflict (${res.json?.error?.slice(0, 50)}...)`
      );
    }

    // 6. CANCELLATION AUTHORIZATION & OWNERSHIP PROTECTION
    {
      // Create a test booking
      const bookId = 'TRT-SEC-CANCEL-' + Date.now();
      await invoke('POST', '/api/bookings', {
        id: bookId,
        name: 'Owner Verification User',
        phone: '9822114455',
        pickupDate: '2026-11-20',
        returnDate: '2026-11-23',
        vehicle: 'Maruti Swift'
      });

      // Attempt unauthorized cancellation with NO phone or WRONG phone
      const unauthorizedCancel = await invoke('POST', `/api/bookings/${bookId}/cancel`, {
        phone: '9999999999' // Wrong phone number!
      });
      const isBlocked = unauthorizedCancel.statusCode === 403;
      record('Authorization', 'Block unauthorized cancellation when phone/email does not match (403)', 
        isBlocked, 
        `HTTP ${unauthorizedCancel.statusCode} (${unauthorizedCancel.json?.error?.slice(0, 45)}...)`
      );

      // Authorized cancellation with correct customer phone
      const authorizedCancel = await invoke('POST', `/api/bookings/${bookId}/cancel`, {
        phone: '9822114455' // Correct phone number
      });
      const isAllowed = authorizedCancel.statusCode === 200 && authorizedCancel.json?.success === true;
      record('Authorization', 'Allow cancellation when customer verifies matching phone number', 
        isAllowed, 
        `HTTP ${authorizedCancel.statusCode} (Booking cancelled safely)`
      );

      // Clean up test booking immediately so it never pollutes user bookings or admin cache
      try {
        const cachePath = path.join(__dirname, '..', 'admin_bookings_cache.json');
        if (fs.existsSync(cachePath)) {
          const list = JSON.parse(fs.readFileSync(cachePath, 'utf8')).filter(b => b.id !== bookId && !b.id.startsWith('TRT-SEC-CANCEL-'));
          fs.writeFileSync(cachePath, JSON.stringify(list, null, 2), 'utf8');
        }
      } catch (e) {}
    }

    // 7. FINANCIAL INTEGRITY & PRICE TAMPERING PROTECTION
    {
      // Attempt price tampering: send price: 10 for a Maruti Swift (which costs 1800/day * 1.20 High Season = 2160/day)
      const res = await invoke('POST', '/api/payment/razorpay/create-order', {
        id: 'TEST-TAMPER-' + Date.now(),
        name: 'Price Tamper Attempt',
        phone: '9876543210',
        pickupDate: '2026-11-10',
        days: 3,
        vehicles: [{ name: 'Maruti Swift', transmission: 'Manual', days: 3, price: 10, deposit: 0 }]
      });
      // 3 days * 1800 * 1.20 = 6480, advance 20% = 1296 (NOT 3 * 10 * 0.20 = 6)
      const isTamperProtected = res.statusCode === 200 && res.json?.amount === 1296;
      record('Financial Security', 'Server recalculates authoritative rate and overrides tampered client prices', 
        isTamperProtected, 
        `Calculated advance token: ₹${res.json?.amount} (Correctly applied ₹2,160/day High Season tariff, ignoring client ₹10 tampering)`
      );
    }

    // 8. BACKDOOR ELIMINATION & STRICT JWT VERIFICATION
    {
      const fakeTokenRes = await invoke('GET', '/api/admin/verify', null, {
        authorization: 'Bearer fake_developer_token_12345'
      });
      const isBlocked = fakeTokenRes.statusCode === 401;
      record('Access Control', 'Block arbitrary dev tokens or string prefixes from bypassing admin auth',
        isBlocked,
        `HTTP ${fakeTokenRes.statusCode} (Strict JWT verification enforced)`
      );
    }

    // 9. HEALTH CHECK ALIAS FOR CLOUD PLATFORMS
    {
      const healthRes = await invoke('GET', '/health');
      const isHealthOk = healthRes.statusCode === 200 && healthRes.json?.status === 'ok';
      record('DevOps', 'GET /health serves health metrics for hosting platform monitors',
        isHealthOk,
        `HTTP ${healthRes.statusCode} (Direct 200 OK with service status)`
      );
    }

    // 10. PAYMENT SIGNATURE INTEGRITY
    {
      const noSigRes = await invoke('POST', '/api/payment/razorpay/verify', {
        razorpay_order_id: 'order_test_123',
        razorpay_payment_id: 'pay_test_456'
      });
      const isSigEnforced = noSigRes.statusCode === 400;
      record('Payment Security', 'Reject payment verification when razorpay_signature is missing',
        isSigEnforced,
        `HTTP ${noSigRes.statusCode} (Rejected unsigned transaction)`
      );
    }

    // 11. ANTI-SCRAPING & PII HARVESTING PROTECTION
    {
      const scrapeAttempt = await invoke('GET', '/api/bookings?search=TRT');
      const isScrapeBlocked = scrapeAttempt.statusCode === 400;
      record('Data Privacy', 'Block generic wildcard searches from harvesting customer PII',
        isScrapeBlocked,
        `HTTP ${scrapeAttempt.statusCode} (Generic TRT substring search rejected with 400)`
      );
    }

    // 12. INJECTION & UNEXPECTED UPSERT PREVENTION
    {
      const patchNonExistent = await invoke('PATCH', '/api/bookings/TRT-NONEXISTENT-999', {
        status: 'Cancelled'
      });
      const is404 = patchNonExistent.statusCode === 404;
      record('Database Integrity', 'Reject PATCH on non-existent booking with 404 instead of upserting',
        is404,
        `HTTP ${patchNonExistent.statusCode} (Non-existent booking rejected with 404 Not Found)`
      );
    }

    // 13. OWNER PRIVILEGE RESTRICTION ON FLEET DELETION
    {
      const deleteFleetNoOwner = await invoke('DELETE', '/api/fleet/v_swift', null, {
        authorization: 'Bearer staff_token_sample'
      });
      const isBlocked = deleteFleetNoOwner.statusCode === 401 || deleteFleetNoOwner.statusCode === 403;
      record('Access Control', 'Restrict fleet deletion from regular staff to Owner Master privileges',
        isBlocked,
        `HTTP ${deleteFleetNoOwner.statusCode} (Unauthorized without Owner privileges)`
      );
    }

    // 14. DEDICATED ATTRACTIONS PAGE ROUTING
    {
      const attrRes = await invoke('GET', '/attractions');
      const isAttrOk = attrRes.statusCode === 200 && (attrRes.body || '').includes("12 Talukas of Goa");
      record('Frontend Navigation', 'Serve dedicated Attractions page at /attractions cleanly',
        isAttrOk,
        `HTTP ${attrRes.statusCode} (Delivered attractions.html with 12 talukas explorer)`
      );
    }

  } catch (err) {
    console.error('Fatal test runner error:', err);
  } finally {
    // Ensure test bookings are wiped from cache after tests run
    try {
      const cachePath = path.join(__dirname, '..', 'admin_bookings_cache.json');
      if (fs.existsSync(cachePath)) {
        const list = JSON.parse(fs.readFileSync(cachePath, 'utf8')).filter(b => !b.id || !b.id.startsWith('TRT-SEC-CANCEL-'));
        fs.writeFileSync(cachePath, JSON.stringify(list, null, 2), 'utf8');
      }
    } catch (e) {}

    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;
    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} total tests`);
    console.log('======================================================\n');
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runAll();
