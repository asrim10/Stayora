import { handleWhoAmI } from "@/lib/actions/auth-action";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, ShieldOff, KeyRound } from "lucide-react";
import UserAvatar from "@/app/_components/UserAvatar";
import SetPasswordForm from "./SetPasswordForm";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const result = await handleWhoAmI();
  if (!result.success) throw new Error("Error fetching user data");
  if (!result.data) notFound();

  const user = result.data;

  // Check if user has a password (OAuth users don't)
  const hasPassword = user.authProvider === "local";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const rows = [
    { label: "Full Name", value: user.fullName || "Not set" },
    { label: "Username", value: user.username },
    { label: "Email Address", value: user.email },
    {
      label: "Account Type",
      value: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    },
    {
      label: "Login Method",
      value: hasPassword ? "Email & Password" : "Google OAuth",
    },
    {
      label: "Two-Factor Auth",
      value: user.mfaEnabled ? "✅ Enabled" : "Not enabled",
    },
    { label: "Account Created", value: formatDate(user.createdAt) },
    { label: "Last Updated", value: formatDate(user.updatedAt) },
  ];

  const stats = [
    { label: "Username", value: user.username },
    { label: "Email", value: user.email },
    { label: "Last Updated", value: formatDate(user.updatedAt) },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#faf7f2] text-gray-900">
        {/*  Hero  */}
        <div className="relative h-[38vh] min-h-65 border-b border-gray-200 px-10 flex flex-col justify-end pb-10 overflow-hidden bg-white">
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none" />

          {/* Top row */}
          <div className="flex items-start justify-between mb-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Your Profile
            </p>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1.5">
                Account Type
              </p>
              <p className="text-3xl font-bold uppercase text-gray-900 mb-1 font-heading">
                {user.role}
              </p>
              <p className="text-xs text-gray-500">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Avatar + name */}
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
              <UserAvatar
                imageUrl={user.imageUrl}
                username={user.username}
                size={72}
              />
            </div>

            {/* Name + stats */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[42px] font-bold leading-none text-gray-900 uppercase mb-4 truncate font-heading">
                {user.fullName || user.username}
              </h1>
              <div className="flex gap-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-0.5">
                      {s.label}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit button */}
            <Link
              href="/user/profile/edit"
              className="shrink-0 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-500 uppercase tracking-widest hover:border-gray-400 hover:text-gray-700 transition-all"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/*  Body  */}
        <div className="max-w-215 mx-auto px-10 py-14">
          {/* Section header */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1.5">
              Account Details
            </p>
            <h2 className="text-[32px] font-bold text-gray-900 font-heading">
              Personal Info
            </h2>
            <div className="mt-4 h-px bg-gray-200" />
          </div>

          {/* Row list */}
          <div>
            {rows.map((row, i) => (
              <div
                key={i}
                className="flex items-baseline gap-8 py-4 border-b border-gray-100 last:border-none"
              >
                <span className="w-44 shrink-0 text-[10px] uppercase tracking-[0.15em] text-gray-500">
                  {row.label}
                </span>
                <span className="text-sm text-gray-600">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Set Password for OAuth users */}
          {!hasPassword && (
            <div className="mb-12">
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1.5">
                  Security
                </p>
                <h2 className="text-[32px] font-bold text-gray-900 font-heading">
                  Set Password
                </h2>
                <div className="mt-4 h-px bg-gray-200" />
              </div>
              <SetPasswordForm />
            </div>
          )}

          {/* Actions */}
          <div className="mt-12 flex items-center justify-between">
            <Link
              href="/user/mfa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-500 uppercase tracking-widest hover:border-gray-400 hover:text-gray-700 transition-all"
            >
              {user.mfaEnabled ? (
                <Shield size={16} className="text-green-500" />
              ) : (
                <ShieldOff size={16} />
              )}
              Manage 2FA
            </Link>
            <Link
              href="/user/profile/edit"
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-500 uppercase tracking-widest hover:border-gray-400 hover:text-gray-700 transition-all"
            >
              + Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
