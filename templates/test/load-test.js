/**
 * Load Test - High Volume Performance Testing
 * 
 * This test demonstrates how to simulate real-world load scenarios with multiple 
 * virtual users and extended duration to test system behavior under stress.
 * Use cases: Load testing, stress testing, endurance testing
 * 
 * Usage:
 *   node load-test.js
 * 
 * Expected output:
 *   - HTML report: ./reports/html/load-test.html
 *   - JSON metrics: ./reports/json/load-test.json
 */

const { runPerformanceTest } = require('performancenilgiri');

// ============================================
// Test 1: Baseline Load Test (Small)
// ============================================
async function testSmallLoad() {
    console.log('\nTest 1: Small Load Test (Baseline)...');
    console.log('─'.repeat(50));
    console.log('   VUs: 10 | Duration: 15s | Expected Requests: ~150-200');
    
    const result = await runPerformanceTest({
        scenarioName: 'Small Load - Baseline Test',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        options: { 
            vus: 10,             // 10 virtual users
            duration: '15s'      // 15 second test duration
        },
        detailedReportjson: "./reports/json/load-test-small.json",
        htmlReport: "./reports/html/load-test-small.html",
        checks: `'status is 200': (r) => r.status === 200,
                 'response time < 1s': (r) => r.timings.duration < 1000`,
        thinkTime: 0.5,
        tags: {
            loadLevel: 'small',
            purpose: 'baseline'
        }
    });

    console.log('Test 1 completed successfully');
    return result;
}

// ============================================
// Test 2: Medium Load Test
// ============================================
async function testMediumLoad() {
    console.log('\nTest 2: Medium Load Test...');
    console.log('─'.repeat(50));
    console.log('   VUs: 25 | Duration: 20s | Expected Requests: ~500-750');
    
    const result = await runPerformanceTest({
        scenarioName: 'Medium Load - Standard Test',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        options: { 
            vus: 25,             // 25 virtual users
            duration: '20s'      // 20 second test
        },
        detailedReportjson: "./reports/json/load-test-medium.json",
        htmlReport: "./reports/html/load-test-medium.html",
        checks: `'status is 200': (r) => r.status === 200,
                 'response time < 2s': (r) => r.timings.duration < 2000,
                 'response time p95 < 1.5s': (r) => r.timings.duration < 1500`,
        thinkTime: 0.3,
        tags: {
            loadLevel: 'medium',
            purpose: 'standard'
        }
    });

    console.log('Test 2 completed successfully');
    return result;
}

// ============================================
// Test 3: Heavy Load Test with Workflow
// ============================================
async function testHeavyLoadWorkflow() {
    console.log('\nTest 3: Heavy Load with Multi-Step Workflow...');
    console.log('─'.repeat(50));
    console.log('   VUs: 20 | Duration: 25s | Complex workflow');
    
    const result = await runPerformanceTest({
        scenarioName: 'Heavy Load - Complex Workflow',
        groups: {
            step1: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts?_limit=20',
                name: 'List Posts',
                checks: `'status is 200': (r) => r.status === 200`
            },
            step2: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/1',
                name: 'Get Post 1',
                thinkTime: 0.5,
                checks: `'status is 200': (r) => r.status === 200`
            },
            step3: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/1/comments',
                name: 'Get Comments',
                thinkTime: 0.5,
                checks: `'status is 200': (r) => r.status === 200`
            }
        },
        options: { 
            vus: 20,             // 20 concurrent users
            duration: '25s'      // 25 second test
        },
        detailedReportjson: "./reports/json/load-test-heavy.json",
        htmlReport: "./reports/html/load-test-heavy.html",
        thinkTime: 0.3,
        tags: {
            loadLevel: 'heavy',
            purpose: 'complex-workflow'
        }
    });

    console.log('Test 3 completed successfully');
    return result;
}

