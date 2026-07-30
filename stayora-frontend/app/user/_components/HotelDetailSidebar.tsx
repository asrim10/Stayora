"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const HotelMap = dynamic(() => import("./HotelMap"), { ssr: false });

interface HotelDetailSidebarProps {
  hotel: {
    id: string;
    name: string;
    images: string[];
    description: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  };
}

const TABS = [{ id: "overview", label: "Overview" }] as const;

type Tab = (typeof TABS)[number]["id"];

export default function HotelDetailSidebar({ hotel }: HotelDetailSidebarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expanded, setExpanded] = useState(false);

  const desc = hotel.description || "";
  const short = desc.length > 120 ? desc.slice(0, 120) + "…" : desc;

  const openInGoogleMaps = () => {
    if (!hotel.coordinates) return;

    const { lat, lng } = hotel.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-80 shrink-0 bg-white border border-gray-200 flex flex-col self-start sticky top-8 shadow-sm rounded-lg">
      {/* Main Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100 rounded-t-lg">
        {hotel.images[0] ? (
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[#2a2a2a] text-[10px] uppercase tracking-widest">
              No Image
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[#059669] text-[9px] uppercase tracking-widest mb-1">
            {hotel.location}
          </p>
          <h2 className="text-white text-sm font-bold uppercase leading-snug font-heading"
          >
            {hotel.name}
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-[10px] uppercase tracking-widest py-3 transition-colors ${
              activeTab === tab.id
                ? "text-[#059669] border-b border-[#059669]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 flex-1">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {/* About */}
            <div>
              <p className="text-[#059669] text-[9px] uppercase tracking-widest mb-2">
                About
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                {expanded ? desc : short}
                {desc.length > 120 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="ml-1 text-[#059669] uppercase text-[10px] tracking-widest"
                  >
                    {expanded ? "Less" : "More"}
                  </button>
                )}
              </p>
            </div>

            {/* Location */}
            <div>
              <p className="text-[#059669] text-[9px] uppercase tracking-widest mb-3">
                Location
              </p>

              {hotel.coordinates ? (
                <>
                  <div className="h-36 w-full overflow-hidden border border-gray-200 mb-2 rounded">
                    <HotelMap
                      lat={hotel.coordinates.lat}
                      lng={hotel.coordinates.lng}
                      hotelName={hotel.name}
                      location={hotel.location}
                    />
                  </div>

                  {/* Open in Google Maps */}
                  <button
                    onClick={openInGoogleMaps}
                    className="text-[10px] uppercase tracking-widest text-[#059669] hover:opacity-70 transition-opacity"
                  >
                    Open in Google Maps →
                  </button>
                </>
              ) : (
                <div className="h-28 bg-gray-100 border border-gray-200 flex items-center justify-center rounded">
                  <p className="text-gray-400 text-[9px] uppercase tracking-widest">
                    Location unavailable
                  </p>
                </div>
              )}

              <div className="mt-3 text-gray-500 text-[11px] flex items-center gap-1">
                <MapPin size={12} className="text-[#059669]" />
                {hotel.location}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Book Now */}
      <div className="p-5 border-t border-gray-200">
        <button
          onClick={() => router.push(`/user/booking?hotelId=${hotel.id}`)}
          className="w-full bg-[#059669] text-white text-[11px] font-bold uppercase tracking-widest py-3 hover:opacity-90 transition-opacity rounded"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
