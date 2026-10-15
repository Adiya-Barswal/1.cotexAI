import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
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

// 1. Auth Service Proxy: /api/auth -> port 8001 (keepFullPath: false taaki /api/auth/login -> /login ban jaye)
app.use(
  "/api/auth",
  proxyWithHeader("http://127.0.0.1:8001", { keepFullPath: false }),
);

// 2. Me Route Proxy: /api/me -> port 8001
app.use(
  "/api/me",
  protect,
  proxyWithHeader("http://127.0.0.1:8001", { keepFullPath: true }),
);

// 3. Chat Service Proxy: /api/chat -> port 8002
app.use(
  "/api/chat",
  protect,
  proxyWithHeader("http://127.0.0.1:8002", { keepFullPath: true }),
);

// 4. AI Agent Service Proxy: /api/agent -> port 8003
app.use(
  "/api/agent",
  protect,
  proxyWithHeader("http://127.0.0.1:8003", { raw: true, keepFullPath: true }),
);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Hello from Gateway!" });
});

app.listen(PORT, () => {
  console.log(`Gateway Server running on port: ${PORT}`);
});
