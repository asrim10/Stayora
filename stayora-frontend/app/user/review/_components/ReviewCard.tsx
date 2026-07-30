"use client";

import { useState } from "react";
import { Stars } from "./Stars";
import { getImageUrl } from "./utils";
import {
  handleUpdateReview,
  handleDeleteReview,
} from "@/lib/actions/review-action";
import { toast } from "react-toastify";
import { ReviewUpdateData } from "@/app/user/review/schema";

interface ReviewData {
  _id?: string;
  id?: string;
  hotelId?: {
    hotelName?: string;
    imageUrl?: string;
    city?: string;
    country?: string;
  };
  hotelName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

function DeleteModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
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
          Delete Review
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Are you sure you want to delete this review? This action cannot be
          undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 bg-white text-gray-500 text-[11px] tracking-[0.14em] uppercase py-3 cursor-pointer hover:border-gray-400 hover:text-gray-700 transition-colors rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-red-600 border border-red-600 text-white text-[11px] tracking-[0.14em] uppercase font-bold py-3 cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-50 rounded"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewCard({
  review,
  onDeleted,
  onUpdated,
}: {
  review: ReviewData;
  onDeleted: (id: string) => void;
  onUpdated: (r: ReviewData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 👈 new

  const id = review._id || review.id || "";
  const hotel = review.hotelId?.hotelName || review.hotelName || "Hotel";
  const location = [review.hotelId?.city, review.hotelId?.country]
    .filter(Boolean)
    .join(", ");
  const imageUrl = getImageUrl(review.hotelId?.imageUrl);
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const save = async () => {
    setSaving(true);
    const result = await handleUpdateReview(id, {
      rating: editRating,
      comment: editComment,
    } as ReviewUpdateData);
    setSaving(false);
    if (result.success) {
      toast.success("Review updated");
      onUpdated({ ...review, rating: editRating, comment: editComment });
      setEditing(false);
    } else toast.error(result.message);
  };

  const del = async () => {
    setDeleting(true);
    const result = await handleDeleteReview(id);
    setDeleting(false);
    setShowDeleteModal(false);
    if (result.success) {
      toast.success("Deleted");
      onDeleted(id);
    } else toast.error(result.message);
  };

  const actionBtnCls =
    "bg-transparent border-none text-[11px] tracking-[0.1em] uppercase p-0 cursor-pointer transition-colors";

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          onConfirm={del}
          onCancel={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}

      <div className="border-t border-gray-200 py-10">
        <div
          className="grid gap-8 mb-6"
          style={{ gridTemplateColumns: "180px 1fr" }}
        >
          <div className="h-27.5 overflow-hidden bg-gray-100 shrink-0 rounded">
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt={hotel}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-gray-200"
              >
                <span className="text-gray-400 text-3xl">⌂</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-1.5">
            {location && (
              <p className="text-[#059669] text-[11px] tracking-[0.15em] uppercase m-0">
                {location}
              </p>
            )}
            <h3 className="text-gray-900 text-lg font-bold uppercase m-0 font-heading"
            >
              {hotel}
            </h3>
            <div className="flex items-center gap-4">
              <Stars
                value={editing ? editRating : review.rating}
                onChange={editing ? setEditRating : undefined}
                size={15}
              />
              <p className="text-gray-500 text-xs m-0">{date}</p>
            </div>
            <div className="flex gap-4 mt-1">
              {!editing ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className={`${actionBtnCls} text-gray-500 hover:text-gray-900`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className={`${actionBtnCls} text-gray-500 hover:text-[#f87171] disabled:opacity-50`}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={save}
                    disabled={saving}
                    className={`${actionBtnCls} text-[#059669] hover:opacity-70 disabled:opacity-50`}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className={`${actionBtnCls} text-gray-500 hover:text-gray-900`}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ paddingLeft: "calc(180px + 2rem)" }}>
          {editing ? (
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={4}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm leading-relaxed p-3 outline-none resize-none focus:border-[#059669] transition-colors rounded"
            />
          ) : (
            <p className="text-gray-500 text-sm leading-relaxed m-0">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
