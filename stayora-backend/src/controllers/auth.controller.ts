import { UserService } from "../services/user.service";
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateOwnProfileDTO,
  SetPasswordDTO,
} from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";
import { setAuthCookie } from "../utils/auth-cookie";

let userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }
      const userData: CreateUserDTO = parsedData.data;
      const newUser = await userService.createUser(userData);
      return res
        .status(201)
        .json({ success: true, message: "User Created", data: newUser });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }
  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }
      const loginData: LoginUserDTO = parsedData.data;
      const { token, user, mfaRequired } = await userService.loginUser(loginData, req);

      // If MFA is required, return temp token — don't set auth cookie yet
      if (mfaRequired) {
        return res.status(200).json({
          success: true,
          message: "MFA verification required",
          mfaRequired: true,
          tempToken: token,
          data: { email: user.email },
        });
      }

      // Set httpOnly cookie for automatic cookie-based auth
      setAuthCookie(res, token);
      return res.status(200).json({
        success: true,
        message: "Login Successful",
        data: user,
        token,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User Id Not found" });
      }
      const user = await userService.getUserById(userId);
      return res.status(200).json({
        success: true,
        data: user,
        message: "User profile fetched successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User Id Not found" });
      }
      const parsedData = UpdateOwnProfileDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) }); // z.prettifyError - better error messages (zod)
      }
      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }
      const updatedUser = await userService.updateUser(userId, parsedData.data, req);
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User profile updated successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      // Use the authenticated user's ID — never trust req.params.id for self-deletion
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized user not found",
        });
      }

      const result = await userService.deleteUser(userId.toString());

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Service Error",
      });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const email = req.body.email;
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      await userService.sendResetPasswordEmail(email);

      // Always return 200 — don't reveal whether the email exists (prevents enumeration)
      return res.status(200).json({
        success: true,
        message: "If the account exists, a password reset email has been sent",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async resetPassword(req: Request, res: Response) {
    try {
      const token = req.params.token;
      const { newPassword } = req.body;
      await userService.resetPassword(token, newPassword, req);
      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully.",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async setPassword(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User Id Not found" });
      }
      const parsedData = SetPasswordDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const updatedUser = await userService.setPassword(
        userId,
        parsedData.data.newPassword,
        req,
      );
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message:
          "Password set successfully. You can now log in with email and password.",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
