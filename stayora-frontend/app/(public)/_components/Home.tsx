"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./PageTransition";

export default function Home() {
  return (
    <main id="home" className="relative min-h-screen w-full overflow-hidden">
      {/* Background image with subtle zoom animation */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 12, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
      >
        <Image
          src="/images/hotel1.jpg"
          alt="Luxury Hotel"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-black/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4">
        <StaggerContainer className="flex flex-col items-center" staggerDelay={0.15}>
          <StaggerItem>
            <div className="flex flex-col items-center mb-6">
              <motion.div
                className="w-14 h-14 rounded-full border border-yellow-500 flex items-center justify-center text-white font-bold text-xl"
                whileHover={{ scale: 1.1, borderColor: "#fbbf24" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                S
              </motion.div>

              <p className="text-white font-semibold tracking-wide mt-2">
                STAYORA
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mb-8">
              <p className="text-sm text-white/80 tracking-widest uppercase">
                Best Prices Guaranteed
              </p>
            </div>
          </StaggerItem>

          <StaggerItem direction="none">
            <h1 className="text-white font-serif text-3xl sm:text-4xl md:text-6xl leading-tight drop-shadow-lg">
              Stay in Luxury <br /> Hotels & Rooms
            </h1>
          </StaggerItem>
        </StaggerContainer>

        {/* Room Preview Circles */}
        <StaggerContainer
          className="absolute bottom-24 sm:bottom-28 flex items-center gap-4 sm:gap-6"
          staggerDelay={0.12}
          delay={0.6}
        >
          <StaggerItem>
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-yellow-500 overflow-hidden flex items-center justify-center"
              whileHover={{ scale: 1.12, borderColor: "#fbbf24" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/images/hotel1.jpg"
                alt="Room 1"
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/30 overflow-hidden flex items-center justify-center opacity-70 hover:opacity-100 transition cursor-pointer"
              whileHover={{ scale: 1.12, borderColor: "#fbbf24" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/images/hotel2.jpg"
                alt="Room 2"
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
              <span className="absolute text-white font-semibold text-sm sm:text-lg">
                02
              </span>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/30 overflow-hidden flex items-center justify-center opacity-70 hover:opacity-100 transition cursor-pointer"
              whileHover={{ scale: 1.12, borderColor: "#fbbf24" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/images/hotel3.jpg"
                alt="Room 3"
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
              <span className="absolute text-white font-semibold text-sm sm:text-lg">
                03
              </span>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </div>
      {/* Bottom Gold Wave Border */}
      <div className="absolute bottom-0 w-full">
        <svg
          viewBox="0 0 1440 150"
          className="w-full h-[100px] sm:h-[140px]"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(0,0,0,0.85)"
            d="M0,80 C360,150 1080,0 1440,70 L1440,150 L0,150 Z"
          />
          <path
            fill="none"
            stroke="#d4af37"
            strokeWidth="4"
            d="M0,80 C360,150 1080,0 1440,70"
          />
        </svg>
      </div>
    </main>
  );
}
