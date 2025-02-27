const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const axios = require('axios');

/**
 * Executes a K6 performance test dynamically, generates test reports, and integrates AI-based analysis.  
 * This function allows users to run K6 performance tests with customizable options, save results,  
 * and analyze performance data using an AI-based service.
 *
 * ## **How It Works**
 * 1. **Validates input parameters**: Ensures required AI report parameters (`reportPath`, `AiUrl`, `apikey`) are provided.
 * 2. **Executes the K6 test**: Runs the generated script and collects performance metrics.
 * 3. **Saves performance results**: Stores detailed JSON reports if `detailedReportjson` is specified.
 * 4. **Performs AI analysis**: Sends test results to an AI service for further insights.
 * 5. **Generates an AI-based HTML report**: Processes AI analysis and saves a structured report in `reportPath`.
 *
 * ---
 * 📌 **Note:**  
 * - Ensure that `k6` is installed and available in the system’s environment.  
 * - The AI analysis service requires a valid API key and endpoint.  
 * - Temporary script and report files are automatically cleaned up after execution.
 *
 * @param {Object} params - Configuration object containing test parameters.
 * @param {string} params.url - The target URL for the K6 performance test.
 * @param {Object} params.options - K6 test options defining virtual users (VUs), duration, etc.
 * @param {Object} params.aireport - Configuration for AI-based analysis.
 * @param {string} params.aireport.reportPath - File path to save the AI-generated HTML report.
 * @param {string} params.aireport.AiUrl - AI API endpoint for performance analysis.
 * @param {string} params.aireport.apikey - API key for authenticating AI-based analysis requests.
 * @param {string} [params.detailedReportjson] - Optional path to save a detailed JSON performance report.
 *
 * @throws {Error} If required AI report parameters (`reportPath`, `AiUrl`, or `apikey`) are missing.
 * @returns {Promise<void>} Resolves when the test execution and AI analysis are completed.
 *
 * @example
 * ```javascript
 * import { runK6Test } from 'nilgiriperformance';
 *
 * const testConfig = {
 *   url: "https://example.com",
 *   options: {
 *     vus: 10,
 *     duration: "30s"
 *   },
 *   aireport: {
 *     reportPath: "./ai_performance_report.html",
 *     AiUrl: "https://ai-analysis-api.com",
 *     apikey: "your-api-key"
 *   },
 *   detailedReportjson: "./performance_metrics.json"
 * };
 *
 * runK6Test(testConfig)
 *   .then(() => console.log('Performance test completed successfully!'))
 *   .catch(err => console.error('Error:', err));
 * ```
 */
async function runPerformanceTest(params) {
    const { url, options, aireport, detailedReportjson } = params;

    if (!aireport || !aireport.reportPath || !aireport.AiUrl || !aireport.apikey) {
        console.error('Missing required AI report parameters (reportPath, AiUrl, or apikey)');
        return;
    }

    const reportPath = aireport.reportPath;
    const AiUrl = aireport.AiUrl;
    const apiKey = aireport.apikey;

    // Convert options object to a string representation
    const optionsString = JSON.stringify(options, null, 4)
        .replace(/"(\w+)":/g, '$1:') // Remove quotes around keys
        .replace(/"/g, "'"); // Replace double quotes with single quotes

    // Generate k6 script dynamically
    const k6Script = `
        import http from 'k6/http';
        import { check, sleep } from 'k6';

        export const options = ${optionsString};

        export default function () {
            let res = http.get('${url}');
            check(res, {
                'status was 200': (r) => r.status === 200,
            });
            sleep(1);
        }
    `.trim();

    // Create a temporary script file
    const tempScriptPath = path.join(__dirname, 'temp_k6_script.js');
    fs.writeFileSync(tempScriptPath, k6Script);

    // Prepare k6 command arguments
    const jsonReportPath = path.resolve('temp_report.json');
    const k6Args = ['run', tempScriptPath, '--summary-export', jsonReportPath];

    // Run k6 test
    const result = spawnSync('k6', k6Args, { stdio: 'inherit' });

    // Cleanup temporary script
    fs.unlinkSync(tempScriptPath);

    if (result.error) {
        console.error('Error running k6:', result.error);
        return;
    }

    // Read k6 JSON report
    const jsonData = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));

    // Save detailed JSON report if needed
    if (detailedReportjson) {
        fs.writeFileSync(detailedReportjson, JSON.stringify(jsonData, null, 2));
        console.log(`Detailed JSON report saved: ${detailedReportjson}`);
    }

    // Call AI API for analysis
    try {
        const aiAnalysis = await getAIAnalysis(jsonData, AiUrl, apiKey);
        generateCustomHtmlReport(jsonData, aiAnalysis, reportPath);
    } catch (error) {
        console.error('Error during AI analysis:', error);
    }

    // Cleanup JSON report file
    fs.unlinkSync(jsonReportPath);
}

