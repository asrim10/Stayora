"use client";

import { useState } from "react";

interface StarsProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}

export function Stars({ value, onChange, size = 24 }: StarsProps) {
  const [hov, setHov] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const active = hov || value;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange?.(s)}
            onMouseEnter={() => onChange && setHov(s)}
            onMouseLeave={() => onChange && setHov(0)}
            className={`bg-transparent border-none p-0 ${onChange ? "cursor-pointer" : "cursor-default"}`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={s <= active ? "#059669" : "none"}
              stroke={s <= active ? "#059669" : "#4b5563"}
              strokeWidth="1.5"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        ))}
      </div>
      {onChange && active > 0 && (
        <span className="text-[#059669] text-[11px] tracking-[0.12em] uppercase">
          {labels[active]}
        </span>
      )}
    </div>
  );
}
