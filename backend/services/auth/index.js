import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import "../../shared/redis/redis.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from auth!",
  });
});

app.use("/", authRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Auth Service running on port: ${PORT}`);
  connectDB();
});
