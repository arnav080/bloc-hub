"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, Clock, Heart, Search, Filter, Cpu } from "lucide-react";

export function RecipeDirectoryView({ model }: { model: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHardware, setSelectedHardware] = useState<string[]>([]);
  
  const hardwareTiers = Array.from(new Set(model.recipes.map((r: any) => r.hardware_tier)));

  const filteredRecipes = model.recipes.filter((recipe: any) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHardware = selectedHardware.length === 0 || selectedHardware.includes(recipe.hardware_tier);
    return matchesSearch && matchesHardware;
  });

  const toggleHardware = (tier: string) => {
    setSelectedHardware(prev => prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1 space-y-8">
        <div>
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Filter className="w-3 h-3" /> Filters
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-zinc-600 font-mono mb-2">HARDWARE TARGET</div>
              <div className="flex flex-col gap-2">
                {hardwareTiers.map(tier => (
                  <button
                    key={tier as string}
                    onClick={() => toggleHardware(tier as string)}
                    className={`text-left text-xs font-mono px-3 py-2 rounded-lg border transition-all ${
                      selectedHardware.includes(tier as string)
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : "bg-zinc-900/30 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    {tier as string}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="lg:col-span-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Filter recipes by name or repo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 shrink-0 uppercase tracking-widest">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>

        <div className="space-y-3">
          {filteredRecipes.map((recipe: any) => {
            const [author, recipeName] = recipe.name.split('/');
            
            return (
              <Link 
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="block group bg-zinc-900/20 border border-white/5 hover:border-white/20 rounded-xl p-4 transition-all hover:bg-zinc-900/40"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Cpu className="w-3 h-3 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-mono text-zinc-300 group-hover:text-blue-100 transition-colors truncate">
                      <span className="text-zinc-500">{author}/</span>
                      <span className="font-bold">{recipeName || author}</span>
                    </h4>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] md:text-xs font-mono text-zinc-500 flex-wrap pl-7.5">
                  <span className="text-zinc-300">{recipe.hardware_tier}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="text-zinc-400">{recipe.quantization}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span>ctx: {recipe.context_size}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.updated}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {recipe.pulls}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {Math.floor(Math.random() * 800) + 120}</span>
                </div>
              </Link>
            );
          })}

          {filteredRecipes.length === 0 && (
            <div className="text-center py-16 border border-white/5 border-dashed rounded-xl bg-zinc-900/10">
              <span className="text-sm font-mono text-zinc-500">No recipes match your current filters.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
