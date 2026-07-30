"use client";

import { motion } from "framer-motion";

export default function HotelsHero({ total }: { total: number }) {
  return (
    <div
      className="relative flex items-end overflow-hidden border-b border-gray-200 bg-gradient-to-br from-amber-50 via-white to-gray-50"
      style={{ height: "40vh", minHeight: 300 }}
    >
      {/* decorative dots */}
      {[
        { top: "25%", left: "15%" },
        { top: "55%", left: "40%" },
        { top: "20%", right: "25%" },
        { top: "65%", right: "12%" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#059669] opacity-20"
          style={{
            ...pos,
            width: i % 2 === 0 ? 8 : 4,
            height: i % 2 === 0 ? 8 : 4,
            boxShadow: "0 0 16px 4px rgba(201,169,110,0.1)",
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #faf7f2 0%, rgba(250,247,242,0.3) 60%, transparent 100%)",
        }}
      />
      <div className="absolute top-[30%] right-[8%] text-right">
        <p className="text-[#059669] text-[10px] tracking-[0.2em] uppercase mb-2">
          Discover
        </p>
        <p className="text-gray-900 text-2xl font-light tracking-[0.05em] leading-snug m-0">
          LUXURY
          <br />
          STAYS
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-12 pb-12"
      >
        <p className="text-[#059669] text-[9px] tracking-[0.22em] uppercase mb-3">
          Our Collection
        </p>
        <h1
          className="text-gray-900 font-bold uppercase leading-tight m-0"
          style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
        >
          ALL HOTELS
        </h1>
        {total > 0 && (
          <p className="text-gray-500 text-sm mt-3">{total} Hotel available</p>
        )}
      </motion.div>
    </div>
  );
}
