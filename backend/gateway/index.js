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

// Forward Proxy Setup for Auth Service (Port 8001)
app.use(
  "/api/auth",
  proxy("http://127.0.0.1:8001", {
    proxyReqPathResolver: (req) => {
      // Strips /api/auth prefix and forwards the rest (e.g., /login)
      return req.url;
    },
  }),
);

// Proxy for /api/me -> Auth Service (Port 8001)
app.use(
  "/api/me",
  protect,
  proxy("http://127.0.0.1:8001", {
    proxyReqPathResolver: (req) => {
      // Directly forwards to /me on the auth service
      return "/me";
    },
  }),
);

// Proxy for Chat Service (Port 8002)
app.use("/api/chat", protect, proxyWithHeader("http://127.0.0.1:8002"));

// Proxy for AI Agent Service (Port 8003)
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
