import { cert, initializeApp } from "firebase-admin/app";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Yahan humne direct absolute path de diya hai taaki folder mismatch ki koi gunjaish hi na rahe
dotenv.config({ path: "/home/ubuntu/1.cotexAI/backend/services/auth/.env" });

let rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";
rawPrivateKey = rawPrivateKey.replace(/^["']|["']$/g, "").trim();
const formattedPrivateKey = rawPrivateKey
  ? rawPrivateKey.replace(/\\n/g, "\n")
  : undefined;

export const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: formattedPrivateKey,
  }),
});
