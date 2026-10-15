```js
import express from "express";
import {
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getCurrentUser);

export default router;
```;
