# nilgiri-performance

This tool helps in automating the generation and execution of K6 performance tests. It provides an interactive way to specify test parameters like the URL, number of virtual users (VUs), and test duration. After the test completes, it generates a summary and a performance report.

### Prerequisites

1. **Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed.
2. **K6**: Make sure [K6](https://k6.io/docs/getting-started/installation/) is installed on your system.
3. **TypeScript**: This project is written in TypeScript, so you'll need to install the required dependencies.

# Steps to Install and Run

1.**Clone the repository to your local machine**:

   ```bash
   git clone https://github.com/triconinfotech/nilgiri-performance.git

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

```bashe
API_URL=<your-api-url>
API_KEY=<your-api-key>
Replace <your-api-url> and <your-api-key> with your actual gpt-4o API URL and key.
```

5. **Compile TypeScript (If using TypeScript)**
If you're using TypeScript, you’ll need to compile the TypeScript files before running the application. Run the following command:

 ```bash
  npx tcs
   ```
This will compile the TypeScript code into JavaScript files that the application can execute.

**Running the Application**
After the setup, you can run the application by executing the compiled JavaScript file in the src/ folder:

```bash
ts-node src/tests/main.ts
```
or
```bash
npm run code
``` 

## Features

- Interactive CLI to define K6 test parameters
- Supports optional iterations, delays, and ramp-up stages
- Generates a dynamic K6 script (`test-script.js`)
- Runs the K6 test and exports the summary as `test-summary.json`
- Analyzes the K6 test summary and generates a report
- Uses AI to analyze performance metrics and generate insights

## File Structure
```bash
/project-root
│
├── /src
│   ├── /utils           # For utility files like report generation and AI-related logic
│   │   ├── AI.ts        # AI-related logic (e.g., analyzing summary.json and generating a report)
│   │   ├── AIprompts.ts # Store AI prompts (like system and user prompts)
│   │   └── generateReport.ts # Logic to generate report based on test-summary.json
│   │
│   ├── /tests
│   │   ├── main.ts      # Main entry point for generating K6 test script and running the test
│   │
├── package.json         # Package dependencies and scripts
└── tsconfig.json        # TypeScript configuration file
```