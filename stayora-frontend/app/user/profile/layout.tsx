"use client";

import Sidebar from "../_components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#faf7f2]">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
