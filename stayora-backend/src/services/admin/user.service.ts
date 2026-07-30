import {
  CreateUserDTO,
  UpdateUserDTO,
} from "../../dtos/user.dto";
import { UserRepository } from "../../repositories/user.repositories";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";

let userRepository = new UserRepository();
const MAX_PASSWORD_HISTORY = 5;

export class AdminUserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    }
    // hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    // Initialize password history
    const userData = data as any;
    userData.passwordHistory = [hashedPassword];

    const newUser = await userRepository.createUser(userData);
    return newUser;
  }

  async getAllUsers(page?: string, size?: string, search?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;
    const { users, total } = await userRepository.getAllUsers(
      pageNumber,
      pageSize,
      search,
    );
    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };
    return { users, pagination };
  }

  async deleteUser(id: string) {
    const user = await userRepository.getUserByID(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    const deleted = await userRepository.deleteUserById(id);
    return deleted;
  }

  async updateUser(id: string, updateData: UpdateUserDTO) {
    const user = await userRepository.getUserByID(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (updateData.password) {
      // Check password history
      const history = user.passwordHistory || [];
      for (const oldHash of history) {
        const isReused = await bcryptjs.compare(updateData.password, oldHash);
        if (isReused) {
          throw new HttpError(
            400,
            "This password has been used recently. Please choose a different one.",
          );
        }
      }

      const hashedPassword = await bcryptjs.hash(updateData.password, 10);
      updateData.password = hashedPassword;

      // Update password history
      const updatedHistory = [hashedPassword, ...history].slice(0, MAX_PASSWORD_HISTORY);
      (updateData as any).passwordHistory = updatedHistory;
    }

    const updatedUser = await userRepository.updateUser(id, updateData);
    return updatedUser;
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserByID(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }
}
