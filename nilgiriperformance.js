

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * Executes a fully dynamic K6 performance test with support for:
 * - Single-request load tests
 * - Multi-group test scenarios
 * - Dynamic payload formats (JSON, form-data, binary)
 * - Automatic HTML and JSON report generation
 * - Detailed tagging and request-level configuration
 * - Automatic temporary script generation and cleanup
 *
 * ---
 * ##  **Overview**
 * This method automates the complete performance testing workflow using K6.
 * It dynamically builds a K6 script from the provided parameters, executes it
 * through the system's K6 binary, generates reports, validates URLs, ensures
 * directory structures exist, and cleans up temporary files.
 *
 * ---
 * ##  **Execution Flow**
 * 1. **Validate input configuration**
 *    - Ensures `request` OR `groups` is provided
 *    - Verifies all URLs exist in every group
 * 2. **Generate dynamic K6 script**
 *    - Handles JSON, raw JSON string, form-data, binary payloads
 *    - Injects headers, cookies, params, tags, checks, thinkTime
 * 3. **Run K6 using spawnSync**
 *    - Automatically locates K6 binary (supports Windows, Mac, Linux)
 *    - Executes k6 with `--summary-export`
 * 4. **Generate optional reports**
 *    - Saves JSON summary if `detailedReportjson` is provided
 *    - Generates HTML report through k6-summary bundle
 * 5. **Return parsed JSON results**
 * 6. **Clean up temporary script & report files**
 *
 * ---
 * ##  **Temporary Files Created**
 * - `temp_k6_script.js` → generated K6 script
 * - `temp_report.json` → raw K6 summary (before exporting)
 *
 * These are automatically deleted after execution.
 *
 * ---
 * ## **Notes**
 * - K6 must be installed on the machine.
 * - Report directories are auto-created if missing.
 * - Group mode overrides single-request mode.
 *
 * ---
 * @param {Object} params - Main configuration object
 *
 * ### 🔹 **High-Level Configuration**
 * @param {string} [params.scenarioName='PerformanceTest']
 *      Name assigned to the generated scenario.
 *
 * @param {Object} [params.request=null]
 *      Single-request configuration. Ignored when `groups` is provided.
 *
 * @param {Object} params.options
 *      K6 load options (vus, stages, thresholds, duration, etc.)
 *
 * @param {string|null} [params.detailedReportjson=null]
 *      File path where full JSON summary should be saved.
 *
 * @param {string|null} [params.htmlReport=null]
 *      File path where HTML summary should be saved.  
 *      Defaults to: `reports/summary.html`
 *
 * @param {string} [params.checks='']
 *      Custom K6 check() expression (e.g., `'status is 200': (r) => r.status === 200`)
 *
 * @param {number} [params.thinkTime=1]
 *      Time to sleep after each iteration (in seconds)
 *
 * @param {Object|null} [params.groups=null]
 *      Multi-group test configuration:
 *      ```js
 *      groups: {
 *         "Login Flow": [
 *             { url: "...", method: "POST", body: {...}, checks: "...", tags: {...} },
 *             { url: "...", method: "GET" }
 *         ],
 *         "Search Flow": { url: "...", method: "GET" }
 *      }
 *      ```
 *
 * @param {Object} [params.tags={}]
 *      Global tags applied to every request.
 *
 * ---
 * ### 🔹 **Request Object (Single or Group Mode)**
 *
 * @param {string} request.url  
 *      Request URL.
 *
 * @param {string} [request.method='GET']  
 *      GET, POST, PUT, DELETE, PATCH.
 *
 * @param {Object} [request.body]  
 *      JSON payload → automatically stringified.
 *
 * @param {string} [request.json]  
 *      Raw JSON text payload.
 *
 * @param {Object} [request.formData]  
 *      Form URL-encoded payload.
 *
 * @param {Buffer} [request.binary]  
 *      Raw binary payload (base64 encoded in script).
 *
 * @param {Object} [request.headers]  
 *      Custom HTTP headers.
 *
 * @param {Object} [request.params]  
 *      Query params.
 *
 * @param {Object} [request.cookies]  
 *      Cookies object.
 *
 * @param {string} [request.timeout]  
 *      Timeout for K6 (e.g., `"30s"`).
 *
 * @param {Object} [request.tags]  
 *      Extra tags applied only to this request.
 *
 * @param {number} [request.thinkTime]  
 *      Overrides global thinkTime.
 *
 * ---
 * ## **Return Value**
 * @returns {Promise<Object>}
 * Resolves with parsed JSON metrics exported from K6.
 *
 * Example returned structure includes:
 * - Metrics
 * - Request duration
 * - Checks results
 * - HTTP codes
 * - Group summaries
 *
 * ---
 * ##  **Examples**
 *
 * ### ✔ Single Request Example
 * ```js
 * await runPerformanceTest({
 *   request: {
 *     url: "https://api.example.com",
 *     method: "GET",
 *     headers: { Authorization: "Bearer token" }
 *   },
 *   options: { vus: 10, duration: "30s" }
 * });
 * ```
 *
 * ### ✔ Group Test Example
 * ```js
 * await runPerformanceTest({
 *   groups: {
 *     "Auth Flow": [
 *       { url: "https://api/login", method: "POST", body: {...} },
 *       { url: "https://api/session", method: "GET" }
 *     ],
 *     "Profile": {
 *       url: "https://api/profile",
 *       method: "GET"
 *     }
 *   },
 *   options: {
 *     stages: [
 *       { duration: "30s", target: 50 },
 *       { duration: "1m", target: 100 }
 *     ]
 *   },
 *   htmlReport: "reports/myTest.html",
 *   detailedReportjson: "reports/raw.json"
 * });
 * ```
 *
 * ---
 * ## Errors Thrown
 * - Missing request OR group configuration
 * - Missing URL in request/group
 * - K6 binary not found
 * - K6 execution failed
 * - Reports could not be generated
 * - JSON export missing
 */

