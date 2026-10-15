import express from "express";
import {
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);
router.get("/me", getCurrentUser);

export default router;
