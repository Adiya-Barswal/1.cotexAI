import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import { redis } from "../../../shared/redis/redis.js";

export const agent = async (req, res, next) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const file = req.file;
    console.log("file", file);
    const userId = req.headers["x-user-id"];

    // 1. User message save
    try {
      await axios.post(`${process.env.CHAT_SERVICE}/api/chat/save-message`, {
        conversationId,
        role: "user",
        content: prompt,
        sender: userId,
      });
    } catch (chatErr) {
      console.log(
        "Warning: Failed to save user message to chat service:",
        chatErr.message,
      );
    }

    // 2. LangGraph invoke
    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
      file,
    });
    console.log("result", result);

    // 3. Memory mein add karna
    await addMessage(conversationId, "user", prompt);
    await addMessage(conversationId, "assistant", result?.aiResponse || "");

    // 4. Assistant message save
    try {
      await axios.post(`${process.env.CHAT_SERVICE}/api/chat/save-message`, {
        conversationId,
        role: "assistant",
        content: result?.aiResponse,
        images: result?.images,
        artifacts: result?.artifacts,
        sender: agent,
      });
    } catch (chatErr) {
      console.log(
        "Warning: Failed to save assistant message to chat service:",
        chatErr.message,
      );
    }

    return res.status(200).json({
      answer: result?.aiResponse || "No response received",
      images: result?.images || [],
      artifacts: result?.artifacts || [],
      model: result?.modelUsed,
    });
  } catch (error) {
    console.error("Agent Controller Error:", error.message);
    return res.status(500).json({ message: `Agent error: ${error.message}` });
  }
};
