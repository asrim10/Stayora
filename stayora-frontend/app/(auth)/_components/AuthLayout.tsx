"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  leftPanel?: {
    badge?: string;
    heading: string;
    description: string;
  };
  footerLink?: {
    text: string;
    label: string;
    href: string;
  };
}

const TAGLINES = [
  {
    badge: "Luxury Stays",
    heading: "Because Stays Should Feel Like Destinations",
    description:
      "Find a perfect stay for your much awaited vacation with Stayora.",
  },
  {
    badge: "Curated Hotels",
    heading: "Handpicked for Your Comfort",
    description:
      "Every property is vetted for quality, service, and an unforgettable experience.",
  },
  {
    badge: "Best Rates",
    heading: "Premium Service at the Best Value",
    description:
      "Enjoy competitive pricing with no hidden fees — luxury that meets your budget.",
  },
];

const FLOATING_DOTS = [
  { top: "15%", left: "10%", delay: 0, size: 4 },
  { top: "35%", left: "85%", delay: 1.2, size: 3 },
  { top: "60%", left: "5%", delay: 0.6, size: 5 },
  { top: "80%", left: "75%", delay: 1.8, size: 3 },
  { top: "25%", left: "60%", delay: 2.4, size: 4 },
  { top: "70%", left: "35%", delay: 0.3, size: 2 },
];

export default function AuthLayout({
  children,
  title,
  subtitle,
  leftPanel,
  footerLink,
}: AuthLayoutProps) {
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tagline = TAGLINES[taglineIndex];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: "url('/images/hotel4.webp')",
            filter: "blur(2px)",
          }}
        />
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 40%, rgba(201,169,110,0.1) 100%)",
              "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.5) 50%, rgba(201,169,110,0.15) 100%)",
              "linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.6) 40%, rgba(201,169,110,0.1) 100%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #c9a96e 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating animated dots */}
      {FLOATING_DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#c9a96e]/20"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            y: [0, -15, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 gap-6 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Left Panel - Info / Tagline */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="max-w-sm">
                <motion.div
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl"
                >
                  {leftPanel?.badge || tagline.badge ? (
                    <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-[#c9a96e] mb-4 font-semibold">
                      {leftPanel?.badge || tagline.badge}
                    </span>
                  ) : null}
                  <h3 className="text-white text-2xl font-bold leading-tight font-heading mb-4">
                    {leftPanel?.heading || tagline.heading}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {leftPanel?.description || tagline.description}
                  </p>

                  {/* Progress dots */}
                  {!leftPanel && (
                    <div className="mt-8 flex items-center gap-2">
                      {TAGLINES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setTaglineIndex(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none ${
                            i === taglineIndex
                              ? "w-12 bg-[#c9a96e]"
                              : "w-3 bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Right Panel - Auth Form */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Glassmorphism Card */}
                <div className="relative rounded-2xl bg-white/10 dark:bg-black/50 backdrop-blur-2xl border border-white/10 dark:border-white/5 p-8 shadow-2xl">
                  {/* Gold accent line */}
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/50 to-transparent" />

                  {/* Title Section */}
                  <div className="text-center mb-6">
                    <motion.div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 text-[#c9a96e] text-[10px] font-bold uppercase tracking-[0.18em] mb-4"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 11L12 3L21 11V20H3V11Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Stayora
                    </motion.div>
                    <motion.h1
                      className="text-2xl font-bold text-white font-heading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55, duration: 0.3 }}
                    >
                      {title}
                    </motion.h1>
                    <motion.p
                      className="mt-1.5 text-sm text-white/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      {subtitle}
                    </motion.p>
                  </div>

                  {/* Form Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.3 }}
                  >
                    {children}
                  </motion.div>

                  {/* Footer Link */}
                  {footerLink && (
                    <motion.div
                      className="mt-6 text-center text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      <span className="text-white/40">{footerLink.text} </span>
                      <a
                        href={footerLink.href}
                        className="font-semibold text-[#c9a96e] hover:text-[#d4b87a] transition-colors"
                      >
                        {footerLink.label}
                      </a>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
