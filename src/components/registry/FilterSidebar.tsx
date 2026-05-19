"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface FilterSidebarProps {
  hardwareTiers: string[];
  tags: string[];
  selectedHardware: string[];
  selectedTags: string[];
  onToggleHardware: (tier: string) => void;
  onToggleTag: (tag: string) => void;
}

export function FilterSidebar({
  hardwareTiers,
  tags,
  selectedHardware,
  selectedTags,
  onToggleHardware,
  onToggleTag,
}: FilterSidebarProps) {
  return (
    <div className="w-full h-full flex flex-col gap-10">
      {/* Hardware Tiers */}
      <div>
        <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Hardware Budget</h3>
        <div className="flex flex-col gap-2">
          {hardwareTiers.map((tier) => {
            const isSelected = selectedHardware.includes(tier);
            return (
              <button
                key={tier}
                onClick={() => onToggleHardware(tier)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
                  isSelected
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                    : "bg-zinc-900/30 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10 hover:text-white"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                  isSelected ? "bg-blue-500 border-blue-500" : "border-white/20"
                }`}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 7.5L6.5 10L11 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                {tier}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories / Tags */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Categories</h3>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="flex flex-wrap gap-2 pb-8">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className={`text-[10px] font-mono px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    isSelected
                      ? "bg-white text-black border-white font-bold"
                      : "bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
