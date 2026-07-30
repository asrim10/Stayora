"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { handleGetReviewsByHotel } from "@/lib/actions/review-action";
import { getHotelById } from "@/lib/api/hotel";
import { getImageUrl } from "@/app/BookingUtils";
import { HotelReviewCard } from "./_components/HotelReviewCard";
import { ReviewModal } from "./_components/ReviewModal";
import { Stars } from "./_components/Stars";

interface HotelData {
  _id?: string;
  hotelName?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  price?: number;
  rating?: number;
  imageUrl?: string;
  availableRooms?: number;
}

interface ReviewData {
  _id?: string;
  id?: string;
  userId?: { _id?: string; fullName?: string; email?: string };
  rating: number;
  comment: string;
  createdAt?: string;
}

const DOTS = [
  { top: "30%", left: "20%" },
  { top: "55%", left: "60%" },
  { top: "20%", right: "25%" },
  { top: "65%", right: "10%" },
];

function HotelReviewsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const id = searchParams.get("hotelId");
    if (id) setHotelId(id);
  }, [searchParams]);

  const fetchReviews = async () => {
    if (!hotelId) return;
    const result = await handleGetReviewsByHotel(hotelId);
    if (result.success)
      setReviews(Array.isArray(result.data) ? result.data : []);
  };

  useEffect(() => {
    if (!hotelId) return;
    setLoading(true);
    Promise.all([
      getHotelById(hotelId)
        .then((res: any) => {
          const data = res?.success ? res.data : res;
          if (data) setHotel(data);
        })
        .catch(() => {}),
      fetchReviews(),
    ]).finally(() => setLoading(false));
  }, [hotelId]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const imageUrl = getImageUrl(hotel?.imageUrl);
  const location = [hotel?.address, hotel?.city, hotel?.country]
    .filter(Boolean)
    .join(", ");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <p className="text-gray-500 text-sm tracking-widest font-heading"
        >
          Loading...
        </p>
      </div>
    );
  }

  if (!hotelId) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center text-gray-900">
        <div className="text-center">
          <h2 className="text-[#059669] mb-4 font-heading">
            No Hotel Selected
          </h2>
          <p className="text-gray-500">Please select a hotel to view reviews.</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center text-gray-900">
        <div className="text-center">
          <h2 className="text-[#059669] mb-4 font-heading">
            Hotel Not Found
          </h2>
          <p className="text-gray-500">
            The selected hotel does not exist or could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900 font-heading"
    >
      {/* HERO */}
      <div
        className="relative flex items-end overflow-hidden"
        style={{ height: "65vh", minHeight: 450 }}
      >
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={hotel?.hotelName}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #0d1117 0%, #1a1a0f 40%, #0f0f0f 100%)",
            }}
          />
        )}
        {DOTS        .map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#059669] opacity-30"
            style={{ ...pos, boxShadow: "0 0 16px 4px rgba(201,169,110,0.15)" }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #faf7f2 0%, rgba(250,247,242,0.65) 45%, rgba(250,247,242,0.15) 100%)",
          }}
        />

        {avgRating && (
          <div className="absolute top-8 right-[5%] text-right">
            <p className="text-[#059669] text-[11px] tracking-[0.2em] uppercase mb-2">
              Guest Rating
            </p>
            <p className="text-gray-900 text-[52px] font-bold leading-none mb-2">
              {avgRating}
            </p>
            <Stars value={Math.round(Number(avgRating))} size={16} />
            <p className="text-gray-500 text-xs mt-1.5">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="relative z-10 px-[5%] pb-14">
          <p className="text-[#059669] text-[11px] tracking-[0.2em] uppercase mb-3">
            {location || "Hotel Reviews"}
          </p>
          <h1 className="text-gray-900 text-[clamp(28px,5vw,64px)] font-bold leading-tight uppercase mb-6">
            {hotel?.hotelName || "Hotel"}
          </h1>
          {user && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#059669] text-white text-[11px] tracking-[0.2em] uppercase font-bold px-8 py-3.5 border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-3 border-t border-b border-gray-200">
        {[
          {
            label: "Price Per Night",
            value: hotel.price ? `Rs. ${hotel.price.toLocaleString()}` : "—",
          },
          { label: "Available Rooms", value: hotel.availableRooms ?? "—" },
          { label: "Total Reviews", value: reviews.length },
        ].map((item, i) => (
          <div
            key={i}
            className={`px-[5%] py-8 ${i < 2 ? "border-r border-gray-200" : ""}`}
          >
            <p className="text-[#059669] text-[11px] tracking-[0.18em] uppercase mb-2">
              {item.label}
            </p>
            <p className="text-gray-900 text-[28px] font-bold m-0">{item.value}</p>
          </div>
        ))}
      </div>

      {/* DESCRIPTION */}
      {hotel?.description && (
        <div className="grid grid-cols-[1fr_2fr] gap-12 px-[5%] py-16 border-b border-gray-200">
          <p className="text-[#059669] text-[11px] tracking-[0.18em] uppercase m-0">
            About This Hotel
          </p>
          <p className="text-gray-500 text-[15px] leading-relaxed m-0">
            {hotel.description}
          </p>
        </div>
      )}

      {/* REVIEWS */}
      <div className="px-[5%] py-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#059669] text-[11px] tracking-[0.18em] uppercase mb-4">
              What Guests Say
            </p>
            <h2 className="text-gray-900 text-[clamp(24px,4vw,48px)] font-bold uppercase leading-tight m-0">
              Guest Reviews
            </h2>
          </div>
          {user && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-transparent border border-gray-300 text-[#059669] text-[11px] tracking-[0.2em] uppercase px-6 py-3 cursor-pointer hover:border-[#059669] transition-colors rounded"
            >
              + Add Review
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="grid grid-cols-3 border-t border-gray-200">
            {[
              {
                title: "Be The First",
                body: "No reviews yet. Share your experience and help others discover this property.",
              },
              {
                title: "Your Voice Matters",
                body: "Your honest feedback directly improves future stays for every guest who follows.",
              },
              {
                title: "Help Fellow Guests",
                body: "Rate the amenities, service, and overall experience to guide fellow travelers.",
              },
            ].map(({ title, body }, i) => (
              <div
                key={i}
                className={`py-10 ${i > 0 ? "pl-8 border-l border-gray-200" : "pr-8"}`}
              >
                <p className="text-[#059669] text-[11px] tracking-[0.15em] uppercase mb-4">
                  {title}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {reviews.map((r) => (
              <HotelReviewCard key={r._id || r.id} review={r} />
            ))}
          </div>
        )}
      </div>

      {showModal && hotel && (
        <ReviewModal
          hotelId={hotelId!}
          hotelName={hotel.hotelName || "Hotel"}
          onClose={() => setShowModal(false)}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  );
}

export default function HotelReviewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HotelReviewsContent />
    </Suspense>
  );
}
