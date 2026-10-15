import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY missing from ai-agent/.env");
}

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY missing from ai-agent/.env");
}

const groq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  maxTokens: 8000,
});

const gemini = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  maxOutputTokens: 8000,
});

export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
    case "search":
    case "coding":
    case "pdf":
      return groq;

    case "router":
    case "intent":
    case "imageAnalyzer":
      return gemini;

    default:
      return groq;
  }
};
