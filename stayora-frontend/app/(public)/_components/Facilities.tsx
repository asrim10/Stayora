"use client";

import Image from "next/image";
import { JSX, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Wifi,
  Car,
  BedDouble,
  Waves,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

import { ScrollReveal, StaggerContainer, StaggerItem } from "./PageTransition";

type Facility = {
  id: number;
  title: string;
  icon: JSX.Element;
  bgImage?: string;
};

const facilitiesData: Facility[] = [
  {
    id: 1,
    title: "Free Wifi Internet",
    icon: <Wifi className="text-white w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />,
  },
  {
    id: 2,
    title: "Free Parking",
    icon: <Car className="text-white w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />,
  },
  {
    id: 3,
    title: "Room Services",
    icon: <BedDouble className="text-white w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />,
  },
  {
    id: 4,
    title: "Swimming Pool",
    icon: <Waves className="text-white w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />,
  },
  {
    id: 5,
    title: "Fitness & Wellbeing",
    icon: <Dumbbell className="text-white w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />,
  },
];

const facilityVariants = {
  inactive: { scale: 0.85, opacity: 0.6 },
  active: { scale: 1.1, opacity: 1 },
};

export default function Facilities() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev === facilitiesData.length - 1 ? 0 : prev + 1,
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [playing]);

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? facilitiesData.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === facilitiesData.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <section
      id="facilities"
      className="relative w-full min-h-[600px] lg:h-[650px] overflow-hidden bg-black scroll-mt-28"
    >
      {/* Background with subtle zoom */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{
          duration: 10,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <Image
          src="/images/hotel2.jpg"
          alt="Facilities Background"
          fill
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Heading */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                className="w-10 h-[2px] bg-yellow-500"
                initial={{ width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <div className="w-9 h-9 rounded-full border border-yellow-500 flex items-center justify-center text-white font-semibold">
                H
              </div>
              <motion.div
                className="w-10 h-[2px] bg-yellow-500"
                initial={{ width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>

            <h2 className="text-white text-3xl md:text-4xl font-serif tracking-wide">
              Facilities
            </h2>

            <motion.div
              className="w-24 h-[2px] bg-yellow-500 mx-auto mt-4"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </ScrollReveal>

        {/* Facilities */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="flex items-center justify-center gap-6 md:gap-10 w-full max-w-6xl flex-wrap md:flex-nowrap">
            {facilitiesData.map((facility, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={facility.id}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => setActiveIndex(index)}
                  variants={facilityVariants}
                  animate={isActive ? "active" : "inactive"}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  whileHover={{ scale: isActive ? 1.15 : 0.95 }}
                >
                  <div className="relative flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full border border-white/20">
                    <AnimatePresence>
                      {isActive && facility.bgImage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.6, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={facility.bgImage}
                            alt={facility.title}
                            fill
                            className="object-cover rounded-full"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute inset-0 rounded-full bg-black/60" />
                    <motion.div
                      className="relative z-10"
                      animate={
                        isActive ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }
                      }
                      transition={{ duration: 0.5 }}
                    >
                      {facility.icon}
                    </motion.div>
                  </div>

                  <p
                    className={`mt-4 text-sm font-medium tracking-wide transition-all duration-300
                    ${isActive ? "text-yellow-400" : "text-white/80"}`}
                  >
                    {facility.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Progress + Arrows */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="relative flex items-center w-full max-w-6xl mt-10 md:mt-14">
            <motion.button
              onClick={handlePrev}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600 transition shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="text-black w-4 h-4 md:w-5 md:h-5" />
            </motion.button>

            <div className="flex-1 h-[2px] bg-white/20 mx-6 relative">
              <motion.div
                className="absolute top-0 left-0 h-[2px] bg-yellow-500"
                animate={{
                  width: `${((activeIndex + 1) / facilitiesData.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <motion.button
              onClick={handleNext}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-white/40 hover:border-yellow-500 transition shrink-0"
              whileHover={{ scale: 1.1, borderColor: "#fbbf24" }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="text-white w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </div>
        </ScrollReveal>

        {/* Play / Pause Button */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="relative mt-10 md:mt-14">
            <motion.button
              onClick={() => setPlaying((prev) => !prev)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/40 flex items-center justify-center"
              whileHover={{ scale: 1.15, borderColor: "#fbbf24" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={playing ? "pause" : "play"}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {playing ? (
                    <Pause className="text-white w-7 h-7 lg:w-7 lg:h-7" />
                  ) : (
                    <Play className="text-white w-7 h-7 lg:w-7 lg:h-7" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
