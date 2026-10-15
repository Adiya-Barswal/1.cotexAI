import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";

import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import { protect } from "./middleware/auth.middleware.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://127.0.0.1:8001";

const CHAT_SERVICE_URL =
  process.env.CHAT_SERVICE_URL || "http://127.0.0.1:8002";

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8003";

const app = express();

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

// Auth: /api/auth/login -> /login
app.use(
  "/api/auth",
  proxy(AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      const path = req.url.split("?")[0];
      const query = req.url.includes("?")
        ? `?${req.url.split("?").slice(1).join("?")}`
        : "";
      return `${path.startsWith("/") ? path : `/${path}`}${query}`;
    },
  }),
);

// Current user: /api/me -> /me
app.use(
  "/api/me",
  protect,
  proxy(AUTH_SERVICE_URL, {
    proxyReqPathResolver: () => "/me",
  }),
);

// Chat: /api/chat/get-conversations -> /get-conversations
app.use(
  "/api/chat",
  protect,
  proxyWithHeader(CHAT_SERVICE_URL, {
    keepFullPath: false,
  }),
);

// AI Agent: /api/agent/chat -> /chat
app.use(
  "/api/agent",
  protect,
  proxyWithHeader(AGENT_SERVICE_URL, {
    raw: true,
    keepFullPath: false,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from Gateway!",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Gateway running on port ${PORT}`);
});
