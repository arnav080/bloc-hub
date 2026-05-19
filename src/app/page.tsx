"use client";
 
import { useState, useEffect } from "react";
import Link from "next/link";
import { Cpu, Clock, User, Plus, Check, Compass, Rss, Copy, Terminal, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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
  const [feedTab, setFeedTab] = useState<"following" | "explore">("following");
  const [feedRecipes, setFeedRecipes] = useState<any[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Recommended creators state
  const [recommendedCreators, setRecommendedCreators] = useState<any[]>([]);

  // 1. Fetch Feed Recipes
  useEffect(() => {
    if (loading) return;
    
    const fetchFeed = async () => {
      setIsFeedLoading(true);
      try {
        const usernameQuery = feedTab === "following" && user ? user.username : "";
        const res = await fetch(`/api/social/feed?username=${encodeURIComponent(usernameQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setFeedRecipes(data.recipes);
          setIsPersonalized(data.isPersonalized);
        }
      } catch (e) {
        console.error("Failed to load feed", e);
      } finally {
        setIsFeedLoading(false);
      }
    };

    fetchFeed();
  }, [user, loading, feedTab]);

  // 2. Fetch Recommended Creators on load
  useEffect(() => {
    if (loading) return;

    const fetchRecommended = async () => {
      if (!supabase) return;
      try {
        let query = supabase.from('profiles').select('username, display_name').limit(5);
        if (user) {
          query = query.neq('username', user.username);
        }
        const { data } = await query;
        if (data) {
          if (user) {
            const { data: follows } = await supabase.from('follows').select('following_username').eq('follower_username', user.username);
            const followed = follows?.map(f => f.following_username.toLowerCase()) || [];
            
            const filtered = data.filter(c => !followed.includes(c.username.toLowerCase()));
            setRecommendedCreators(filtered);
          } else {
            setRecommendedCreators(data);
          }
        }
      } catch (e) {
        console.error("Failed to load recommended creators", e);
      }
    };

    fetchRecommended();
  }, [user, loading]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Command copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFollowRecommended = async (creatorUsername: string) => {
    if (!user) {
      toast.error("Please login to follow developers!");
      return;
    }

    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUsername: user.username,
          targetUsername: creatorUsername,
          action: "follow"
        })
      });

      if (res.ok) {
        toast.success(`Following @${creatorUsername}`);
        setRecommendedCreators(prev => prev.filter(c => c.username !== creatorUsername));
        if (feedTab === "following") {
          const feedRes = await fetch(`/api/social/feed?username=${encodeURIComponent(user.username)}`);
          if (feedRes.ok) {
            const data = await feedRes.json();
            setFeedRecipes(data.recipes);
            setIsPersonalized(data.isPersonalized);
          }
        }
      }
    } catch (e) {
      toast.error("Failed to follow creator");
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return "recently";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
 
  if (!loading && user) {
    return (
      <div className="min-h-screen bg-[#171616] text-white pt-24 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-blue-500 font-mono text-[10px] uppercase tracking-widest mb-3 block">Developer Network</span>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-mono">
                Welcome back, <span className="text-blue-400">{user.username}</span>
              </h1>
              <p className="text-zinc-500 font-mono text-sm max-w-xl">
                Your personalized hub dashboard. Keep up with contributor updates, test suites, and mesh optimization runs.
              </p>
            </div>
            
            <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-xl shrink-0 font-mono text-xs">
              <button 
                onClick={() => setFeedTab("following")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${feedTab === "following" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"}`}
              >
                <Rss className="w-3.5 h-3.5" /> Following
              </button>
              <button 
                onClick={() => setFeedTab("explore")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${feedTab === "explore" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"}`}
              >
                <Compass className="w-3.5 h-3.5" /> Explore
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {feedTab === "following" && !isPersonalized && !isFeedLoading && (
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 font-mono text-xs text-zinc-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <strong className="text-blue-400 uppercase tracking-wider block mb-1">Explore Community Runs</strong>
                  Your following feed is currently empty because you aren't following anyone yet or they haven't posted runs! Showing latest global recipes.
                </div>
                <button 
                  onClick={() => setFeedTab("explore")}
                  className="shrink-0 text-blue-400 hover:text-white transition-colors underline decoration-blue-500/30"
                >
                  Browse Registry →
                </button>
              </div>
            )}

            {isFeedLoading ? (
              <div className="space-y-6 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-zinc-900/30 border border-white/5 rounded-2xl" />
                ))}
              </div>
            ) : feedRecipes.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/10 border border-white/5 rounded-2xl font-mono text-zinc-500">
                <Terminal className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                No optimization runs available in this view.
              </div>
            ) : (
              feedRecipes.map((recipe) => {
                const author = recipe.name.split('/')[0] || "community";
                const recipeName = recipe.name.split('/')[1] || recipe.name;
                const pullCommand = `bloc pull ${recipe.name}`;
                
                return (
                  <div 
                    key={recipe.id}
                    className="bg-zinc-900/30 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all font-mono relative group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs uppercase shadow-lg shadow-blue-500/10">
                          {author[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <a href={`/users/${author}`} className="text-zinc-400 hover:text-white font-bold transition-colors">
                              @{author}
                            </a>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRelativeTime(recipe.created_at)}</span>
                          </div>
                          <a href={`/recipes/${recipe.id}`} className="text-base font-bold text-blue-100 hover:text-blue-400 transition-colors mt-0.5 block flex items-center gap-2">
                            {recipeName}
                            <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-2 self-start">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md border border-white/5">
                          {recipe.models?.family || "Base Model"}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/10">
                          {recipe.quantization} quant
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/30 rounded-xl border border-white/5 mb-6 text-xs text-zinc-400">
                      <div>
                        <span className="text-[9px] text-zinc-600 block mb-1">HARDWARE REQUIREMENTS</span>
                        <strong className="text-zinc-300">{recipe.hardware_requirements}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-600 block mb-1">CONTEXT SIZE</span>
                        <strong className="text-zinc-300">{recipe.context_size} TOKENS</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-600 block mb-1">HARDWARE TIER</span>
                        <strong className="text-zinc-300">{recipe.hardware_tier}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-600 block mb-1">ENGINE</span>
                        <strong className="text-zinc-300">LLAMA.CPP</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-zinc-950 px-4 py-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 overflow-hidden text-zinc-400 text-xs">
                        <span className="text-zinc-600 select-none">$</span>
                        <code className="truncate text-zinc-200">{pullCommand}</code>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(pullCommand, recipe.id)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0 text-zinc-500 hover:text-white"
                      >
                        {copiedId === recipe.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale-up" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
