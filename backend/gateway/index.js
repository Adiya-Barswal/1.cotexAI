import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";

import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import { protect } from "./middleware/auth.middleware.js";

// Load Environment Variables
dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

// CORS setup for Production IP
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://32.236.225.26",
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- AUTH ROUTES (Supports both /api/auth and /auth) ---
const authProxy = proxy("http://127.0.0.1:8001", {
  proxyReqPathResolver: (req) => req.url,
});

app.use(["/api/auth", "/auth"], authProxy);

// --- ME ROUTES (Supports both /api/me and /me) ---
const meProxy = proxy("http://127.0.0.1:8001", {
  proxyReqPathResolver: (req) => "/me",
});

app.use(["/api/me", "/me"], protect, meProxy);

// --- CHAT ROUTES (Supports both /api/chat and /chat) ---
app.use(
  ["/api/chat", "/chat"],
  protect,
  proxyWithHeader("http://127.0.0.1:8002"),
);

// --- AI AGENT ROUTES (Supports both /api/agent and /agent) ---
app.use(
  ["/api/agent", "/agent"],
  protect,
  proxyWithHeader("http://127.0.0.1:8003", { raw: true }),
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from Gateway!",
  });
});

app.listen(PORT, () => {
  console.log(`Gateway Server running on port: ${PORT}`);
});
