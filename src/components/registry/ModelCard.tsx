"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ModelCard({ model }: { model: any }) {
  const recipeCount = model.recipes?.length || 0;

  return (
    <Link 
      href={`/models/${model.id}`}
      className="group flex flex-col h-full bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-white/20 hover:bg-zinc-900/50 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{model.family}</span>
            <h3 className="text-xl font-bold font-mono group-hover:text-blue-400 transition-colors">{model.name}</h3>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-mono border-white/10 text-zinc-400 flex items-center gap-1.5 bg-black/50">
            <Layers className="w-3 h-3 text-blue-400" />
            {recipeCount} {recipeCount === 1 ? 'Recipe' : 'Recipes'}
          </Badge>
        </div>

        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-6 flex-grow font-mono">
          {model.description}
        </p>

        <div className="flex gap-2 flex-wrap mb-6">
          {model.tags.map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-black/50 text-zinc-500 border border-white/5 rounded font-mono">
              #{tag}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500 group-hover:text-white transition-colors">
            View Directory
          </span>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
