"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff, KeyRound, Check } from "lucide-react";
import { handleSetPassword } from "@/lib/actions/auth-action";

export default function SetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (newPassword.length < 8) return "Minimum 8 characters";
    if (!/[A-Z]/.test(newPassword)) return "Must contain an uppercase letter";
    if (!/[0-9]/.test(newPassword)) return "Must contain a number";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    try {
      const res = await handleSetPassword(newPassword, confirmPassword);
      if (res.success) {
        setSuccess(true);
        toast.success("Password set successfully! You can now use email login and MFA.");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-green-800/30 bg-green-900/20 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-300">Password Set Successfully</p>
            <p className="text-xs text-green-400/70 mt-1">
              You can now enable Two-Factor Authentication and log in with email and password.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#059669]/20 bg-[#059669]/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#059669]/15 flex items-center justify-center">
          <KeyRound size={18} className="text-[#059669]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Set a Password</p>
          <p className="text-xs text-[#6b6b8a] mt-0.5">
            Your account uses Google sign-in. Set a password to also log in with email and enable MFA.
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6b8a] mb-1.5 block">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-10 text-sm text-white outline-none focus:border-[#059669]/40 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b8a] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.15em] text-[#6b6b8a] mb-1.5 block">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-10 text-sm text-white outline-none focus:border-[#059669]/40 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b8a] hover:text-white transition-colors"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full h-10 rounded-lg bg-[#059669] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
        >
          {loading ? "Setting Password..." : "Set Password"}
        </button>
      </div>
    </div>
  );
}
