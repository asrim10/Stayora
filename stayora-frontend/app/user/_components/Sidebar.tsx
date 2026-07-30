"use client";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Compass,
  Heart,
  Inbox,
  CalendarDays,
  Star,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { handleGetUnreadCount } from "@/lib/actions/notification-action";
import UserAvatar from "@/app/_components/UserAvatar";

const menuItems = [
  { label: "Home", href: "/user/dashboard", icon: Home },
  { label: "Discover", href: "/user/hotels", icon: Compass },
  { label: "Favourite", href: "/user/favourite", icon: Heart },
  { label: "Inbox", href: "/user/inbox", icon: Inbox, badge: true },
  {
    label: "Booking History",
    href: "/user/booking/history",
    icon: CalendarDays,
  },
  { label: "My Reviews", href: "/user/review/myreview", icon: Star },
  { label: "Profile", href: "/user/profile", icon: User },
  {
    label: "Security (2FA)",
    href: "/user/mfa",
    icon: Shield,
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0); // 👈 new

  // 👇 poll unread count every 30 seconds
  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      const res = await handleGetUnreadCount();
      if (res?.success) setUnreadCount(res.data || 0);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div
      className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0 font-heading"
    >
      {/* USER CARD */}
      <div className="px-6 pt-8 pb-6 border-b border-gray-200">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
          <UserAvatar
            imageUrl={user?.imageUrl}
            username={user?.username}
            size={64}
          />
        </div>
        <p className="text-gray-900 text-[15px] font-bold m-0 mb-0.5 tracking-[0.02em]">
          {user?.fullName || user?.username || "Guest User"}
        </p>
        <p className="text-[#059669] text-[10px] tracking-[0.18em] uppercase m-0">
          Traveler Enthusiast
        </p>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-4 py-6">
        <p className="text-gray-400 text-[9px] tracking-[0.2em] uppercase ml-2 mb-3">
          Menu
        </p>
        <div className="flex flex-col gap-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 no-underline transition-colors border-l-2 ${
                  isActive
                    ? "bg-amber-50 border-[#059669] text-[#059669]"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={15} strokeWidth={1.8} />
                  <span
                    className={`text-[13px] tracking-[0.03em] ${isActive ? "font-semibold" : "font-normal"}`}
                  >
                    {item.label}
                  </span>
                </div>
                {/* 👇 show unread badge only for Inbox */}
                {"badge" in item && item.badge && unreadCount > 0 && (
                  <span className="bg-[#059669] text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 text-[13px] tracking-[0.03em] bg-transparent border-none cursor-pointer transition-colors hover:text-[#f87171] hover:bg-red-50 rounded"

        >
          <LogOut size={15} strokeWidth={1.8} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
