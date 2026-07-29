"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaApple, FaCcMastercard, FaCcPaypal, FaCcVisa } from "react-icons/fa";
import { SiGooglepay } from "react-icons/si";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "./PageTransition";

const socialLinks = [
  {
    icon: <FaFacebookF size={14} />,
    href: "https://facebook.com",
    className:
      "border border-white/20 hover:border-yellow-500 text-white hover:text-yellow-500",
  },
  {
    icon: <FaXTwitter size={14} />,
    href: "https://x.com",
    className:
      "border border-white/20 hover:border-yellow-500 text-white hover:text-yellow-500",
  },
  {
    icon: <FaLinkedinIn size={14} />,
    href: "https://linkedin.com",
    className: "bg-yellow-500 hover:bg-yellow-600 text-black",
  },
  {
    icon: <FaYoutube size={14} />,
    href: "https://youtube.com",
    className:
      "border border-white/20 hover:border-yellow-500 text-white hover:text-yellow-500",
  },
  {
    icon: <FaInstagram size={14} />,
    href: "https://instagram.com",
    className:
      "border border-white/20 hover:border-yellow-500 text-white hover:text-yellow-500",
  },
];

const usefulLinks = [
  { href: "#about", label: "About us" },
  { href: "#", label: "Featured Rooms" },
  { href: "#", label: "Our Best Services" },
  { href: "#", label: "Request a Booking" },
];

const exploreLinks = [
  { href: "#feedback", label: "Client Reviews" },
  { href: "#", label: "Neighborhood" },
  { href: "#", label: "Resort Passeirer" },
];

const contactInfo = [
  {
    icon: <MapPin className="text-yellow-500" size={18} />,
    content: (
      <>
        Changunarayan-3, Bhaktapur
        <br />
        Nepal
      </>
    ),
  },
  {
    icon: <Phone className="text-yellow-500" size={18} />,
    content: <>+977-9863039493</>,
  },
  {
    icon: <Mail className="text-yellow-500" size={18} />,
    content: <>asrimsuwal7@gmail.com</>,
  },
];

const paymentMethods = [
  {
    label: "Apple Pay",
    icon: <FaApple size={14} />,
    href: "https://www.apple.com/apple-pay/",
  },
  {
    label: "Mastercard",
    icon: <FaCcMastercard size={14} />,
    href: "https://www.mastercard.com",
  },
  {
    label: "Google Pay",
    icon: <SiGooglepay size={14} />,
    href: "https://pay.google.com",
  },
  {
    label: "PayPal",
    icon: <FaCcPaypal size={14} />,
    href: "https://www.paypal.com",
  },
  {
    label: "Visa",
    icon: <FaCcVisa size={14} />,
    href: "https://www.visa.com",
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative w-full bg-[#1a1f25] pt-12 md:pt-16 pb-8 scroll-mt-28"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Logo */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex justify-center mb-8 md:mb-12">
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-yellow-500 flex items-center justify-center bg-yellow-500/10"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <span className="text-yellow-500 text-2xl font-serif font-bold">
                  S
                </span>
              </motion.div>
              <h3 className="text-white text-xl font-serif tracking-wider">
                STAYORA
              </h3>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Social Links */}
          <ScrollReveal direction="left" delay={0.2}>
            <div>
              <h3 className="text-white text-xl font-serif mb-6">
                Our links <br />
              </h3>

              <div className="flex gap-3">
                {socialLinks.map(({ icon, href, className }, i) => (
                  <motion.a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition ${className}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Useful Links */}
          <ScrollReveal direction="up" delay={0.25}>
            <div>
              <h3 className="text-white text-lg font-serif mb-6">
                Useful Link
              </h3>
              <StaggerContainer staggerDelay={0.05}>
                {usefulLinks.map((link) => (
                  <StaggerItem key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-yellow-500 text-sm flex items-center gap-2 transition group"
                    >
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 3 }}
                      >
                        →
                      </motion.span>{" "}
                      {link.label}
                    </a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </ScrollReveal>

          {/* Explore */}
          <ScrollReveal direction="up" delay={0.3}>
            <div>
              <h3 className="text-white text-lg font-serif mb-6">Explore</h3>
              <StaggerContainer staggerDelay={0.05}>
                {exploreLinks.map((link) => (
                  <StaggerItem key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-yellow-500 text-sm flex items-center gap-2 transition"
                    >
                      <motion.span
                        className="inline-block"
                        whileHover={{ x: 3 }}
                      >
                        →
                      </motion.span>{" "}
                      {link.label}
                    </a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </ScrollReveal>

          {/* Get In Touch */}
          <ScrollReveal direction="right" delay={0.35}>
            <div>
              <h3 className="text-white text-lg font-serif mb-6">
                Get In Touch
              </h3>
              <StaggerContainer staggerDelay={0.08}>
                {contactInfo.map((item, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-start gap-3">
                      <motion.div
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0"
                        whileHover={{
                          scale: 1.1,
                          borderColor: "#fbbf24",
                          backgroundColor: "rgba(251,191,36,0.1)",
                        }}
                      >
                        {item.icon}
                      </motion.div>
                      <p className="text-white/60 text-sm leading-relaxed pt-2">
                        {item.content}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom Bar */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              Copyright &copy; 2024 Stayora. All rights reserved.
            </p>

            <div className="flex items-center gap-3 text-white/50 text-sm">
              {["Terms of service", "Privacy policy", "Cookies"].map(
                (item, i, arr) => (
                  <span key={item} className="flex items-center gap-3">
                    <motion.a
                      href="#"
                      className="hover:text-yellow-500 transition"
                      whileHover={{ y: -1 }}
                    >
                      {item}
                    </motion.a>
                    {i < arr.length - 1 && (
                      <span className="text-white/20">|</span>
                    )}
                  </span>
                ),
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              {paymentMethods.map(({ label, icon, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded text-white/70 text-xs hover:bg-white/10 hover:text-white transition"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {icon} {label}
                </motion.a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
