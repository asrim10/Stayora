"use client";
import { Search, SlidersHorizontal } from "lucide-react";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <Search
          size={13}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by hotel name, location, or booking ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white border border-gray-300 text-gray-900 text-xs px-4 py-3 pl-9 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 rounded"
        />
      </div>
      <button className="flex items-center gap-2 border border-gray-300 text-gray-500 text-[10px] tracking-[0.16em] uppercase px-5 py-3 hover:border-gray-400 hover:text-gray-700 transition-colors bg-white cursor-pointer rounded">
        <SlidersHorizontal size={13} />
        Filters
      </button>
    </div>
  );
}
