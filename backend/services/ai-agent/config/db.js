import mongoose from "mongoose";

import dns from "dns";

// Node.js ko Google ke public DNS (8.8.8.8) ka use karne ko bolo
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("db connected ");
  } catch (error) {
    console.error(`db error: ${error.message}`);
  }
};

export default connectDB;
