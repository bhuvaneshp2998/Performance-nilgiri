/**
 * Sample Group Test - Multi-Step Workflow Performance Testing
 * 
 * This test demonstrates how to test multi-step workflows and group requests.
 * Use cases: User workflows, multi-step processes, transaction flows
 * 
 * Usage:
 *   node sample-group-test.js
 * 
 * Expected output:
 *   - HTML report: ./reports/html/sample-group-test.html
 *   - JSON metrics: ./reports/json/sample-group-test.json
 */

const { runPerformanceTest } = require('performancenilgiri');

// ============================================
// Test 1: Simple Multi-Step Workflow
// ============================================
async function testSimpleWorkflow() {
    console.log('\nTest 1: Simple Multi-Step Workflow...');
    console.log('─'.repeat(50));
    
    const result = await runPerformanceTest({
        scenarioName: 'Simple User Workflow',
        groups: {
            // Step 1: Get list of posts
            listPosts: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts?_limit=10',
                name: 'Get Posts List',
                checks: `'status is 200': (r) => r.status === 200,
                         'has posts': (r) => r.json().length > 0`
            },
            // Step 2: Get a specific post
            getPost: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/1',
                name: 'Get Post Details',
                thinkTime: 1,
                checks: `'status is 200': (r) => r.status === 200,
                         'has id': (r) => r.json('id') === 1`
            },
            // Step 3: Get comments for the post
            getComments: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/1/comments',
                name: 'Get Post Comments',
                thinkTime: 0.5,
                checks: `'status is 200': (r) => r.status === 200,
                         'comments exist': (r) => r.json().length > 0`
            }
        },
        options: { 
            vus: 5,              // 5 concurrent users
            duration: '15s'      // 15 second test
        },
        detailedReportjson: "./reports/json/sample-group-test.json",
        htmlReport: "./reports/html/sample-group-test.html",
        thinkTime: 0.5,
        tags: {
            workflow: 'simple',
            testType: 'sequential'
        }
    });

    console.log('Test 1 completed successfully');
    return result;
}

// ============================================
// Test 2: Complex Multi-Step with Data Creation
// ============================================
async function testComplexWorkflow() {
    console.log('\nTest 2: Complex Workflow (Create & Read)...');
    console.log('─'.repeat(50));
    
    const newPost = {
        title: 'Performance Test Post',
        body: 'This is a performance test to measure workflow speed',
        userId: 1
    };

    const result = await runPerformanceTest({
        scenarioName: 'E-Commerce Order Flow',
        groups: {
            // Step 1: Browse products
            browse: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts?_limit=5',
                name: 'Browse Products',
                checks: `'status is 200': (r) => r.status === 200`
            },
            // Step 2: View product detail
            viewDetail: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/1',
                name: 'View Product Details',
                thinkTime: 1.5,
                checks: `'status is 200': (r) => r.status === 200`
            },
            // Step 3: Add to cart (simulated with POST)
            addToCart: {
                method: 'POST',
                url: 'https://jsonplaceholder.typicode.com/posts',
                name: 'Add to Cart',
                body: newPost,
                thinkTime: 1,
                checks: `'status is 201': (r) => r.status === 201`
            },
            // Step 4: Checkout (another POST)
            checkout: {
                method: 'POST',
                url: 'https://jsonplaceholder.typicode.com/posts',
                name: 'Checkout',
                body: { ...newPost, action: 'checkout' },
                thinkTime: 2,
                checks: `'status is 201': (r) => r.status === 201`
            },
            // Step 5: View order confirmation
            confirmation: {
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/101',
                name: 'View Order Confirmation',
                checks: `'status is 200': (r) => r.status === 200`
            }
        },
        options: { 
            vus: 4,
            duration: '20s'
        },
        detailedReportjson: "./reports/json/sample-group-complex-test.json",
        htmlReport: "./reports/html/sample-group-complex-test.html",
        thinkTime: 1,
        tags: {
            workflow: 'ecommerce',
            testType: 'full-journey'
        }
    });

    console.log('Test 2 completed successfully');
    return result;
}

// ============================================
// Test 3: Multiple Actions in Single Group
// ============================================
async function testGroupWithMultipleActions() {
    console.log('\nTest 3: Group with Multiple Sequential Actions...');
    console.log('─'.repeat(50));
    
    const result = await runPerformanceTest({
        scenarioName: 'Social Media Interaction Flow',
        groups: {
            // A sequence of actions in the social media group
            socialFlow: [
                {
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/posts',
                    name: 'Load Feed',
                    checks: `'status is 200': (r) => r.status === 200`
                },
                {
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/posts/5',
                    name: 'View Post 1',
                    thinkTime: 1.5,
                    checks: `'status is 200': (r) => r.status === 200`
                },
                {
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/posts/5/comments',
                    name: 'Load Comments',
                    thinkTime: 0.5,
                    checks: `'status is 200': (r) => r.status === 200`
                },
                {
                    method: 'POST',
                    url: 'https://jsonplaceholder.typicode.com/posts/5/comments',
                    name: 'Post Comment',
                    body: {
                        postId: 5,
                        name: 'Test User',
                        email: 'test@example.com',
                        body: 'Great performance test!'
                    },
                    thinkTime: 1,
                    checks: `'status is 201': (r) => r.status === 201`
                },
                {
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/posts',
                    name: 'Back to Feed',
                    thinkTime: 0.5,
                    checks: `'status is 200': (r) => r.status === 200`
                }
            ]
        },
        options: { 
            vus: 5,
            duration: '20s'
        },
        detailedReportjson: "./reports/json/sample-group-sequence-test.json",
        htmlReport: "./reports/html/sample-group-sequence-test.html",
        thinkTime: 0.5,
        tags: {
            workflow: 'social',
            testType: 'interaction'
        }
    });

    console.log('Test 3 completed successfully');
    return result;
}

// ============================================
// Main Test Suite
// ============================================
async function runAllGroupTests() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   SAMPLE GROUP TESTS - WORKFLOW TESTING                ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\nStarting multi-step workflow test suite...');
    console.log(`Started at: ${new Date().toLocaleString()}`);

    try {
        // Run tests sequentially
        await testSimpleWorkflow();
        await testComplexWorkflow();
        await testGroupWithMultipleActions();

        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║   ALL GROUP TESTS PASSED SUCCESSFULLY                  ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log(`Completed at: ${new Date().toLocaleString()}`);
        console.log('\nReports Generated:');
        console.log('   HTML: ./reports/html/sample-group-*.html');
        console.log('   JSON: ./reports/json/sample-group-*.json');
        
        return true;
    } catch (error) {
        console.error('\nTest failed with error:');
        console.error(error.message);
        process.exit(1);
    }
}

// Run the test suite
runAllGroupTests();
