"use client";

import Link from "next/link";
import models from "@/lib/models.json";
import PixelBlast from "@/components/PixelBlast";
import { CTAButton } from "@/components/Navbar";
import { AsciiCanvas } from "@/components/AsciiCanvas";
import { useAuth } from "@/context/AuthContext";

import PipelineSection from "@/components/PipelineSection";
import OpenSourceSection from "@/components/OpenSourceSection";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return (
      <div className="min-h-screen bg-[#171616] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient background bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="flex flex-col items-center justify-center text-center font-mono max-w-md relative z-10">
          <div className="w-12 h-12 rounded-xl border border-white/10 bg-zinc-900/50 flex items-center justify-center mb-6 shadow-inner text-blue-500 animate-pulse">
            <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.877075 7.49988C0.877075 3.84221 3.84221 0.877075 7.49988 0.877075C11.1575 0.877075 14.1227 3.84221 14.1227 7.49988C14.1227 11.1575 11.1575 14.1227 7.49988 14.1227C3.84221 14.1227 0.877075 11.1575 0.877075 7.49988ZM7.49988 1.82708C4.36686 1.82708 1.82708 4.36686 1.82708 7.49988C1.82708 9.07686 2.4704 10.5034 3.51375 11.5332L11.5332 3.51375C10.5034 2.4704 9.07686 1.82708 7.49988 1.82708ZM13.1727 7.49988C13.1727 5.9229 12.5294 4.49633 11.486 3.46654L3.46654 11.486C4.49633 12.5294 5.9229 13.1727 7.49988 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49988Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Feed Coming Soon</h2>
          <p className="text-xs text-zinc-500 leading-relaxed mb-6">
            Your personalized developer feed tracking trending model releases, local benchmark scores, and updates from contributors you follow is currently being compiled.
          </p>
          <Link 
            href="/registry"
            className="text-[10px] font-bold text-blue-400 border border-blue-500/20 hover:border-blue-500/50 bg-blue-950/20 px-4 py-2 rounded-lg uppercase tracking-widest transition-all"
          >
            Explore Registry →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171616] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-60">
          <PixelBlast 
            pixelSize={6}
            color="#2563EB"
            patternScale={5}
            patternDensity={0.4}
            transparent={true}
            edgeFade={0.3}
            speed={0.3}
            pixelSizeJitter={0.1}
            rippleIntensityScale={1.5}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white leading-[1.2]">
              Verified Local AI Performance <br />
              requires <span className="font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Bloc.</span>
            </h1>
            
            <p className="text-sm md:text-base text-white font-mono mb-10 max-w-lg mx-auto tracking-tight leading-relaxed opacity-90">
              Optimized model recipes, distributed mesh orchestration, and local inference — the missing layer for AI that scales. Get smarter with every node.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <CTAButton 
                label="Start Building" 
                href="/docs" 
                variant="large" 
                className="w-full sm:w-auto"
              />
              <Link href="https://bloc-wheat-sigma.vercel.app/contact" className="h-12 flex items-center justify-center bg-zinc-900 border border-white/10 text-white px-8 py-3 rounded-[14px] text-[13px] font-mono font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all">
                Talk to Founder
              </Link>
            </div>

            <div className="inline-flex items-center gap-3 bg-zinc-900/80 border border-white/10 p-2 pl-4 rounded-xl text-xs font-mono text-zinc-400 backdrop-blur-md group hover:border-white/20 transition-all duration-300">
              <span className="text-zinc-600">$</span>
              <code className="text-zinc-200">bloc pull qwen-3.5-4b</code>
              <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-500">
                  <path d="M5 2V1H10V2M5 2C4.44772 2 4 2.44772 4 3V12C4 12.5523 4.44772 13 5 13H10C10.5523 13 11 12.5523 11 12V3C11 2.44772 10.5523 2 10 2M5 2H10M3 5H2V14H11V13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blue Banner Divider - Stretches from edge-gap to edge-gap */}
      <div className="w-full px-6 py-12">
        <section className="w-full h-[315px] bg-[#2563EB] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 dither-pattern text-white pointer-events-none" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <AsciiCanvas />
        </section>
      </div>

      {/* How it Works Pipeline */}
      <PipelineSection />

      {/* Trending Models Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
            <div className="text-left">
              <span className="text-blue-500 font-mono text-[10px] uppercase tracking-widest mb-3 block">The Registry.</span>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tighter text-white mb-4 leading-tight">
                Trending on <span className="font-mono">Bloc.</span>
              </h2>
              <p className="text-zinc-500 font-mono text-[13px] max-w-xl">
                Most pulled manifests in the last 24h. Hand-picked performance recipes optimized for local hardware.
              </p>
            </div>
            
            <div className="flex gap-4 mb-1">
              <span className="text-[10px] font-mono bg-zinc-900 px-3 py-1.5 rounded-full text-zinc-400 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">Sort: Popular</span>
              <span className="text-[10px] font-mono bg-zinc-900 px-3 py-1.5 rounded-full text-zinc-400 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">Hardware: All</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {models.slice(0, 3).map((model) => {
              const recipeCount = model.recipes?.length || 0;
              return (
              <Link 
                href={`/models/${model.id}`} 
                key={model.id}
                className="group border border-white/5 p-8 rounded-2xl hover:bg-white/[0.02] transition-all duration-300 flex flex-col h-full bg-zinc-900/20"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors font-mono">{model.name}</h3>
                  <span className="text-[10px] font-mono bg-zinc-800 px-2 py-1 rounded border border-white/10 uppercase tracking-widest text-zinc-400">
                    {recipeCount} {recipeCount === 1 ? 'Recipe' : 'Recipes'}
                  </span>
                </div>
                
                <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-grow font-mono">
                  {model.description}
                </p>

                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {model.tags.map((tag: string) => (
                      <span key={tag} className="text-[9px] bg-zinc-900 text-zinc-600 px-2 py-0.5 rounded border border-white/5 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-end text-[10px] font-mono text-zinc-500">
                    <span className="group-hover:text-white transition-colors flex items-center gap-2">
                      View Directory <span>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            )})}
          </div>

          <div className="flex flex-col items-center text-center">
            <Link href="/registry" className="text-zinc-400 hover:text-white transition-colors font-mono text-[13px] flex items-center gap-2 group">
              Explore the Hub Registry
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300">
                <path d="M3 12L12 3M12 3H5.5M12 3V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <OpenSourceSection />
      <FAQ noBorder />
      <FinalCTA noBorder />
      <Footer />
    </div>
  );
}
