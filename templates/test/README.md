# Performance Test Suite

Complete example test suite demonstrating the Performance Nilgiri framework with three different testing approaches.

## Quick Start

### Run all sample tests:
```bash
node sample-api-test.js
node sample-group-test.js
node load-test.js
```

### Run with npm:
```bash
npm run test:run
```

### Run with InfluxDB monitoring:
```bash
npm run test:influx
```

---

## Test Files Overview

### 1. sample-api-test.js
**Single Endpoint API Testing**

Tests individual API endpoints with various configurations and validation checks.

**4 Test Scenarios:**
1. Simple GET Request - Basic API call
2. POST Request with Body - Submitting data
3. Query Parameters - Filtering results
4. Authentication Headers - Secure requests

**Key Features:**
- Request headers configuration
- JSON body payload
- Response validation checks
- Error handling
- Performance metrics

**Run:**
```bash
node sample-api-test.js
```

**Output:**
- Console progress logs
- HTML reports: `./reports/html/sample-api-*.html`
- JSON metrics: `./reports/json/sample-api-*.json`

---

### 2. sample-group-test.js
**Multi-Step Workflow Testing**

Tests complex user workflows with sequential API calls simulating real user behavior.

**3 Workflow Scenarios:**
1. Simple Multi-Step (3 sequential calls)
   - Get posts list
   - Get post details
   - Get post comments

2. E-Commerce Order Flow (5 steps)
   - Browse products
   - View product details
   - Add to cart
   - Checkout
   - View confirmation

3. Social Media Interaction (5 actions)
   - Load feed
   - View posts
   - Load comments
   - Post comment
   - Return to feed

**Key Features:**
- Sequential request execution
- Think time (user wait simulation)
- Multi-step group workflows
- Request array sequences
- Workflow tagging
- Response validation at each step

**Run:**
```bash
node sample-group-test.js
```

**Output:**
- Console progress logs
- HTML reports: `./reports/html/sample-group-*.html`
- JSON metrics: `./reports/json/sample-group-*.json`

---

### 3. load-test.js
**Load & Stress Testing**

Simulates various load conditions to test system performance under stress.

**5 Load Scenarios:**

| Scenario | VUs | Duration | Purpose |
|----------|-----|----------|---------|
| Small Load | 10 | 15s | Baseline testing |
| Medium Load | 25 | 20s | Standard load |
| Heavy Load | 20 | 25s | Complex workflow |
| Spike Test | 40 | 20s | Sudden traffic |
| Endurance | 15 | 30s | Long-running stability |

**Key Features:**
- Progressive load testing
- Stress scenario simulation
- Performance thresholds
- Real-world load patterns
- Stability monitoring
- Detailed guidance

**Run:**
```bash
node load-test.js
```

**Output:**
- Console progress logs with guidance
- HTML reports: `./reports/html/load-test-*.html`
- JSON metrics: `./reports/json/load-test-*.json`

---

## File Structure

```
templates/test/
├── sample-api-test.js      (7.2 KB)  - Simple API testing
├── sample-group-test.js    (9.7 KB)  - Workflow testing
├── load-test.js            (11.6 KB) - Load testing
├── TEST_GUIDE.md           (6.8 KB)  - Detailed guide
├── README.md               (this file) - Quick reference
├── test.js                 (3.7 KB)  - Template file
├── test.ts                 (4.0 KB)  - TypeScript template
└── reports/
    ├── html/               - HTML test reports
    ├── json/               - JSON metrics
    └── resource/
        └── samplepayload.json - Test data
```

---

## Configuration Reference

### Basic Test Configuration
```javascript
const result = await runPerformanceTest({
    // Test identification
    scenarioName: 'My Test',
    
    // Single request
    request: {
        method: 'GET|POST|PUT|DELETE',
        url: 'https://api.example.com/endpoint',
        headers: { 'Content-Type': 'application/json' },
        body: { /* JSON payload */ }
    },
    
    // Or multiple sequential requests
    groups: {
        step1: { /* request config */ },
        step2: { /* request config */ },
        stepN: [
            { /* request 1 */ },
            { /* request 2 */ }
        ]
    },
    
    // Load configuration
    options: {
        vus: 5,              // Virtual users
        duration: '10s'      // Test duration
    },
    
    // Validation
    checks: `
        'status is 200': (r) => r.status === 200,
        'response time < 1s': (r) => r.timings.duration < 1000
    `,
    
    // Behavior
    thinkTime: 0.5,          // Seconds between requests
    tags: {                  // Categorization
        environment: 'test',
        testType: 'api'
    },
    
    // Output
    detailedReportjson: './reports/json/test.json',
    htmlReport: './reports/html/test.html'
});
```

---

## Performance Metrics

### Response Time Targets
- **Good**: < 500ms
- **Acceptable**: < 1 second
- **Poor**: > 2 seconds

