import express from "express";
import {
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Login route
router.post("/login", login);

// Logout route
router.get("/logout", logout);

// Get current user route
router.get("/me", protect, getCurrentUser);

export default router;
