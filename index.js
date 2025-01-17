#!/usr/bin/env node
const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); // Load environment variables at the start

// Create the readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function checkAndCreateEnv() {
  const envFilePath = path.join(__dirname, '.env');

  if (!fs.existsSync(envFilePath)) {
    console.log('.env file not found. Please provide the following details to create it:');
    const apiKey = await ask('Enter your OPENAI_API_KEY: ');
    const apiUrl = await ask('Enter your OPENAI_API_ENDPOINT: ');

    fs.writeFileSync(envFilePath, `OPENAI_API_KEY=${apiKey}\nOPENAI_API_ENDPOINT=${apiUrl}\n`);
    console.log('.env file created with your credentials!');

    // Reload the environment variables after creating the .env file
    require('dotenv').config(); // Ensure we reload the .env file after it's created
  } else {
    console.log('.env file found. Proceeding with execution...');
  }
}

// Main function
(async function () {
  // First, ensure the .env file exists
  await checkAndCreateEnv();

  // Function to get GPT response using OpenAI API
  async function getGPTResponse(systemPrompt, userPrompt) {

    try {
      const response = await axios.post(
        API_URL,
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': API_KEY,
            'Region': 'eastus2',
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error while calling OpenAI API:', error.message || 'Unknown error');
      throw error;
    }
  }

  // AI prompt configuration
  const Prompts = {
    system: `You are an expert in performance testing.`,
    user: {
      performance: (input) => `
        Please analyze the following performance test summary and generate a detailed report:

        Here is the summary of the performance test:
        ${JSON.stringify(input, null, 2)}

        Please provide insights, identify any performance issues, and suggest improvements based on the data above.
      `,
    },
  };

  // Function to generate report
  async function generateReport(metrics) {

    console.log('AI is Generating Report...');
    try {
      const systemPrompt = Prompts.system;
      const userPrompt = Prompts.user.performance(metrics);
      const report = await getGPTResponse(systemPrompt, userPrompt);

      console.log('Generated Report:\n', report);

      const outputFilePath = path.resolve(__dirname, 'test-report.txt');
      fs.writeFileSync(outputFilePath, report, 'utf-8');
      console.log(`Report saved to: ${outputFilePath}`);
    } catch (error) {
      console.error('Error generating the report:', error);
    }
  }

  console.log('Welcome to the Dynamic K6 Performance Testing Tool!');

  const url = await ask('Enter the URL to test: ');
  const vus = await ask('Enter the number of Virtual Users (VUs): ');
  const duration = await ask('Enter the test duration (e.g., 30s, 1m): ');

  const iterationsRequired = await ask('Do you want to specify iterations? (yes/no): ');
  let iterationsSnippet = '';
  if (iterationsRequired.toLowerCase() === 'yes') {
    const iterations = await ask('Enter the number of iterations per VU: ');
    iterationsSnippet = `for (let i = 0; i < ${iterations}; i++) { const res = http.get(url); }`;
  } else {
    iterationsSnippet = 'const res = http.get(url);';
  }

  let k6Script = `import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: ${vus},
  duration: '${duration}',
};

export default function () {
  const url = '${url}';
  ${iterationsSnippet}
};`;

  fs.writeFileSync('test-script.js', k6Script);
  console.log('\nK6 script generated as `test-script.js`.');
  console.log('Running the Performance test...\n');

  const runTestCommand = 'k6 run --summary-export=./test-summary.json test-script.js';

  exec(runTestCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running K6 test: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(stdout);
    console.log('\nTest completed ....\n');

    // After the test is completed, check if the summary file exists before reading it
    const summaryPath = path.resolve(__dirname, 'test-summary.json');
    
    if (fs.existsSync(summaryPath)) {
      const jsonData = fs.readFileSync(summaryPath, 'utf-8');
      const metrics = JSON.parse(jsonData);

      // Generate the report using AI
      generateReport(metrics);
    } else {
      console.error('Error: test-summary.json not found.');
    }

    rl.close();
  });
})();
