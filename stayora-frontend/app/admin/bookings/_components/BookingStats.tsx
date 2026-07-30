"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  LogIn,
  LogOut,
} from "lucide-react";

interface BookingStatsProps {
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    checkedInBookings: number;
    checkedOutBookings: number;
  };
  isLoading?: boolean;
}

const CARDS = [
  {
    key: "totalBookings",
    label: "Total",
    Icon: BookOpen,
    color: "text-[#059669]",
    bar: "bg-[#059669]",
  },
  {
    key: "confirmedBookings",
    label: "Confirmed",
    Icon: CheckCircle,
    color: "text-[#4ade80]",
    bar: "bg-[#4ade80]",
  },
  {
    key: "pendingBookings",
    label: "Pending",
    Icon: Clock,
    color: "text-[#facc15]",
    bar: "bg-[#facc15]",
  },
  {
    key: "cancelledBookings",
    label: "Cancelled",
    Icon: XCircle,
    color: "text-[#f87171]",
    bar: "bg-[#f87171]",
  },
  {
    key: "checkedInBookings",
    label: "Checked In",
    Icon: LogIn,
    color: "text-[#a78bfa]",
    bar: "bg-[#a78bfa]",
  },
  {
    key: "checkedOutBookings",
    label: "Checked Out",
    Icon: LogOut,
    color: "text-[#60a5fa]",
    bar: "bg-[#60a5fa]",
  },
] as const;

export function BookingStats({ stats, isLoading }: BookingStatsProps) {
  return (
    <div className="grid grid-cols-6 border-t border-l border-gray-200 shadow-sm">
      {CARDS.map(({ key, label, Icon, color, bar }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white border-r border-b border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-gray-500 text-[9px] tracking-[0.2em] uppercase m-0">
              {label}
            </p>
            <Icon size={13} className={`${color} opacity-65`} />
          </div>
          <p className="text-gray-900 text-[34px] font-bold mb-4 leading-none m-0 font-heading"
          >
            {isLoading ? <span className="text-gray-300">—</span> : stats[key]}
          </p>
          <div className={`w-5 h-0.5 ${bar} opacity-50`} />
        </motion.div>
      ))}
    </div>
  );
}

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
} as const;

export const PAYMENT_STATUS = {
  PAID: "paid",
  UNPAID: "unpaid",
  REFUNDED: "refunded",
} as const;

export const getStatusColor = (
  status: string,
): "default" | "success" | "warning" | "destructive" => {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "paid":
      return "success";
    case "pending":
    case "unpaid":
      return "warning";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "default";
  }
};

export const formatDate = (date: string | Date) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

export const calculateDays = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  try {
    return Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    );
  } catch {
    return 0;
  }
};
