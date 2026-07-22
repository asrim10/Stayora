import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 3000;
export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/defaultdb";

if (!process.env.JWT_SECRET) {
  console.error(
    "[FATAL] JWT_SECRET environment variable is not set. " +
      "Set a strong, random JWT_SECRET in your .env file. " +
      "Example: JWT_SECRET=$(openssl rand -base64 32)\n",
  );
  process.exit(1);
}
export const JWT_SECRET: string = process.env.JWT_SECRET;

// MFA encryption key — used to encrypt TOTP secrets at rest (AES-256-GCM)
// Skip validation in test environment so tests can set it via setup file
if (!process.env.MFA_ENCRYPTION_KEY && process.env.NODE_ENV !== "test") {
  console.error(
    "[FATAL] MFA_ENCRYPTION_KEY environment variable is not set. " +
      "Generate one with: openssl rand -hex 32\n",
  );
  process.exit(1);
}

export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET: string =
  process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_CALLBACK_URL: string =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:5050/api/auth/google/callback";
export const CLIENT_URL: string =
  process.env.CLIENT_URL || "http://localhost:3000";