### Error Rate Targets
- **Good**: < 0.5% errors
- **Acceptable**: < 1% errors
- **Poor**: > 5% errors

### Check Success Rate
- **Good**: > 95% checks pass
- **Acceptable**: > 90% checks pass
- **Poor**: < 90% checks pass

---

## Key Concepts

### Virtual Users (VUs)
Concurrent simulated users accessing your API simultaneously.

### Duration
How long the test runs (e.g., '10s', '5m').

### Think Time
Delay between requests to simulate human behavior.

### Checks
Validation rules that pass/fail based on response.

### Groups
Sequential steps executed one after another.

### Tags
Metadata for categorizing and filtering test results.

---

## Creating Custom Tests

### Step 1: Copy the pattern
```javascript
const { runPerformanceTest } = require('performancenilgiri');

async function myTest() {
    const result = await runPerformanceTest({
        scenarioName: 'My Custom Test',
        request: {
            method: 'GET',
            url: 'https://your-api.com/endpoint'
        },
        options: { vus: 5, duration: '10s' },
        detailedReportjson: "./reports/json/my-test.json",
        htmlReport: "./reports/html/my-test.html"
    });
    return result;
}
```

### Step 2: Create main function
```javascript
async function runAllTests() {
    console.log('Starting tests...');
    try {
        await myTest();
        console.log('Tests completed successfully');
    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}

runAllTests();
```

### Step 3: Run it
```bash
node my-test.js
```

---

## Common Patterns

### GET Request with Validation
```javascript
request: {
    method: 'GET',
    url: 'https://api.example.com/users/1'
},
checks: `
    'status is 200': (r) => r.status === 200,
    'has name': (r) => r.json('name') !== undefined,
    'id matches': (r) => r.json('id') === 1
`
```

### POST with Body
```javascript
request: {
    method: 'POST',
    url: 'https://api.example.com/users',
    body: {
        name: 'John Doe',
        email: 'john@example.com'
    }
},
checks: `'status is 201': (r) => r.status === 201`
```

### Multi-Step Workflow
```javascript
groups: {
    login: {
        method: 'POST',
        url: 'https://api.example.com/login',
        body: { username: 'user', password: 'pass' }
    },
    fetchData: {
        method: 'GET',
        url: 'https://api.example.com/data',
        thinkTime: 1
    },
    logout: {
        method: 'POST',
        url: 'https://api.example.com/logout',
        thinkTime: 0.5
    }
}
```

### Load Test Progression
```javascript
options: {
    vus: 10,      // Start with 10 users
    duration: '10s'
},
tags: {
    loadLevel: 'baseline'
}
```

---

## Viewing Results

### Console Output
- Test progress
- Completion status
- Report locations

### HTML Reports
Open in browser: `./reports/html/*.html`
- Visual graphs
- Response times
- Throughput metrics
- Error rates
- Check results

### JSON Reports
View raw data: `./reports/json/*.json`
- Individual request timings
- Aggregated statistics
- Check pass/fail results
- Detailed metrics

---

## Troubleshooting

### Tests Not Running
1. Check K6 installed: `k6 version`
2. Verify permissions: `ls -la test/`
3. Check API endpoints accessible

### No Reports Generated
1. Verify `./reports/` exists
2. Check write permissions
3. Look for console errors

### Metrics Seem Wrong
1. Check API is responding
2. Verify VU count is correct
3. Ensure duration is sufficient
4. Check thinkTime settings

### Performance Issues
1. Monitor response times
2. Check error rates
3. Review check failures
4. Adjust load parameters
5. Optimize API endpoints

---

## Next Steps

1. Run sample tests to understand patterns
2. Review reports in `./reports/html/`
3. Customize tests for your APIs
4. Adjust load parameters
5. Set up InfluxDB monitoring
6. Integrate into CI/CD pipeline

---

## Integration with npm

Add to package.json scripts:
```json
{
  "scripts": {
    "test:api": "node test/sample-api-test.js",
    "test:group": "node test/sample-group-test.js",
    "test:load": "node test/load-test.js",
    "test:all": "npm run test:api && npm run test:group && npm run test:load",
    "test:influx": "npm run test:all -- --use-influx"
  }
}
```

---

## Related Documentation

- [TEST_GUIDE.md](./TEST_GUIDE.md) - Detailed test file guide
- [../README.md](../README.md) - Main framework documentation
- [../MONITORING.md](../MONITORING.md) - InfluxDB/Grafana setup
- [../../PROMPT_REFERENCE.md](../../PROMPT_REFERENCE.md) - Complete API reference

---

## Support

For issues or questions:
1. Check TEST_GUIDE.md for detailed explanations
2. Review sample test files for patterns
3. Check console output for error messages
4. Verify API endpoints are accessible
5. Ensure JSON payloads are valid