/**
 * Analyzes the k6 performance data using an AI API.
 * @param {Object} jsonData - k6 JSON data.
 * @param {string} AiUrl - AI API URL.
 * @param {string} apiKey - The API key for the AI service.
 * @returns {string} - AI analysis result.
 */
async function getAIAnalysis(jsonData, AiUrl, apiKey) {
    // Convert JSON data into a structured table for the prompt
    const tableRows = Object.keys(jsonData.metrics).map(key => {
        const metric = jsonData.metrics[key];
        return `
  <tr>
    <td>${key}</td>
    <td>${metric.value || metric.avg || metric.count || 'N/A'}</td>
  </tr>`;
    }).join('');

    // Construct the AI prompt
    const prompt = `
You are a performance optimization expert. Analyze the following k6 performance test data and provide actionable insights, recommendations, and fixes in a **strictly structured HTML table format**.

### **Performance Data**
The following table contains key performance metrics collected from a k6 performance test:
${tableRows}
### **Analysis Requirements**
1. **Identify Bottlenecks**: Highlight areas where performance is suboptimal (e.g., high response times, high failure rates, low throughput).
2. **Recommendations for Improvement**: Suggest best practices for optimizing request durations, reducing failures, and enhancing efficiency.
3. **Fix Suggestions**: Provide specific fixes based on the metric values (e.g., caching, load balancing, database optimization).
4. **Detailed Explanations**: Explain why each recommendation is relevant and how it addresses the identified issue.

### **Output Format**
You **MUST** return the result in the following **strictly structured HTML table format**:

html
<table border="1">
  <tr>
    <th>Metric</th>
    <th>Value</th>
    <th>Issue</th>
    <th>Recommendation</th>
    <th>Fix/Suggestion</th>
    <th>Explanation</th>
  </tr>
  <tr>
    <td>http_req_duration (p95)</td>
    <td>1200.00ms</td>
    <td>High response time for 95% of requests</td>
    <td>Optimize database queries and reduce server-side processing time</td>
    <td>1. Add database indexes. 2. Use caching for frequently accessed data.</td>
    <td>High p95 response times indicate that most requests are slow, which can degrade user experience. Optimizing database queries and adding caching can significantly reduce response times.</td>
  </tr>
  <tr>
    <td>http_reqs_failed</td>
    <td>15.00%</td>
    <td>High failure rate</td>
    <td>Investigate server errors and improve error handling</td>
    <td>1. Check server logs for 5xx errors. 2. Implement retry mechanisms for transient failures.</td>
    <td>A high failure rate indicates potential issues with server stability or client-side errors. Investigating logs and improving error handling can reduce failures.</td>
  </tr>
</table>

Rules
1.Strict Formatting: You MUST use the exact HTML table structure provided above. Do not modify the structure or add extra columns/rows.
2.Rounding: All numerical values MUST be rounded to 2 decimal places.
3.Specificity: Recommendations and fixes MUST be specific and actionable. Avoid generic advice.
4.Consistency: Ensure the output is consistent with the example provided.
`;

const aipayload = {
    messages: [
        { role: 'system', content: "You are an expert in k6 performance testing and optimization." },
        { role: 'user', content: prompt },
    ],
    temperature: 0.1,
};

try {
    const response = await axios.post(AiUrl, aipayload, {
        headers: { "Content-Type": "application/json", "api-key": apiKey },
    });

    const aiAnalysis = response.data.choices[0].message.content.trim();

    // ✅ Ensure script runs in a browser
    if (typeof document !== "undefined") {
        const dropdownContent = document.querySelector(".dropdown-content");
        if (dropdownContent) {
            dropdownContent.innerHTML = `<table border="1"><tr><th>AI Analysis</th></tr><tr><td>${aiAnalysis}</td></tr></table>`;
        } else {
            console.warn("Dropdown content not found in the document.");
        }
    }

    return aiAnalysis;
} catch (error) {
    console.error("Error sending request to AI API:", error);
    return "Failed to fetch AI analysis.";
}
}


/**
 * Generates a custom HTML report based on k6 JSON data and AI analysis.
 * @param {Object} jsonData - k6 JSON data.
 * @param {string} aiAnalysis - AI analysis result.
 * @param {string} reportPath - Path to save the HTML report.
 */
