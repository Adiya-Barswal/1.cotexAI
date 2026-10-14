import dotenv from "dotenv";
dotenv.config();
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
//import { ChatOpenRouter } from "@langchain/openrouter";

// groq ai model
const groq = new ChatGroq({
  model: "openai/gpt-oss-120b",
  maxTokens: 8000,
});

// gemini ai model
const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 8000,
});

// call getmodels for using agent
export const getModel = async (agent) => {
  switch (agent) {
    case "chat":
      return groq;
    case "search":
      return groq;
    case "router":
      return gemini;
    case "intent":
      return gemini;
    case "coding":
      return groq;
    case "imageAnalyzer":
      return gemini;
    case "pdf":
      return groq;

    default:
      return groq;
  }
};
