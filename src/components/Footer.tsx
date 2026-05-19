"use client";

import Link from "next/link";
import { AsciiCanvas } from "./AsciiCanvas";

export default function Footer({ noBorder = false }: { noBorder?: boolean }) {
  return (
    <footer className={`bg-[#171616] pt-24 pb-12 px-6 md:px-12 ${noBorder ? "" : "border-t border-white/5"}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-0">
        
        {/* Brand Section */}
        <div className="lg:col-span-2 flex flex-col items-start">
          <div className="flex items-center gap-4 mb-8">
            <div className="scale-75 origin-left">
              <AsciiCanvas />
            </div>
          </div>
          
          <p className="text-[16px] font-mono text-white/50 leading-relaxed max-w-sm tracking-tight mb-8">
            The local infrastructure for collaborative team intelligence. 
            Plug-and-play AI that stays in your office.
          </p>
        </div>

        {/* Links Container right aligned on large screens */}
        <div className="lg:col-span-3 flex flex-wrap lg:flex-nowrap gap-x-8 lg:gap-x-12 lg:justify-end">
          {/* Links: Product */}
          <div className="flex flex-col gap-6 min-w-[120px]">
            <h4 className="text-[12px] font-mono font-bold text-white uppercase tracking-[0.2em] mb-2">Product</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="https://bloc-wheat-sigma.vercel.app/product" className="text-[14px] font-mono text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 border-dotted hover:border-white/20 pb-0.5">Features</Link></li>
              <li><Link href="https://bloc-wheat-sigma.vercel.app/product" className="text-[14px] font-mono text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 border-dotted hover:border-white/20 pb-0.5">Pricing</Link></li>
              <li><Link href="https://bloc-wheat-sigma.vercel.app/product" className="text-[14px] font-mono text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 border-dotted hover:border-white/20 pb-0.5">Hardware</Link></li>
            </ul>
          </div>

          {/* Links: Developers */}
          <div className="flex flex-col gap-6 min-w-[120px]">
            <h4 className="text-[12px] font-mono font-bold text-white uppercase tracking-[0.2em] mb-2">Developers</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/docs" className="text-[14px] font-mono text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 border-dotted hover:border-white/20 pb-0.5">API Docs</Link></li>
              <li><Link href="https://github.com/bloc-ai" className="text-[14px] font-mono text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 border-dotted hover:border-white/20 pb-0.5">GitHub</Link></li>
              <li><Link href="https://discord.gg/bloc" className="text-[14px] font-mono text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 border-dotted hover:border-white/20 pb-0.5">Discord</Link></li>
            </ul>
          </div>

          {/* Links: Legal */}
          <div className="flex flex-col gap-6 min-w-[120px]">
            <h4 className="text-[12px] font-mono font-bold text-white uppercase tracking-[0.2em] mb-2">Legal</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="#" className="text-[14px] font-mono text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 border-dotted hover:border-white/20 pb-0.5">Privacy</Link></li>
              <li><Link href="#" className="text-[14px] font-mono text-white/40 hover:text-white transition-colors duration-300 border-b border-white/5 border-dotted hover:border-white/20 pb-0.5">Terms</Link></li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
}
