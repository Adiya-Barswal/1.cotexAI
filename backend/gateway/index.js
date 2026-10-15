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

// 1. Auth Service Proxy: /api/auth/login -> /login on port 8001
app.use(
  "/api/auth",
  proxy("http://127.0.0.1:8001", {
    proxyReqPathResolver: (req) => {
      // req.url me /login bachti hai, so it forwards to http://127.0.0.1:8001/login
      return req.url;
    },
  }),
);

// 2. Me Route Proxy: /api/me -> /me on port 8001
app.use(
  "/api/me",
  protect,
  proxy("http://127.0.0.1:8001", {
    proxyReqPathResolver: (req) => {
      // Forwards directly to http://127.0.0.1:8001/me
      return "/me";
    },
  }),
);

// 3. Chat Service Proxy: /api/chat
app.use(
  "/api/chat",
  protect,
  proxyWithHeader("http://127.0.0.1:8002", { keepFullPath: false }),
);

// 4. AI Agent Service Proxy: /api/agent
app.use(
  "/api/agent",
  protect,
  proxyWithHeader("http://127.0.0.1:8003", { raw: true, keepFullPath: false }),
);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Hello from Gateway!" });
});

app.listen(PORT, () => {
  console.log(`Gateway Server running on port: ${PORT}`);
});
