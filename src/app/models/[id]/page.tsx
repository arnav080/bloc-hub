import Link from "next/link";
import { notFound } from "next/navigation";
import models from "@/lib/models.json";
import { RecipeDirectoryView } from "@/components/registry/RecipeDirectoryView";
import { Layers } from "lucide-react";

export default async function ModelDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const model = models.find((m) => m.id === resolvedParams.id);

  if (!model) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#171616] text-white py-24 px-6 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto">
        <Link href="/registry" className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 hover:text-white mb-12 inline-flex items-center gap-2 transition-colors uppercase bg-zinc-900/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/5">
          <span>←</span> BACK TO REGISTRY
        </Link>
        
        <div className="mb-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-2 py-1 rounded border border-white/5">{model.family}</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-mono">{model.name}</h1>
        
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-6 max-w-3xl font-mono">
          {model.description}
        </p>

        <div className="flex gap-2 flex-wrap mb-12">
          <div className="flex items-center gap-2 text-[10px] px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-mono mr-2">
            <Layers className="w-3 h-3" />
            {model.recipes?.length || 0} RECIPES
          </div>
          {model.tags.map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-1 bg-zinc-900 text-zinc-500 rounded border border-white/5 font-mono">
              #{tag}
            </span>
          ))}
        </div>

        {/* Directory View */}
        <div className="border-t border-white/5">
          <RecipeDirectoryView model={model} />
        </div>
      </div>
    </div>
  );
}
