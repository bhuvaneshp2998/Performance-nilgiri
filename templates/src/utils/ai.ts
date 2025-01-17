
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = process.env.OPENAI_API_ENDPOINT;

if (!API_URL || !API_KEY) {
  throw new Error("Missing OpenAI API URL or API Key in the .env file.");
}

async function getGPTResponse(systemPrompt: string, userPrompt: string) {
  if (!API_URL || !API_KEY) {
    throw new Error("API URL or API Key is missing.");
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": API_KEY,
          "Region": "eastus2"
        }
      }
    );

    return response.data.choices[0].message.content.trim();

  } catch (error) {
    console.error("Error while calling OpenAI API:", error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export default getGPTResponse;