async function runPerformanceTest(params) {
    try {
        const { 
            scenarioName = 'PerformanceTest',
            request = null, 
            options, 
            detailedReportjson = null,
            htmlReport = null,
            checks = '',
            thinkTime = 1,
            groups = null,
            tags = {}
        } = params;

        if (!request && !groups) {
            throw new Error('Missing required configuration: request or groups');
        }

        if (request && !request.url) {
            throw new Error('Missing URL in request configuration');
        }

        if (groups) {
            validateGroups(groups);
        }

        if (detailedReportjson) {
            const jsonReportDir = path.dirname(detailedReportjson);
            if (!fs.existsSync(jsonReportDir)) {
                fs.mkdirSync(jsonReportDir, { recursive: true });
            }
        }

        const k6Script = generateK6Script(params);
        const tempScriptPath = path.join(__dirname, 'temp_k6_script.js');
        const jsonReportPath = path.join(__dirname, 'temp_report.json');
        
        fs.writeFileSync(tempScriptPath, k6Script);

        const k6Path = getK6Path();
        
        const result = spawnSync(k6Path, 
            ['run', tempScriptPath, '--summary-export', jsonReportPath], 
            { stdio: 'inherit' }
        );

        if (result.error) {
            throw result.error;
        }

        if (!fs.existsSync(jsonReportPath)) {
            throw new Error('k6 did not generate results');
        }

        const jsonData = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));

        if (detailedReportjson) {
            fs.writeFileSync(detailedReportjson, JSON.stringify(jsonData, null, 2));
            console.log(`JSON report saved: ${detailedReportjson}`);
        }

        const actualHtmlReportPath = htmlReport || 'reports/summary.html';
        if (fs.existsSync(actualHtmlReportPath)) {
            console.log(`HTML report saved: ${actualHtmlReportPath}`);
        }

        return jsonData;
    } catch (error) {
        console.error('Performance test failed:', error.message);
        throw error;
    } finally {
        cleanupTempFiles();
    }
}

