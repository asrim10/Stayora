"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import LoginForm from "../_components/LoginForm";

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, checkAuth } = useAuth();
  const [oauthMessage, setOauthMessage] = useState<string | null>(null);
  const oauthHandled = useRef(false);

  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth");
    const oauthError = searchParams.get("error");
    const firstLogin = searchParams.get("firstLogin");

    if (oauthSuccess === "success" && !oauthHandled.current) {
      oauthHandled.current = true;
      setOauthMessage(
        firstLogin
          ? "Account created successfully with Google!"
          : "Signed in with Google successfully!",
      );

      // Reload auth context to pick up the new httpOnly cookie
      checkAuth().then(() => {
        // Clean up URL params
        window.history.replaceState({}, "", window.location.pathname);
      });
    }

    if (oauthError) {
      setOauthMessage(
        `Google sign-in failed: ${decodeURIComponent(oauthError)}`,
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, checkAuth]);

  // Once authenticated via OAuth, redirect to the appropriate page
  useEffect(() => {
    if (isAuthenticated && oauthMessage && user) {
      const target =
        user.role === "admin"
          ? "/admin"
          : user.role === "user"
            ? "/user/dashboard"
            : "/";

      const timer = setTimeout(() => {
        router.replace(target);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, oauthMessage, user, router]);

  return (
    <div className="space-y-6 w-full">
      {oauthMessage && (
        <div
          className={`p-3 rounded-md border ${
            oauthMessage.includes("failed")
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <p className="text-sm">{oauthMessage}</p>
        </div>
      )}
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Welcome Back!!!</h1>
        <p className="mt-1 text-sm text-foreground/70">Login to your account</p>
      </div>
      <LoginForm />
    </div>
  );
}
