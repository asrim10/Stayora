import { handleGetOneUser } from "@/lib/actions/admin/user-action";
import Link from "next/link";
import UserAvatar from "@/app/_components/UserAvatar";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await handleGetOneUser(id);

  if (!response.success) {
    throw new Error(response.message || "Failed to load user");
  }

  const user = response.data;

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <div className="border-b border-gray-200 px-12 py-12 flex items-end justify-between">
        <div>
          <p className="text-[#059669] text-[10px] tracking-[0.22em] uppercase mb-3">
            Admin Panel
          </p>
          <h1 className="text-gray-900 text-4xl font-bold uppercase leading-tight font-heading">
            User Details
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="border border-gray-200 text-gray-500 text-[11px] tracking-[0.14em] uppercase px-6 py-3 hover:border-gray-300 hover:text-gray-700 transition-colors rounded"
          >
            ← Back
          </Link>
          <Link
            href={`/admin/users/${id}/edit`}
            className="bg-[#059669] text-white text-[11px] font-bold tracking-[0.18em] uppercase px-6 py-3 hover:opacity-90 transition-opacity rounded"
          >
            Edit User
          </Link>
        </div>
      </div>

      <div className="px-12 py-12">
        <div className="flex items-center gap-8 pb-10 border-b border-gray-200 mb-2">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shrink-0 bg-gray-100">
            <UserAvatar
              imageUrl={user.imageUrl}
              username={user.fullName}
              size={80}
            />
          </div>
          <div>
            <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-1">
              {user.role === "admin" ? "Administrator" : "Member"}
            </p>
            <h2 className="text-gray-900 text-2xl font-bold font-heading"
            >
              {user.fullName}
            </h2>
            <p className="text-[#4b5563] text-sm mt-0.5">@{user.username}</p>
          </div>
        </div>

        <div className="border-t border-gray-200">
          {[
            { label: "Full Name", value: user.fullName },
            { label: "Email", value: user.email },
            { label: "Username", value: `@${user.username}` },
            { label: "Role", value: user.role, isRole: true },
          ].map(({ label, value, isRole }) => (
            <div
              key={label}
              className="grid grid-cols-[1fr_2fr] gap-12 py-7 border-b border-gray-200 items-center"
            >
              <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase">
                {label}
              </p>
              {isRole ? (
                <span
                  className={`text-[9px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 border w-fit ${
                    user.role === "admin"
                      ? "bg-emerald-50 text-[#059669] border-[#05966933]"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  {value}
                </span>
              ) : (
                <p className="text-gray-900 text-sm font-medium">{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
