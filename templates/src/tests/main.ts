import { exec } from 'child_process';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve));

(async function () {
  console.log("Welcome to the Dynamic K6 Performance Testing Tool!");

  const url: string = await ask("Enter the URL to test: ");
  const vus: string = await ask("Enter the number of Virtual Users (VUs): ");
  const duration: string = await ask("Enter the test duration (e.g., 30s, 1m): ");

  const iterationsRequired: string = await ask("Do you want to specify iterations? (yes/no): ");
  let iterationsSnippet = "";
  if (iterationsRequired.toLowerCase() === "yes") {
    const iterations: string = await ask("Enter the number of iterations per VU: ");
    iterationsSnippet = `
  for (let i = 0; i < ${iterations}; i++) {
    const res = http.get(url);
    __DELAY__;
  }`;
  } else {
    iterationsSnippet = "const res = http.get(url);";
  }

  const delayRequired: string = await ask("Do you want to add a delay between iterations? (yes/no): ");
  let delaySnippet = "";
  if (delayRequired.toLowerCase() === "yes") {
    const delayTime: string = await ask("Enter the delay time (e.g., 1s, 500ms): ");
    delaySnippet = `sleep(${parseFloat(delayTime.replace("s", ""))});`;
  }

  const rampUpRequired: string = await ask("Do you want to add ramp-up stages? (yes/no): ");
  let rampUpStages: { duration: string; target: string }[] | null = null;
  if (rampUpRequired.toLowerCase() === "yes") {
    const rampTime: string = await ask("Enter the ramp-up duration (e.g., 10s, 30s): ");
    const peakVus: string = await ask("Enter the peak number of Virtual Users (VUs): ");
    rampUpStages = [
      { duration: rampTime, target: peakVus },
      { duration, target: vus },
    ];
  }
  let k6Script = `import http from 'k6/http';
import { sleep } from 'k6';

`;
  if (rampUpStages) {
    k6Script += `
export const options = {
  stages: ${JSON.stringify(rampUpStages)},
};
`;
  } else {
    k6Script += `
export const options = {
  vus: ${vus},
  duration: '${duration}',
};
`;
  }

  k6Script += `
export default function () {
  const url = '${url}';
  ${iterationsSnippet.replace("__DELAY__", delaySnippet)}
};
`;

  fs.writeFileSync("test-script.js", k6Script);
  console.log("\nK6 script generated as `test-script.js`.");
  console.log("Running the test...\n");

 
  const command =`k6 run --summary-export=test-summary.json test-script.js`;
  const process = exec(command);


  if (process.stdout) {
    process.stdout.on("data", (data: string) => console.log(data.toString()));
  }

  if (process.stderr) {
    process.stderr.on("data", (data: string) => console.error(data.toString()));
  }

  process.on("close", (code: number) => {
    console.log(`K6 test completed with exit code ${code}`);
    console.log("AI Generating the report...");
    exec('npx ts-node src/utils/generateReport.ts', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running generateReport.ts: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log(`stdout: ${stdout}`);
      rl.close();
    });
  });
})();
