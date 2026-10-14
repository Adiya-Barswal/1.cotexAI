import Conversation from "../models/conversation.model.js";

import Message from "../models/message.model.js";

// 1 Create Conversation Code
export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId);

    if (!userId) {
      return res.status(401).json({ message: "unauthorized: user id missing" });
    }

    const conversation = await Conversation.create({
      userId: userId,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `create conversation error ${error}` });
  }
};

// 2 Get Conversations Code
export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("Fetching conversations for userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "unauthorized: user id missing" });
    }

    const conversations = await Conversation.find({ userId }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get conversations error ${error}` });
  }
};

//  update Conversations Code
export const updateConversations = async (req, res) => {
  try {
    const { id, title } = req.body;

    const conversations = await Conversation.findByIdAndUpdate(
      id,
      { title },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `update conversations error ${error}` });
  }
};

// 3. Save Message
export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, sender, images, artifacts } =
      req.body;

    const message = await Message.create({
      conversationId,
      content,
      role,
      sender,
      images,
      artifacts,
    });

    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ message: `save message error ${error}` });
  }
};

// 4.Get Saved Messages Code
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({ message: `get messages error ${error}` });
  }
};
