# Test Files Guide

This folder contains comprehensive example test files demonstrating how to use the Performance Nilgiri framework.

## Available Test Files

### 1. sample-api-test.js
**Simple API Endpoint Testing**

Tests single API endpoints with various request types and configurations.

#### What it demonstrates:
- Simple GET requests
- POST requests with JSON body
- Query parameters
- Authentication headers
- Response validation and checks

#### How to run:
```bash
node sample-api-test.js
```

#### Expected output:
- 4 API tests (GET, POST, Query Params, Auth)
- HTML reports in `./reports/html/`
- JSON metrics in `./reports/json/`

#### Scenarios:
1. **Simple GET Request** - Basic API call to fetch data
2. **POST Request** - Submitting data to an API
3. **Query Parameters** - Filtering API results
4. **Authentication** - Secure API calls with bearer token

---

### 2. sample-group-test.js
**Multi-Step Workflow Testing**

Tests complex user workflows that involve multiple sequential steps.

#### What it demonstrates:
- Sequential API calls (Step 1 → Step 2 → Step 3)
- Think time between requests (simulate user behavior)
- Complex workflows (browse → view → checkout)
- Multiple request arrays in groups
- Tags for categorizing tests

#### How to run:
```bash
node sample-group-test.js
```

#### Expected output:
- 3 group tests with multiple steps each
- HTML reports in `./reports/html/`
- JSON metrics in `./reports/json/`

#### Scenarios:
1. **Simple Multi-Step Workflow** - 3 sequential API calls
   - Get list of posts
   - Get specific post details
   - Get post comments

2. **Complex E-Commerce Flow** - Full user journey
   - Browse products
   - View product details
   - Add to cart
   - Checkout
   - View order confirmation

3. **Social Media Interaction** - User engagement flow
   - Load feed
   - View posts
   - Load comments
   - Post comment
   - Return to feed

---

### 3. load-test.js
**High-Volume Performance Testing**

Tests system behavior under different load conditions and stress scenarios.

#### What it demonstrates:
- Small load baseline testing
- Medium load standard testing
- Heavy load with complex workflows
- Spike testing (sudden traffic increase)
- Endurance testing (long-duration stability)
- Performance metrics and thresholds
- Load progression

#### How to run:
```bash
node load-test.js
```

#### Expected output:
- 5 load tests with increasing complexity
- HTML reports in `./reports/html/`
- JSON metrics in `./reports/json/`
- Performance guidance and thresholds

#### Scenarios:
1. **Small Load** (Baseline)
   - VUs: 10
   - Duration: 15s
   - Expected: 150-200 requests

2. **Medium Load** (Standard)
   - VUs: 25
   - Duration: 20s
   - Expected: 500-750 requests

3. **Heavy Load** (Complex workflow)
   - VUs: 20
   - Duration: 25s
   - 3-step workflow

4. **Spike Test** (Sudden traffic)
   - VUs: 40
   - Duration: 20s
   - Expected: 800-1200 requests

5. **Endurance Test** (Long-running)
   - VUs: 15
   - Duration: 30s
   - Tests system stability

---

## Running the Tests

### Run individual test:
```bash
node sample-api-test.js
node sample-group-test.js
node load-test.js
```

### Run all tests via npm script:
```bash
npm run test:run
```

### Run with InfluxDB monitoring:
```bash
npm run test:influx
```

---

## Understanding the Output

### Console Output
Each test produces console logs showing:
- Test name and description
- Progress indicators
- Completion status
- Report locations

### HTML Reports
Open `reports/html/*.html` in your browser to see:
- Response time graphs
- Throughput metrics
- Error rates
- Check pass/fail ratios

### JSON Reports
View `reports/json/*.json` for raw metrics:
- Individual request timings
- Aggregated statistics
- Check results
- Detailed performance data

---

## Performance Thresholds

### Good Performance
- Response time: < 500ms
- Error rate: < 0.5%
- All checks pass

### Acceptable Performance
- Response time: < 1s
- Error rate: < 1%
- Most checks pass

### Poor Performance
- Response time: > 2s
- Error rate: > 5%
- Multiple check failures

---

## Test Configuration Options

Each test can be customized by modifying the configuration:

```javascript
const result = await runPerformanceTest({
    scenarioName: 'Test Name',           // Name of the test
    request: {                            // Single request or...
        method: 'GET',
        url: 'https://...',
        headers: {},
        body: {}
    },
    groups: {                             // Multiple sequential requests
        step1: { ... },
        step2: { ... }
    },
    options: {
        vus: 10,                          // Virtual users
        duration: '10s'                   // Test duration
    },
    checks: `'name': (r) => condition`,  // Validation checks
    thinkTime: 0.5,                       // Delay between requests
    tags: {},                             // Categorization tags
    detailedReportjson: './path.json',   // JSON output
    htmlReport: './path.html'             // HTML output
});
```

---

## Extending the Tests

You can create your own test files by copying the pattern:

```javascript
const { runPerformanceTest } = require('performancenilgiri');

async function myCustomTest() {
    const result = await runPerformanceTest({
        scenarioName: 'My Test',
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

async function runTests() {
    try {
        await myCustomTest();
        console.log('Tests completed successfully');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

runTests();
```

---

## Troubleshooting

### Tests not running
1. Ensure K6 is installed: `k6 version`
2. Check file permissions
3. Verify API endpoints are accessible

### No reports generated
1. Check `./reports/` directory exists
2. Verify write permissions
3. Look for errors in console output

### Performance metrics seem wrong
1. Check your API endpoint is responding
2. Verify virtual user counts (VUs) are correct
3. Ensure duration is long enough for meaningful data

---

## Next Steps

1. Run the sample tests to understand patterns
2. Modify scenarios to match your APIs
3. Adjust load parameters for your target
4. Review reports to identify bottlenecks
5. Optimize and re-run tests

---

For more information, see:
- Main README.md - Framework overview
- PROMPT_REFERENCE.md - Complete API reference
- MONITORING.md - InfluxDB/Grafana setup
