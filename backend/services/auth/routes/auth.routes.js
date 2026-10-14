import express from "express";
import { login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// login route
router.post("/login", login);

//logout
router.get("/logout", logout);

export default router;
