import z from "zod";

export const UserSchema = z.object({
  username: z.string().min(2),
  email: z.email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
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
