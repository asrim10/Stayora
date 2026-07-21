"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleMfaChallenge } from "@/lib/actions/mfa-action";
import { getTempMfaToken, clearTempMfaToken } from "@/lib/cookie";
import { Shield, ArrowLeft, KeyRound } from "lucide-react";

export default function MfaChallengePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const loadTempToken = async () => {
      const t = await getTempMfaToken();
      if (!t) {
        router.replace("/login");
        return;
      }
      setTempToken(t);
      setChecking(false);
    };
    loadTempToken();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken || !token.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await handleMfaChallenge(tempToken, token.trim());
      if (result.success) {
        await clearTempMfaToken();
        const userData = result.data as any;
        if (userData?.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/user/dashboard");
        }
      } else {
        setError(result.message || "Invalid verification code");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-white/40 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <section
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hotel4.webp')" }}
    >
      <div className="min-h-screen w-full bg-black/30 dark:bg-black/40 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur p-8 shadow-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 text-white text-sm font-medium mb-4">
              <Shield size={16} />
              Two-Factor Authentication
            </div>
            <h2 className="text-2xl font-semibold">Enter your code</h2>
            <p className="mt-2 text-sm text-foreground/70">
              Open your authenticator app and enter the 6-digit code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label
                className="text-sm font-medium"
                htmlFor="mfa-code"
              >
                Authentication Code
              </label>
              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 w-full rounded-md border border-black/10 dark:border-white/15 bg-background pl-10 pr-3 text-lg tracking-[0.3em] text-center font-mono outline-none focus:border-foreground/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || token.length < 6}
              className="h-11 w-full rounded-md bg-black text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60 transition-all"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
