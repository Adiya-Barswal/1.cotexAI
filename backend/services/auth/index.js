import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";

import "../../shared/redis/redis.js";

import connectDB from "./config/db.js";
import router from "./routes/auth.routes.js";

// Load Environment Variables (.env file se)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

//  Auth middleware
app.use("/", authRoutes);

//app.use("/api/auth", router);

// Auth Service test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from auth!",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(` Auth Service running on port: ${PORT}`);
  connectDB();
});
