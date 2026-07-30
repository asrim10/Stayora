"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterData, registerSchema } from "../schema";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { handleRegister } from "@/lib/actions/auth-action";
import { Eye, EyeOff } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}/api/auth/google`;

export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });
  const [pending, setTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const submit = async (values: RegisterData) => {
    if (turnstileSiteKey && !captchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }
    setError(null);
    setTransition(async () => {
      try {
        const response = await handleRegister({ ...values, captchaToken });
        if (!response.success) {
          throw new Error(response.message);
        }
        if (response.success) {
          router.push("/login");
        } else {
          setError("Registration failed");
        }
      } catch (err: Error | any) {
        setError(err.message || "Registration failed");
      } finally {
        // Reset Turnstile — token is one-time use
        setCaptchaToken("");
        setTurnstileKey((k) => k + 1);
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
            {...register("username")}
            placeholder="Enter username"
          />
          {errors.username?.message && (
            <p className="text-xs text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
            {...register("fullName")}
            placeholder="Enter full name"
          />
          {errors.fullName?.message && (
            <p className="text-xs text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
            {...register("email")}
            placeholder="Enter your email"
          />
          {errors.email?.message && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-10 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
              {...register("password")}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password?.message && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-10 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
              {...register("confirmPassword")}
              placeholder="Enter same password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className="text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {turnstileSiteKey && (
          <div className="flex justify-center">
            <Turnstile
              key={turnstileKey}
              siteKey={turnstileSiteKey}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => {
                setCaptchaToken("");
                setTurnstileKey((k) => k + 1);
                setError("CAPTCHA verification failed. Please refresh and try again.");
              }}
              onExpire={() => {
                setCaptchaToken("");
                setTurnstileKey((k) => k + 1);
                setError("CAPTCHA expired, please verify again.");
              }}
              options={{ theme: "light" }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || pending || (!!turnstileSiteKey && !captchaToken)}
          className="h-10 w-full rounded-lg bg-[#059669] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
        >
          {isSubmitting || pending ? "Creating account..." : "Sign Up"}
        </button>

        {/* Google OAuth Sign-Up */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="relative bg-[#0a0a0a]/40 px-4 py-1 text-xs uppercase text-white/40 backdrop-blur-sm">
              Or sign up with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}
          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <FcGoogle className="text-lg" />
          Sign up with Google
        </button>
      </form>
    </div>
  );
}