function validateGroups(groups) {
    for (const [groupName, groupRequests] of Object.entries(groups)) {
        if (Array.isArray(groupRequests)) {
            groupRequests.forEach((req, index) => {
                if (!req || !req.url) {
                    throw new Error(`Missing URL in group '${groupName}', request ${index + 1}`);
                }
            });
        } else {
            if (!groupRequests || !groupRequests.url) {
                throw new Error(`Missing URL in group '${groupName}'`);
            }
        }
    }
}

function generateK6Script(params) {
    const htmlReportPath = params.htmlReport || 'reports/summary.html';
    const detailedReportPath = params.detailedReportjson;
    
    const htmlReportDir = path.dirname(htmlReportPath);
    if (!fs.existsSync(htmlReportDir)) {
        fs.mkdirSync(htmlReportDir, { recursive: true });
    }
    
    if (detailedReportPath) {
        const jsonReportDir = path.dirname(detailedReportPath);
        if (!fs.existsSync(jsonReportDir)) {
            fs.mkdirSync(jsonReportDir, { recursive: true });
        }
    }

    if (params.groups) {
        return generateGroupK6Script(params);
    } else {
        return generateSingleK6Script(params);
    }
}

function generateSingleK6Script(params) {
    const htmlReportPath = params.htmlReport || 'reports/summary.html';
    const checksCode = params.checks ? 
        `check(response, { ${params.checks} });` :
        `check(response, { 'status was 2xx': (r) => r.status >= 200 && r.status < 300 });`;
    
    return `
import http from 'k6/http';
${params.request && params.request.binary ? "import { b64decode } from 'k6/encoding';" : ''}
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const options = ${JSON.stringify(params.options, null, 4)};

export default function() {
    ${generateSingleRequestCode(params.request, params.tags, checksCode)}
    
    sleep(${params.thinkTime});
}

export function handleSummary(data) {
    return {
        '${htmlReportPath}': htmlReport(data),
        'stdout': textSummary(data, { indent: ' ', enableColors: true })
    };
}
`.trim();
}

function generateGroupK6Script(params) {
    const htmlReportPath = params.htmlReport || 'reports/summary.html';
    
    const groupsCode = Object.entries(params.groups).map(([groupName, groupRequests]) => {
        let requestsCode;
        
        if (Array.isArray(groupRequests)) {
            requestsCode = groupRequests.map((req, index) => {
                const checks = req.checks || `'status was 2xx': (r) => r.status >= 200 && r.status < 300`;
                return generateRequestInGroupCode(req, params.tags, checks, index);
            }).join('\n');
        } else {
            const checks = groupRequests.checks || `'status was 2xx': (r) => r.status >= 200 && r.status < 300`;
            requestsCode = generateRequestInGroupCode(groupRequests, params.tags, checks, 0);
        }
        
        return `
    group('${groupName}', function() {
${requestsCode}
    });`;
    }).join('\n');

    return `
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const options = ${JSON.stringify(params.options, null, 4)};

export default function() {
${groupsCode}
    sleep(${params.thinkTime});
}

export function handleSummary(data) {
    return {
        '${htmlReportPath}': htmlReport(data),
        'stdout': textSummary(data, { indent: ' ', enableColors: true })
    };
}
`.trim();
}

