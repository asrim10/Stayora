"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { handleGetPublicReviews } from "@/lib/actions/review-action";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "./PageTransition";

type Review = {
  _id: string;
  fullName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      const result = await handleGetPublicReviews();
      if (result.success) {
        setReviews(result.data.slice(0, 6));
      }
    };
    fetchReviews();
  }, []);

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  if (reviews.length === 0) return null;

  const activeReview = reviews[activeIndex];
  const nextIndex = (activeIndex + 1) % reviews.length;
  const nextReview = reviews[nextIndex];

  return (
    <section
      id="feedback"
      className="relative w-full py-16 md:py-24 bg-[#0b0b0b] overflow-hidden scroll-mt-28"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[url('/images/pattern.png')] bg-repeat" />

      {/* Heading */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="relative z-10 text-center mb-10 md:mb-16">
          <p className="text-yellow-500 tracking-[5px] text-sm uppercase">
            Testimonials
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-serif mt-3">
            Customer&apos;s Feedback
          </h2>
          <motion.div
            className="w-28 h-[2px] bg-yellow-500 mx-auto mt-4"
            initial={{ width: 0 }}
            whileInView={{ width: 112 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          />
        </div>
      </ScrollReveal>

      {/* Slider */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
        {/* Active Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeReview._id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100, rotateY: direction > 0 ? 15 : -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100, rotateY: direction > 0 ? -15 : 15 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative w-full bg-black/70 backdrop-blur-md border border-white/10 p-4 sm:p-8 flex group">
              {/* Gold Side Strip */}
              <motion.div
                className="w-12 sm:w-16 flex items-center justify-center bg-yellow-500 shrink-0"
                whileHover={{ backgroundColor: "#fbbf24" }}
              >
                <p className="text-black font-semibold tracking-widest rotate-[-90deg] text-[10px] sm:text-sm whitespace-nowrap">
                  GUEST REVIEW
                </p>
              </motion.div>

              {/* Content */}
              <div className="flex-1 px-3 sm:px-8 min-w-0">
                {/* Stars */}
                <motion.div
                  className="flex gap-1 text-yellow-500 mb-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                    },
                  }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, scale: 0 },
                        visible: { opacity: 1, scale: 1 },
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Star
                        size={18}
                        fill={i < activeReview.rating ? "gold" : "none"}
                        stroke="gold"
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Message */}
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed italic">
                  &ldquo;{activeReview.comment}&rdquo;
                </p>

                <div className="w-full h-[1px] bg-white/20 my-6" />

                {/* User */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-12 h-12 rounded-full border border-yellow-500 bg-yellow-500/20 flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(251,191,36,0.4)" }}
                  >
                    <span className="text-yellow-500 font-serif text-lg font-bold">
                      {activeReview.fullName.charAt(0).toUpperCase()}
                    </span>
                  </motion.div>

                  <div>
                    <h3 className="text-white font-serif text-base sm:text-lg">
                      {activeReview.fullName}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {new Date(activeReview.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next Card Preview */}
        <ScrollReveal direction="right" delay={0.2}>
          <div className="relative w-full bg-black/40 backdrop-blur-sm border border-white/5 p-4 sm:p-8 flex opacity-60">
            {/* Gold Side Strip */}
            <div className="w-12 sm:w-16 flex items-center justify-center bg-yellow-500/60 shrink-0">
              <p className="text-black font-semibold tracking-widest rotate-[-90deg] text-[10px] sm:text-sm whitespace-nowrap">
                UP NEXT
              </p>
            </div>

            <div className="flex-1 px-3 sm:px-8 min-w-0">
              {/* Stars */}
              <div className="flex gap-1 text-yellow-500/60 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < nextReview.rating ? "gold" : "none"}
                    stroke="gold"
                  />
                ))}
              </div>

              <p className="text-white/50 text-xs sm:text-sm leading-relaxed line-clamp-3">
                &ldquo;{nextReview.comment}&rdquo;
              </p>

              <div className="w-full h-[1px] bg-white/10 my-6" />

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-yellow-500/40 bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-500/60 font-serif text-lg font-bold">
                    {nextReview.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-white/60 font-serif text-lg">
                    {nextReview.fullName}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Bottom Navigation */}
      <ScrollReveal direction="up" delay={0.3}>
        <div className="relative z-10 max-w-7xl mx-auto px-6 mt-10 md:mt-14 flex items-center">
          <motion.button
            onClick={handlePrev}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600 transition shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="text-black w-4 h-4 md:w-5 md:h-5" />
          </motion.button>

          {/* Progress Line */}
          <div className="flex-1 h-[2px] bg-white/20 mx-3 md:mx-6 relative">
            <motion.div
              className="absolute top-0 left-0 h-[2px] bg-yellow-500"
              animate={{ width: `${((activeIndex + 1) / reviews.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <motion.button
            onClick={handleNext}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/30 hover:border-yellow-500 transition shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="text-white w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        </div>
      </ScrollReveal>
    </section>
  );
}
