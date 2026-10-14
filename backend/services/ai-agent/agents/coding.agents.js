import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModels.js";
import { injectImages } from "../utils/injectImages.js";
// billing service abhi bani nahi, isliye band hai
// import { deductCredits } from "../utils/deductCredits.js";

// double-escaped code (\\n, \\") ko asli code me badalta hai
const fixEscapes = (text = "") => {
  if (text.includes("\n") || !text.includes("\\n")) return text;

  return text
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

export const codingAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "coding");

    const intentLlm = await getModel("intent");
    const llm = await getModel("coding");

    // pehla AI call: user kya chahta hai
    const intentRes = await intentLlm.invoke(`
You are a strict intent classifier for a coding assistant.

Reply with EXACTLY ONE WORD from this list. Nothing else. No punctuation. No explanation.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

Rule: If the user asks to build, create, generate, or make a website/app/project, answer CODE_GENERATION.

User Request:
${state.prompt}
    `);

    const intent = intentRes.content.trim().toUpperCase();
    console.log("Detected intent:", intent);

    // naya project chahiye
    if (intent.includes("CODE_GENERATION")) {
      const prompt = `
You are CortexAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:

- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.
- Inside JSON strings, escape newlines as \\n exactly once. Do not double-escape.

IMAGES
=========================

Never write real image URLs. For every photo use the placeholder [[img:keyword]]
where keyword is 1-2 simple English words describing the photo.
Examples: <img src="[[img:pizza]]">, <img src="[[img:burger]]">,
background: url('[[img:restaurant interior]]')
Use a different keyword for each image.
For logos use text, emoji or inline SVG, never an image.

MESSAGE
=========================

The "message" field is a short friendly explanation shown in chat, like ChatGPT/Claude.

- Write it in the same language as the user's request.
- Use Markdown, 4 to 8 lines max.
- Say what you built, list the files and what each does, and mention 2-3 key features.
- Do NOT put any code inside the message.
- End with one line offering to make changes.

Return ONLY valid JSON.

Schema:

{
  "message":"short markdown explanation",
  "files":[
    { "name":"index.html", "content":"..." },
    { "name":"style.css", "content":"..." },
    { "name":"script.js", "content":"..." }
  ]
}

Rules:

- Output must start with {
- Output must end with }
- No markdown outside the JSON
- No extra text outside the JSON
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}
      `;

      const res = await llm.invoke(prompt);

      // ```json wrapper hata ke parse karo
      const cleaned = res.content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const data = JSON.parse(cleaned);

      // escape theek karo
      const cleanedFiles = (data.files || []).map((f) => ({
        ...f,
        content: fixEscapes(f.content),
      }));

      // [[img:keyword]] ko asli image URL se badlo
      const files = await injectImages(cleanedFiles);

      // chat me dikhne wala explanation
      const message =
        fixEscapes(data.message || "").trim() ||
        "Maine aapka project bana diya hai. Right side panel me code aur preview dekh sakte ho.";

      // await deductCredits(state.userId, "coding");

      return {
        ...state,
        aiResponse: message,
        artifacts: [
          {
            id: Date.now(),
            type: "Project",
            files: files,
            title: state.prompt,
          },
        ],
      };
    }

    // review/explain/debug waghera: sirf markdown jawab
    const res = await llm.invoke(`
The user's request is:

${intent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

User Request:

${state.prompt}
    `);

    // await deductCredits(state.userId, "coding");

    return {
      ...state,
      aiResponse: res.content,
      artifacts: [],
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: error?.data?.message || "failed to generate code",
      artifacts: [],
    };
  }
};
