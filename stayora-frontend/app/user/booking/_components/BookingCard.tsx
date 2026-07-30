"use client";

import { useState } from "react";
import {
  formatDate,
  getImageUrl,
  getLocationString,
  getStatusColor,
  getStatusText,
} from "@/app/BookingUtils";
import { Calendar, Users, ChevronRight, Star, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingCardProps {
  booking: any;
  hotelData: any;
  onReview: (booking: any) => void;
  onCancel?: (bookingId: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-blue-50 text-blue-600 border border-blue-200",
  confirmed: "bg-blue-50 text-blue-600 border border-blue-200",
  completed: "bg-green-50 text-green-600 border border-green-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  checked_in: "bg-purple-50 text-purple-600 border border-purple-200",
  checked_out: "bg-blue-50 text-blue-600 border border-blue-200",
};

function statusStyle(status: string) {
  return (
    STATUS_STYLES[(status || "").toLowerCase().trim()] ||
    "bg-gray-100 text-gray-500 border border-gray-200"
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-gray-400 text-[9px] tracking-[0.18em] uppercase">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[#059669]">{icon}</span>
        <span className="text-gray-900 text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}

function CancelModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white border border-gray-200 w-[90%] max-w-md p-8 rounded-lg shadow-xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-transparent border-none cursor-pointer text-lg leading-none"
        >
          ✕
        </button>
        <p className="text-[#059669] text-[10px] tracking-[0.22em] uppercase mb-3">
          Confirm Action
        </p>
        <h2 className="text-gray-900 text-2xl font-bold uppercase mb-5 m-0 font-heading">
          Cancel Booking
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Are you sure you want to cancel this booking? This action cannot be
          undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 bg-white text-gray-500 text-[11px] tracking-[0.14em] uppercase py-3 cursor-pointer hover:border-gray-400 hover:text-gray-700 transition-colors rounded"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 border border-red-600 text-white text-[11px] tracking-[0.14em] uppercase font-bold py-3 cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-50 rounded"
          >
            {loading ? "Cancelling..." : "Cancel Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

const CANCELLABLE_STATUSES = ["upcoming", "confirmed", "pending"];

export default function BookingCard({
  booking,
  hotelData,
  onReview,
  onCancel,
}: BookingCardProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const hotelReviewId = hotelData?._id || booking.hotelId || booking.hotel?._id;
  const hotelId = hotelData?._id || booking.hotelId || booking.hotel?._id;

  const canCancel = CANCELLABLE_STATUSES.includes(
    (booking.status || "").toLowerCase(),
  );

  const handleCancel = async () => {
    setCancelling(true);
    await onCancel?.(booking._id || booking.id);
    setCancelling(false);
    setShowCancelModal(false);
  };

  return (
    <>
      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancel}
          onCancel={() => setShowCancelModal(false)}
          loading={cancelling}
        />
      )}

      <div className="border border-gray-200 bg-white hover:border-gray-300 transition-colors rounded-lg shadow-sm">
        <div className="grid" style={{ gridTemplateColumns: "240px 1fr" }}>
          {/* Image */}
          <div className="relative overflow-hidden bg-gray-100 h-full min-h-50 rounded-l-lg">
            <img
              src={getImageUrl(hotelData?.imageUrl || booking.image)}
              alt={hotelData?.hotelName || booking.hotelName || "Hotel"}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)",
              }}
            />
            <div className="absolute bottom-3 left-3">
              <span
                className={`text-[10px] px-2 py-1 font-bold tracking-widest uppercase ${statusStyle(booking.status)}`}
              >
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between p-7">
            {/* Top */}
            <div>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-[#059669] text-[9px] tracking-[0.18em] uppercase mb-1">
                    {getLocationString(hotelData)}
                  </p>
                  <h3 className="text-gray-900 text-xl font-bold uppercase leading-snug font-heading">
                    {hotelData?.hotelName || booking.hotelName || "Hotel"}
                  </h3>
                </div>
                {booking.rating && (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-[#05966933] px-3 py-1.5 rounded">
                    <Star size={11} className="text-[#059669] fill-[#059669]" />
                    <span className="text-[#059669] text-xs font-bold">
                      {booking.rating}.0
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-[10px] font-mono mt-1">
                ID: {(booking._id || booking.id || "").slice(-12).toUpperCase()}
                &nbsp;·&nbsp;
                {booking.confirmation || booking.confirmationCode || "—"}
              </p>
            </div>

            {/* Dates + Guests */}
            <div className="grid grid-cols-3 border-t border-b border-gray-200 py-5 my-5 gap-4">
              <InfoCell
                icon={<Calendar size={13} />}
                label="Check-in"
                value={formatDate(booking.checkInDate)}
              />
              <InfoCell
                icon={<Calendar size={13} />}
                label="Check-out"
                value={formatDate(booking.checkOutDate)}
              />
              <InfoCell
                icon={<Users size={13} />}
                label="Guests"
                value={`${booking.guests || 1} ${
                  (booking.guests || 1) === 1 ? "Guest" : "Guests"
                }`}
              />
            </div>

            {/* Bottom */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-gray-400 text-[9px] tracking-[0.18em] uppercase mb-1">
                  {booking.nights || 1}{" "}
                  {(booking.nights || 1) === 1 ? "Night" : "Nights"}
                </p>
                <p className="text-gray-900 text-2xl font-bold font-heading">
                  Rs.{" "}
                  {(
                    booking.totalAmount ||
                    booking.totalPrice ||
                    0
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {canCancel && (
                  <>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="border border-red-300 text-red-600 text-[10px] tracking-[0.14em] uppercase px-4 py-2.5 hover:bg-red-50 transition-colors bg-white cursor-pointer rounded"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() =>
                    router.push(`/user/review?hotelId=${hotelReviewId}`)
                  }
                  className="border border-gray-300 text-gray-500 text-[10px] tracking-[0.14em] uppercase px-4 py-2.5 hover:border-[#059669] hover:text-[#059669] transition-colors bg-white cursor-pointer rounded flex items-center gap-1.5"
                >
                  <Star size={12} /> Review
                </button>
                <button
                  onClick={() =>
                    router.push(`/user/booking?hotelId=${hotelId}`)
                  }
                  className="bg-[#059669] text-white text-[10px] font-bold tracking-[0.14em] uppercase px-5 py-2.5 hover:opacity-90 transition-opacity cursor-pointer border-none rounded flex items-center gap-1.5"
                >
                  Details <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
