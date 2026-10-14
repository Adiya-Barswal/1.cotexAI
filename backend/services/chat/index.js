import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import chatRoutes from "./routes/chat.route.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// chat middleware

app.use("/api/chat", chatRoutes);

// Test Route for Chat Service
app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat Service is running successfully on port 8002!",
  });
});

app.listen(PORT, () => {
  console.log(` Chat Service running on port: ${PORT}`);
  connectDB();
});
