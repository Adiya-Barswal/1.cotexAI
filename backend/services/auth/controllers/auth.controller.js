import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import { redis } from "../../../shared/redis/redis.js";
import { json } from "stream/consumers";

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }

    // 1. Firebase Token Verify
    const decoded = await getAuth(app).verifyIdToken(token);

    // 2. Find or Create User
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || "User",
        avatar: decoded.picture || "",
      });
    }

    // 3. genarate Unique Session ID from crypto
    const sessionId = crypto.randomUUID();

    // set session id for 7 days in redis
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    // 4. 7-Day Session Cookie Set
    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. User Response
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: `login error ${error}` });
  }
};

// Logout

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (sessionId) {
      await redis.del(`session:${sessionId}`);
    }

    //  Client browser se session cookie clear karna
    res.clearCookie("session", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: `login error ${error}` });
  }
};
