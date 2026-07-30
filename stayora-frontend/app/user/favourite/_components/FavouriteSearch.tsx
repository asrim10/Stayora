"use client";

import { Search } from "lucide-react";

interface FavoritesSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  count: number;
}

export function FavoritesSearchBar({
  value,
  onChange,
  count,
}: FavoritesSearchBarProps) {
  return (
    <div className="bg-white border border-gray-200 px-6 py-5 flex flex-wrap gap-4 items-center rounded-lg shadow-sm">
      <div className="relative flex-1 min-w-60">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name or location..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-4 py-2.5 pl-9 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 rounded"
        />
      </div>
      <p className="text-gray-400 text-[10px] tracking-[0.18em] uppercase">
        {count} {count === 1 ? "property" : "properties"} saved
      </p>
    </div>
  );
}
