"use client";
import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import Avatar from "./Avatar";
import { IReview } from "../schema";

interface ReviewModalProps {
  review: IReview;
  mode: "view" | "edit";
  onClose: () => void;
  onSave?: (id: string, data: FormData) => Promise<void>;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="block mb-2 text-[10px] uppercase tracking-[0.15em] text-gray-500">
    {children}
  </span>
);

const ReviewModal = ({ review, mode, onClose, onSave }: ReviewModalProps) => {
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditRating(review.rating);
    setEditComment(review.comment);
  }, [review]);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("rating", String(editRating));
    fd.append("comment", editComment);
    await onSave(review._id, fd);
    setSaving(false);
  };

  const hotelName =
    typeof review.hotelId === "object" && review.hotelId !== null
      ? ((review.hotelId as { hotelName?: string }).hotelName ?? "—")
      : "—";

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-130 max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-gray-200">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 mb-1">
              Admin Panel
            </p>
            <h2
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {mode === "edit" ? "Edit Review" : "Review Details"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all text-lg leading-none cursor-pointer bg-transparent"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-5 p-6">
          {/* Guest */}
          <div className="flex items-center gap-3">
            <Avatar name={review.fullName} size="lg" />
            <div>
              <p
                className="text-base font-semibold text-gray-900"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {review.fullName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{review.email}</p>
            </div>
          </div>

          {/* Hotel */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3">
            <span className="text-gray-400 text-lg">🏨</span>
            <div>
              <Label>Hotel</Label>
              <p className="text-sm text-gray-700">{hotelName}</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label>Rating</Label>
            {mode === "edit" ? (
              <div className="flex items-center gap-3">
                <StarRating
                  rating={editRating}
                  size={24}
                  interactive
                  onChange={setEditRating}
                />
                <span className="text-sm text-[#059669]">{editRating}/5</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} size={18} />
                <span
                  className="text-lg font-bold text-[#059669]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {review.rating}/5
                </span>
              </div>
            )}
          </div>

          {/* Comment */}
          <div>
            <Label>Comment</Label>
            {mode === "edit" ? (
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={5}
                className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-3 outline-none resize-y leading-relaxed focus:border-[#059669]/30 transition-colors placeholder:text-gray-400"
              />
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed rounded-lg border border-gray-200 px-4 py-3">
                {review.comment}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="flex gap-8 pt-1">
            {(
              [
                ["Created", review.createdAt],
                ["Updated", review.updatedAt],
              ] as [string, string][]
            ).map(([lbl, dt]) => (
              <div key={lbl}>
                <Label>{lbl}</Label>
                <p className="text-xs text-gray-500">
                  {dt
                    ? new Date(dt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
        \{" "}
        {mode === "edit" && (
          <div className="flex justify-end gap-2.5 px-6 pb-6">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-500 text-sm hover:border-gray-400 hover:text-gray-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#059669] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
