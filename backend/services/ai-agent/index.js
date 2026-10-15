import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import connectDB from "./config/db.js";
import router from "./routes/agent.route.js";
import "../../shared/redis/redis.js";

const app = express();
const PORT = process.env.PORT || 8003;

app.use(express.json());
app.use(morgan("dev"));

app.use("/", router);

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Agent Service is running!",
  });
});

app.listen(PORT, () => {
  console.log(`AI Agent Service running on port: ${PORT}`);
  connectDB();
});
