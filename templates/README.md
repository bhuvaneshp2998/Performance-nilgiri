<p align="center">
  <img src="https://raw.githubusercontent.com/bhuvaneshp2998/Performance-nilgiri/main/logo/NilgiriPerformance.png" alt="Nilgiri Performance Logo" width="200"/>
</p>

<h1 align="center">Nilgiri Performance Framework</h1>

<p align="center">
    <!-- NPM badges -->
    <a href="https://npmjs.com/package/performancenilgiri">
        <img src="https://img.shields.io/npm/v/performancenilgiri.svg" alt="npm version">
    </a>
    <a href="https://npmjs.com/package/performancenilgiri">
        <img src="https://img.shields.io/npm/dm/performancenilgiri.svg" alt="npm downloads">
    </a>
    <a href="https://github.com/bhuvaneshp2998/Performance-nilgiri/blob/main/LICENSE.txt">
        <img src="https://img.shields.io/npm/l/performancenilgiri.svg" alt="license">
    </a>
</p>

---

## 📖 About Nilgiri Performance

**Nilgiri Performance** is a core component of the Nilgiri Framework that integrates **K6** (a modern load testing tool) into your Node.js projects. It provides an AI-driven performance testing solution with a simple CLI tool and comprehensive API.

### ✨ Key Features

✅ **Simple CLI tool** to scaffold performance testing projects  
✅ **Comprehensive API** for load, stress, and soak testing  
✅ **AI-enhanced reporting** with automated performance analysis  
✅ **Multi-scenario support** for complex workflows and grouped requests  
✅ **HTML & JSON reports** for detailed performance insights  
✅ **Think time support** for realistic user behavior simulation  
✅ **Custom assertions/checks** for test validation  
✅ **TypeScript & JavaScript** support  

---

## 📋 Prerequisites

Before getting started, ensure you have:

