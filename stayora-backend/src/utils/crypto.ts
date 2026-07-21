import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits — recommended for GCM

// Retrieve the MFA encryption key from the environment.
// Must be a 32-byte (64 hex character) string.
function getEncryptionKey(): Buffer {
  const key = process.env.MFA_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "[FATAL] MFA_ENCRYPTION_KEY environment variable is not set. " +
        "Generate one with: openssl rand -hex 32",
    );
  }
  return Buffer.from(key, "hex");
}

// Encrypt plaintext using AES-256-GCM.
// Returns a colon-delimited string in the format: iv:ciphertext:authTag
// All three segments are hex-encoded.
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${ciphertext}:${authTag}`;
}

// Decrypt a ciphertext string that was produced by encrypt().
// Expects the format: iv:ciphertext:authTag (all hex-encoded).
export function decrypt(encoded: string): string {
  const key = getEncryptionKey();

  const parts = encoded.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }

  const [ivHex, ciphertext, authTagHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}
