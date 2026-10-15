import { cert, initializeApp } from "firebase-admin/app";
import dotenv from "dotenv";

dotenv.config();

// Private key ke newline (\n) characters ko properly format karne ke liye
const formattedPrivateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

export const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: formattedPrivateKey,
  }),
});
