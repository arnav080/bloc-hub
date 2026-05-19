"use client";

import Link from "next/link";

export default function DocsComingSoon() {
  return (
    <div className="min-h-screen bg-[#171616] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="flex flex-col items-center justify-center text-center font-mono max-w-md relative z-10">
        <div className="w-12 h-12 rounded-xl border border-white/10 bg-zinc-900/50 flex items-center justify-center mb-6 shadow-inner text-blue-500 animate-pulse">
          <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 2C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H3.5ZM2 2.5C2 1.67157 2.67157 1 3.5 1H11.5C12.3284 1 13 1.67157 13 2.5V12.5C13 13.3284 12.3284 14 11.5 14H3.5C2.67157 14 2 13.3284 2 12.5V2.5ZM4.5 4.5C4.22386 4.5 4 4.72386 4 5C4 5.27614 4.22386 5.5 4.5 5.5H10.5C10.7761 5.5 11 5.27614 11 5C11 4.72386 10.7761 4.5 10.5 4.5H4.5ZM4.5 7C4.22386 7 4 7.22386 4 7.5C4 7.77614 4.22386 8 4.5 8H10.5C10.7761 8 11 7.77614 11 7.5C11 7.22386 10.7761 7 10.5 7H4.5ZM4.5 9.5C4.22386 9.5 4 9.72386 4 10C4 10.2761 4.22386 10.5 4.5 10.5H8.5C8.77614 10.5 9 10.2761 9 10C9 9.72386 8.77614 9.5 8.5 9.5H4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Docs Coming Soon</h2>
        <p className="text-xs text-zinc-500 leading-relaxed mb-6">
          We are finalizing our detailed manifest schema reference, CLI documentation, and local hardware auto-tuning specifications.
        </p>
        <Link 
          href="/"
          className="text-[10px] font-bold text-blue-400 border border-blue-500/20 hover:border-blue-500/50 bg-blue-950/20 px-4 py-2 rounded-lg uppercase tracking-widest transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
