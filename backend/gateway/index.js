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

// 1. Auth Service Proxy: Strips /api/auth so /api/auth/login becomes /login on port 8001
app.use(
  "/api/auth",
  proxy("http://127.0.0.1:8001", {
    proxyReqPathResolver: (req) => {
      // req.url contains everything after /api/auth (e.g., /login, /register)
      return req.url;
    },
  }),
);

// 2. Me Route Proxy: Rewrites /api/me to /me on auth service (port 8001)
app.use(
  "/api/me",
  protect,
  proxy("http://127.0.0.1:8001", {
    proxyReqPathResolver: (req) => {
      return "/me";
    },
  }),
);

// 3. Chat Service Proxy (Port 8002)
app.use("/api/chat", protect, proxyWithHeader("http://127.0.0.1:8002"));

// 4. AI Agent Service Proxy (Port 8003)
app.use(
  "/api/agent",
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
