import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";

import { proxyWithHeader } from "./utils/proxyWithHeader.js";

import { protect } from "./middleware/auth.middleware.js";
import { getCurrentUser } from "./controller/user.controller.js";
// Load Environment Variables
dotenv.config();

console.log("CHECK AUTH SERVICE URL:", process.env.AUTH_SERVICE);

const PORT = process.env.PORT || 8000;

const app = express();

// cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(cookieParser());

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// forword proxy setup
app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE, {
    proxyReqPathResolver: (req) => {
      return req.url;
    },
  }),
);
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE));

app.use(
  "/api/agent",
  protect,
  proxyWithHeader(process.env.AGENT_SERVICE, { raw: true }),
);

//get user
app.get("/api/me", protect, getCurrentUser);

// Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from Gateway!",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(` Gateway Server running on port: ${PORT}`);
});
