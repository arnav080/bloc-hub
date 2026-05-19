import { RegistryView } from "@/components/registry/RegistryView";
import models from "@/lib/models.json";
import { Toaster } from "@/components/ui/sonner";

export default function RegistryPage() {
  return (
    <div className="min-h-screen bg-[#171616] text-white pt-32 relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-[1400px] mx-auto w-full px-6 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter mb-4 text-white">
          THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">REGISTRY</span>
        </h1>
        <p className="text-zinc-400 font-mono text-sm md:text-base max-w-2xl leading-relaxed">
          The central hub for hardware-verified local AI models. Search architectures, filter by your specific GPU or Unified Memory budget, and pull optimized manifest recipes instantly.
        </p>
      </div>

      <RegistryView initialModels={models} />
      
      {/* Sonner Toaster for copy notifications */}
      <Toaster theme="dark" position="bottom-right" className="font-mono" />
    </div>
  );
}
