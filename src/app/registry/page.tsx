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
      


      <RegistryView initialModels={dbModels} />
      
      {/* Sonner Toaster for copy notifications */}
      <Toaster theme="dark" position="bottom-right" className="font-mono" />
    </div>
  );
}
