import express from "express";
import {
  createConversation,
  getConversations,
  updateConversations,
  saveMessage,
  getMessages,
} from "../controllers/chat.controller.js";

const router = express.Router();

//  Create a new conversation
router.post("/create-conversation", createConversation);

//  Get all conversations of a user
router.get("/get-conversations", getConversations);

//  Update conversation title
router.post("/update-conversation", updateConversations);

//  Save a new message
router.post("/save-message", saveMessage);

//  Get all messages for a specific conversation
router.get("/get-messages/:conversationId", getMessages);

export default router;
