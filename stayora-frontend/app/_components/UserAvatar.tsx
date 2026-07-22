"use client";

import { useState } from "react";
import { getUserImageUrl } from "@/app/BookingUtils";

type Props = {
  imageUrl?: string | null;
  username?: string;
  size?: number; // size in pixels, defaults to 64 (16 x 4 = w-16)
};

export default function UserAvatar({ imageUrl, username, size = 64 }: Props) {
  const [imgError, setImgError] = useState(false);
  const initials = username?.charAt(0).toUpperCase() || "U";

  const src = imageUrl ? getUserImageUrl(imageUrl) : null;

  // Show image if we have a URL and it hasn't errored
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={username || "User"}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    );
  }

  // Fallback: initials on gold gradient
  return (
    <div
      className="w-full h-full flex items-center justify-center text-[#0a0a0a] font-bold"
      style={{
        background: "linear-gradient(135deg, #c9a96e 0%, #8b6914 100%)",
        fontSize: `${Math.max(size * 0.35, 14)}px`,
      }}
    >
      {initials}
    </div>
  );
}
