"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginData, loginSchema } from "../schema";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { handleLogin } from "@/lib/actions/auth-action";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [pending, setTransition] = useTransition();

  const submit = async (values: LoginData) => {
    if (turnstileSiteKey && !captchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }
    setError(null);
    setTransition(async () => {
      try {
        const response = await handleLogin({ ...values, captchaToken });
        if (!response.success) {
          throw new Error(response.message);
        }
        if (response.success) {
          // If MFA is required, redirect to the challenge page
          if (response.mfaRequired) {
            return router.replace("/mfa/challenge");
          }

          if (response.data?.role == "admin") {
            return router.replace("/admin");
          }
          if (response.data?.role === "user") {
            return router.replace("/user/dashboard");
          }
          return router.replace("/");
        } else {
          setError("Login failed");
        }
      } catch (err: Error | any) {
        setError(err.message || "Login failed");
      } finally {
        // Reset Turnstile — token is one-time use
        setCaptchaToken("");
        setTurnstileKey((k) => k + 1);
      }
    });
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 text-white text-sm font-medium">
          <svg
            width="18"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 11L12 3L21 11V20H3V11Z"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Stayora
        </div>
        <h2 className="text-3xl font-serif mt-4">Sign in to your account</h2>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 text-sm outline-none focus:border-foreground/40"
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
              autoComplete="current-password"
              className="h-10 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 pr-10 text-sm outline-none focus:border-foreground/40"
              {...register("password")}
              placeholder="Enter your password"
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

        <Link
          href="/request-password-reset"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition md:ml-auto block text-right"
        >
          Forgot password?
        </Link>

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
          className="h-10 w-full rounded-md bg-black text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60"
        >
          {isSubmitting || pending ? "Signing in..." : "Login"}
        </button>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 h-px bg-gray-300" />
        </div>
      </form>
    </div>
  );
}
