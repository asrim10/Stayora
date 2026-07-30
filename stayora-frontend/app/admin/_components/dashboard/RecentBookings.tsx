const STATUS_STYLES: Record<string, string> = {
  confirmed: "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.08]",
  pending: "text-amber-400  border-amber-500/20  bg-amber-500/[0.08]",
  cancelled: "text-red-400   border-red-500/20   bg-red-500/[0.08]",
  "checked-in": "text-blue-400  border-blue-500/20  bg-blue-500/[0.08]",
  "checked-out": "text-purple-400 border-purple-500/20 bg-purple-500/[0.08]",
};

interface Booking {
  _id: string;
  userId?: string;
  hotelId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
}

const COLS = ["Guest", "Property", "Check-in", "Check-out", "Amount", "Status"];

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGuestName(userId: Booking["userId"]) {
  if (!userId) return "—";
  if (typeof userId === "object") return userId || "—";
  return "Guest";
}

function getHotelName(hotelId: Booking["hotelId"]) {
  if (!hotelId) return "—";
  if (typeof hotelId === "object") return hotelId || "—";
  return "Hotel";
}

export function RecentBookings({ bookings }: { bookings: Booking[] }) {
  const recent = bookings.slice(0, 7);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-0.5">
            Latest Activity
          </p>
          <h3
            className="text-lg font-bold text-gray-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Recent Bookings
          </h3>
        </div>
        <a
          href="/admin/bookings"
          className="text-[10px] uppercase tracking-[0.15em] text-gray-500 hover:text-[#059669] transition-colors"
        >
          View All →
        </a>
      </div>

      {/* Column headers */}
      <div
        className="grid gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50"
        style={{ gridTemplateColumns: "1.5fr 1.5fr 0.9fr 0.9fr 90px 110px" }}
      >
        {COLS.map((c) => (
          <span
            key={c}
            className="text-[9px] uppercase tracking-[0.15em] text-gray-500"
          >
            {c}
          </span>
        ))}
      </div>

      {recent.length === 0 ? (
        <div className="py-16 text-center text-gray-500 text-sm">
          No bookings yet
        </div>
      ) : (
        recent.map((b) => (
          <div
            key={b._id}
            className="grid gap-4 px-6 py-4 items-center border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
            style={{
              gridTemplateColumns: "1.5fr 1.5fr 0.9fr 0.9fr 90px 110px",
            }}
          >
            <div className="min-w-0">
              <p className="text-sm text-gray-800 truncate">
                {getGuestName(b.userId)}
              </p>
            </div>
            <span className="text-xs text-gray-500 truncate">
              {getHotelName(b.hotelId)}
            </span>
            <span className="text-xs text-[#6b6b8a]">
              {formatDate(b.checkInDate)}
            </span>
            <span className="text-xs text-[#6b6b8a]">
              {formatDate(b.checkOutDate)}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {b.totalPrice != null
                ? `Rs.${b.totalPrice.toLocaleString()}`
                : "—"}
            </span>
            <span
              className={`text-[10px] font-medium px-2.5 py-0.5 rounded border w-fit capitalize ${STATUS_STYLES[b.status || ""] || "text-gray-500 border-gray-200 bg-gray-50"}`}
            >
              {b.status || "—"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
