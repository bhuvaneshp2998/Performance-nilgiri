const { runPerformanceTest } = require('performancenilgiri');
const basePayload = require('../resource/samplepayload.json');

async function testApiEndpoint() {
    const result = await runPerformanceTest({
        scenarioName: 'API Endpoint Test',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        options: { 
            vus: 2, 
            duration: '5s'
        },
        detailedReportjson: "./reports/json/test_metrics.json",  
        htmlReport: "./reports/html/test_report.html",
        checks: `'status is 200': (r) => r.status === 200`,
        thinkTime: 1
    });
    return result;
}

async function testWithGroups() {
    const result = await runPerformanceTest({
        scenarioName: 'Multi-Step Workflow Test',
        groups: {
            authentication: {
                method: 'POST',
                url: 'https://jsonplaceholder.typicode.com/posts',
                body: basePayload,
                name: 'Login',
                checks: `'status is 201': (r) => r.status === 201`
            },
            dataFetch: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/1',
                name: 'Get Post',
                checks: `'status is 200': (r) => r.status === 200`
            }
        },
        options: { 
            vus: 2, 
            duration: '5s'
        },
        detailedReportjson: "./reports/json/groups_metrics.json",  
        htmlReport: "./reports/html/groups_report.html",
        thinkTime: 0.5,
        tags: {
            environment: 'test',
            testType: 'workflow'
        }
    });
    return result;
}

async function testMultipleRequestsInGroup() {
    const result = await runPerformanceTest({
        scenarioName: 'E-commerce Flow Test',
        groups: {
            browseFlow: [
                {
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/posts',
                    name: 'Browse Products',
                    checks: `'status is 200': (r) => r.status === 200`
                },
                {
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/posts/1',
                    name: 'View Product Details',
                    thinkTime: 1,
                    checks: `'status is 200': (r) => r.status === 200`
                }
            ]
        },
        options: { 
            vus: 2, 
            duration: '5s'
        },
        detailedReportjson: "./reports/json/ecommerce_metrics.json",  
        htmlReport: "./reports/html/ecommerce_report.html",
        thinkTime: 0.5,
        tags: {
            business: 'ecommerce',
            region: 'us-east'
        }
    });
    return result;
}

async function runAllTests() {
    console.log('Starting performance test suite...');

    try {
        console.log('\nTest 1: Simple API endpoint...');
        await testApiEndpoint();
        console.log('Completed');

        console.log('\nTest 2: Workflow with groups...');
        await testWithGroups();
        console.log('Completed');

        console.log('\nTest 3: Multiple requests in groups...');
        await testMultipleRequestsInGroup();
        console.log('Completed');
        
        console.log('\nAll tests completed successfully');
    } catch (error) {
        console.error('\nTest failed:', error.message);
        if (error.message.includes('syntax')) {
            console.log('\nTry running with DEBUG_K6=1 for more details:');
            console.log('DEBUG_K6=1 node test.js');
        }
    }
}


runAllTests();