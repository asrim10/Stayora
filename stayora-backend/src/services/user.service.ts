import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repositories";
import bcryptjs from "bcryptjs";
let userRepository = new UserRepository();
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_KEYS, CURRENT_KID } from "../config";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { sendEmail } from "../config/email";
import { AuditLogService } from "./audit-log.service";
import { Request } from "express";

const auditLogService = new AuditLogService();
const CLIENT_URL = process.env.CLIENT_URL as string;
const MAX_PASSWORD_HISTORY = 5;

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    }
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    // Initialize password history with the first password
    const userData = data as any;
    userData.passwordHistory = [hashedPassword];

    const newUser = await userRepository.createUser(userData);
    return newUser;
  }

  async loginUser(data: LoginUserDTO, req?: Request) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000,
      );
      throw new HttpError(
        423,
        `Account locked due to too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
      );
    }

    // If lock has expired, reset attempt counter
    if (user.lockUntil && user.lockUntil <= new Date()) {
      await userRepository.updateUser(user._id.toString(), {
        loginAttempts: 0,
        lockUntil: null as any,
      });
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    // If user registered via OAuth (no password), they cannot use email/password login
    if (!user.password) {
      throw new HttpError(
        401,
        "This account uses Google sign-in. Please sign in with Google.",
      );
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      // Increment failed attempts
      const attempts = (user.loginAttempts || 0) + 1;
      const maxAttempts = 15;

      if (attempts >= maxAttempts) {
        await userRepository.updateUser(user._id.toString(), {
          loginAttempts: attempts,
          lockUntil: new Date(Date.now() + 30 * 60 * 1000),
        });
        throw new HttpError(
          423,
          "Account locked after 15 failed attempts. Try again in 30 minutes.",
        );
      }

      await userRepository.updateUser(user._id.toString(), {
        loginAttempts: attempts,
      });

      // Audit: failed login (non-blocking)
      try {
        await auditLogService.log(
          user._id.toString(),
          "login_failed",
          `Failed login attempt from IP: ${req?.ip}`,
          req,
        );
      } catch { /* audit failure should not block login */ }

      throw new HttpError(401, "Invalid credentials");
    }

    // Successful login — reset attempts and unlock
    await userRepository.updateUser(user._id.toString(), {
      loginAttempts: 0,
      lockUntil: null as any,
    });

    // Audit: successful login (non-blocking)
    try {
      await auditLogService.log(
        user._id.toString(),
        "login_success",
        "Successful login",
        req,
      );
    } catch { /* audit failure should not block login */ }

    // If MFA is enabled, issue a short-lived temp token instead of the real JWT
    if (user.mfaEnabled) {
      const tempPayload = {
        id: user._id,
        email: user.email,
        mfaPending: true,
      };
      const tempToken = jwt.sign(tempPayload, JWT_KEYS[CURRENT_KID], { algorithm: "HS256", expiresIn: "5m", header: { alg: "HS256", kid: CURRENT_KID } });
      return { token: tempToken, user, mfaRequired: true };
    }

    //generate jwt — never include sensitive fields like password
    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_KEYS[CURRENT_KID], { algorithm: "HS256", expiresIn: "30d", header: { alg: "HS256", kid: CURRENT_KID } }); // 30days
    return { token, user, mfaRequired: false };
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserByID(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  async updateUser(userId: string, data: UpdateUserDTO, req?: Request) {
    const user = await userRepository.getUserByID(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    if (user.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email!);
      if (emailExists) {
        throw new HttpError(403, "Email already in use");
      }
    }
    if (user.username !== data.username) {
      const usernameExists = await userRepository.getUserByUsername(
        data.username!,
      );
      if (usernameExists) {
        throw new HttpError(403, "Username already in use");
      }
    }
    if (data.password) {
      // Check password history
      const history = user.passwordHistory || [];
      for (const oldHash of history) {
        const isReused = await bcryptjs.compare(data.password, oldHash);
        if (isReused) {
          throw new HttpError(
            400,
            "You have used this password recently. Please choose a different password.",
          );
        }
      }

      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password = hashedPassword;

      // Update password history
      const updatedHistory = [hashedPassword, ...history].slice(0, MAX_PASSWORD_HISTORY);
      (data as any).passwordHistory = updatedHistory;

      // Audit: password changed (non-blocking)
      try {
        await auditLogService.log(
          userId,
          "password_changed",
          "User changed their password",
          req,
        );
      } catch { /* audit failure should not block password change */ }
    }

    const updatedUser = await userRepository.updateUser(userId, data);

    // Audit: profile updated (non-blocking)
    if (!data.password) {
      try {
        await auditLogService.log(
          userId,
          "profile_updated",
          "User updated their profile",
          req,
        );
      } catch { /* audit failure should not block profile update */ }
    }

    return updatedUser;
  }

  async deleteUser(userId: string) {
    const existingUser = await userRepository.getUserByID(userId);
    if (!existingUser) {
      throw new HttpError(404, "User not found");
    }

    const deleted = await userRepository.deleteUserById(userId);
    if (!deleted) {
      throw new HttpError(500, "Failed to delete user");
    }

    return { message: "User deleted successfully" };
  }

  async sendResetPasswordEmail(email?: string) {
    if (!email) {
      throw new HttpError(400, "Email is required");
    }
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return;
    }

    // Check if password reset is locked
    if (user.resetLockUntil && user.resetLockUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.resetLockUntil.getTime() - Date.now()) / 60000,
      );
      throw new HttpError(
        423,
        `Too many password reset requests. Try again in ${remainingMinutes} minute(s).`,
      );
    }

    // If lock has expired, reset attempt counter
    if (user.resetLockUntil && user.resetLockUntil <= new Date()) {
      await userRepository.updateUser(user._id.toString(), {
        passwordResetAttempts: 0,
        resetLockUntil: null as any,
      });
      user.passwordResetAttempts = 0;
      user.resetLockUntil = undefined;
    }

    // Increment reset attempts
    const attempts = (user.passwordResetAttempts || 0) + 1;
    const maxAttempts = 5;

    if (attempts >= maxAttempts) {
      await userRepository.updateUser(user._id.toString(), {
        passwordResetAttempts: attempts,
        resetLockUntil: new Date(Date.now() + 30 * 60 * 1000),
      });
      throw new HttpError(
        423,
        "Too many password reset requests. Try again in 30 minutes.",
      );
    }

    await userRepository.updateUser(user._id.toString(), {
      passwordResetAttempts: attempts,
    });

    const token = jwt.sign({ id: user._id }, JWT_KEYS[CURRENT_KID], { algorithm: "HS256", expiresIn: "1h", header: { alg: "HS256", kid: CURRENT_KID } }); // 1 hour expiry
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
    await sendEmail(user.email, "Password Reset", html);
    return user;
  }

  async resetPassword(token?: string, newPassword?: string, req?: Request) {
    try {
      if (!token || !newPassword) {
        throw new HttpError(400, "Token and new password are required");
      }
      const kid = (jwt.decode(token, { complete: true }) as any)?.header?.kid || CURRENT_KID;
      const decoded: any = jwt.verify(token, JWT_KEYS[kid] || JWT_SECRET, { algorithms: ["HS256"] });
      const userId = decoded.id;
      const user = await userRepository.getUserByID(userId);
      if (!user) {
        throw new HttpError(404, "User not found");
      }

      // Check password history
      const history = user.passwordHistory || [];
      for (const oldHash of history) {
        const isReused = await bcryptjs.compare(newPassword, oldHash);
        if (isReused) {
          throw new HttpError(
            400,
            "You have used this password recently. Please choose a different password.",
          );
        }
      }

      const hashedPassword = await bcryptjs.hash(newPassword, 10);

      // Update password history
      const updatedHistory = [hashedPassword, ...history].slice(0, MAX_PASSWORD_HISTORY);
      await userRepository.updateUser(userId, {
        password: hashedPassword,
        passwordHistory: updatedHistory,
      });

      // Audit: password reset (non-blocking)
      try {
        await auditLogService.log(
          userId,
          "password_reset",
          "Password was reset via email link",
          req,
        );
      } catch { /* audit failure should not block password reset */ }

      return user;
    } catch (error) {
      throw new HttpError(400, "Invalid or expired token");
    }
  }

  // For OAuth users to set a password for the first time
  async setPassword(userId: string, newPassword: string, req?: Request) {
    const user = await userRepository.getUserByID(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // Only allow if user doesn't already have a password (OAuth-only account)
    if (user.password) {
      throw new HttpError(
        400,
        "You already have a password set. Use the password reset option instead.",
      );
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    const updatedUser = await userRepository.updateUser(userId, {
      password: hashedPassword,
      passwordHistory: [hashedPassword],
      authProvider: "local",
    });

    // Audit: password set (non-blocking)
    try {
      await auditLogService.log(
        userId,
        "password_set",
        "Password set for OAuth-linked account",
        req,
      );
    } catch { /* audit failure should not block password set */ }

    return updatedUser;
  }
}
