import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repositories";
import bcryptjs from "bcryptjs";
let userRepository = new UserRepository();
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { sendEmail } from "../config/email";
const CLIENT_URL = process.env.CLIENT_URL as string;

export class UserService {
  async createUser(data: CreateUserDTO) {
    //business logic before creating user
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    }
    //hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10); //10 complexity
    data.password = hashedPassword;

    //create user
    const newUser = await userRepository.createUser(data);
    return newUser;
  }
  async loginUser(data: LoginUserDTO) {
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

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      // Increment failed attempts
      const attempts = (user.loginAttempts || 0) + 1;
      const maxAttempts = 15;

      if (attempts >= maxAttempts) {
        // Lock the account for 30 minutes
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
      throw new HttpError(401, "Invalid credentials");
    }

    // Successful login — reset attempts and unlock
    await userRepository.updateUser(user._id.toString(), {
      loginAttempts: 0,
      lockUntil: null as any,
    });

    // If MFA is enabled, issue a short-lived temp token instead of the real JWT
    if (user.mfaEnabled) {
      const tempPayload = {
        id: user._id,
        email: user.email,
        mfaPending: true,
      };
      const tempToken = jwt.sign(tempPayload, JWT_SECRET, { expiresIn: "5m" });
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
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" }); // 30days
    return { token, user, mfaRequired: false };
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserByID(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  async updateUser(userId: string, data: UpdateUserDTO) {
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
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password = hashedPassword;
    }
    const updatedUser = await userRepository.updateUser(userId, data);
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
      // Return silently — don't reveal whether the email exists (prevents enumeration)
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
      // Lock password reset for 30 minutes
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

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" }); // 1 hour expiry
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
    await sendEmail(user.email, "Password Reset", html);
    return user;
  }

  async resetPassword(token?: string, newPassword?: string) {
    try {
      if (!token || !newPassword) {
        throw new HttpError(400, "Token and new password are required");
      }
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      const user = await userRepository.getUserByID(userId);
      if (!user) {
        throw new HttpError(404, "User not found");
      }
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      await userRepository.updateUser(userId, { password: hashedPassword });
      return user;
    } catch (error) {
      throw new HttpError(400, "Invalid or expired token");
    }
  }
}
