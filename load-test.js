/**
 * PCE Chaos Engineering Load & Concurrency Tester
 * Tests hypotheses for Experiment 1 (Latency & Race Conditions)
 */

const BASE_URL = process.argv[2] || process.env.TARGET_URL || 'http://localhost:5001';

async function runTest() {
  console.log('='.repeat(60));
  console.log('🔬 PCE Chaos Test: Experiment 1 (Concurrency & Latency)');
  console.log(`Target: ${BASE_URL}`);
  console.log('='.repeat(60));

  // 1. Single Request Latency Measurement
  console.log('\n[1/3] Measuring Single Request Response Time...');
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/items`);
    const data = await res.json();
    const duration = Date.now() - t0;
    console.log(`✅ Single GET /api/items completed in ${duration}ms (status: ${res.status})`);
    if (duration > 2000) {
      console.log('⚡ Chaos Latency Detected (> 2000ms)! Simulated delay is ACTIVE.');
    } else {
      console.log('⚡ Fast baseline latency (< 500ms). Normal mode.');
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }

  // 2. Race Condition / Rapid Clicks Test (Simulating User spam-clicking "Add Item")
  console.log('\n[2/3] Simulating 5 Rapid Concurrent Submissions ("Spam Click" Test)...');
  const itemName = `Chaos Bread ${Date.now().toString().slice(-4)}`;
  const itemPayload = { name: itemName, price: 45, quantity: 1 };

  const startBatch = Date.now();
  const promises = [1, 2, 3, 4, 5].map((clickNum) =>
    fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemPayload)
    })
      .then(async (r) => ({
        clickNum,
        status: r.status,
        data: await r.json(),
        time: Date.now() - startBatch
      }))
      .catch((err) => ({ clickNum, error: err.message }))
  );

  const results = await Promise.all(promises);
  const totalBatchTime = Date.now() - startBatch;

  const successfulCreates = results.filter((r) => r.status === 201 || (r.data && r.data.success));
  console.log(`⏱️  Batch completed in ${totalBatchTime}ms.`);
  console.log(`📊 Results: ${successfulCreates.length} items created out of 5 concurrent clicks.`);

  if (successfulCreates.length > 1) {
    console.log('⚠️  DELTA DETECTED: Race condition permitted multiple duplicate writes for the same submission!');
    console.log('👉 Hardening Required: Frontend button disable + in-flight debounce.');
  } else {
    console.log('🛡️  HARDENED: Concurrency prevented duplicate submissions.');
  }

  // 3. Concurrent Load Test (20 parallel reads under delay)
  console.log('\n[3/3] Testing Server Throughput under Delay (20 concurrent reads)...');
  const loadStart = Date.now();
  const loadReqs = Array.from({ length: 20 }, (_, i) =>
    fetch(`${BASE_URL}/api/items`).then((r) => r.status)
  );

  const loadStatuses = await Promise.all(loadReqs);
  const loadTime = Date.now() - loadStart;
  const okCount = loadStatuses.filter((s) => s === 200).length;

  console.log(`📈 20 concurrent requests completed in ${loadTime}ms.`);
  console.log(`✅ Success Rate: ${(okCount / 20) * 100}% (${okCount}/20 ok)`);

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test Run Finished');
  console.log('='.repeat(60));
}

runTest();
