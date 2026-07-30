"use client";
import { useEffect } from "react";



export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
        style={{
          backgroundImage: "url('/images/hotel4.webp')",
          filter: "blur(2px)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/85" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 border border-red-800/30 text-red-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-6">
          Error
        </div>
        <h1 className="text-white text-3xl font-bold font-heading mb-3">
          Something went wrong
        </h1>
        <p className="text-white/50 text-sm mb-8">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="bg-[#059669] text-white text-[11px] font-bold tracking-[0.18em] uppercase px-8 py-3.5 rounded-lg hover:opacity-90 transition-all cursor-pointer border-none"
        >
          Try Again
        </button>
      </div>
    </section>
  );
}
