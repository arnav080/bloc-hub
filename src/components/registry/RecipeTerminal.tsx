"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export function RecipeTerminal({ manifestUrl }: { manifestUrl: string }) {
  const [copied, setCopied] = useState(false);
  const pullCommand = `bloc pull ${manifestUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pullCommand);
    setCopied(true);
    toast.success("Command copied to clipboard", {
      description: "Run this in your terminal to deploy the model locally.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass p-1 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/5">
      <div className="bg-[#111111] p-6 flex items-center justify-between font-mono text-sm border border-white/5 rounded-xl">
        <div className="flex items-center gap-3 overflow-x-auto mr-4">
          <span className="text-zinc-600 shrink-0 select-none">$</span>
          <span className="text-zinc-300 whitespace-nowrap">{pullCommand}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors uppercase tracking-widest cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
