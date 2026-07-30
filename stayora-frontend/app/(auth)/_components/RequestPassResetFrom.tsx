// app/(auth)/_components/RequestPasswordResetForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/api/auth";
import { toast } from "react-toastify";
import { useState } from "react";
import z from "zod";
import { Turnstile } from "@marsidev/react-turnstile";

export const RequestPasswordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type RequestPasswordResetDTO = z.infer<
  typeof RequestPasswordResetSchema
>;

export default function RequestPasswordResetForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetDTO>({
    resolver: zodResolver(RequestPasswordResetSchema),
  });

  const onSubmit = async (data: RequestPasswordResetDTO) => {
    if (turnstileSiteKey && !captchaToken) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }
    try {
      const response = await requestPasswordReset(data.email, captchaToken);
      if (response.success) {
        toast.success("Password reset link sent to your email.");
        setIsSubmitted(true);
      } else {
        toast.error(response.message || "Failed to request password reset.");
      }
    } catch (error) {
      toast.error(
        (error as Error).message || "Failed to request password reset.",
      );
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-white font-heading mb-4">
          Check Your Email
        </h2>
        <p className="text-sm text-white/60">
          If an account exists with that email, we've sent password reset
          instructions.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label
            className="text-sm text-white/60"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            {...register("email")}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {turnstileSiteKey && (
          <div className="flex justify-center">
            <Turnstile
              siteKey={turnstileSiteKey}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => toast.error("CAPTCHA verification failed. Please refresh and try again.")}
              onExpire={() => {
                setCaptchaToken("");
                toast.error("CAPTCHA expired, please verify again.");
              }}
              options={{ theme: "light" }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || (!!turnstileSiteKey && !captchaToken)}
          className="h-10 w-full rounded-lg bg-[#059669] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer border-none"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
