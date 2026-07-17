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