function generateRequestInGroupCode(request, globalTags = {}, checks = '', index = 0) {
    let payloadCode = 'null';
    let contentType = request.headers?.['Content-Type'];
    
    if (request.body) {
        payloadCode = `JSON.stringify(${JSON.stringify(request.body)})`;
        contentType = contentType || 'application/json';
    } else if (request.json) {
        payloadCode = `'${request.json.replace(/'/g, "\\'")}'`;
        contentType = contentType || 'application/json';
    } else if (request.formData) {
        payloadCode = `'${new URLSearchParams(request.formData).toString()}'`;
        contentType = contentType || 'application/x-www-form-urlencoded';
    } else if (request.binary) {
        payloadCode = `b64decode('${request.binary.toString('base64')}')`;
        contentType = contentType || 'application/octet-stream';
    }

    const headers = {
        ...(contentType ? { 'Content-Type': contentType } : {}),
        ...(request.headers || {})
    };

    const requestTags = {
        ...globalTags,
        ...(request.tags || {}),
        name: request.name || `request_${index}`,
        method: request.method || 'GET'
    };

    const resVar = `res${index}`;

    return `
        let ${resVar} = http.${request.method?.toLowerCase() || 'get'}(
            '${request.url}',
            ${payloadCode},
            {
                headers: ${JSON.stringify(headers)},
                ${request.params ? `params: ${JSON.stringify(request.params)},` : ''}
                ${request.cookies ? `cookies: ${JSON.stringify(request.cookies)},` : ''}
                ${request.timeout ? `timeout: '${request.timeout}',` : ''}
                tags: ${JSON.stringify(requestTags)}
            }
        );
        
        check(${resVar}, { ${checks} });
        ${request.thinkTime ? `sleep(${request.thinkTime});` : ''}`;
}

function generateSingleRequestCode(request, globalTags = {}, checksCode = '') {
    let payloadCode = 'null';
    let contentType = request.headers?.['Content-Type'];
    
    if (request.body) {
        payloadCode = `JSON.stringify(${JSON.stringify(request.body)})`;
        contentType = contentType || 'application/json';
    } else if (request.json) {
        payloadCode = `'${request.json.replace(/'/g, "\\'")}'`;
        contentType = contentType || 'application/json';
    } else if (request.formData) {
        payloadCode = `'${new URLSearchParams(request.formData).toString()}'`;
        contentType = contentType || 'application/x-www-form-urlencoded';
    } else if (request.binary) {
        payloadCode = `b64decode('${request.binary.toString('base64')}')`;
        contentType = contentType || 'application/octet-stream';
    }

    const headers = {
        ...(contentType ? { 'Content-Type': contentType } : {}),
        ...(request.headers || {})
    };

    const requestTags = {
        ...globalTags,
        ...(request.tags || {}),
        name: request.name || 'request',
        method: request.method || 'GET'
    };

    return `
    let response = http.${request.method?.toLowerCase() || 'get'}(
        '${request.url}',
        ${payloadCode},
        {
            headers: ${JSON.stringify(headers)},
            ${request.params ? `params: ${JSON.stringify(request.params)},` : ''}
            ${request.cookies ? `cookies: ${JSON.stringify(request.cookies)},` : ''}
            ${request.timeout ? `timeout: '${request.timeout}',` : ''}
            tags: ${JSON.stringify(requestTags)}
        }
    );
    
    ${checksCode}
    ${request.thinkTime ? `sleep(${request.thinkTime});` : ''}`;
}

function getK6Path() {
    const platforms = {
        win32: 'C:\\Program Files\\k6\\k6.exe',
        darwin: '/usr/local/bin/k6',
        linux: '/usr/bin/k6'
    };

    const k6Path = platforms[process.platform] || 'k6';
    
    if (fs.existsSync(k6Path)) {
        return k6Path;
    }

    const check = process.platform === 'win32' 
        ? spawnSync('where', ['k6'])
        : spawnSync('which', ['k6']);
    
    if (check.status === 0) {
        return 'k6';
    }

    throw new Error('k6 not found. Please install k6 from https://k6.io/docs/getting-started/installation/');
}

function cleanupTempFiles() {
    const tempFiles = [
        path.join(__dirname, 'temp_k6_script.js'),
        path.join(__dirname, 'temp_report.json')
    ];
    
    tempFiles.forEach(file => {
        try {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        } catch (error) {
            // Silent fail
        }
    });
}

module.exports = { runPerformanceTest };