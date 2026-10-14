import { getModel } from "../config/llmModels.js";
import { generatePpt } from "../utils/generatePpt.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pptAgent = async (state) => {
  try {
    // Rate limit check
    await checkAgentLimit(state.userId, "ppt");

    // LLM model load karna
    const llm = await getModel("ppt");

    const prompt = `You are a professional presentation designer.

Return ONLY valid JSON.

Format:
{
"title":"",
"subtitle":"",
"slides":[
{
"title":"",
"points":[
"",
"",
"",
""
]
}
]
}

Rules:
- Generate exactly 6 content slides.
- Each slide should have 4-6 concise bullet points.
- No markdown formatting outside JSON.
- No explanation.
- Return ONLY JSON.

Topic:
${state.prompt}`;

    const res = await llm.invoke(prompt);
    let rawContent = res.content.trim();

    // REGEX FIX: Model ke text mein se sirf JSON object extract karna
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Model did not return valid JSON structure.");
    }

    const data = JSON.parse(jsonMatch[0]);

    // PPT buffer generate karna
    const ppt = await generatePpt(data);
    const buffer = await ppt.write({
      outputType: "nodebuffer",
    });

    const filename = `ppt-${Date.now()}.pptx`;

    await uploadToS3(
      filename,
      buffer,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );

    // S3 se 24 hours ka presigned link lena
    const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

    return {
      ...state,
      aiResponse: `# ✅ Presentation Generated

**${data.title}**

📥 [Download PPT](${downloadUrl})

_Link expires in 24 hours._`,
    };
  } catch (error) {
    console.log("PPT Agent Error:", error);
    return {
      ...state,
      aiResponse: "Failed to generate presentation. Please try again.",
    };
  }
};
