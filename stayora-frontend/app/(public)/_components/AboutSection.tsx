"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  Luggage,
  BedDouble,
} from "lucide-react";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "./PageTransition";

const features = [
  {
    icon: <Sparkles className="text-yellow-500 w-7 h-7" />,
    title: "Serenity and Bliss",
    desc: "Your comfort zone away from home",
  },
  {
    icon: <Luggage className="text-yellow-500 w-7 h-7" />,
    title: "Store Luggage",
    desc: "Hospitality meets comfort & security",
  },
  {
    icon: <BedDouble className="text-yellow-500 w-7 h-7" />,
    title: "Room Services",
    desc: "Premium service at your doorstep",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full py-16 md:py-24 bg-[#0b0b0b] overflow-hidden scroll-mt-28"
    >
      <div className="absolute inset-0 opacity-20 bg-[url('/images/pattern.png')] bg-repeat" />

      {/* Content Wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12 items-center">
        {/* LEFT SIDE */}
        <ScrollReveal direction="left" delay={0.1}>
          <div className="text-white">
            {/* Heading */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-full border border-yellow-500 flex items-center justify-center font-semibold"
                  whileHover={{ scale: 1.15, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  S
                </motion.div>

                <div>
                  <h2 className="text-3xl md:text-4xl font-serif text-white">
                    About{" "}
                    <span className="text-yellow-500 font-semibold">
                      Stayora
                    </span>
                  </h2>

                  <motion.div
                    className="w-28 h-[2px] bg-yellow-500 mt-2"
                    initial={{ width: 0 }}
                    whileInView={{ width: 112 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Paragraph */}
            <p className="text-white/70 leading-relaxed text-sm">
              Stayora is passionate about creating unforgettable experiences and
              understands that little things make a huge difference for our
              guests. We deliver premium comfort, luxury service, and world-class
              hospitality.
              <br />
              <br />
              From cozy luxury rooms to breathtaking city views, our goal is to
              make every stay feel like your second home.
            </p>

            {/* Stats */}
            <StaggerContainer className="grid grid-cols-3 gap-6 mt-10" staggerDelay={0.1} delay={0.2}>
              {[
                { num: "50+", label: "Luxury Hotels" },
                { num: "4.8+", label: "Guest Rating" },
                { num: "128k+", label: "Clients Happy" },
              ].map((stat) => (
                <StaggerItem key={stat.label}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="text-yellow-500 text-2xl md:text-3xl font-serif">
                      {stat.num}
                    </h3>
                    <p className="text-white/70 text-sm mt-1">{stat.label}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </ScrollReveal>

        {/* CENTER IMAGE */}
        <ScrollReveal direction="none" delay={0.2} duration={0.8}>
          <div className="relative flex justify-center">
            {/* Oval Image */}
            <motion.div
              className="relative w-[260px] h-[420px] md:w-[320px] md:h-[520px] rounded-[200px] overflow-hidden border-4 border-yellow-500/50"
              whileHover={{ scale: 1.02, borderColor: "rgba(251,191,36,0.8)" }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Image
                src="/images/about.jpg"
                alt="Stayora About"
                fill
                sizes="320px"
                className="object-cover"
              />
              <motion.div
                className="absolute inset-0 bg-yellow-500/10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Circular Curved Text */}
            <motion.div
              className="absolute -top-8 -left-8 md:-top-10 md:-left-10 w-[350px] h-[350px] md:w-[450px] md:h-[450px] pointer-events-none"
              initial={{ rotate: -30, opacity: 0 }}
              whileInView={{ rotate: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <path
                  id="circlePath"
                  d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                  fill="none"
                />
                <text
                  dy="-10"
                  className="text-[11px] md:text-[13px] fill-white/70 tracking-[0.3em] uppercase font-light"
                >
                  <textPath href="#circlePath">Welcome to Stayora</textPath>
                </text>
              </svg>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* RIGHT SIDE FEATURES */}
        <ScrollReveal direction="right" delay={0.3}>
          <div className="flex flex-col gap-8 md:gap-10 text-white">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex items-start gap-4 md:gap-5 group"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: "easeOut" }}
              >
                <motion.div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-yellow-500/40 flex items-center justify-center shrink-0"
                  whileHover={{ scale: 1.1, borderColor: "#fbbf24", backgroundColor: "rgba(251,191,36,0.1)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>

                <div>
                  <h3 className="text-lg md:text-xl font-serif group-hover:text-yellow-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
