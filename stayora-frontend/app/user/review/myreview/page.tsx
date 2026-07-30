"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  handleCreateReview,
  handleGetMyReviews,
} from "@/lib/actions/review-action";
import { useAuth } from "@/app/context/AuthContext";
import { ReviewCreateData } from "@/app/user/review/schema";
import { Stars } from "../_components/Stars";
import { ReviewCard } from "../_components/ReviewCard";

interface ReviewData {
  _id?: string;
  id?: string;
  hotel?: {
    _id?: string;
    hotelName?: string;
    images?: string[];
    city?: string;
    country?: string;
  };
  hotelName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

const DOTS = [
  { top: "30%", left: "20%" },
  { top: "55%", left: "45%" },
  { top: "25%", right: "30%" },
  { top: "60%", right: "15%" },
];

const EMPTY_COLS = [
  {
    title: "Share Your Stay",
    body: "Your honest feedback helps us improve and helps fellow travelers make better decisions.",
  },
  {
    title: "Rate Your Experience",
    body: "Rate from 1 to 5 stars and tell the world what made your visit memorable.",
  },
  {
    title: "Help Others Choose",
    body: "Every review contributes to a community of informed travelers.",
  },
];

function MyReviewsContent() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get("hotelId") || "";
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"write" | "my">(hotelId ? "write" : "my");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { comment: "" } });

  const fetchReviews = async () => {
    const r = await handleGetMyReviews();
    if (r.success) setReviews(Array.isArray(r.data) ? r.data : []);
  };

  useEffect(() => {
    if (!user) return;
    fetchReviews().finally(() => setLoading(false));
  }, [user]);

  const onSubmit = async (data: any) => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    const result = await handleCreateReview({
      hotelId,
      rating,
      comment: data.comment,
    } as ReviewCreateData);
    setSubmitting(false);
    if (result.success) {
      toast.success("Review submitted");
      reset();
      setRating(0);
      setTab("my");
      fetchReviews();
    } else toast.error(result.message);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <p className="text-[#059669] text-lg font-heading"
        >
          You must be logged in to view your reviews.
        </p>
      </div>
    );
  }

  if (tab === "write" && !hotelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center font-heading">
          <h2 className="text-[#059669] mb-4">No Hotel Selected</h2>
          <p className="text-gray-500">
            Please select a hotel to write a review.
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
        style={{ height: "55vh", minHeight: 400 }}
      >
        <div
          className="absolute inset-0"
          style={{
          background:
            "linear-gradient(135deg, #f5f0e8 0%, #faf7f2 40%, #f0ebe3 100%)",
          }}
        />
        {DOTS.map((pos, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#059669] opacity-20"
            style={{ ...pos, width: 5, height: 5, boxShadow: "0 0 20px 4px rgba(201,169,110,0.15)" }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
          background:
            "linear-gradient(to top, #faf7f2 0%, rgba(250,247,242,0.5) 50%, transparent 100%)",
          }}
        />
        <div className="absolute top-[28%] right-[8%] text-right">
          <p className="text-[#059669] text-sm tracking-[0.2em] uppercase mb-2">
            Your Experience
          </p>
          <h2 className="text-gray-900 text-[clamp(18px,3vw,28px)] font-light leading-snug tracking-[0.05em] m-0">
            MATTERS
            <br />
            TO US
          </h2>
        </div>
        <div className="relative z-10 px-[5%] pb-16">
          <p className="text-[#059669] text-xs tracking-[0.2em] uppercase mb-4">
            Guest Reviews
          </p>
          <h1 className="text-gray-900 text-[clamp(32px,6vw,72px)] font-bold leading-tight uppercase tracking-tight m-0">
            SHARE YOUR
            <br />
            STAY
          </h1>
        </div>
      </div>

      {/* STATS */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-3 border-t border-b border-gray-200">
          {[
            { label: "Total Reviews", value: reviews.length },
            {
              label: "Average Rating",
              value: avgRating ? `${avgRating} / 5` : "—",
            },
            {
              label: "Hotels Reviewed",
              value: new Set(reviews.map((r) => r.hotel?._id || r.hotelName))
                .size,
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`px-[5%] py-8 ${i < 2 ? "border-r border-gray-200" : ""}`}
            >
              <p className="text-[#059669] text-[11px] tracking-[0.18em] uppercase mb-2">
                {s.label}
              </p>
              <p className="text-gray-900 text-[32px] font-bold m-0">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* TABS */}
      <div className="px-[5%] pt-12 pb-0 border-b border-gray-200 flex gap-12">
        {hotelId && (
          <button
            onClick={() => setTab("write")}
            className={`bg-transparent border-none cursor-pointer text-[11px] tracking-[0.2em] uppercase pb-4 transition-colors border-b ${
              tab === "write"
                ? "text-[#059669] border-[#059669]"
                : "text-gray-500 border-transparent"
            }`}
          >
            Write a Review
          </button>
        )}
        <button
          onClick={() => setTab("my")}
          className={`bg-transparent border-none cursor-pointer text-[11px] tracking-[0.2em] uppercase pb-4 transition-colors border-b ${
            tab === "my"
              ? "text-[#059669] border-[#059669]"
              : "text-gray-500 border-transparent"
          }`}
        >
          My Reviews {reviews.length > 0 && `(${reviews.length})`}
        </button>
      </div>

      {/* WRITE REVIEW */}
      {tab === "write" && hotelId && (
        <div className="px-[5%] py-16">
          <div className="max-w-2xl">
            <p className="text-[#059669] text-[11px] tracking-[0.18em] uppercase mb-12">
              Share Your Experience
            </p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-10"
            >
              <div>
              <p className="text-gray-500 text-[11px] tracking-[0.15em] uppercase mb-4">
                Your Rating
              </p>
                <Stars value={rating} onChange={setRating} size={36} />
              </div>
              <div>
                <p className="text-gray-500 text-[11px] tracking-[0.15em] uppercase mb-3">
                  Your Review
                </p>
                <textarea
                  {...register("comment", {
                    required: "Review is required",
                    minLength: { value: 5, message: "Min 5 characters" },
                    maxLength: { value: 1000, message: "Max 1000 characters" },
                  })}
                  rows={6}
                  placeholder="Describe your experience in detail..."
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm leading-relaxed p-4 outline-none resize-none focus:border-[#059669] transition-colors rounded"
                />
                {errors.comment && (
                  <p className="text-[#ef4444] text-xs mt-1.5">
                    {errors.comment.message as string}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="self-start bg-[#059669] text-white text-[11px] tracking-[0.2em] uppercase font-bold px-10 py-4 border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MY REVIEWS */}
      {tab === "my" && (
        <div className="px-[5%] py-16">
          <p className="text-[#059669] text-[11px] tracking-[0.18em] uppercase mb-4">
            Your Feedback
          </p>
          <h2 className="text-gray-900 text-[clamp(24px,4vw,48px)] font-bold uppercase mb-12 leading-tight">
            MY REVIEWS
          </h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : reviews.length === 0 ? (
            <div className="grid grid-cols-3 border-t border-gray-200">
              {EMPTY_COLS.map(({ title, body }, i) => (
                <div
                  key={i}
                  className={`py-10 ${i > 0 ? "pl-8 border-l border-gray-200" : "pr-8"}`}
                >
                  <p className="text-[#059669] text-[11px] tracking-[0.15em] uppercase mb-4">
                    {title}
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id || review.id}
                  review={review}
                  onDeleted={(id) =>
                    setReviews((prev) =>
                      prev.filter((r) => (r._id || r.id) !== id),
                    )
                  }
                  onUpdated={(updated) =>
                    setReviews((prev) =>
                      prev.map((r) =>
                        (r._id || r.id) === (updated._id || updated.id)
                          ? updated
                          : r,
                      ),
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyReviewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MyReviewsContent />
    </Suspense>
  );
}
