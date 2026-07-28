"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import {
  handleMfaSetup,
  handleMfaVerify,
  handleMfaDisable,
  handleMfaStatus,
} from "@/lib/actions/mfa-action";
import { Shield, ShieldOff, KeyRound, Copy, Check, ArrowLeft, AlertCircle } from "lucide-react";
import Sidebar from "../_components/Sidebar";

export default function MfaPage() {
  const router = useRouter();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "disable">("idle");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(true);

  // Load MFA status on mount
  const loadStatus = useCallback(async () => {
    try {
      const result = await handleMfaStatus();
      if (result.success) {
        setMfaEnabled(result.data.mfaEnabled);
      }
    } catch {
      // Not logged in or error
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleStartSetup = async () => {
    if (!password) {
      setError("Please enter your password to start MFA setup");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await handleMfaSetup(password);
      if (result.success) {
        setOtpauthUrl(result.data.otpauthUrl);
        setSecret(result.data.secret);
        setStep("verify");
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to start MFA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verifyCode || verifyCode.length < 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await handleMfaVerify(verifyCode, password);
      if (result.success) {
        setMfaEnabled(true);
        setStep("idle");
        setSuccess("MFA has been enabled successfully!");
        setPassword("");
        setVerifyCode("");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDisable = () => {
    setStep("disable");
    setError(null);
    setPassword("");
    setVerifyCode("");
  };

  const handleDisable = async () => {
    if (!password || !verifyCode || verifyCode.length < 6) {
      setError("Please enter your password and a valid verification code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await handleMfaDisable(password, verifyCode);
      if (result.success) {
        setMfaEnabled(false);
        setStep("idle");
        setSuccess("MFA has been disabled successfully!");
        setPassword("");
        setVerifyCode("");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to disable MFA");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-white/40 text-sm">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 min-w-0 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6b8a] mb-1.5">
              Security
            </p>
            <h1 className="text-[32px] font-bold text-white font-heading">
              Two-Factor Authentication (2FA)
            </h1>
            <p className="text-sm text-[#6b6b8a] mt-2">
              Add an extra layer of security to your account using an authenticator app like Google Authenticator or Authy.
            </p>
            <div className="mt-4 h-px bg-white/6" />
          </div>

          {/* Success/Error messages */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-800/30 flex items-center gap-3">
              <Check size={18} className="text-green-400 shrink-0" />
              <p className="text-sm text-green-300">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-800/30 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Status Card */}
          {step === "idle" && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    mfaEnabled
                      ? "bg-green-900/30 text-green-400"
                      : "bg-[#2a2a2a] text-[#6b6b8a]"
                  }`}
                >
                  {mfaEnabled ? (
                    <Shield size={28} />
                  ) : (
                    <ShieldOff size={28} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {mfaEnabled ? "MFA is Enabled" : "MFA is Disabled"}
                  </h2>
                  <p className="text-sm text-[#6b6b8a]">
                    {mfaEnabled
                      ? "Your account is protected with two-factor authentication."
                      : "Protect your account with an extra layer of security."}
                  </p>
                </div>
              </div>

              {mfaEnabled ? (
                <button
                  onClick={handleStartDisable}
                  className="px-5 py-2.5 rounded-lg border border-red-800/40 text-sm text-red-400 hover:bg-red-900/20 hover:border-red-600/60 transition-all"
                >
                  Disable Two-Factor Authentication
                </button>
              ) : (
                <button
                  onClick={() => {
                    setStep("setup");
                    setError(null);
                    setPassword("");
                  }}
                  className="px-5 py-2.5 rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Enable Two-Factor Authentication
                </button>
              )}
            </div>
          )}

          {/* Setup Step 1: Enter Password */}
          {step === "setup" && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setStep("idle")}
                  className="text-[#6b6b8a] hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6b8a]">
                  Step 1 of 2
                </p>
              </div>

              <h2 className="text-lg font-semibold text-white mb-2">
                Confirm your password
              </h2>
              <p className="text-sm text-[#6b6b8a] mb-6">
                Enter your account password to start setting up two-factor authentication.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-white/25 transition-colors"
                  />
                </div>
                <button
                  onClick={handleStartSetup}
                  disabled={loading || !password}
                  className="w-full h-11 rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  {loading ? "Generating..." : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Setup Step 2: Scan QR Code & Verify */}
          {step === "verify" && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => {
                    setStep("setup");
                    setError(null);
                  }}
                  className="text-[#6b6b8a] hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6b8a]">
                  Step 2 of 2
                </p>
              </div>

              <h2 className="text-lg font-semibold text-white mb-2">
                Scan QR Code
              </h2>
              <p className="text-sm text-[#6b6b8a] mb-6">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code below.
              </p>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-xl">
                  {otpauthUrl && (
                    <QRCodeSVG value={otpauthUrl} size={200} level="M" />
                  )}
                </div>
              </div>

              {/* Manual Setup Key */}
              <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/8">
                <p className="text-xs text-[#6b6b8a] mb-2">
                  Can&apos;t scan the code? Enter this key manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-white/80 font-mono bg-black/30 px-3 py-2 rounded break-all select-all">
                    {secret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="shrink-0 p-2 rounded-lg text-[#6b6b8a] hover:text-white hover:bg-white/5 transition-all"
                    title="Copy secret"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Verify Code */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">
                    Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b8a]"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) =>
                        setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-lg tracking-[0.3em] font-mono text-white outline-none focus:border-white/25 transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={loading || verifyCode.length < 6}
                  className="w-full h-11 rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  {loading ? "Verifying..." : "Enable Two-Factor Authentication"}
                </button>
              </div>
            </div>
          )}

          {/* Disable Step */}
          {step === "disable" && (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-8">
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setStep("idle")}
                  className="text-[#6b6b8a] hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6b8a]">
                  Disable 2FA
                </p>
              </div>

              <h2 className="text-lg font-semibold text-white mb-2">
                Disable Two-Factor Authentication
              </h2>
              <p className="text-sm text-[#6b6b8a] mb-6">
                Enter your password and a verification code from your authenticator app to disable 2FA.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-white/25 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">
                    Authentication Code
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b8a]"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) =>
                        setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-lg tracking-[0.3em] font-mono text-white outline-none focus:border-white/25 transition-colors"
                    />
                  </div>
                </div>
                <button
                  onClick={handleDisable}
                  disabled={loading || !password || verifyCode.length < 6}
                  className="w-full h-11 rounded-lg border border-red-800/40 text-sm text-red-400 font-semibold hover:bg-red-900/20 hover:border-red-600/60 disabled:opacity-40 transition-all"
                >
                  {loading ? "Disabling..." : "Disable Two-Factor Authentication"}
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 rounded-2xl border border-white/8 bg-white/3 p-6">
            <h3 className="text-sm font-semibold text-white mb-3">
              What is Two-Factor Authentication?
            </h3>
            <ul className="space-y-2 text-sm text-[#6b6b8a]">
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                After enabling, you&apos;ll need to enter a 6-digit code from your authenticator app when logging in.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                This adds an extra layer of security even if your password is compromised.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                We recommend Google Authenticator, Authy, or Microsoft Authenticator.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/40 mt-0.5">•</span>
                You can disable 2FA at any time by providing your password and a valid code.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