// ============================================
// Test 4: Spike Test (Sudden Load Increase)
// ============================================
async function testSpikeLoad() {
    console.log('\nTest 4: Spike Test (Sudden Load)...');
    console.log('─'.repeat(50));
    console.log('   VUs: 40 | Duration: 20s | Expected Requests: ~800-1200');
    console.log('   Simulates sudden traffic spike');
    
    const result = await runPerformanceTest({
        scenarioName: 'Spike Load - Sudden Traffic',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: {
                'Content-Type': 'application/json',
                'X-Load-Test': 'spike'
            }
        },
        options: { 
            vus: 40,             // 40 concurrent users (spike)
            duration: '20s'      // 20 second spike test
        },
        detailedReportjson: "./reports/json/load-test-spike.json",
        htmlReport: "./reports/html/load-test-spike.html",
        checks: `'status is 200': (r) => r.status === 200,
                 'response time acceptable': (r) => r.timings.duration < 3000`,
        thinkTime: 0.2,
        tags: {
            loadLevel: 'spike',
            purpose: 'traffic-spike',
            severity: 'high'
        }
    });

    console.log('Test 4 completed successfully');
    return result;
}

// ============================================
// Test 5: Endurance Test (Long Duration)
// ============================================
async function testEnduranceLoad() {
    console.log('\nTest 5: Endurance Test (Long Duration)...');
    console.log('─'.repeat(50));
    console.log('   VUs: 15 | Duration: 30s | Tests system stability');
    
    const result = await runPerformanceTest({
        scenarioName: 'Endurance Test - Long Running',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        options: { 
            vus: 15,             // 15 sustained users
            duration: '30s'      // 30 second endurance test
        },
        detailedReportjson: "./reports/json/load-test-endurance.json",
        htmlReport: "./reports/html/load-test-endurance.html",
        checks: `'status is 200': (r) => r.status === 200,
                 'response time stable': (r) => r.timings.duration < 2000,
                 'no errors': (r) => r.status < 400`,
        thinkTime: 0.5,
        tags: {
            loadLevel: 'endurance',
            purpose: 'stability-test',
            duration: 'long'
        }
    });

    console.log('Test 5 completed successfully');
    return result;
}

// ============================================
// Metrics Analyzer
// ============================================
function printLoadTestGuidance() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   LOAD TEST PERFORMANCE GUIDANCE                       ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    
    console.log('\nKey Metrics to Monitor:');
    console.log('   • Response Time (p50, p95, p99)');
    console.log('   • Throughput (requests per second)');
    console.log('   • Error Rate (% of failed requests)');
    console.log('   • Virtual Users (concurrent users)');
    console.log('   • Memory & CPU Usage');
    
    console.log('\nPerformance Thresholds:');
    console.log('   Good:    Response time < 500ms');
    console.log('   Decent:  Response time < 1s');
    console.log('   Poor:    Response time > 2s');
    console.log('   Error:   Error rate > 1%');
    
    console.log('\nTest Progression:');
    console.log('   1. Run Small Load (baseline)');
    console.log('   2. Increase to Medium Load');
    console.log('   3. Test Heavy Load');
    console.log('   4. Simulate Spike Traffic');
    console.log('   5. Run Endurance Test');
}

// ============================================
// Main Test Suite
// ============================================
async function runAllLoadTests() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   LOAD TESTS - PERFORMANCE & STRESS TESTING            ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\nStarting comprehensive load test suite...');
    console.log(`Started at: ${new Date().toLocaleString()}`);

    try {
        // Show guidance
        printLoadTestGuidance();
        
        console.log('\n\nRunning tests sequentially...\n');

        // Run tests sequentially
        await testSmallLoad();
        await testMediumLoad();
        await testHeavyLoadWorkflow();
        await testSpikeLoad();
        await testEnduranceLoad();

        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║   ALL LOAD TESTS COMPLETED SUCCESSFULLY                ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`Completed at: ${new Date().toLocaleString()}`);
        console.log('\nReports Generated:');
        console.log('   HTML: ./reports/html/load-test-*.html');
        console.log('   JSON: ./reports/json/load-test-*.json');
        
        console.log('\nNext Steps:');
        console.log('   1. Open HTML reports in browser for visualization');
        console.log('   2. Check JSON reports for detailed metrics');
        console.log('   3. Compare results across different load levels');
        console.log('   4. Identify performance bottlenecks');
        console.log('   5. Optimize and re-run tests');
        
        return true;
    } catch (error) {
        console.error('\nTest failed with error:');
        console.error(error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test suite
runAllLoadTests();
