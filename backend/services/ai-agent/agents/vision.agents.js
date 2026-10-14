import { getModel } from "../config/llmModels.js";
import axios from "axios";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
// import { deductCredits } from "../utils/deductCredits.js"; // Temporarily commented out
import { checkAgentLimit } from "../config/agentLimit.js";

export const visionAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "image");
    const llm = await getModel("image");

    // Transform the simple user prompt into a high-detail cinematic prompt
    const res = await llm.invoke(`
        You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt.

User Request:
${state.prompt}

        `);

    const prompt = res.content.trim();

    // Build the Pollinations AI image URL using the Flux model
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux`;

    // Fetch the image binary data from the API as an array buffer
    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // await deductCredits(state.userId, "vision"); // Commented out for testing response

    // Convert the binary response data into a Node.js Buffer
    const buffer = Buffer.from(imageRes.data);
    const filename = `image-${Date.now()}.png`;

    await uploadToS3(filename, buffer, "image/png");
    const downloadUrl = await getFromS3(filename, 24 * 60);

    return {
      ...state,
      aiResponse: `
![Generated Image](${downloadUrl})

📥 [Download Image](${downloadUrl})

⏳ Link expires in 10 minutes.`,
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: error?.data?.message || "failed to generate image",
    };
  }
};
