import { getModel } from "../config/llmModels.js";
import { generatePdf } from "../utils/generatePdf.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pdfAgent = async (state) => {
  try {
    // 1. Check the user's PDF agent limit
    await checkAgentLimit(state.userId, "pdf");

    // 2. Get the LLM model
    const llm = await getModel("pdf");

    // 3. Ask the model to generate structured PDF content
    const prompt = `
You are an expert document writer.

Return ONLY a valid JSON object.
Do not include Markdown code fences or explanations.

Use this structure:
{
  "title": "Document title",
  "subtitle": "Short description",
  "sections": [
    {
      "heading": "Section heading",
      "points": ["Point one", "Point two", "Point three"]
    }
  ]
}

Generate 4-8 sections.
Each section should have 3-6 concise points.

Topic: ${state.prompt}
`;

    // 4. Get the model response
    const res = await llm.invoke(prompt);
    const rawContent = String(res.content || "").trim();

    // 5. Remove Markdown code fences if present
    const cleanedContent = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // 6. Parse the JSON response
    const data = JSON.parse(cleanedContent);

    // 7. Validate the generated content
    if (
      !data ||
      typeof data.title !== "string" ||
      typeof data.subtitle !== "string" ||
      !Array.isArray(data.sections) ||
      !data.sections.every(
        (section) =>
          section &&
          typeof section.heading === "string" &&
          Array.isArray(section.points) &&
          section.points.every((point) => typeof point === "string"),
      )
    ) {
      throw new Error("Invalid PDF content returned by the model.");
    }

    // 8. Generate the PDF buffer
    const pdfBuffer = await generatePdf(data);

    // 9. Create a unique filename
    const filename = `pdf-${Date.now()}.pdf`;

    // 10. Upload the PDF to S3
    await uploadToS3(filename, pdfBuffer, "application/pdf");

    // 11. Generate a temporary download link
    const downloadUrl = await getFromS3(filename, 24 * 60);

    // 12. Return the result to LangGraph
    return {
      ...state,
      aiResponse: `# PDF Generated Successfully

**${data.title}**

📥 [Download PDF](${downloadUrl})

_Link expires in 24 hours._`,
    };
  } catch (error) {
    console.error("PDF Agent Error:", error);

    return {
      ...state,
      aiResponse:
        "Failed to generate PDF. Please try again with a clear topic.",
    };
  }
};
