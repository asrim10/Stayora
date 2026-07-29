"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 30);

      // Hide navbar on scroll down, show on scroll up (only on mobile)
      if (currentScrollY > 80) {
        if (currentScrollY > lastScrollY) {
          setHidden(true);
          setOpenMenu(false);
        } else {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpenMenu(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About us" },
    { href: "#facilities", label: "Facilities" },
    { href: "#feedback", label: "Experiences" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/70 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src="/images/logo.png"
              alt="Stayora Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </motion.div>

          {/* Center Logo Text */}
          <motion.div
            className="text-white font-serif text-2xl tracking-widest"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Stayora
          </motion.div>

          {/* Right */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link
              href="/login"
              className="text-white border border-white/30 px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:text-black"
            >
              Login
            </Link>

            {/* Mobile Menu Button - Animated Hamburger */}
            <motion.button
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[5px]"
              onClick={() => setOpenMenu(!openMenu)}
              whileTap={{ scale: 0.85 }}
              aria-label={openMenu ? "Close menu" : "Open menu"}
            >
              <motion.span
                className="block w-6 h-[2px] bg-white rounded-full origin-center"
                animate={openMenu ? { rotate: 45, y: 3.5, width: 22 } : { rotate: 0, y: 0, width: 24 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              />
              <motion.span
                className="block w-6 h-[2px] bg-white rounded-full"
                animate={openMenu ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block w-6 h-[2px] bg-white rounded-full origin-center"
                animate={openMenu ? { rotate: -45, y: -3.5, width: 22 } : { rotate: 0, y: 0, width: 24 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              />
            </motion.button>
          </motion.div>
        </div>

        {/* Desktop Nav */}
        <motion.nav
          className="hidden md:block mt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ul className="flex justify-center gap-10 text-white text-sm font-medium tracking-wide">
            {navLinks.map((link, i) => (
              <motion.li
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  className="px-2 py-1 rounded-md transition-colors duration-200 hover:text-yellow-400 relative group"
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] bg-yellow-400 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "80%" }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden mt-4 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden border border-white/10"
            >
              <motion.ul
                className="flex flex-col gap-1 p-4 text-white text-sm"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {navLinks.map((link) => (
                  <motion.li
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={link.href}
                      className="block px-4 py-3 rounded-lg hover:bg-white/10 hover:text-yellow-400 transition-colors"
                      onClick={() => setOpenMenu(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}

                {/* Login inside mobile menu */}
                <motion.li
                  className="mt-2 pt-3 border-t border-white/10"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-3 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors"
                    onClick={() => setOpenMenu(false)}
                  >
                    Sign In
                  </Link>
                </motion.li>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
