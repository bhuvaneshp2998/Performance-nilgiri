/**
 * Sample API Test - Single Request Performance Testing
 * 
 * This test demonstrates how to test a single API endpoint with various configurations.
 * Use cases: Simple API endpoints, health checks, single endpoint testing
 * 
 * Usage:
 *   node sample-api-test.js
 * 
 * Expected output:
 *   - HTML report: ./reports/html/sample-api-test.html
 *   - JSON metrics: ./reports/json/sample-api-test.json
 */

const { runPerformanceTest } = require('performancenilgiri');

// ============================================
// Test 1: Simple GET Request
// ============================================
async function testSimpleGetRequest() {
    console.log('\nTest 1: Simple GET Request...');
    console.log('─'.repeat(50));
    
    const result = await runPerformanceTest({
        scenarioName: 'Simple API GET Request',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Performance-Nilgiri-Test'
            }
        },
        options: { 
            vus: 5,              // 5 virtual users
            duration: '10s'      // 10 second test duration
        },
        detailedReportjson: "./reports/json/sample-api-test.json",
        htmlReport: "./reports/html/sample-api-test.html",
        checks: `'status is 200': (r) => r.status === 200,
                 'response time < 500ms': (r) => r.timings.duration < 500`,
        thinkTime: 0.5
    });

    console.log('✅ Test 1 completed successfully');
    return result;
}

// ============================================
// Test 2: POST Request with Body
// ============================================
async function testPostRequestWithBody() {
    console.log('\n📝 Test 2: POST Request with Body...');
    console.log('─'.repeat(50));
    
    const testPayload = {
        title: 'Performance Test Post',
        body: 'Testing POST request with JSON body',
        userId: 1
    };

    const result = await runPerformanceTest({
        scenarioName: 'POST Request with JSON Body',
        request: {
            method: 'POST',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: {
                'Content-Type': 'application/json'
            },
            body: testPayload
        },
        options: { 
            vus: 3,
            duration: '8s'
        },
        detailedReportjson: "./reports/json/sample-api-post-test.json",
        htmlReport: "./reports/html/sample-api-post-test.html",
        checks: `'status is 201': (r) => r.status === 201,
                 'has id field': (r) => r.json('id') !== undefined,
                 'response time < 1s': (r) => r.timings.duration < 1000`,
        thinkTime: 1
    });

    console.log('✅ Test 2 completed successfully');
    return result;
}

// ============================================
// Test 3: API with Query Parameters
// ============================================
async function testApiWithQueryParams() {
    console.log('\n📝 Test 3: API with Query Parameters...');
    console.log('─'.repeat(50));
    
    const result = await runPerformanceTest({
        scenarioName: 'API with Query Parameters',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts?userId=1&_limit=5',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        options: { 
            vus: 4,
            duration: '10s'
        },
        detailedReportjson: "./reports/json/sample-api-params-test.json",
        htmlReport: "./reports/html/sample-api-params-test.html",
        checks: `'status is 200': (r) => r.status === 200,
                 'response is array': (r) => Array.isArray(r.json()),
                 'array has items': (r) => r.json().length > 0`,
        thinkTime: 0.5,
        tags: {
            testType: 'query-params',
            api: 'jsonplaceholder'
        }
    });

    console.log('✅ Test 3 completed successfully');
    return result;
}

// ============================================
// Test 4: API with Authentication Header
// ============================================
async function testApiWithAuth() {
    console.log('\n📝 Test 4: API with Authentication...');
    console.log('─'.repeat(50));
    
    const result = await runPerformanceTest({
        scenarioName: 'API with Auth Header',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sample-token-12345'
            }
        },
        options: { 
            vus: 3,
            duration: '8s'
        },
        detailedReportjson: "./reports/json/sample-api-auth-test.json",
        htmlReport: "./reports/html/sample-api-auth-test.html",
        checks: `'status is 200': (r) => r.status === 200,
                 'has title': (r) => r.json('title') !== undefined`,
        thinkTime: 0.8,
        tags: {
            security: 'authenticated',
            testType: 'auth'
        }
    });

    console.log('✅ Test 4 completed successfully');
    return result;
}

// ============================================
// Main Test Suite
// ============================================
async function runAllApiTests() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   SAMPLE API TESTS - SINGLE ENDPOINT TESTING           ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\nStarting performance test suite...');
    console.log(`Started at: ${new Date().toLocaleString()}`);

    try {
        // Run tests sequentially
        await testSimpleGetRequest();
        await testPostRequestWithBody();
        await testApiWithQueryParams();
        await testApiWithAuth();

        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║   ✅ ALL API TESTS PASSED SUCCESSFULLY                 ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`Completed at: ${new Date().toLocaleString()}`);
        console.log('\n📊 Reports Generated:');
        console.log('   HTML: ./reports/html/sample-api-*.html');
        console.log('   JSON: ./reports/json/sample-api-*.json');
        
        return true;
    } catch (error) {
        console.error('\n❌ Test failed with error:');
        console.error(error.message);
        process.exit(1);
    }
}

// Run the test suite
runAllApiTests();
