
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const axios = require('axios');

/**
 * Runs a k6 performance test dynamically, generates a JSON report, and then creates a custom HTML report based on it.
 * @param {Object} params - Parameters for the k6 test.
 * @param {string} params.url - URL to test.
 * @param {Object} params.options - k6 options (e.g., vus, duration, stages, thresholds, etc.).
 * @param {string} [params.reportPath] - Path to save the custom HTML report.
 * @param {Object} [params.aireport] - Optional API key and report path for generating reports.
 * @param {string} [params.detailedReportjson] - Path to save the detailed JSON report.
 */
async function runK6Test(params) {
    const { url, options, aireport, detailedReportjson } = params;

    if (!aireport || !aireport.reportPath) {
        console.error('Report path is not defined in aireport');
        return;
    }

    const reportPath = aireport.reportPath;
    const apiKey = aireport.apikey;

    // Convert options object to a string representation
    const optionsString = JSON.stringify(options, null, 4)
        .replace(/"(\w+)":/g, '$1:') // Remove quotes around keys
        .replace(/"/g, "'"); // Replace double quotes with single quotes for k6 compatibility

    // Generate k6 script as a string
    const k6Script = `import http from 'k6/http';
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

    // Prepare the k6 command arguments
    const k6Args = ['run', tempScriptPath];

    // Set the report path for JSON
    let jsonReportPath = path.resolve('temp_report.json');
    k6Args.push('--summary-export', jsonReportPath);

    // Run k6 with the generated script
    const result = spawnSync('k6', k6Args, {
        stdio: 'inherit', // Show output in the terminal
    });

    // Cleanup: Remove the temporary script file
    fs.unlinkSync(tempScriptPath);

    if (result.error) {
        console.error('Error running k6:', result.error);
        return;
    }

    // Read the JSON report
    const jsonData = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));

    // Save detailed JSON report if specified
    if (detailedReportjson) {
        fs.writeFileSync(detailedReportjson, JSON.stringify(jsonData, null, 2));
        console.log(`Detailed JSON report saved: ${detailedReportjson}`);
    }

    // Call the AI API for analysis
    try {
        const aiAnalysis = await getAIAnalysis(jsonData, apiKey);

        // Generate custom HTML report with AI analysis
        generateCustomHtmlReport(jsonData, aiAnalysis, reportPath);
    } catch (error) {
        console.error('Error during AI analysis:', error);
    }

    // Clean up the JSON report file
    fs.unlinkSync(jsonReportPath);
}

/**
 * Analyzes the k6 performance data using an AI API (e.g., OpenAI).
 * @param {Object} jsonData - k6 JSON data.
 * @param {string} apiKey - The API key for the AI service.
 * @returns {string} - The AI analysis result.
 */
async function getAIAnalysis(jsonData, apiKey) {

    console.log(jsonData)
    const tableRows = Object.keys(jsonData).map(key => {
        const value = jsonData[key];
        let recommendation, fixSuggestion, explanation;

        // Define recommendations, fixes, and explanations based on the metric
        switch (key) {
            case 'http_req_duration':
                recommendation = 'Optimize server-side processing, reduce database query times.';
                fixSuggestion = 'Implement caching strategies like Redis or Memcached.';
                explanation = 'The current request duration is reasonable but can be further reduced with optimizations. Server-side processing could be bottlenecking response times, while caching can reduce database load, making repeated requests faster.';
                break;
            case 'http_req_connecting':
                recommendation = 'Reduce DNS lookup times, use a CDN.';
                fixSuggestion = 'Enable HTTP/2 or QUIC protocols.';
                explanation = 'Connection time can be improved by reducing DNS resolution times, which can be achieved through caching or using a faster DNS provider. Additionally, using a Content Delivery Network (CDN) can distribute the load more effectively, reducing connection times.';
                break;
            case 'http_req_failed':
                recommendation = 'Investigate causes of failed requests.';
                fixSuggestion = 'Implement retry strategies or better error handling.';
                explanation = 'Although the error rate is relatively low, consistent failures, even with a small percentage, can affect user experience. Identifying the root cause, such as network reliability issues or server timeouts, and implementing retry mechanisms can improve reliability.';
                break;
            case 'http_req_blocked':
                recommendation = 'Optimize server\'s thread pool, reduce concurrent requests.';
                fixSuggestion = 'Implement request prioritization or connection pooling.';
                explanation = 'Blocked requests may indicate that the server\'s thread pool is overloaded, causing delays. Reducing concurrency or improving thread management can help reduce this delay. Request prioritization ensures critical tasks are processed first, while connection pooling can reduce connection overhead.';
                break;
            default:
                recommendation = 'Monitor and analyze this metric further.';
                fixSuggestion = 'Consider implementing optimizations based on detailed analysis.';
                explanation = 'This metric requires further investigation to determine the best course of action for optimization.';
                break;
        }

        return `
  <tr>
    <td>Performance Improvement</td>
    <td>${key}</td>
    <td>${value}</td>
    <td>${recommendation}</td>
    <td>${fixSuggestion}</td>
    <td>${explanation}</td>
  </tr>`;
    }).join('');

    const prompt = `
Analyze this data and provide a comprehensive performance report in a table format with the following sections:

1. **Recommendations for Improvement**:
   - Areas for improvement (e.g., request duration, connection times, error rates)
   - Suggested optimizations for each area with detailed explanations.

2. **Feedback on the Current Performance**:
   - Summary of the overall performance evaluation with more context.
   - Key metrics indicating potential issues (e.g., response time percentiles, error rates) and why they matter.

3. **Suggestions for Fixes**:
   - Specific recommendations for addressing the identified issues (e.g., scaling, retry strategies, server optimizations), including rationale behind each suggestion.

Please format the analysis and suggestions into a structured table with the following columns: **Category**, **Metric**, **Value**, **Recommendation**, **Fix/Suggestion**, **Explanation**.

Output the result in this HTML table format:

<table border="1">
  <tr>
    <th>Category</th>
    <th>Metric</th>
    <th>Value</th>
    <th>Recommendation</th>
    <th>Fix/Suggestion</th>
    <th>Explanation</th>
  </tr>
  ${tableRows}
</table>
`;


    const url = "https://veda-ai-openaiservice.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2023-03-15-preview";

    const aipayload = {
        messages: [
            { role: 'system', content: "You are expert in k6 perfromce tesing" },
            { role: 'user', content: prompt },
        ],
        temperature: 0.3,
    };

    const aiheaders = {
        "Content-Type": "application/json",
        "api-key": apiKey,
    };

    try {
        const response = await axios.post(url, aipayload, { headers: aiheaders });
        return response.data.choices[0].message.content.trim(); // Return the analysis result
    } catch (error) {
        console.error("Error sending request to GPT:", error);
        throw error;
    }
}

/**
 * Generates a custom HTML report based on the k6 JSON summary and AI analysis.
 * @param {Object} jsonData - k6 JSON data.
 * @param {string} aiAnalysis - AI analysis result.
 * @param {string} reportPath - Path to save the custom HTML report.
 */
function generateCustomHtmlReport(jsonData, aiAnalysis, reportPath) {
    // Extract metrics from jsonData
    const totalRequests = jsonData.metrics?.http_reqs?.count || 'N/A';
    const duration = jsonData.metrics?.http_req_duration?.avg?.toFixed(2) ?? 'N/A';
    const vus = jsonData.metrics?.vus?.value || 'N/A';
    const responseTimeAvg = jsonData.metrics?.http_req_duration?.avg?.toFixed(2) ?? 'N/A';


    // Calculate pass and fail counts
    const checks = jsonData.metrics?.checks;
    const passCount = checks ? checks.passes : 'N/A';
    const failCount = checks ? checks.fails : 'N/A';

    // HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>k6 Performance Test Report</title>
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

        /* Dropdown for AI Analysis */
        .dropdown {
            margin-bottom: 30px;
        }

        .dropdown-header {
            background: #3498db;
            color: #fff;
            padding: 15px;
            border-radius: 10px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color 0.3s;
        }

        .dropdown-header:hover {
            background: #2980b9;
        }

        .dropdown-content {
            display: none;
            background: #fff;
            padding: 15px;
            border-radius: 10px;
            margin-top: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .dropdown-content p {
            margin: 0;
            color: #555;
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
                <h2>Duration</h2>
                <p>${duration}ms</p>
            </div>
            <div class="card">
                <h2>Virtual Users</h2>
                <p>${vus}</p>
            </div>
            <div class="card">
                <h2>Avg Response Time</h2>
                <p>${responseTimeAvg}ms</p>
            </div>
            <div class="card">
                <h2>Pass Count</h2>
                <p>${passCount}</p>
            </div>
            <div class="card">
                <h2>Fail Count</h2>
                <p>${failCount}</p>
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

        <!-- Dropdown for AI Analysis -->
        <div class="dropdown">
            <div class="dropdown-header" onclick="toggleDropdown()">
                <h2>AI Analysis</h2>
                <span>▼</span>
            </div>
            <div class="dropdown-content">
                <p>${aiAnalysis}</p>
            </div>
        </div>
    </div>

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
                        jsonData.metrics.http_req_duration.p90,
                        jsonData.metrics.http_req_duration.p95
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
                        jsonData.metrics.iteration_duration.p90,
                        jsonData.metrics.iteration_duration.p95
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
        function toggleDropdown() {
            const content = document.querySelector('.dropdown-content');
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        }

        // Dark Mode Toggle
        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
        }
    </script>
</body>
</html>


    `;

    fs.writeFileSync(reportPath, htmlContent);
    console.log(`Custom HTML report with AI analysis generated: ${reportPath}`);
}

module.exports = { runK6Test };
