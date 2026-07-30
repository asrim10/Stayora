"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleMfaChallenge } from "@/lib/actions/mfa-action";
import { getTempMfaToken, clearTempMfaToken } from "@/lib/cookie";
import { Shield, ArrowLeft, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: "url('/images/hotel4.webp')",
            filter: "blur(2px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/85" />
        <div className="relative z-10 w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: "url('/images/hotel4.webp')",
            filter: "blur(2px)",
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 40%, rgba(201,169,110,0.1) 100%)",
              "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.5) 50%, rgba(201,169,110,0.15) 100%)",
              "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 40%, rgba(201,169,110,0.1) 100%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="relative rounded-2xl bg-white/10 dark:bg-black/50 backdrop-blur-2xl border border-white/10 dark:border-white/5 p-8 shadow-2xl">
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#059669]/50 to-transparent" />

            <div className="text-center mb-6">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/10 border border-[#059669]/20 text-[#059669] text-[10px] font-bold uppercase tracking-[0.18em] mb-4"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Shield size={14} />
                Two-Factor Authentication
              </motion.div>
              <motion.h2
                className="text-2xl font-bold text-white font-heading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                Enter your code
              </motion.h2>
              <motion.p
                className="mt-1.5 text-sm text-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Open your authenticator app and enter the 6-digit code.
              </motion.p>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              {error && (
                <div className="p-3 rounded-md bg-red-900/20 border border-red-800/30">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-white/60" htmlFor="mfa-code">
                  Authentication Code
                </label>
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
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
                    className="h-12 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-lg tracking-[0.3em] text-center font-mono text-white outline-none focus:border-[#059669]/50 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || token.length < 6}
                className="h-11 w-full rounded-lg bg-[#059669] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed border-none"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-[#059669] transition-colors bg-transparent border-none cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Back to login
                </button>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
