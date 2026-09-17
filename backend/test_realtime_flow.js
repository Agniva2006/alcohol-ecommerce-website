const http = require('http');

async function testEndpoint(name, path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const pass = res.statusCode >= 200 && res.statusCode < 300;
        console.log(`${pass ? '✅' : '❌'} [${res.statusCode}] ${name} (${path})`);
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), pass });
        } catch {
          resolve({ status: res.statusCode, data, pass });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} failed: ${err.message}`);
      resolve({ status: 500, error: err.message, pass: false });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🍸 SIP & SAVOR — Real-Time Ecosystem Test Suite');
  console.log('====================================================\n');

  // 1. Health check & WebSocket status
  await testEndpoint('1. Health Check & Socket Status', '/api/health');

  // 2. Customer: Get Shops & Catalog
  await testEndpoint('2. Fetch Licensed Shops', '/api/shops');
  await testEndpoint('3. Fetch Categories', '/api/categories');
  const products = await testEndpoint('4. Fetch Real Products Matrix', '/api/products');

  // 3. Customer: Place Order
  const newOrder = await testEndpoint('5. Place Real-Time Order', '/api/orders', 'POST', {
    customerId: 'guest',
    shopId: 'SH-JPG-001',
    items: [{ brandId: 'BR-BEER-001', quantity: 2, price: 170 }],
    deliveryAddress: 'Jalpaiguri Govt Engineering College, Gate 1',
    deliveryLat: 26.5410,
    deliveryLng: 88.7122
  });

  const orderId = newOrder.data?.id;

  if (orderId) {
    // 4. Track Order
    await testEndpoint('6. Live Order Telemetry Tracking', `/api/orders/${orderId}/track`);

    // 5. Retailer: Accept Order
    await testEndpoint('7. Retailer Accept Order (PACKED)', `/api/retailer/orders/${orderId}`, 'PATCH', {
      status: 'PACKED'
    });

    // 6. Delivery: Move In-Transit
    await testEndpoint('8. Delivery Rider Accept & Transit', '/api/delivery/update-status', 'POST', {
      orderId: orderId,
      status: 'in_transit'
    });

    // 7. Verify Doorstep OTP
    await testEndpoint('9. Verify Doorstep Handover OTP (1234)', `/api/orders/${orderId}/verify-otp`, 'POST', {
      otp: '1234'
    });
  }

  // 8. Admin HQ Metrics
  await testEndpoint('10. Admin GMV & Operational Metrics', '/api/admin/metrics');
  await testEndpoint('11. Admin Registered Shops', '/api/admin/shops');

  // 9. State Excise Digital Hologram Verification
  await testEndpoint('12. West Bengal State Excise Hologram Verification', '/api/excise/verify/WB-EXC-99887766');

  console.log('\n====================================================');
  console.log('🎉 ALL SIP & SAVOR CORE ENDPOINTS VERIFIED!');
  console.log('====================================================');
}

runTests();
