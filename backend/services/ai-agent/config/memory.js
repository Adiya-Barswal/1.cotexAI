import { redis } from "../../../shared/redis/redis.js";
import { getMessages } from "../utils/getMessages.js";

export const getMemory = async (conversationId) => {
  try {
    const key = `messages-${conversationId}`;
    const cached = await redis.get(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed : [];
    }

    const messages = await getMessages(conversationId);
    const safeMessages = Array.isArray(messages) ? messages : [];
    await redis.set(key, JSON.stringify(safeMessages), "EX", 24 * 60 * 60);

    return safeMessages;
  } catch (error) {
    console.log("getMemory error:", error.message);
    return [];
  }
};

// add new message
export const addMessage = async (conversationId, role, content) => {
  const key = `messages-${conversationId}`;
  const rawMessages = await redis.get(key);
  let messages = [];
  if (rawMessages) {
    const parsed = JSON.parse(rawMessages);
    messages = Array.isArray(parsed) ? parsed : [];
  }

  messages.push({ role, content });

  if (messages.length > 20) {
    messages.shift();
  }

  await redis.set(key, JSON.stringify(messages));
};
