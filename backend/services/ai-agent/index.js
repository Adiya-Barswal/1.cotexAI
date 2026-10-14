import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import router from "./routes/agent.route.js";
import "../../shared/redis/redis.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;

// Middleware

app.use(express.json());
app.use(morgan("dev"));

// agent router middleware
app.use("/api/agent", router);

// Test Route for Chat Service
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from Ai agent",
  });
});

app.listen(PORT, () => {
  console.log(` Agent Service running on port: ${PORT}`);
  connectDB();
});
