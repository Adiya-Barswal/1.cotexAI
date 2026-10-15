import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import chatRoutes from "./routes/chat.route.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://32.236.225.26",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Gateway prefix strip karta hai, isliye routes root par mount hain.
app.use("/", chatRoutes);

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat Service is running successfully!",
  });
});

app.listen(PORT, () => {
  console.log(`Chat Service running on port: ${PORT}`);
  connectDB();
});
