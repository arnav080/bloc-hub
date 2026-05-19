"use client";

import React, { useState, useEffect } from "react";
import { FilterSidebar } from "./FilterSidebar";
import { ModelCard } from "./ModelCard";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import Link from "next/link";

export function RegistryView({ initialModels }: { initialModels: any[] }) {
  const [viewMode, setViewMode] = useState<"model" | "gpu">("model");
  const [selectedHardware, setSelectedHardware] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [commandOpen, setCommandOpen] = useState(false);

  // Derive unique hardware tiers (from nested recipes) and tags for the sidebar
  const hardwareTiers = Array.from(new Set(initialModels.flatMap(m => m.recipes?.map((r: any) => r.hardware_tier) || [])));
  const allTags = Array.from(new Set(initialModels.flatMap(m => m.tags)));

  // Setup Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter logic: A model passes if any of its recipes match the selected hardware, AND its tags match.
  const filteredModels = initialModels.filter((model) => {
    const matchesHardware = selectedHardware.length === 0 || 
      model.recipes?.some((r: any) => selectedHardware.includes(r.hardware_tier));
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => model.tags.includes(tag));
    return matchesHardware && matchesTags;
  });

  const toggleHardware = (tier: string) => {
    setSelectedHardware(prev => prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Grouping logic for rendering
  let groupedData: Record<string, any[]> = {};
  
  if (viewMode === "model") {
    groupedData = filteredModels.reduce((acc, curr) => {
      const family = curr.family || "Other";
      if (!acc[family]) acc[family] = [];
      acc[family].push(curr);
      return acc;
    }, {} as Record<string, any[]>);
  } else {
    // GPU-wise: Group models under each hardware tier they support
    filteredModels.forEach((model) => {
      const tiers = Array.from(new Set(model.recipes?.map((r: any) => r.hardware_tier) || ["Other"]));
      tiers.forEach((tier) => {
        const tierName = tier as string;
        if (!groupedData[tierName]) groupedData[tierName] = [];
        groupedData[tierName].push(model);
      });
    });
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full px-6">
      {/* Full-width Inline Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-12 border-b border-white/5">
        <h1 className="text-3xl font-bold font-mono tracking-tighter text-white uppercase shrink-0">
          REGISTRY
        </h1>
        
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Search Trigger */}
          <button 
            onClick={() => setCommandOpen(true)}
            className="w-full sm:w-72 h-10 flex items-center justify-between gap-3 bg-black/40 border border-white/10 hover:border-white/20 px-4 rounded-xl text-zinc-400 font-mono text-[11px] transition-colors shrink-0 whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span>Search models, tags...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-zinc-900 border border-white/10 px-1.5 py-0.5 rounded text-[9px] text-zinc-600 font-sans">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>

          {/* View Toggle */}
          <div className="h-10 flex items-center gap-3 bg-black/40 px-4 rounded-xl border border-white/10 shrink-0">
            <span className={`text-[10px] font-mono font-bold tracking-wider uppercase transition-colors ${viewMode === "model" ? "text-white" : "text-zinc-500"}`}>Model-wise</span>
            <Switch 
              checked={viewMode === "gpu"} 
              onCheckedChange={(checked) => setViewMode(checked ? "gpu" : "model")}
              className="data-[state=checked]:bg-blue-600 scale-90"
            />
            <span className={`text-[10px] font-mono font-bold tracking-wider uppercase transition-colors ${viewMode === "gpu" ? "text-white" : "text-zinc-500"}`}>GPU-wise</span>
          </div>

          {/* Create Button */}
          <Link 
            href="/registry/submit" 
            className="h-10 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500/50 bg-blue-950/20 px-5 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(37,99,235,0.02)]"
          >
            + Submit Recipe
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-1 border-r border-white/5 pr-6 h-[calc(100vh-120px)] sticky top-24">
          <FilterSidebar 
            hardwareTiers={hardwareTiers}
            tags={allTags}
            selectedHardware={selectedHardware}
            selectedTags={selectedTags}
            onToggleHardware={toggleHardware}
            onToggleTag={toggleTag}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 pb-32">

        {/* Results Grid */}
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-24 border border-white/5 border-dashed rounded-2xl">
            <h3 className="text-xl font-mono text-zinc-400 mb-2">No models found</h3>
            <p className="text-zinc-500 font-mono text-sm">Try adjusting your hardware or category filters.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedData).map(([groupName, modelsList]) => (
              <div key={groupName}>
                <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-white mb-6">
                  {groupName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modelsList.map((model) => (
                    <ModelCard key={model.id} model={model} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closes the grid container */}
      </div>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search models or toggle hardware tiers..." className="font-mono text-sm" />
        <CommandList className="bg-[#171616] border-t border-white/10">
          <CommandEmpty className="py-6 text-center font-mono text-zinc-500 text-sm">No results found.</CommandEmpty>
          <CommandGroup heading="Hardware Budgets" className="text-zinc-400 font-mono">
            {hardwareTiers.map(tier => (
              <CommandItem 
                key={tier} 
                onSelect={() => { toggleHardware(tier); setCommandOpen(false); }}
                className="font-mono text-xs hover:bg-zinc-800 hover:text-white cursor-pointer data-[selected=true]:bg-blue-600 data-[selected=true]:text-white"
              >
                {selectedHardware.includes(tier) ? "Remove Filter" : "Filter by"}: {tier}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Models" className="text-zinc-400 font-mono">
            {initialModels.map(model => (
              <CommandItem 
                key={model.id} 
                onSelect={() => { window.location.href = `/models/${model.id}`; }}
                className="font-mono text-xs hover:bg-zinc-800 hover:text-white cursor-pointer data-[selected=true]:bg-zinc-800 data-[selected=true]:text-white"
              >
                View Directory: {model.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
