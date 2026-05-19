"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Terminal, Save, ArrowLeft, Cpu, Database, Link as LinkIcon, Settings2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import YAML from "yaml";

export default function SubmitRecipe() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [baseModel, setBaseModel] = useState("qwen-2.5-7b");
  const [recipeName, setRecipeName] = useState("");
  const [vram, setVram] = useState("8GB");
  const [quantization, setQuantization] = useState("Q4_K_M");
  const [contextSize, setContextSize] = useState(8192);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#171616] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Generate the YAML manifest string
  const manifestObj = {
    version: "1.0",
    model: {
      base: baseModel,
      name: `${user.username}/${recipeName || "my-recipe"}`,
      architecture: "llama",
      quantization: quantization
    },
    requirements: {
      vram: vram,
      ram: "16GB",
      os: ["macOS", "Linux", "Windows"]
    },
    engine: {
      context_size: contextSize,
      max_threads: 8,
      gpu_layers: "max"
    }
  };

  const yamlString = YAML.stringify(manifestObj);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName) {
      toast.error("Please enter a recipe name");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/recipes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yaml: yamlString,
          username: user.username,
          recipeName: recipeName,
          baseModel: baseModel
        })
      });

      if (!res.ok) throw new Error("Failed to submit recipe");

      toast.success("Recipe published successfully!");
      router.push("/registry");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171616] text-white pt-20 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest mb-4 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <ArrowLeft className="w-3 h-3" /> Back to Registry
            </Link>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              <Terminal className="w-8 h-8 text-blue-500" />
              Configure Local Recipe
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Pane: Configuration Form */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
            
            <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-400" />
              Optimization Parameters
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Base Model */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Base Weights</label>
                <div className="relative">
                  <Database className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <select 
                    value={baseModel}
                    onChange={(e) => setBaseModel(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                  >
                    <option value="qwen-2.5-7b">Qwen 2.5 (7B)</option>
                    <option value="llama-3-8b">Llama 3 (8B)</option>
                    <option value="mistral-7b-v0.2">Mistral v0.2 (7B)</option>
                    <option value="phi-3-mini">Phi-3 Mini (3.8B)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                </div>
              </div>

              {/* Recipe Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Target Namespace</label>
                <div className="flex bg-black/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                  <div className="bg-white/5 px-4 py-3 border-r border-white/10 text-sm font-mono text-zinc-500 flex items-center gap-2 shrink-0">
                    {user.username} /
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. macbook-pro-m3"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-transparent py-3 px-4 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
                <p className="text-[10px] font-mono text-zinc-500">Only lowercase letters, numbers, and hyphens.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* VRAM */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Target VRAM</label>
                  <div className="relative">
                    <select 
                      value={vram}
                      onChange={(e) => setVram(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                    >
                      <option value="4GB">4GB (Budget)</option>
                      <option value="8GB">8GB (Standard)</option>
                      <option value="16GB">16GB (Pro)</option>
                      <option value="24GB">24GB (Ultra)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                  </div>
                </div>

                {/* Quantization */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Quantization</label>
                  <div className="relative">
                    <select 
                      value={quantization}
                      onChange={(e) => setQuantization(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                    >
                      <option value="Q4_K_M">Q4_K_M (Rec.)</option>
                      <option value="Q5_K_M">Q5_K_M</option>
                      <option value="Q8_0">Q8_0</option>
                      <option value="FP16">FP16 (Max)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !recipeName}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmitting ? "Committing to Git..." : "Publish to Registry"}
              </button>
            </form>
          </div>

          {/* Right Pane: Live YAML Preview */}
          <div className="sticky top-24 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <span className="ml-2 text-[10px] font-mono text-zinc-500">{user.username}/{recipeName || "my-recipe"}.yaml</span>
              </div>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Live Preview
              </span>
            </div>
            
            <div className="p-6 overflow-x-auto min-h-[400px]">
              <pre className="text-[13px] font-mono leading-relaxed">
                <code>
                  {yamlString.split('\n').map((line, i) => {
                    if (line.includes(':')) {
                      const idx = line.indexOf(':');
                      const key = line.substring(0, idx);
                      const value = line.substring(idx + 1);
                      return (
                        <div key={i}>
                          <span className="text-blue-400">{key}</span>:
                          <span className="text-green-400">{value}</span>
                        </div>
                      );
                    }
                    return <div key={i} className="text-zinc-500">{line}</div>;
                  })}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
