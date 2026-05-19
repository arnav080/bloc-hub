"use client";

import React from "react";
import Link from "next/link";

const projects = [
  {
    name: "bloc-core",
    stars: "4,281",
    description: "Core orchestration engine for high-performance local model deployment and lifecycle management.",
    color: "#2563EB",
    type: "Core"
  },
  {
    name: "bloc-cli",
    stars: "1,842",
    description: "Unified developer interface for pulling manifests and deploying sovereign AI clusters.",
    color: "#10B981",
    type: "CLI"
  },
  {
    name: "manifests",
    stars: "3,105",
    description: "Community registry of verified hardware recipes and model optimization configs.",
    color: "#F59E0B",
    type: "Registry"
  }
];

export default function OpenSourceSection() {
  return (
    <section className="py-32 px-6 bg-[#171616]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-blue-500 font-mono text-[10px] uppercase tracking-widest mb-3 block">The Foundation.</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-4">
            Our Open Source.
          </h2>
          <p className="text-zinc-500 font-mono text-sm max-w-2xl mx-auto">
            We are building the sovereign AI stack with the community. Every layer of Bloc is open, audited, and ready for production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.name}
              href={`https://github.com/bloc-ai/${project.name}`}
              className="group relative bg-zinc-900/30 border border-white/5 p-8 rounded-3xl hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300 flex flex-col justify-between min-h-[220px] overflow-hidden will-change-transform"
            >
              {/* Subtle background glow - optimized with radial-gradient instead of blur */}
              <div 
                className="absolute -top-24 -right-24 w-48 h-48 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                style={{ 
                  background: `radial-gradient(circle, ${project.color} 0%, transparent 70%)` 
                }}
              />

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                    style={{ backgroundColor: project.color }}
                  />
                  <h3 className="text-lg font-bold font-mono text-white group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs mb-4">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  <span>{project.stars}</span>
                </div>

                <p className="text-zinc-500 text-[13px] leading-relaxed font-mono">
                  {project.description}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                  {project.type}
                </span >
                <span className="text-zinc-500 group-hover:text-white transition-colors">
                  <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12L12 3M12 3H5.5M12 3V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link 
            href="https://github.com/bloc-ai" 
            className="px-8 py-3 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Visit GitHub Organization
          </Link>
        </div>
      </div>
    </section>
  );
}
