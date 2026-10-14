import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },

    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/bottts/svg?seed=default", // Default avatar URL
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
