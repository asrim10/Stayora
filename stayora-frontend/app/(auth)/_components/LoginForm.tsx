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

const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}/api/auth/google`;

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

  const handleGoogleLogin = () => {
    // Direct the user to the backend's Google OAuth endpoint.
    // The backend will redirect to Google, then back to our callback,
    // set the httpOnly cookie, and redirect to the frontend.
    window.location.href = GOOGLE_AUTH_URL;
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
              autoComplete="current-password"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-10 text-sm text-white outline-none focus:border-[#059669]/50 transition-colors placeholder:text-white/30"
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
          className="text-sm text-[#059669] hover:text-[#d4b87a] font-medium transition md:ml-auto block text-right"
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
          className="h-10 w-full rounded-lg bg-[#059669] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
        >
          {isSubmitting || pending ? "Signing in..." : "Login"}
        </button>

        {/* Google OAuth Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="relative bg-white/10 backdrop-blur-sm px-4 py-1 text-xs uppercase text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <FcGoogle className="text-lg" />
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
