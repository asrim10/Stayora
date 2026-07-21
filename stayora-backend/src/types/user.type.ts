import z from "zod";

export const UserSchema = z.object({
  username: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"),
  imageUrl: z.string().optional(),
  loginAttempts: z.number().optional(),
  lockUntil: z.date().optional(),
  passwordResetAttempts: z.number().optional(),
  resetLockUntil: z.date().optional(),
  mfaSecret: z.string().optional(),
  mfaEnabled: z.boolean().optional().default(false),
});

export type UserType = z.infer<typeof UserSchema>;
