import { generateSecret, generateURI, verifySync } from "otplib";
import { UserRepository } from "../repositories/user.repositories";
import { HttpError } from "../errors/http-error";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { encrypt, decrypt } from "../utils/crypto";

const userRepository = new UserRepository();

const ISSUER = "Stayora";

// Generate a TOTP secret and otpauth URL for QR code scanning.
// The secret is encrypted with AES-256-GCM before being stored in the database.
export async function generateMfaSetup(userId: string, email: string) {
  const secret = generateSecret();
  const otpauthUrl = generateURI({
    algorithm: "sha1",
    digits: 6,
    issuer: ISSUER,
    label: email,
    secret,
    period: 30,
  });

  // Encrypt the secret before storing in the database
  const encryptedSecret = encrypt(secret);
  await userRepository.updateUser(userId, { mfaSecret: encryptedSecret });

  return { secret, otpauthUrl };
}

// Verify a TOTP token against the user's stored MFA secret.
// The stored secret is expected to be encrypted — it is decrypted before verification.
function verifyTotpToken(encryptedSecret: string, token: string): boolean {
  try {
    const secret = decrypt(encryptedSecret);
    const result = verifySync({ token, secret, algorithm: "sha1", digits: 6, period: 30 });
    return result.valid === true;
  } catch {
    return false;
  }
}

// Enable MFA for a user after verifying their first TOTP code.
export async function enableMfa(userId: string, token: string, password: string) {
  const user = await userRepository.getUserByID(userId);
  if (!user) throw new HttpError(404, "User not found");

  // Verify password
  const validPassword = await bcryptjs.compare(password, user.password);
  if (!validPassword) throw new HttpError(401, "Invalid password");

  if (user.mfaEnabled) throw new HttpError(400, "MFA is already enabled");

  if (!user.mfaSecret) throw new HttpError(400, "MFA setup not initialized. Generate a secret first.");

  // Verify the TOTP code (secret is decrypted inside verifyTotpToken)
  if (!verifyTotpToken(user.mfaSecret, token)) {
    throw new HttpError(400, "Invalid verification code. Please try again.");
  }

  await userRepository.updateUser(userId, { mfaEnabled: true });
  return { message: "MFA enabled successfully" };
}

// Disable MFA for a user (requires password + valid TOTP).
export async function disableMfa(userId: string, password: string, token: string) {
  const user = await userRepository.getUserByID(userId);
  if (!user) throw new HttpError(404, "User not found");

  const validPassword = await bcryptjs.compare(password, user.password);
  if (!validPassword) throw new HttpError(401, "Invalid password");

  if (!user.mfaEnabled || !user.mfaSecret) throw new HttpError(400, "MFA is not enabled");

  // Verify TOTP code before disabling (secret is decrypted inside verifyTotpToken)
  if (!verifyTotpToken(user.mfaSecret, token)) {
    throw new HttpError(400, "Invalid verification code");
  }

  await userRepository.updateUser(userId, {
    mfaEnabled: false,
    mfaSecret: null as any,
  });

  return { message: "MFA disabled successfully" };
}

// Complete the MFA challenge step during login.
// Validates the temp token and TOTP code, then issues the real JWT.
export async function completeMfaChallenge(tempToken: string, token: string) {
  let decoded: any;
  try {
    decoded = jwt.verify(tempToken, JWT_SECRET);
  } catch {
    throw new HttpError(401, "Invalid or expired temporary token. Please login again.");
  }

  if (!decoded.mfaPending) {
    throw new HttpError(400, "Invalid token type");
  }

  const userId = decoded.id;
  const user = await userRepository.getUserByID(userId);
  if (!user) throw new HttpError(404, "User not found");

  if (!user.mfaEnabled || !user.mfaSecret) {
    throw new HttpError(400, "MFA is not enabled for this account");
  }

  // Verify TOTP code (secret is decrypted inside verifyTotpToken)
  if (!verifyTotpToken(user.mfaSecret, token)) {
    throw new HttpError(401, "Invalid verification code");
  }

  // Generate the real JWT (30 days)
  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  };
  const realToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

  return { token: realToken, user };
}

// Get the user's MFA status.
export async function getMfaStatus(userId: string) {
  const user = await userRepository.getUserByID(userId);
  if (!user) throw new HttpError(404, "User not found");

  return {
    mfaEnabled: user.mfaEnabled || false,
    mfaSecret: user.mfaSecret ? true : false,
  };
}
