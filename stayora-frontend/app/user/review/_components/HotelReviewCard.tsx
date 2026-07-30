import { Stars } from "./Stars";

interface ReviewData {
  _id?: string;
  id?: string;
  userId?: { fullName?: string; email?: string };
  rating: number;
  comment: string;
  createdAt?: string;
}

export function HotelReviewCard({ review }: { review: ReviewData }) {
  const name = review.userId?.fullName || review.userId?.email || "Guest";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="border-t border-gray-200 py-10 grid grid-cols-[1fr_2fr] gap-12">
      <div className="flex flex-col gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[#059669] text-sm font-bold">
          {initials}
        </div>
        <p className="text-gray-900 text-sm font-semibold m-0">{name}</p>
        <Stars value={review.rating} size={14} />
        <p className="text-gray-500 text-xs m-0">{date}</p>
      </div>
      <div>
        <p className="text-gray-600 text-sm leading-relaxed m-0">
          {review.comment}
        </p>
      </div>
    </div>
  );
}