function generateCustomHtmlReport(jsonData, aiAnalysis, reportPath) {
    // Extract metrics from jsonData
    const metricsMapping = [
        { label: "Total HTTP Requests", key: "http_reqs", format: v => `${v.count} requests` },
        { label: "Request Rate (req/sec)", key: "http_reqs", format: v => `${v.rate} requests/sec` },
        { label: "Response Time (ms)", key: "http_req_duration", format: v => `Avg: ${v.avg}, Min: ${v.min}, Med: ${v.med ?? '-'}, Max: ${v.max}` },
        { label: "90th Percentile Response Time", key: "http_req_duration", format: v => `${v['p(90)']} ms` },
        { label: "95th Percentile Response Time", key: "http_req_duration", format: v => `${v['p(95)']} ms` },
        { label: "Wait Time (ms)", key: "http_req_waiting", format: v => `Avg: ${v.avg}, Min: ${v.min}, Med: ${v.med ?? '-'}, Max: ${v.max}` },
        { label: "90th Percentile Wait Time", key: "http_req_waiting", format: v => `${v['p(90)']} ms` },
        { label: "95th Percentile Wait Time", key: "http_req_waiting", format: v => `${v['p(95)']} ms` },
        { label: "Virtual Users (VUs)", key: "vus", format: v => `Current: ${v.value}, Min: ${v.min}, Max: ${v.max}` },
        { label: "Data Sent (bytes)", key: "data_sent", format: v => `Total: ${v.total}, Rate: ${v.rate} bytes/sec` },
        { label: "Data Received (bytes)", key: "data_received", format: v => `Total: ${v.total}, Rate: ${v.rate} bytes/sec` },
        { label: "Total Iterations", key: "iterations", format: v => `${v.count} iterations` },
        { label: "TLS Handshaking Time (ms)", key: "tls_handshaking", format: v => `Avg: ${v.avg}, Min: ${v.min}, Med: ${v.med ?? '-'}, Max: ${v.max}` },
        { label: "90th Percentile TLS Time", key: "tls_handshaking", format: v => `${v['p(90)']} ms` },
        { label: "95th Percentile TLS Time", key: "tls_handshaking", format: v => `${v['p(95)']} ms` },
        { label: "HTTP Request Failures", key: "http_req_failed", format: v => `Passes: ${v.passes}, Fails: ${v.fails}, Value: ${v.value}` },
        { label: "Checks Passed", key: "checks", format: v => `${v.passes} passes, ${v.fails} fails, Value: ${v.value}` },
        { label: "Iteration Duration (ms)", key: "iteration_duration", format: v => `Avg: ${v.avg}, Min: ${v.min}, Med: ${v.med ?? '-'}, Max: ${v.max}` },
        { label: "90th Percentile Iteration Time", key: "iteration_duration", format: v => `${v['p(90)']} ms` },
        { label: "95th Percentile Iteration Time", key: "iteration_duration", format: v => `${v['p(95)']} ms` },
        { label: "Receiving Time (ms)", key: "http_req_receiving", format: v => `Avg: ${v.avg}, Min: ${v.min}, Med: ${v.med ?? '-'}, Max: ${v.max}` },
        { label: "90th Percentile Receiving Time", key: "http_req_receiving", format: v => `${v['p(90)']} ms` },
        { label: "95th Percentile Receiving Time", key: "http_req_receiving", format: v => `${v['p(95)']} ms` },
        { label: "Blocked Time (ms)", key: "blocked_time", format: v => `Avg: ${v.avg}, Min: ${v.min}, Med: ${v.med ?? '-'}, Max: ${v.max}` },
        { label: "90th Percentile Blocked Time", key: "blocked_time", format: v => `${v['p(90)']} ms` },
        { label: "95th Percentile Blocked Time", key: "blocked_time", format: v => `${v['p(95)']} ms` },
        { label: "Max Virtual Users (VUs Max)", key: "vus_max", format: v => `${v.value} users` },
        { label: "Sending Time (ms)", key: "http_req_sending", format: v => `Avg: ${v.avg}, Min: ${v.min}, Med: ${v.med ?? '-'}, Max: ${v.max}` },
        { label: "90th Percentile Sending Time", key: "http_req_sending", format: v => `${v['p(90)']} ms` },
        { label: "95th Percentile Sending Time", key: "http_req_sending", format: v => `${v['p(95)']} ms` },
        { label: "Connecting Time (ms)", key: "http_req_connecting", format: v => `Avg: ${v.avg}, Min: ${v.min}, Med: ${v.med ?? '-'}, Max: ${v.max}` },
        { label: "90th Percentile Connecting Time", key: "http_req_connecting", format: v => `${v['p(90)']} ms` },
        { label: "95th Percentile Connecting Time", key: "http_req_connecting", format: v => `${v['p(95)']} ms` }
    ];

    const tableRows = metricsMapping.map(({ label, key, format }) => {
        const value = jsonData.metrics[key];
        return value ? `<tr><td>${label}</td><td>${format(value)}</td></tr>` : '';
    }).join('');

    const totalRequests = jsonData.metrics?.http_reqs?.count || 'N/A';
    const duration = jsonData.metrics?.http_req_duration?.avg?.toFixed(2) ?? 'N/A';
    const vus = jsonData.metrics?.vus?.value || 'N/A';
    const throughput = (totalRequests / (jsonData.metrics?.iteration_duration?.max / 1000)).toFixed(2);
    const iterations = jsonData.metrics?.iterations?.count || 'N/A';
    const errorRate = ((jsonData.metrics?.checks?.fails || 0) / totalRequests * 100).toFixed(2) + '%';

    // Calculate pass and fail counts
    const checks = jsonData.metrics?.checks;
    const passCount = checks ? checks.passes : 'N/A';
    const failCount = checks ? checks.fails : 'N/A';

    const aiAnalysisHtml = aiAnalysis.match(/<table[^>]*>[\s\S]*?<\/table>/)[0]; // Extract only the table content
const aiAnalysisTable = `
    <div class="ai-analysis-table">
        ${aiAnalysisHtml.trim()} <!-- Ensure no extra spaces -->
    </div>
`;

    // HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>k6 Performance Test Report</title>

    <style>
        body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }

        /* Dropdown Styling */
        .dropdown {
            position: relative;
            display: inline-block;
            margin-top: 20px;
            font-size: 12px; /* Consistent smaller font size */
        }

        /* Dropdown Header */
        .dropdown-header {
            background: #3498db;
            color: #fff;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            transition: background-color 0.3s;
        }

        .dropdown-header:hover {
            background: #2980b9;
        }

        .dropdown-header h2 {
            font-size: 12px;
            margin: 0;
            font-weight: normal;
        }

        .dropdown-header span {
            font-size: 10px;
            margin-left: 5px;
        }

        /* Dropdown Content */
        .dropdown-content {
            display: none;
            background: #fff;
            padding: 8px;
            border-radius: 6px;
            margin-top: 5px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
            .dropdown.show .dropdown-content {
    display: block;
}

       /* Ensure both dropdowns are aligned properly */
.dropdown-container {
    max-width: 100%; /* Allow it to expand */
    overflow: auto; /* Enable scrolling if needed */
}

/* Ensure dropdowns take full width */
.dropdown {
    width: 100%;
    margin-bottom: 10px; /* Adds spacing between dropdowns */
}


    </style>

    <style>
        /* General Styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333;
            transition: background-color 0.3s, color 0.3s;
        }

        h1 {
            text-align: center;
            color: #2c3e50;
            margin-top: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s, box-shadow 0.3s;
        }

        /* Summary Cards */
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: linear-gradient(135deg, #6a11cb, #2575fc);
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
            margin: 0;
            font-size: 24px;
        }

        .card p {
            margin: 10px 0 0;
            font-size: 18px;
        }



        /* Charts */
        .charts {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 30px;
        }

        .chart-container {
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            width: 48%;
        }

        canvas {
            width: 100% !important;
            height: auto !important;
        }

        /* Dark Mode Toggle */
        .dark-mode-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: #fff;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .dark-mode-toggle:hover {
            background: #2980b9;
        }

        /* Dark Mode Styles */
        body.dark-mode {
            background-color: #1e1e2f;
            color: #fff;
        }

        body.dark-mode .container {
            background: #2c3e50;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        body.dark-mode .card {
            background: linear-gradient(135deg, #8e2de2, #4a00e0);
        }

        body.dark-mode .dropdown-content {
            background: #34495e;
            color: #fff;
        }

        body.dark-mode .dropdown-content p {
            color: #fff;
        }

        body.dark-mode .chart-container {
            background: #34495e;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

    <!-- Dark Mode Toggle -->
    <button class="dark-mode-toggle" onclick="toggleDarkMode()">Toggle Dark Mode</button>

    <h1>k6 Performance Test Report</h1>

    <div class="container">
        <!-- Summary Cards -->
        <div class="summary-cards">
            <div class="card">
                <h2>Total Requests</h2>
                <p>${totalRequests}</p>
            </div>
            <div class="card">
                <h2>Time Duration</h2>
                <p>${duration}ms</p>
            </div>
            <div class="card">
                <h2>Virtual Users</h2>
                <p>${vus}</p>
            </div>
            <div class="card">
                <h2>Throughput</h2>
                <p>${throughput}ms</p>
            </div>
            <div class="card">
                <h2>Pass Count</h2>
                <p>${passCount}</p>
            </div>
            <div class="card">
                <h2>Fail Count</h2>
                <p>${failCount}</p>
            </div>
            <div class="card">
                <h2>Iterations</h2>
                <p>${iterations}</p>
            </div>
            <div class="card">
                <h2>Error Rate</h2>
                <p>${errorRate}</p>
            </div>
        </div>

        <!-- Charts (in parallel) -->
        <div class="charts">
            <!-- Chart for HTTP Request Duration -->
            <div class="chart-container">
                <h2>HTTP Request Duration</h2>
                <canvas id="httpReqDurationChart"></canvas>
            </div>

            <!-- Chart for Iteration Duration -->
            <div class="chart-container">
                <h2>Iteration Duration</h2>
                <canvas id="iterationDurationChart"></canvas>
            </div>
        </div>

   <div class="dropdown-container">
    <!-- Performance Metrics Dropdown -->
    <div class="dropdown">
        <div class="dropdown-header" onclick="toggleDropdown(this)">
            <h2>Performance Metrics</h2>
            <span>▼</span>
        </div>
        <div class="dropdown-content">
            <table>
                <thead>
                    <tr><th>Metric</th><th>Value/Statistics</th></tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    </div>

    <!-- AI Analysis Dropdown (Directly Below) -->
    <div class="dropdown">
        <div class="dropdown-header" onclick="toggleDropdown(this)">
            <h2>AI Analysis</h2>
            <span>▼</span>
        </div>
        <div class="dropdown-content">
            <p>${aiAnalysisTable}</p>
        </div>
    </div>
</div>


   

    <script>
        async function loadMetrics() {
            try {
                const response = await fetch('metrics.json'); // JSON file path
                const data = await response.json();
                const tableBody = document.querySelector("#metricsTable tbody");

                Object.entries(data.metrics).forEach(([key, value]) => {
                    const row = document.createElement("tr");
                    const metricCell = document.createElement("td");
                    const valueCell = document.createElement("td");

                    metricCell.textContent = key;
                    valueCell.textContent = JSON.stringify(value, null, 2);

                    row.appendChild(metricCell);
                    row.appendChild(valueCell);
                    tableBody.appendChild(row);
                });
            } catch (error) {
                console.error("Error loading metrics:", error);
            }
        }

        loadMetrics();
    </script>

    <script>
        // Sample JSON data passed from the function
        const jsonData = ${JSON.stringify(jsonData)};

        // Charts
        const httpReqDurationCtx = document.getElementById('httpReqDurationChart').getContext('2d');
        new Chart(httpReqDurationCtx, {
            type: 'bar',
            data: {
                labels: ['Min', 'Median', 'Average', 'Max', 'p90', 'p95'],
                datasets: [{
                    label: 'HTTP Request Duration (ms)',
                    data: [
    jsonData.metrics.http_req_duration.min,
    jsonData.metrics.http_req_duration.med,
    jsonData.metrics.http_req_duration.avg,
    jsonData.metrics.http_req_duration.max,
    jsonData.metrics.http_req_duration["p(90)"],
    jsonData.metrics.http_req_duration["p(95)"]
],

                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        const iterationDurationCtx = document.getElementById('iterationDurationChart').getContext('2d');
        new Chart(iterationDurationCtx, {
            type: 'line',
            data: {
                labels: ['Min', 'Median', 'Average', 'Max', 'p90', 'p95'],
                datasets: [{
                    label: 'Iteration Duration (ms)',
                    data: [
                        jsonData.metrics.iteration_duration.min,
                        jsonData.metrics.iteration_duration.med,
                        jsonData.metrics.iteration_duration.avg,
                        jsonData.metrics.iteration_duration.max,
                        jsonData.metrics.iteration_duration["p(90)"],
                        jsonData.metrics.iteration_duration["p(95)"]
                    ],
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Dropdown functionality
     function toggleDropdown(element) {
    // Find the closest dropdown and toggle 'show' class
    const dropdown = element.parentElement;
    dropdown.classList.toggle("show");
}


        // Dark Mode Toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        }

        // Persistent Dark Mode
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    </script>
</body>
</html>
    `;

    // Write the HTML content to the report file
    fs.writeFileSync(reportPath, htmlContent);

    console.log(`Custom HTML report with AI analysis generated: ${reportPath}`);
}

module.exports = { runPerformanceTest };
