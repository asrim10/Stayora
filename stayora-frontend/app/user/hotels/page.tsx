"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  MapPin,
  Wifi,
  Car,
  Waves,
  Utensils,
  Dumbbell,
  Wind,
} from "lucide-react";
import { getAllHotels } from "@/lib/api/hotel";
import HotelCard from "./_components/HotelCard";
import HotelFilters from "./_components/HotelFilters";
import HotelsHero from "./_components/HotelsHero";

export default function HotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    rating: "",
    amenities: [] as string[],
    sortBy: "default",
  });

  useEffect(() => {
    getAllHotels()
      .then((res: any) => {
        if (res?.success && Array.isArray(res.data)) setHotels(res.data);
        else if (Array.isArray(res)) setHotels(res);
        else setHotels([]);
      })
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...hotels];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (h) =>
          (h.hotelName || h.name || "").toLowerCase().includes(q) ||
          (h.city || "").toLowerCase().includes(q) ||
          (h.country || "").toLowerCase().includes(q) ||
          (h.address || "").toLowerCase().includes(q),
      );
    }

    if (filters.minPrice)
      list = list.filter((h) => (h.price || 0) >= Number(filters.minPrice));
    if (filters.maxPrice)
      list = list.filter((h) => (h.price || 0) <= Number(filters.maxPrice));
    if (filters.rating)
      list = list.filter((h) => (h.rating || 0) >= Number(filters.rating));
    if (filters.amenities.length > 0)
      list = list.filter((h) =>
        filters.amenities.every((a) => (h.amenities || []).includes(a)),
      );

    if (filters.sortBy === "price_asc")
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (filters.sortBy === "price_desc")
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (filters.sortBy === "rating")
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [hotels, searchQuery, filters]);

  const activeFilterCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.rating,
    filters.sortBy !== "default" ? filters.sortBy : "",
    ...filters.amenities,
  ].filter(Boolean).length;

  return (
    <div
      className="min-h-screen bg-[#faf7f2] text-gray-900 font-heading"
    >
      <HotelsHero total={hotels.length} />

      {/* SEARCH + FILTER BAR */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="px-12 py-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by hotel name, city, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm pl-10 pr-4 py-3 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 rounded"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 bg-transparent border-none cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border text-[10px] tracking-[0.16em] uppercase px-5 py-3 cursor-pointer transition-colors bg-transparent ${
              showFilters || activeFilterCount > 0
                ? "border-[#059669] text-[#059669]"
                : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#059669] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          <p className="text-gray-400 text-[10px] tracking-[0.16em] uppercase ml-auto">
            {filtered.length} of {hotels.length} hotels
          </p>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-200"
            >
              <HotelFilters
                filters={filters}
                onChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HOTELS GRID */}
      <div className="px-12 py-12">
        {loading ? (
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#faf7f2] h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center border-t border-gray-200">
            <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-4">
              No Results
            </p>
            <h2 className="text-gray-900 text-3xl font-bold uppercase mb-3">
              No Hotels Found
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilters({
                  minPrice: "",
                  maxPrice: "",
                  rating: "",
                  amenities: [],
                  sortBy: "default",
                });
              }}
              className="border border-gray-300 text-gray-500 text-[10px] tracking-[0.16em] uppercase px-6 py-3 bg-white cursor-pointer hover:border-[#059669] hover:text-[#059669] transition-colors rounded"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {filtered.map((hotel, i) => (
              <motion.div
                key={hotel._id || hotel.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white"
              >
                <HotelCard
                  hotel={hotel}
                  onBook={() =>
                    router.push(
                      `/user/booking?hotelId=${hotel._id || hotel.id}`,
                    )
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
