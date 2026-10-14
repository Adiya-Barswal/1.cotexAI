import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { chatAgent } from "../agents/chat.agents.js";
import { searchAgent } from "../agents/search.agents.js";
import { codingAgent } from "../agents/coding.agents.js";
import { visionAgent } from "../agents/vision.agents.js";
import { pdfAgent } from "../agents/pdf.agents.js";
import { pptAgent } from "../agents/ppt.agents.js";

const workflow = new StateGraph(agentState);

// nodes
workflow.addNode("router", router);
workflow.addNode("chat", chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);
workflow.addNode("vision", visionAgent);

// start router se hoga
workflow.addEdge("__start__", "router");

// router ne jo agent chuna, usi node pe jao
workflow.addConditionalEdges(
  "router",
  (state) => {
    switch (state.agent) {
      case "chat":
        return "chat";
      case "search":
        return "search";
      case "coding":
        return "coding";
      case "pdf":
        return "pdf";
      case "ppt":
        return "ppt";
      case "vision":
        return "vision";
      default:
        return "chat";
    }
  },
  {
    chat: "chat",
    search: "search",
    coding: "coding",
    vision: "vision",
    pdf: "pdf",
    ppt: "ppt",
  },
);

// end connections
workflow.addEdge("search", "chat");
workflow.addEdge("chat", "__end__");
workflow.addEdge("coding", "__end__");
workflow.addEdge("vision", "__end__");
workflow.addEdge("pdf", "__end__");
// workflow.addEdge("ppt", "__end__");

export const graph = workflow.compile();
