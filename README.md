<p align="center">
  <img src="https://raw.githubusercontent.com/triconinfotech/nilgiri/main/files/nilgiri.PNG" alt="Nilgiri Logo" width="200"/>
</p>
<h1 align="center">Nilgiri Framework</h1>
<p align="center">
    <!-- NPM badges -->
    <a href="https://npmjs.com/package/create-nilgiriperformance">
        <img src="https://img.shields.io/npm/v/create-nilgiriperformance.svg" alt="npm version">
    </a>
    <a href="https://npmjs.com/package/create-nilgiriperformance">
        <img src="https://img.shields.io/npm/dm/create-nilgiriperformance.svg" alt="npm downloads">
    </a>
    <a href="https://github.com/animeshkumar29/nilgiri/blob/main/LICENSE.txt">
        <img src="https://img.shields.io/npm/l/create-nilgiriperformance.svg" alt="license">
    </a>
</p>

## nilgiri-performance : A Core Component of the Nilgiri Framework

This nilgiri-performance module integrates the power of the K6 performance testing framework with AI-driven insights to simplify and enhance performance testing. It provides an intuitive interface to configure key test parameters, such as the URL, virtual users (VUs), and test duration. Once the tests are executed, AI analyzes the results to generate comprehensive performance reports, enabling a deeper understanding of product efficiency and scalability. Perfect for teams aiming to automate and elevate their performance testing workflows.


<h1 align="center">How to Setup ?</h1>

Before we go to Setup Lets See what are the prerequisites 
### Prerequisites

1. **Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed.
2. **K6**: Make sure [K6](https://k6.io/docs/getting-started/installation/) is installed on your system.
3. **IDE**: This project is written in TypeScript, so you'll need to IDE Which Supports NodeJs, For Example : VScode , Intelli ,Etc.
4. **AI API Key and EndPoint**: This Project is AI-driven,Hence User are requested to get ready with AI API Auth Key and End Point .

## Setup : Install and Run

1.**Clone the repository to your local machine**:

   ```bash
   git clone https://github.com/triconinfotech/nilgiri-performance.git
   ```
2.**Navigate into the project directory**:

   ```bash
   cd nilgiri-performance
   ```

3.**Install Dependencies**:
   ```bash
   npm run dependencyInstall
   ```
4. **Configure API Credentials**
In the root directory of the project, create a .env file (if it doesn't already exist). Then, add your API URL and API Key as follows:

```bashF
API_URL=<your-api-url>
API_KEY=<your-api-key>
Replace <your-api-url> and <your-api-key> with your actual gpt-4o API URL and key.
```

<h1 align="center">How to Run the Application ?</h1>

**Running the Application**

After the setup, you can run the application by executing command

```bash
npm run code
``` 
<h1 align="center">How Report Looks like ?</h1>

* Please Add your Report Snippet in GIF format 

## Features

- Interactive CLI to define K6 test parameters
- Supports optional iterations, delays, and ramp-up stages
- Generates a dynamic K6 script (`test-script.js`)
- Runs the K6 test and exports the summary as `test-summary.json`
- Analyzes the K6 test summary and generates a report
- Uses AI to analyze performance metrics and generate insights

## Support 
* For any Support please feel free to drop your query at 
*   [nilgiri-performance GitHub repository](https://github.com/bhuvaneshp2998/Performance-nilgiri/issues).

Thank you for choosing nilgiri-performance as part of the Nilgiri framework for your Node.js utility needs!
<p align="center">
    Copyright (c) 2025 Tricon Infotech
</p>