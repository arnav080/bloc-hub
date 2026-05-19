import { RegistryView } from "@/components/registry/RegistryView";
import modelsJson from "@/lib/models.json";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function RegistryPage() {
  let dbModels = modelsJson;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*, recipes(*)');

      if (!error && data && data.length > 0) {
        dbModels = data;
      }
    } catch (err) {
      console.error("Supabase load failed, falling back to models.json:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#171616] text-white pt-32 relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-[1400px] mx-auto w-full px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter mb-4 text-white">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">REGISTRY</span>
          </h1>
          <p className="text-zinc-400 font-mono text-xs md:text-sm max-w-2xl leading-relaxed">
            The central hub for hardware-verified local AI models. Search architectures, filter by your specific GPU or Unified Memory budget, and pull optimized manifest recipes instantly.
          </p>
        </div>
        <Link 
          href="/registry/submit" 
          className="shrink-0 font-mono text-[10px] font-bold text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500/50 bg-blue-950/20 px-6 py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(37,99,235,0.05)] text-center"
        >
          + Submit Recipe
        </Link>
      </div>

      <RegistryView initialModels={dbModels} />
      
      {/* Sonner Toaster for copy notifications */}
      <Toaster theme="dark" position="bottom-right" className="font-mono" />
    </div>
  );
}
