"use client";

import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Waves,
  Utensils,
  Dumbbell,
} from "lucide-react";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Free Wi-Fi": <Wifi size={11} />,
  "Free Parking": <Car size={11} />,
  "Swimming Pool": <Waves size={11} />,
  Restaurant: <Utensils size={11} />,
  Gym: <Dumbbell size={11} />,
};

export default function HotelCard({
  hotel,
  onBook,
}: {
  hotel: any;
  onBook: () => void;
}) {
  const getImageUrl = (url?: string) => {
    if (!url) return "/api/placeholder/600/400";
    if (url.startsWith("http")) return url;
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "") + url;
  };

  const location = [hotel.city, hotel.country].filter(Boolean).join(", ");
  const amenities = (hotel.amenities || []).slice(0, 3);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group bg-white border border-gray-200 hover:border-gray-300 transition-all cursor-pointer h-full flex flex-col shadow-sm hover:shadow-md"
    >
      {/* Image */}
      <div
        className="relative overflow-hidden bg-gray-100"
        style={{ height: 220 }}
      >
        <img
          src={getImageUrl(hotel.imageUrl)}
          alt={hotel.hotelName || hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)",
          }}
        />
        {hotel.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/20 px-2.5 py-1.5 rounded">
            <Star size={10} className="text-[#059669] fill-[#059669]" />
            <span className="text-[#059669] text-xs font-bold">
              {hotel.rating}
            </span>
          </div>
        )}
        {location && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <MapPin size={10} className="text-[#059669]" />
            <span className="text-white text-[10px] tracking-widest uppercase">
              {location}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <p className="text-gray-400 text-[9px] tracking-[0.18em] uppercase mb-1.5">
            {hotel.type || "Hotel"}
          </p>
          <h3
            className="text-gray-900 text-lg font-bold uppercase leading-snug m-0 group-hover:text-[#059669] transition-colors font-heading"
          >
            {hotel.hotelName || hotel.name}
          </h3>
          {hotel.description && (
            <p className="text-gray-500 text-xs leading-relaxed mt-2 line-clamp-2">
              {hotel.description}
            </p>
          )}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {amenities.map((a: string) => (
              <span
                key={a}
                className="flex items-center gap-1 text-gray-500 text-[9px] tracking-widest uppercase border border-gray-200 px-2 py-1 rounded"
              >
                {AMENITY_ICONS[a] || null}
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-200">
          <div>
            <p className="text-gray-400 text-[9px] tracking-[0.16em] uppercase mb-1">
              Per night
            </p>
            <p
              className="text-gray-900 text-xl font-bold m-0 font-heading"
            >
              Rs.{" "}
              <span className="text-[#059669]">
                {(hotel.price || 0).toLocaleString()}
              </span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBook}
            className="bg-[#059669] text-white text-[10px] font-bold tracking-[0.16em] uppercase px-5 py-2.5 border-none cursor-pointer hover:opacity-90 transition-opacity rounded"
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
