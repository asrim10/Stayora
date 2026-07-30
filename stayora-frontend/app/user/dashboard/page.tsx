"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import HotelCard from "../_components/HotelCard";
import HotelDetailSidebar from "../_components/HotelDetailSidebar";
import PopularHotelCard from "../_components/PopularHotelCard";
import { handleGetAllHotels } from "@/lib/actions/hotel-action";
import { toast } from "react-toastify";
import { handleGetMyFavourites } from "@/lib/actions/favourite-action";
import OAuthToast from "@/app/_components/OAuthToast";

interface Hotel {
  _id: string;
  hotelName: string;
  address: string;
  city: string;
  country: string;
  rating?: number;
  description?: string;
  price: number;
  availableRooms: number;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface FavoriteMap {
  [hotelId: string]: string;
}

const FILTERS = [
  { id: "recommended", label: "Recommended" },
  { id: "popular", label: "Popular" },
  { id: "nearest", label: "Nearest" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<Filter>("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [favoriteMap, setFavoriteMap] = useState<FavoriteMap>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchHotels();
  }, [debouncedSearch]);
  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await handleGetAllHotels("1", "50", debouncedSearch);
      if (res.success) {
        setHotels(res.data || []);
        if (res.data?.length > 0) setSelectedHotel(res.data[0]);
      } else toast.error(res.message || "Failed to fetch hotels");
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await handleGetMyFavourites();
      if (res.success && res.data) {
        const map: FavoriteMap = {};
        res.data.forEach((f: any) => {
          map[f.hotelId] = f._id;
        });
        setFavoriteMap(map);
      }
    } catch {}
  };

  const handleFavoriteChange = (hotelId: string, isFavorited: boolean) => {
    if (isFavorited) fetchFavorites();
    else
      setFavoriteMap((prev) => {
        const m = { ...prev };
        delete m[hotelId];
        return m;
      });
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl)
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
    if (imageUrl.startsWith("http")) return imageUrl;
    return process.env.NEXT_PUBLIC_API_BASE_URL + imageUrl;
  };

  const getCoverImage = (hotel: Hotel): string => {
    return getImageUrl(hotel.images?.[0]);
  };

  const featuredHotels = hotels
    .filter((h) => h.rating && h.rating >= 4.5)
    .slice(0, 3);

  const filteredHotels = [...hotels]
    .sort((a, b) => {
      if (activeFilter === "recommended")
        return (b.rating || 0) - (a.rating || 0);
      if (activeFilter === "popular") return b.price - a.price;
      return 0;
    })
    .slice(0, 6);

  return (
    <>
      <OAuthToast />
      <div className="flex-1 bg-[#faf7f2] overflow-y-auto min-h-screen text-gray-900">
        <div className="flex gap-0">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 px-12 py-12 min-w-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <p className="text-[#059669] text-[10px] tracking-[0.22em] uppercase mb-3">
              Welcome back
            </p>
            <h1 className="text-gray-900 font-bold uppercase leading-tight m-0 font-heading"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              {user?.fullName || user?.username || "Watson"}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Explore and discover premium stays
            </p>
          </motion.div>

          {/* Search */}
          <div className="mb-12">
            <div className="relative max-w-xl">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search hotels by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm px-4 py-3 pl-10 outline-none focus:border-[#059669] transition-colors placeholder:text-gray-400 rounded"
              />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 border border-gray-200 animate-pulse rounded"
                />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-24 border-t border-gray-200">
              <p className="text-gray-400 text-[11px] tracking-[0.2em] uppercase mb-2">
                No results
              </p>
              {searchQuery && (
                <p className="text-gray-500 text-sm">
                  Try adjusting your search
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Featured Hotels */}
              {featuredHotels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-14"
                >
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-[#059669] text-[9px] tracking-[0.2em] uppercase mb-2">
                        Top Rated
                      </p>
                      <h2
                        className="text-gray-900 text-2xl font-bold uppercase m-0 font-heading"
                      >
                        Featured Hotels
                      </h2>
                    </div>
                  </div>
                  <div
                    className="grid gap-px bg-gray-200"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(260px, 1fr))",
                    }}
                  >
                    {featuredHotels.map((hotel, i) => (
                      <motion.div
                        key={hotel._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white cursor-pointer"
                        onClick={() => setSelectedHotel(hotel)}
                      >
                        <HotelCard
                          id={hotel._id}
                          name={hotel.hotelName}
                          location={`${hotel.city}, ${hotel.country}`}
                          rating={hotel.rating || 0}
                          image={getCoverImage(hotel)}
                          price={hotel.price}
                          isFeatured
                          isFavorited={!!favoriteMap[hotel._id]}
                          favouriteId={favoriteMap[hotel._id]}
                          onFavoriteChange={handleFavoriteChange}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Filter tabs + grid */}
              <div>
                <div className="flex items-end justify-between mb-6 border-b border-gray-200 pb-0">
                  <div className="flex gap-0">
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`text-[10px] tracking-[0.16em] uppercase px-5 py-3.5 border-none bg-transparent cursor-pointer transition-colors border-b-2 ${
                          activeFilter === f.id
                            ? "text-[#059669] border-[#059669]"
                            : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <button className="text-[#059669] text-[10px] tracking-[0.14em] uppercase bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity mb-0.5">
                    View All →
                  </button>
                </div>

                <div
                  className="grid gap-px bg-gray-200"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                  }}
                >
                  {filteredHotels.map((hotel, i) => (
                    <motion.div
                      key={hotel._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white cursor-pointer"
                      onClick={() => setSelectedHotel(hotel)}
                    >
                      <PopularHotelCard
                        id={hotel._id}
                        name={hotel.hotelName}
                        location={
                          hotel.address || `${hotel.city}, ${hotel.country}`
                        }
                        price={hotel.price}
                        rating={hotel.rating}
                        image={getCoverImage(hotel)}
                        isFavorited={!!favoriteMap[hotel._id]}
                        favouriteId={favoriteMap[hotel._id]}
                        onFavoriteChange={handleFavoriteChange}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        {selectedHotel && (
          <div className="border-l border-gray-200">
            <HotelDetailSidebar
              hotel={{
                id: selectedHotel._id,
                name: selectedHotel.hotelName,
                images: [getCoverImage(selectedHotel)],
                description:
                  selectedHotel.description ||
                  "A beautiful hotel with excellent amenities and service.",
                location: `${selectedHotel.city}, ${selectedHotel.country}`,
                coordinates: selectedHotel.coordinates,
              }}
            />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
