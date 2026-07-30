"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

interface FavoriteEmptyStateProps {
  isFiltered: boolean;
}

const COLS = [
  {
    title: "Explore & Discover",
    body: "Browse our curated selection of premium hotels and save the ones that catch your eye.",
  },
  {
    title: "Save Your Picks",
    body: "Heart any hotel to add it here instantly. Your collection lives across all your sessions.",
  },
  {
    title: "Book With Ease",
    body: "Return to your favorites any time and book directly — no searching required.",
  },
];

export function FavoriteEmptyState({ isFiltered }: FavoriteEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="py-24 text-center border-t border-gray-200">
        <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase mb-3">
          No results
        </p>
        <p className="text-gray-500 text-sm">
          Try adjusting your search terms
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between py-8 border-b border-gray-200 mb-0">
        <div>
          <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2">
            Your Collection
          </p>
          <h2 className="text-gray-900 text-3xl font-bold uppercase m-0 font-heading">
            No Favorites Yet
          </h2>
        </div>
        <Heart size={32} className="text-gray-200" />
      </div>
      <div className="grid grid-cols-3 border-t border-l border-gray-200">
        {COLS.map(({ title, body }, i) => (
          <div
            key={i}
            className="bg-white border-r border-b border-gray-200 p-8"
          >
            <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-4">
              {title}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
      <div className="pt-8 flex justify-start">
        <Link
          href="/user/dashboard"
          className="bg-[#059669] text-white text-[11px] font-bold tracking-[0.18em] uppercase px-8 py-3.5 hover:opacity-90 transition-opacity no-underline"
        >
          Explore Hotels
        </Link>
      </div>
    </div>
  );
}
