"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function SplitButton({ label, href = "/waitlist", className = "" }: { label: string; href?: string; className?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center cursor-pointer group ${className}`}
    >
      <motion.div 
        className="flex items-center gap-[2px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Left Icon Block (Fade-in on Hover) */}
        <motion.div
          initial={false}
          animate={{ 
            width: isHovered ? 40 : 0,
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -20
          }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="h-10 flex items-center justify-center bg-[#2563EB] text-white shadow-lg overflow-hidden"
        >
          <motion.span
            animate={{ rotate: isHovered ? 0 : -180 }}
            transition={{ duration: 0.4 }}
            className="text-xl"
          >
            +
          </motion.span>
        </motion.div>

        {/* Label Block */}
        <motion.div
          className="h-10 flex items-center px-6 bg-[#2563EB] text-white font-mono font-bold uppercase tracking-[0.1em] text-[11px] shadow-lg group-hover:bg-[#1d4ed8] transition-colors duration-300"
        >
          {label}
        </motion.div>

        {/* Right Icon Block (Fade-out on Hover) */}
        <motion.div
          initial={false}
          animate={{ 
            width: isHovered ? 0 : 40,
            opacity: isHovered ? 0 : 1,
            x: isHovered ? 20 : 0
          }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="h-10 flex items-center justify-center bg-[#2563EB] text-white shadow-lg overflow-hidden"
        >
          <motion.span
            animate={{ rotate: isHovered ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            className="text-xl"
          >
            +
          </motion.span>
        </motion.div>
      </motion.div>
    </Link>
  );
}
