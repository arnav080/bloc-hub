"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SplitButton } from "./SplitButton";

export function FinalCTA({ noBorder = false }: { noBorder?: boolean }) {
  return (
    <section className={`bg-[#171616] py-32 flex flex-col items-center justify-center px-6 text-center ${noBorder ? "" : "border-t border-white/5"}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h2 className="text-[40px] md:text-[72px] font-mono font-semibold tracking-tighter text-white leading-[0.9] mb-12">
          Ready to build <br /> your local <br /> intelligence?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <SplitButton label="Join the waitlist" />
          <Link 
            href="https://bloc-wheat-sigma.vercel.app/product#top" 
            className="text-white/40 hover:text-white font-mono text-[18px] transition-colors duration-300 flex items-center gap-2 group"
          >
            View full specs
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
