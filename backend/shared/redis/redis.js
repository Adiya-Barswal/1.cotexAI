import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Centralized Redis Client setup for all microservices
const redis = new Redis(
  process.env.REDIS_URL || {
    host: "127.0.0.1",
    port: 6379,
  },
);

redis.on("connect", () => {
  console.log("Connected to Shared Redis successfully!");
});

redis.on("error", (err) => {
  console.error("Shared Redis connection error:", err);
});

export default redis;
