"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getHotelById } from "../../../lib/api/hotel";
import { createBooking } from "../../../lib/api/booking";
import { Heart, MapPin, Star, Waves, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";
import dynamic from "next/dynamic";
import { handleInitiateKhaltiPayment } from "@/lib/actions/payment-action";
import { getReviewsByHotel } from "@/lib/api/review";

const HotelMap = dynamic(() => import("../_components/HotelMap"), {
  ssr: false,
});

const inputCls =
  "w-full bg-white border border-gray-300 text-gray-900 text-sm px-4 py-3 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 rounded";
const labelCls =
  "block text-[#059669] text-[9px] tracking-[0.18em] uppercase mb-2";

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2">
        {eyebrow}
      </p>
      <h3
        className="text-gray-900 text-2xl font-bold uppercase m-0 font-heading"
      >
        {title}
      </h3>
    </div>
  );
}

function HotelBookingContent() {
  const searchParams = useSearchParams();
  const hotelId = searchParams?.get("hotelId") || "";
  const router = useRouter();
  const { user } = useAuth();

  const [hotel, setHotel] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [nights, setNights] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hotelId) return;
    setLoading(true);
    getHotelById(hotelId)
      .then((res: any) => {
        if (res?.success) setHotel(res.data);
        else setHotel(res);
      })
      .catch(() => setHotel(null))
      .finally(() => setLoading(false));
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId) return;
    getReviewsByHotel(hotelId)
      .then((res: any) => {
        if (res?.success && Array.isArray(res.data)) setReviews(res.data);
        else if (Array.isArray(res)) setReviews(res);
        else setReviews([]);
      })
      .catch(() => setReviews([]));
  }, [hotelId]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setNights(0);
      setTotalPrice(0);
      setTaxes(0);
      return;
    }
    const diff = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    );
    const n = diff > 0 ? diff : 0;
    setNights(n);
    const sub = n * (hotel?.price || 0);
    const t = Math.round(sub * 0.12);
    setTaxes(t);
    setTotalPrice(sub + t);
  }, [checkIn, checkOut, hotel]);

  const todayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const nextDate = (s: string, add = 1) => {
    const d = new Date(s);
    d.setDate(d.getDate() + add);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleCheckIn = (v: string) => {
    if (v < todayString()) {
      toast.error("Cannot select past dates for check-in");
      return;
    }
    setCheckIn(v);
    if (checkOut && new Date(checkOut) <= new Date(v)) setCheckOut("");
  };

  const handleCheckOut = (v: string) => {
    if (v < todayString()) {
      toast.error("Cannot select past dates");
      return;
    }
    if (checkIn && new Date(v) <= new Date(checkIn)) {
      toast.error("Check-out must be after check-in");
      return;
    }
    setCheckOut(v);
  };

  const getImageUrl = (url?: string) => {
    if (!url) return "/api/placeholder/800/450";
    if (url.startsWith("http")) return url;
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "") + url;
  };

  const handleBook = async (paymentMethod: "cash" | "online") => {
    if (!hotel) return toast.error("No hotel selected");
    if (!checkIn || !checkOut)
      return toast.error("Please select check-in and check-out dates");
    if (!fullName || !email)
      return toast.error("Please provide your name and email");

    try {
      setSubmitting(true);

      const res = await createBooking({
        hotelId: hotel._id || hotel.id || hotelId,
        fullName,
        email,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice,
        paymentMethod,
      });

      if (!res?.success) return toast.error(res?.message || "Booking failed");

      const bookingId = res.data._id;

      if (paymentMethod === "online") {
        const khaltiData = await handleInitiateKhaltiPayment({
          bookingId,
          totalPrice,
          fullName,
          email,
        });

        if (khaltiData.success && khaltiData.data?.payment_url) {
          window.location.href = khaltiData.data.payment_url;
        } else {
          toast.error(
            khaltiData.message || "Failed to initiate Khalti payment",
          );
        }
        return;
      }

      toast.success("Booking created successfully");
      router.push("/user/booking/history");
    } catch (e: any) {
      toast.error(e.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const location = hotel
    ? [hotel.address, hotel.city, hotel.country].filter(Boolean).join(", ")
    : "";

  const avgRating = reviews.length
    ? (
        reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      ).toFixed(1)
    : null;

  return (
    <div
      className="min-h-screen bg-[#faf7f2] text-gray-900"
    >
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.5;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        select option {
          background-color: white;
          color: #1a1a1a;
        }
      `}</style>

      {/* TOP NAV */}
      <div className="border-b border-gray-200 px-12 py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#6b7280] text-[10px] tracking-[0.16em] uppercase bg-transparent border-none cursor-pointer hover:text-[#059669] transition-colors"
        >
          <ChevronLeft size={14} /> Back
        </button>
        <p className="text-[#059669] text-[10px] tracking-[0.22em] uppercase m-0">
          Stayora
        </p>
        <Heart
          size={16}
          className="text-gray-300 cursor-pointer hover:text-[#059669] transition-colors"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-64 bg-gray-100 border border-gray-200 animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      )}

      {!loading && !hotel && (
        <div className="flex items-center justify-center py-32 text-gray-500 text-sm">
          Hotel not found.
        </div>
      )}

      {!loading && hotel && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 380px" }}>
          {/* LEFT */}
          <div className="border-r border-gray-200 px-12 py-12">
            <div className="mb-3">
              <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2">
                {location}
              </p>
              <h1
                className="text-gray-900 font-bold uppercase leading-tight m-0 font-heading"
                style={{ fontSize: "clamp(28px, 3vw, 48px)" }}
              >
                {hotel.hotelName || hotel.name}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <Star size={13} className="text-[#059669] fill-[#059669]" />
                    <span className="text-[#059669] text-sm font-bold">
                      {avgRating}
                    </span>
                    <span className="text-gray-500 text-xs">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <MapPin size={11} className="text-[#059669]" />
                  {location}
                </div>
              </div>
            </div>

            {/* IMAGE GALLERY */}
            <div
              className="grid gap-px bg-gray-200 mb-14"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr",
                gridTemplateRows: "280px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="overflow-hidden bg-gray-100 relative">
                  <img
                    src={getImageUrl(hotel.imageUrl)}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {i === 2 && (
                    <button className="absolute bottom-4 right-4 bg-white/90 border border-gray-200 text-gray-500 text-[10px] tracking-[0.14em] uppercase px-4 py-2 hover:border-[#059669] hover:text-[#059669] transition-colors cursor-pointer rounded">
                      All Photos
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ABOUT */}
            <div className="border-b border-gray-200 pb-12 mb-12">
              <SectionTitle eyebrow="Overview" title="About This Hotel" />
              <p className="text-gray-500 text-sm leading-relaxed">
                {hotel.description || "No description available."}
              </p>
            </div>

            {/* AMENITIES */}
            <div className="border-b border-gray-200 pb-12 mb-12">
              <SectionTitle eyebrow="Facilities" title="Amenities" />
              <div className="grid grid-cols-2 gap-3">
                {(
                  hotel.amenities || [
                    "Swimming Pool",
                    "Free Wi-Fi",
                    "Free Parking",
                    "Restaurant",
                    "Gym",
                    "Spa",
                  ]
                ).map((a: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-gray-500 text-sm"
                  >
                    <Waves size={13} className="text-[#059669] shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* LOCATION */}
            <div className="border-b border-gray-200 pb-12 mb-12">
              <SectionTitle eyebrow="Where We Are" title="Location" />
              {hotel.coordinates ? (
                <>
                  <div className="h-52 w-full overflow-hidden border border-gray-200 rounded">
                    <HotelMap
                      lat={hotel.coordinates.lat}
                      lng={hotel.coordinates.lng}
                      hotelName={hotel.hotelName || hotel.name}
                      location={location}
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${hotel.coordinates.lat},${hotel.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block bg-white border border-gray-300 text-[#059669] text-[10px] tracking-[0.14em] uppercase px-4 py-2 hover:border-[#059669] hover:text-[#059669] transition-colors rounded"
                  >
                    Open in Google Maps
                  </a>
                </>
              ) : (
                <div className="h-52 bg-gray-100 border border-gray-200 flex items-center justify-center rounded">
                  <p className="text-gray-400 text-[9px] tracking-[0.2em] uppercase">
                    Location unavailable
                  </p>
                </div>
              )}
            </div>

            {/* REVIEWS */}
            <div>
              <SectionTitle eyebrow="What Guests Say" title="Guest Reviews" />
              {reviews.length === 0 ? (
                <div className="border border-gray-200 p-10 text-center rounded">
                  <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase">
                    No reviews yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-px bg-gray-200">
                  {reviews.map((r: any, i: number) => {
                    const reviewer =
                      r.userId?.fullName || r.fullName || r.name || "Guest";
                    const comment = r.comment || r.text || "";
                    const rating = r.rating || 5;
                    return (
                      <div key={r._id || i} className="bg-white p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-[#059669] text-xs font-bold">
                            {reviewer[0]?.toUpperCase()}
                          </div>
                          <span className="text-gray-900 text-sm font-bold">
                            {reviewer}
                          </span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                size={10}
                                className={
                                  j < rating
                                    ? "text-[#059669] fill-[#059669]"
                                    : "text-gray-200 fill-gray-200"
                                }
                              />
                            ))}
                          </div>
                          {r.createdAt && (
                            <span className="text-gray-400 text-[10px] ml-auto">
                              {new Date(r.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed m-0">
                          {comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              {reviews.length > 0 && (
                <button
                  onClick={() => router.push(`/user/review?hotelId=${hotelId}`)}
                  className="text-[#059669] text-[10px] tracking-[0.16em] uppercase mt-5 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                >
                  Show all {reviews.length} reviews →
                </button>
              )}
            </div>
          </div>

          {/* RIGHT - BOOKING PANEL */}
          <div className="sticky top-0 h-screen overflow-y-auto bg-white border-l border-gray-200 flex flex-col shadow-sm">
            <div className="p-8 border-b border-gray-200">
              <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2">
                Starting from
              </p>
              <p className="text-gray-900 text-3xl font-bold m-0">
                Rs. {(hotel.price || 0).toLocaleString()}
                <span className="text-gray-500 text-sm font-normal">
                  /night
                </span>
              </p>
            </div>

            <div className="p-8 flex flex-col gap-5 flex-1">
              <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase">
                Reserve Your Stay
              </p>

              <div>
                <label className={labelCls}>Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  min={todayString()}
                  onChange={(e) => handleCheckIn(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn ? nextDate(checkIn) : todayString()}
                  onChange={(e) => handleCheckOut(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className={inputCls}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>

              {nights > 0 && (
                <div className="border-t border-b border-gray-200 py-5 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Rs. {(hotel.price || 0).toLocaleString()} × {nights}{" "}
                      nights
                    </span>
                    <span className="text-gray-900">
                      Rs. {((hotel.price || 0) * nights).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & fees (12%)</span>
                    <span className="text-gray-900">
                      Rs. {taxes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-[#059669] text-lg">
                      Rs. {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <button
                  disabled={submitting || nights <= 0}
                  onClick={() => handleBook("online")}
                  className="w-full bg-[#5C2D91] text-white text-[11px] font-bold tracking-[0.18em] uppercase py-4 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? "Processing..." : "Pay with Khalti"}
                </button>
                <button
                  disabled={submitting || nights <= 0}
                  onClick={() => handleBook("cash")}
                  className="w-full bg-transparent border border-[#059669] text-[#059669] text-[11px] font-bold tracking-[0.18em] uppercase py-4 hover:bg-[#059669] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded"
                >
                  {submitting ? "Booking..." : "Pay at Hotel (Cash)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HotelBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HotelBookingContent />
    </Suspense>
  );
}
