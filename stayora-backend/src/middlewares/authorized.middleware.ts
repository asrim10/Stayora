import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/user.repositories";
import { HttpError } from "../errors/http-error";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser;
    }
  }
} // adding tag (user) to request, can use req.user
let userRepository = new UserRepository();
export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Try Authorization header first (Bearer token)
    // 2. Fall back to httpOnly auth_token cookie (set by backend on login)
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // 0 -> Bearer, 1 -> token
    }

    if (!token) {
      // Parse the auth_token cookie manually (no cookie-parser dependency)
      const rawCookie = req.headers.cookie;
      if (rawCookie) {
        const match = rawCookie
          .split("; ")
          .find((c) => c.startsWith("auth_token="))
          ?.split("=")[1];
        if (match) token = decodeURIComponent(match);
      }
    }

    if (!token) throw new HttpError(401, "Unauthorized JWT missing");
    const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;
    if (!decodedToken || !decodedToken.id) {
      throw new HttpError(401, "Unauthorized JWT unverified");
    } // make function async
    const user = await userRepository.getUserByID(decodedToken.id);
    if (!user) throw new HttpError(401, "Unauthorized user not found");
    req.user = user; // attach user to request (like tag)
    next();
  } catch (err: Error | any) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized no user info");
    }
    if (req.user.role !== "admin") {
      throw new HttpError(403, "Forbidden not admin");
    }
    return next();
  } catch (err: Error | any) {
    return res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};
