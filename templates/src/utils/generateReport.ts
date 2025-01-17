import fs from "fs";
import path from "path";
import getGPTResponse from "./AI";
import Prompts from "./AIprompt";

async function generateReport() {
  try {
    const filePath = path.join(__dirname, '../..', 'test-summary.json');
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const metrics = JSON.parse(jsonData);
    const systemPrompt = Prompts.system;
    const userPrompt = Prompts.user.performance(metrics);
    const report = await getGPTResponse(systemPrompt, userPrompt);


    console.log("Generated Report:\n", report);

    const outputFilePath = path.resolve(__dirname, "test-report.txt");
    fs.writeFileSync(outputFilePath, report, "utf-8");
    console.log(`Report saved to: ${outputFilePath}`);
  } catch (error) {
    console.error("Error generating the report:", error);
  }
}

generateReport();
