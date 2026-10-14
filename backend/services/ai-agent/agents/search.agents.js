import { checkAgentLimit } from "../config/agentLimit.js";
import { searchTool } from "../config/tavily.js";
import { deductCredits } from "../utils/deductCredits.js";
export const searchAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "search");

    // State se prompt lekar Tavily search tool ko invoke kar rahe hain
    const results = await searchTool.invoke({
      query: state.prompt,
    });
    await deductCredits(state.userId, "search");
    console.log(results);
    return {
      ...state,
      searchResults: results,
      images: results.images,
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      searchResults: [],
      images: [],
      aiResponse: error?.data?.message || "failed to search",
    };
  }
};