1. **Node.js** (v14+)
   - Download from [nodejs.org](https://nodejs.org/)
   
2. **K6** - Modern load testing tool
   - Install from [k6.io/docs/getting-started/installation](https://k6.io/docs/getting-started/installation/)
   
3. **TypeScript** (optional, for .ts files)
   ```bash
   npm install -g typescript
   ```
   
4. **IDE** - VSCode, IntelliJ, or any Node.js-compatible editor

5. **AI API Credentials** (for AI-enhanced reports)
   - API endpoint URL
   - API authentication key

---

## 🚀 Quick Start

### Step 1: Create a New Performance Testing Project

```bash
npx create-testperformance my-performance-tests
cd my-performance-tests
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Your First Test

Edit `test/test.js` or `test/test.ts` and update with your target URL:

```javascript
const { runPerformanceTest } = require('performancenilgiri');

async function testApiEndpoint() {
    const result = await runPerformanceTest({
        scenarioName: 'My First Test',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        options: { 
            vus: 5,           // Virtual Users
            duration: '10s'   // Test Duration
        },
        detailedReportjson: "./reports/json/test_metrics.json",
        htmlReport: "./reports/html/test_report.html",
        checks: `'status is 200': (r) => r.status === 200`,
        thinkTime: 1
    });
    return result;
}

testApiEndpoint().catch(console.error);
```

### Step 4: Run Tests

```bash
# Run specific test file
npm run test:run

# Run all test files
npm run all

# Run with specific filename
node run-tests.js test.js
```

### Step 5: View Reports

Performance reports are generated in:
- **HTML**: `./reports/html/test_report.html`
- **JSON**: `./reports/json/test_metrics.json`

---

## 📁 Project Structure

Once created, your project will have this structure:

```
my-performance-tests/
├── package.json              # Dependencies and scripts
├── test/
│   ├── test.js              # JavaScript test examples
│   └── test.ts              # TypeScript test examples
├── resource/
│   └── samplepayload.json   # Sample request payloads
├── reports/                 # Generated test reports
│   ├── html/               # HTML reports
│   └── json/               # JSON metrics
└── run-tests.js            # Test runner script
```

---

## 🔧 Core API: `runPerformanceTest()`

### Function Signature

```javascript
const { runPerformanceTest } = require('performancenilgiri');

const result = await runPerformanceTest(configObject);
```

---

### Configuration Parameters

#### 📌 Request Configuration

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | string | Yes | HTTP method (GET, POST, PUT, DELETE, PATCH) |
| `url` | string | Yes | Target URL for the request |
| `body` | object | No | Request payload for POST/PUT requests |
| `headers` | object | No | Custom HTTP headers |
| `name` | string | No | Request name for reporting |

#### ⚙️ Test Options

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `vus` | number | Yes | Virtual Users (concurrent users) | `5`, `10`, `100` |
| `duration` | string | Yes | Test duration | `'5s'`, `'1m'`, `'30m'` |

#### 📊 Reporting Configuration

| Parameter | Type | Description |
|-----------|------|-------------|
| `scenarioName` | string | Name of the test scenario |
| `htmlReport` | string | Output path for HTML report |
| `detailedReportjson` | string | Output path for JSON metrics |
| `aireport` | object | AI report configuration (deprecated) |

#### 🔍 Test Logic

| Parameter | Type | Description |
|-----------|------|-------------|
| `checks` | string | K6 assertions (e.g., `'status is 200': (r) => r.status === 200`) |
| `thinkTime` | number | Delay between requests in seconds |
| `tags` | object | Metadata tags for test categorization |

#### 👥 Grouped/Sequential Requests

| Parameter | Type | Description |
|-----------|------|-------------|
| `groups` | object | Named groups of requests for multi-step workflows |
| `groups[groupName]` | object \| array | Single request config or array of requests |

---

## 💡 Usage Examples

### Example 1: Simple API Test

```javascript
const { runPerformanceTest } = require('performancenilgiri');

async function simpleTest() {
    const result = await runPerformanceTest({
        scenarioName: 'Simple API Test',
        request: {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: { 'Content-Type': 'application/json' }
        },
        options: { vus: 5, duration: '10s' },
        detailedReportjson: "./reports/json/test_metrics.json",
        htmlReport: "./reports/html/test_report.html",
        checks: `'status is 200': (r) => r.status === 200`,
        thinkTime: 1
    });
    return result;
}

simpleTest().catch(console.error);
```

### Example 2: Multi-Step Workflow Test

```javascript
const { runPerformanceTest } = require('performancenilgiri');

async function workflowTest() {
    const result = await runPerformanceTest({
        scenarioName: 'User Workflow',
        groups: {
            authentication: {
                method: 'POST',
                url: 'https://api.example.com/login',
                body: { username: 'user', password: 'pass' },
                name: 'Login',
                checks: `'status is 200': (r) => r.status === 200`
            },
            dataFetch: {
                method: 'GET',
                url: 'https://api.example.com/user/data',
                name: 'Fetch Data',
                checks: `'status is 200': (r) => r.status === 200`
            },
            logout: {
                method: 'POST',
                url: 'https://api.example.com/logout',
                name: 'Logout',
                checks: `'status is 200': (r) => r.status === 200`
            }
        },
        options: { vus: 10, duration: '30s' },
        detailedReportjson: "./reports/json/workflow_metrics.json",
        htmlReport: "./reports/html/workflow_report.html",
        thinkTime: 0.5,
        tags: { environment: 'staging', testType: 'workflow' }
    });
    return result;
}

workflowTest().catch(console.error);
```

### Example 3: Sequential Requests in a Group

```javascript
const { runPerformanceTest } = require('performancenilgiri');

async function ecommerceTest() {
    const result = await runPerformanceTest({
        scenarioName: 'E-commerce Flow',
        groups: {
            userJourney: [
                {
                    method: 'GET',
                    url: 'https://shop.example.com/products',
                    name: 'Browse Products',
                    checks: `'status is 200': (r) => r.status === 200`
                },
                {
                    method: 'GET',
                    url: 'https://shop.example.com/products/123',
                    name: 'View Product Details',
                    thinkTime: 2,
                    checks: `'status is 200': (r) => r.status === 200`
                },
                {
                    method: 'POST',
                    url: 'https://shop.example.com/cart/add',
                    body: { productId: 123, quantity: 1 },
                    name: 'Add to Cart',
                    checks: `'status is 201': (r) => r.status === 201`
                }
            ]
        },
        options: { vus: 20, duration: '1m' },
        detailedReportjson: "./reports/json/ecommerce_metrics.json",
        htmlReport: "./reports/html/ecommerce_report.html",
        thinkTime: 1,
        tags: { business: 'ecommerce', region: 'us-east' }
    });
    return result;
}

ecommerceTest().catch(console.error);
```

### Example 4: Test with Dynamic Payloads

```javascript
import { runPerformanceTest } from 'performancenilgiri';
import basePayload from '../resource/samplepayload.json';
import dotenv from 'dotenv';

dotenv.config();

async function dynamicPayloadTest() {
    const modifiedPayload = {
        ...basePayload,
        userId: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
    };

    const result = await runPerformanceTest({
        scenarioName: 'Dynamic Payload Test',
        request: {
            method: 'POST',
            url: process.env.BASE_URL || 'https://api.example.com/submit',
            body: modifiedPayload,
            headers: { 'Content-Type': 'application/json' }
        },
        options: { vus: 10, duration: '20s' },
        detailedReportjson: "./reports/json/dynamic_metrics.json",
        htmlReport: "./reports/html/dynamic_report.html",
        checks: `'successful': (r) => r.status >= 200 && r.status < 300`
    });
    return result;
}

dynamicPayloadTest().catch(console.error);
```

---

## 📊 Real-time Monitoring with Grafana + InfluxDB

**NEW:** Nilgiri Performance now includes optional **real-time monitoring** with Grafana dashboards and InfluxDB metrics storage!

### 🚀 Quick Monitoring Setup

```bash
# 1. Start monitoring stack (Docker required)
npm run monitor:start

# 2. Wait for containers to start (~10-15 seconds)
npm run monitor:status

# 3. Run tests with real-time monitoring
npm run test:influx

# 4. Open Grafana dashboard
# http://localhost:3000

# 5. Stop when done
npm run monitor:stop
```

### 📈 Available Monitoring Commands

| Command | Purpose |
|---------|---------|
| `npm run monitor:start` | Start InfluxDB + Grafana |
| `npm run monitor:stop` | Stop monitoring stack |
| `npm run monitor:restart` | Restart containers |
| `npm run monitor:status` | Check container status |
| `npm run monitor:logs` | View real-time logs |
| `npm run test:influx` | Run tests with InfluxDB output |
| `npm run all:influx` | Run all tests with monitoring |
| `npm run smoke:influx` | Run smoke tests with monitoring |

### 📊 Grafana Dashboard Features

**Real-time Visualizations:**
- 📈 **HTTP Request Duration** - Response time trends
- 📊 **Total Requests** - Request volume over time
- ❌ **Error Rate** - Failure percentage (color-coded)
- 👥 **Virtual Users** - Concurrent user simulation
- ⏱️ **Throughput** - Requests per second

### 🔧 Monitoring Configuration

Default credentials (change in `.env`):
- **Grafana**: `admin` / `admin`
- **InfluxDB**: `admin` / `admin`

### 📚 Complete Monitoring Guide

For detailed monitoring setup, configuration, and troubleshooting, see:
👉 **[MONITORING.md](templates/MONITORING.md)** in the templates folder

---

## 📊 Performance Reports

### HTML Report Features

The generated HTML report includes:

#### 🟢 Summary Metrics (Color-Coded Tiles)
- **Total Requests** - Total HTTP requests executed
- **Time Duration** - Test execution time
- **Virtual Users** - Number of concurrent users
- **Throughput** - Requests per second
- **Pass Count** - Successful requests
- **Fail Count** - Failed requests
- **Iterations** - Script execution count
- **Error Rate** - Percentage of failures

#### 📈 Performance Graphs

**1. HTTP Request Duration (Bar Chart)**
- Shows distribution of response times
- Displays: Min, Median, Average, Max, p90, p95
- Helps identify performance bottlenecks

**2. Iteration Duration (Line Chart)**
- Shows trend of iteration times over test execution
- Identifies performance degradation
- Detects memory leaks or increasing server load

#### 📌 Additional Features
- **Performance Metrics Dropdown** - Detailed breakdown
- **AI Analysis Dropdown** - Automated insights and recommendations

### JSON Report Format

Detailed metrics in JSON format for programmatic analysis:
- Request statistics
- Response times (min, max, average, percentiles)
- Error counts and rates
- Iteration data with timestamps

---

## 🧪 Test Scenario Types

### Smoke Tests
- **VUs**: 2-5
- **Duration**: 5-10s
- **Purpose**: Quick validation of critical functionality
- **Use Case**: Pre-deployment health checks

### Load Tests
- **VUs**: 10-100+
- **Duration**: 1-5 minutes
- **Purpose**: Identify performance bottlenecks
- **Use Case**: Baseline performance measurement

### Stress Tests
- **VUs**: 100+
- **Duration**: Extended time
- **Purpose**: Find breaking points
- **Use Case**: Capacity planning

### Soak Tests
- **VUs**: Constant moderate load
- **Duration**: Hours
- **Purpose**: Detect memory leaks
- **Use Case**: Long-term stability assessment

---

## 📈 Metric Interpretation Guide

### Response Time Thresholds

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| **p90 Response Time** | <500ms | 500-1000ms | >1000ms |
| **p95 Response Time** | <1s | 1-2s | >2s |
| **Max Response Time** | <5s | 5-10s | >10s |
| **Error Rate** | <0.1% | 0.1-1% | >1% |
| **Throughput** | Consistent | Fluctuating | Declining |

### Understanding Percentiles

- **p90**: 90% of requests completed below this time
- **p95**: 95% of requests completed below this time (common SLA target)
- **p99**: 99% of requests completed below this time
- **Max**: Slowest request observed

---

## 🎯 Best Practices

✅ **DO:**
- Use realistic think times between requests (0.5-2s)
- Tag tests for easy filtering and analysis
- Test against staging environments first
- Run tests during low-traffic periods
- Monitor server resources during tests
- Save both HTML and JSON reports for comparison
- Use environment variables for sensitive data
- Gradually increase VUs in load tests (ramp-up pattern)
- Compare results across test runs

❌ **DON'T:**
- Run high-load tests against production without authorization
- Ignore p95/p99 percentile metrics
- Use hardcoded credentials in test files
- Forget to set realistic VU ramp-up
- Ignore error responses - analyze failures carefully
- Run tests during peak traffic hours
- Share API credentials in reports

---

## 🛠️ Advanced Configuration

### Using Environment Variables

```javascript
import dotenv from 'dotenv';
dotenv.config();

const result = await runPerformanceTest({
    request: {
        method: 'GET',
        url: process.env.BASE_URL,
        headers: {
            'Authorization': `Bearer ${process.env.API_TOKEN}`
        }
    },
    options: { 
        vus: parseInt(process.env.VUS || '5'), 
        duration: process.env.DURATION || '30s'
    },
    // ... rest of config
});
```

### Running TypeScript Tests

```bash
# Compile TypeScript
npm run build

# Or run directly with ts-node
npx ts-node test/test.ts
```

---

## 🐛 Troubleshooting

### K6 command not found
```bash
# Install K6 from https://k6.io/docs/getting-started/installation/
# Or add K6 binary to your PATH
```

### Module 'performancenilgiri' not found
```bash
npm install performancenilgiri
```

### TypeScript compilation errors
```bash
npm install -g typescript
npm run build
```

### Reports not generating
1. Verify file paths are correct (relative or absolute)
2. Ensure `./reports/html/` and `./reports/json/` directories exist
3. Check file write permissions
4. Review console errors for detailed messages

### AI analysis not working
1. Verify `AiUrl` endpoint is correct and accessible
2. Validate `apikey` has required permissions
3. Check API rate limits
4. Ensure network connectivity to AI service

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| [index.js](index.js) | CLI generator for project scaffolding |
| [package.json](package.json) | Root dependencies |
| [PROMPT_REFERENCE.md](PROMPT_REFERENCE.md) | Comprehensive framework documentation |
| `templates/package.json` | Generated project dependencies |
| `templates/run-tests.js` | Test runner script |
| `templates/test/test.js` | JavaScript test examples |
| `templates/test/test.ts` | TypeScript test examples |

---

## 📚 Learning Resources

- **K6 Documentation**: https://k6.io/docs/
- **K6 API Reference**: https://k6.io/docs/javascript-api/
- **GitHub Repository**: https://github.com/bhuvaneshp2998/Performance-nilgiri
- **Issue Tracking**: https://github.com/bhuvaneshp2998/Performance-nilgiri/issues

---

## 🔐 Security Best Practices

⚠️ **Important Security Considerations:**

1. **Never commit API keys** - Use environment variables
2. **Use `.env` file** - Add to `.gitignore`
3. **Don't test production** without explicit authorization
4. **Use HTTPS endpoints** for sensitive data transmission
5. **Rotate credentials** regularly
6. **Sanitize logs** if sharing with others
7. **Validate SSL certificates** in production environments

**Example `.env` file:**
```bash
BASE_URL=https://api.staging.example.com
API_KEY=your-secret-key
AI_API_URL=https://ai-service.example.com
AI_API_KEY=your-ai-api-key
```

---

## 📞 Support

For issues, questions, or feature requests:

- **GitHub Issues**: [Report bugs and request features](https://github.com/bhuvaneshp2998/Performance-nilgiri/issues)
- **GitHub Discussions**: [Community discussions and Q&A](https://github.com/bhuvaneshp2998/Performance-nilgiri/discussions)
- **Email Support**: Contact Tricon Infotech

---

## 📄 License

MIT License - See [LICENSE.txt](LICENSE.txt) for details

---

## 🙏 Acknowledgments

Thank you for choosing **Nilgiri Performance** as part of the Nilgiri Framework for your performance testing needs!

<p align="center">
    <strong>Copyright (c) 2025 Tricon Infotech</strong>
</p>

<p align="center">
    <a href="https://github.com/bhuvaneshp2998/Performance-nilgiri">GitHub Repository</a> • 
    <a href="https://npmjs.com/package/performancenilgiri">NPM Package</a> • 
    <a href="https://k6.io">K6.io</a>
</p>
