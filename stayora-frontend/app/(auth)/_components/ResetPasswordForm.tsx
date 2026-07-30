"use client";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters")
      .regex(/[A-Z]/, "Confirm password must contain an uppercase letter")
      .regex(/[0-9]/, "Confirm password must contain a number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordDTO>({
    resolver: zodResolver(ResetPasswordSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: ResetPasswordDTO) => {
    try {
      const response = await handleResetPassword(token, data.password);
      if (response.success) {
        toast.success("Password reset successfully");
        router.replace("/login");
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-white/60" htmlFor="password">
            New Password
          </label>
          <input
            type="password"
            id="password"
            {...register("password")}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
            placeholder="Enter new password"
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-white/60" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            {...register("confirmPassword")}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
            placeholder="Confirm new password"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 w-full rounded-lg bg-[#059669] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer border-none"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>

        <div className="text-center text-sm mt-4">
          <Link
            href="/request-password-reset"
            className="text-[#059669] hover:text-[#d4b87a] font-medium transition"
          >
            Request another reset email
          </Link>
        </div>
      </form>
    </div>
  );
}
