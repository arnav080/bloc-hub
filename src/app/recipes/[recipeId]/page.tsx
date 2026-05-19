import Link from "next/link";
import { notFound } from "next/navigation";
import models from "@/lib/models.json";
import { RecipeTerminal } from "@/components/registry/RecipeTerminal";
import { Toaster } from "@/components/ui/sonner";
import { CheckCircle2, ChevronRight, Hash } from "lucide-react";

export default async function RecipeDetail({ params }: { params: Promise<{ recipeId: string }> }) {
  const resolvedParams = await params;
  
  // Find the recipe by iterating through all base models
  let foundRecipe: any = null;
  let parentModel: any = null;

  for (const model of models) {
    const recipe = model.recipes?.find((r: any) => r.id === resolvedParams.recipeId);
    if (recipe) {
      foundRecipe = recipe;
      parentModel = model;
      break;
    }
  }

  if (!foundRecipe) {
    notFound();
  }

  const nameParts = foundRecipe.name.split('/');
  const author = nameParts.length > 1 ? nameParts[0] : 'community';
  const recipeName = nameParts.length > 1 ? nameParts[1] : foundRecipe.name;

  return (
    <div className="min-h-screen bg-[#171616] text-white py-24 px-6 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 mb-12 text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
          <Link href="/registry" className="hover:text-white transition-colors">REGISTRY</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/models/${parentModel.id}`} className="hover:text-white transition-colors">{parentModel.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">{recipeName}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-mono break-all">
              <Link href={`/users/${author}`} className="text-zinc-500 hover:text-white transition-colors">
                {author}
              </Link>
              <span className="text-zinc-500">/</span>
              <span className="text-blue-400">{recipeName}</span>
            </h1>
            
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-12 max-w-2xl font-mono">
              Optimized deployment recipe for <strong className="text-white font-normal bg-zinc-900 px-2 py-0.5 rounded">{foundRecipe.hardware_tier}</strong> environments. Based on the {parentModel.name} architecture.
            </p>

            <div className="space-y-12">
              <section>
                <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Deployment Command
                </h2>
                <RecipeTerminal manifestUrl={foundRecipe.manifest_url} />
              </section>

              <section>
                <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" /> Manifest Preview
                </h2>
                <div className="glass p-6 rounded-2xl border border-white/5 font-mono text-xs text-zinc-300 overflow-x-auto bg-black/50 shadow-inner">
                  <pre className="leading-relaxed">
{`version: "1.0"
metadata:
  name: "${foundRecipe.id}"
  description: "Recipe for ${parentModel.name}"
model:
  repo: "${foundRecipe.name}"
  engine: "llama.cpp"
engine_config:
  ctx_size: ${foundRecipe.context_size}
  gpu_layers: 99
  flash_attn: true`}
                  </pre>
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6 lg:mt-2">
            <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">Specifications</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] text-zinc-600 font-mono mb-1">HARDWARE REQUIREMENTS</div>
                  <div className="text-sm font-mono text-zinc-300 bg-zinc-900 px-3 py-1.5 rounded border border-white/5 inline-block">{foundRecipe.hardware_requirements}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 font-mono mb-1">QUANTIZATION</div>
                  <div className="text-sm font-mono text-zinc-300 bg-zinc-900 px-3 py-1.5 rounded border border-white/5 inline-block">{foundRecipe.quantization}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 font-mono mb-1">CONTEXT SIZE</div>
                  <div className="text-sm font-mono text-zinc-300 bg-zinc-900 px-3 py-1.5 rounded border border-white/5 inline-block">{foundRecipe.context_size} TOKENS</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 font-mono mb-1">ENGINE</div>
                  <div className="text-sm font-mono text-zinc-300">LLAMA.CPP</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 font-mono mb-1">LAST UPDATED</div>
                  <div className="text-sm font-mono text-zinc-300">{foundRecipe.updated}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster theme="dark" position="bottom-right" className="font-mono" />
    </div>
  );
}
