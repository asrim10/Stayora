import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  imageUrl: true,
})
  .extend({
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number",
      }),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.email(),
  password: z.string().min(6),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial();
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

// DTO for users updating their own profile.
// Excludes `role` and internal/system fields that should not be self-settable.
// Admins can still update role via the admin panel using `UpdateUserDTO`.
export const UpdateOwnProfileDTO = UserSchema.omit({
  role: true,
  loginAttempts: true,
  lockUntil: true,
  passwordResetAttempts: true,
  resetLockUntil: true,
  mfaSecret: true,
  mfaEnabled: true,
}).partial();
export type UpdateOwnProfileDTO = z.infer<typeof UpdateOwnProfileDTO>;
