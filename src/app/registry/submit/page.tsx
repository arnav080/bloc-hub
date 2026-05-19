"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Terminal, Save, ArrowLeft, Cpu, Database, Settings2, Sliders, Edit3, Eye, Link2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import YAML from "yaml";

export default function SubmitRecipe() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Mode: Form-driven vs Raw Editor-driven
  const [editorMode, setEditorMode] = useState<"form" | "raw">("form");

  // Raw YAML state
  const [rawYaml, setRawYaml] = useState("");

  // Terminal Import input
  const [terminalCommand, setTerminalCommand] = useState("");

  // Model & Namespace (All fully writable)
  const [baseModel, setBaseModel] = useState("qwen-35b-moe");
  const [recipeName, setRecipeName] = useState("");
  const [quantization, setQuantization] = useState("Q4_K_S");
  const [modelSource, setModelSource] = useState("https://huggingface.co/bartowski/Qwen2.5-Coder-32B-Instruct-GGUF/resolve/main/Qwen2.5-Coder-32B-Instruct-Q4_K_M.gguf");

  // Hardware Details (All fully writable)
  const [vram, setVram] = useState("8GB VRAM");
  const [hardwareDesc, setHardwareDesc] = useState("RTX 4060 Ti 8GB");

  // Engine Optimization details
  const [gpuLayers, setGpuLayers] = useState(99);
  const [moeExperts, setMoeExperts] = useState(32);
  const [flashAttention, setFlashAttention] = useState(true);
  const [batchSize, setBatchSize] = useState(512);
  const [ubatchSize, setUbatchSize] = useState(512);
  const [threads, setThreads] = useState(12);

  // KV Cache Precision
  const [kvKey, setKvKey] = useState("q4_0");
  const [kvValue, setKvValue] = useState("tq3_0");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse shell benchmark terminal commands to pre-fill all parameters
  const handleTerminalImport = () => {
    if (!terminalCommand.trim()) {
      toast.error("Please paste a terminal command first.");
      return;
    }

    try {
      const cmd = terminalCommand.trim();

      // Helper regex parsers for exact flags
      const getVal = (flag: string) => {
        const regex = new RegExp(`(?:\\s|^)${flag}\\s+([^\\s\\\\]+)`);
        const match = cmd.match(regex);
        return match ? match[1] : null;
      };

      // 1. Model Parsing (extract model weights name and guess architecture/quant)
      const modelFile = getVal("-m") || getVal("--model");
      if (modelFile) {
        // Strip path and gguf suffix
        const cleanName = modelFile.replace(/^.*[\\\/]/, '').replace(/\.gguf$/i, '');
        
        // Ex: Qwen3.6-35B-A3B-TQ3_4S -> Base: qwen-3.6-35b-a3b, Quant: TQ3_4S
        const parts = cleanName.split('-');
        if (parts.length > 1) {
          const guessedQuant = parts[parts.length - 1];
          const guessedBase = parts.slice(0, -1).join('-').toLowerCase();
          
          setBaseModel(guessedBase);
          setQuantization(guessedQuant.toUpperCase());
          setRecipeName(`${guessedBase}-${guessedQuant.toLowerCase()}-optimized`);
        } else {
          setBaseModel(cleanName.toLowerCase());
          setRecipeName(`${cleanName.toLowerCase()}-optimized`);
        }

        // Guess HF Source link if a standard user repo format is present, or leave generic
        if (modelFile.startsWith("http")) {
          setModelSource(modelFile);
        } else {
          setModelSource(`https://huggingface.co/QuantFactory/${cleanName}-GGUF/resolve/main/${cleanName}.${quantization}.gguf`);
        }
      }

      // 2. Offload Layers (-ngl / --n-gpu-layers)
      const ngl = getVal("-ngl") || getVal("--n-gpu-layers");
      if (ngl) setGpuLayers(Number(ngl));

      // 3. MoE experts (-ncmoe / --num-experts)
      const ncmoe = getVal("-ncmoe") || getVal("--num-experts");
      if (ncmoe) setMoeExperts(Number(ncmoe));

      // 4. CPU Threads (-t / --threads)
      const t = getVal("-t") || getVal("--threads");
      if (t) setThreads(Number(t));

      // 5. Batch settings (-b / --batch-size)
      const b = getVal("-b") || getVal("--batch-size");
      if (b) setBatchSize(Number(b));

      const ub = getVal("-ub") || getVal("--ubatch-size");
      if (ub) setUbatchSize(Number(ub));

      // 6. Flash Attention (-fa / --flash-attn)
      const fa = getVal("-fa") || getVal("--flash-attn");
      if (fa) setFlashAttention(fa === "1" || fa.toLowerCase() === "true");

      // 7. KV Cache keys (-ctk / --cache-type-k)
      const ctk = getVal("-ctk") || getVal("--cache-type-k");
      if (ctk) setKvKey(ctk);

      // 8. KV Cache values (-ctv / --cache-type-v)
      const ctv = getVal("-ctv") || getVal("--cache-type-v");
      if (ctv) setKvValue(ctv);

      toast.success("Successfully parsed terminal flags into form variables!");
      setTerminalCommand(""); // Clear box on success
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse command. Make sure standard llama.cpp flags are used.");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Compile detailed custom YAML representation automatically from form state
  const manifestObj = {
    version: "1.0",
    model: {
      base: baseModel,
      name: `${user?.username || "developer"}/${recipeName || "recipe"}`,
      quantization: quantization,
      source: modelSource
    },
    requirements: {
      vram: vram,
      hardware: hardwareDesc,
      os: ["macOS", "Linux", "Windows"]
    },
    engine: {
      gpu_layers: gpuLayers,
      moe_experts: moeExperts,
      flash_attention: flashAttention,
      batch_size: batchSize,
      ubatch_size: ubatchSize,
      threads: threads,
      kv_cache: {
        key: kvKey,
        value: kvValue
      }
    }
  };

  const compiledYaml = YAML.stringify(manifestObj);

  // Sync Form edits to Raw Editor state
  useEffect(() => {
    if (editorMode === "form") {
      setRawYaml(compiledYaml);
    }
  }, [compiledYaml, editorMode]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#171616] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editorMode === "form" && !recipeName) {
      toast.error("Please enter a recipe name");
      return;
    }

    // Verify raw editor mode is valid YAML
    let finalYaml = rawYaml;
    let finalRecipeName = recipeName;

    if (editorMode === "raw") {
      try {
        const parsed = YAML.parse(rawYaml);
        if (!parsed.model?.name) {
          toast.error("Raw YAML is missing the 'model.name' parameter.");
          return;
        }
        // Extract recipeName from path
        const parts = parsed.model.name.split("/");
        finalRecipeName = parts[parts.length - 1];
      } catch (err) {
        toast.error("Invalid YAML syntax! Please fix compilation errors in the raw editor.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/recipes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yaml: finalYaml,
          username: user.username,
          recipeName: finalRecipeName
        })
      });

      if (!res.ok) throw new Error("Failed to submit recipe");

      toast.success("Advanced recipe committed and compiled!");
      router.push("/registry");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171616] text-white pt-20 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/registry" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest mb-4 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <ArrowLeft className="w-3 h-3" /> Back to Registry
            </Link>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              <Terminal className="w-8 h-8 text-blue-500" />
              Configure Custom optimization
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Pane: Config Console */}
          <div className="space-y-6">
            {/* Terminal Parser Import Console */}
            <div className="bg-[#0c0c0c] border border-blue-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-transparent" />
              <h3 className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-500" />
                Terminal Run Command Auto-Importer
              </h3>
              
              <div className="flex flex-col gap-3">
                <textarea
                  placeholder="Paste your llama-bench or llama-server script here... e.g. ./llama-bench -m Qwen3.6-35B-A3B-TQ3_4S.gguf -ngl 99 -ncmoe 32 -fa 1"
                  value={terminalCommand}
                  onChange={(e) => setTerminalCommand(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 min-h-[70px] resize-y leading-relaxed"
                />
                
                <button
                  type="button"
                  onClick={handleTerminalImport}
                  className="w-full md:w-auto self-end bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold uppercase tracking-widest text-[9px] py-2 px-5 rounded-lg transition-all"
                >
                  Parse & Auto-Fill Parameters
                </button>
              </div>
            </div>

            {/* Main Parameters Form */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* SECTION 1: Weights & Namespace */}
                <div>
                  <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    Model Configuration
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Base Architecture</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. qwen-35b-moe"
                        value={baseModel}
                        onChange={(e) => setBaseModel(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Quantization</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Q4_K_S or TQ3_4S"
                        value={quantization}
                        onChange={(e) => setQuantization(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  {/* HuggingFace Source Link */}
                  <div className="space-y-2 mt-4">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-blue-400" />
                      HuggingFace Model Source URL (.gguf)
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="e.g. https://huggingface.co/bartowski/Qwen2.5-32B-GGUF/resolve/main/model.gguf"
                      value={modelSource}
                      onChange={(e) => setModelSource(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Recipe Namespace & Name</label>
                    <div className="flex bg-black/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                      <div className="bg-white/5 px-4 py-3 border-r border-white/10 text-sm font-mono text-zinc-500 flex items-center shrink-0">
                        {user.username} /
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. qwen-35b-moe-rtx4060"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="w-full bg-transparent py-3 px-4 text-sm font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Hardware Environment */}
                <div>
                  <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Target hardware
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Hardware Bracket VRAM</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 8GB VRAM or 16GB Unified Memory"
                        value={vram}
                        onChange={(e) => setVram(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Exact Device Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. RTX 4060 Ti 8GB"
                        value={hardwareDesc}
                        onChange={(e) => setHardwareDesc(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: llama.cpp / Engine Flags */}
                <div>
                  <h2 className="text-[11px] font-mono font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Engine Optimization Flags
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Offload Layers (-ngl)</label>
                      <input
                        type="number"
                        required
                        value={gpuLayers}
                        onChange={(e) => setGpuLayers(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">MoE Experts (-ncmoe)</label>
                      <input
                        type="number"
                        required
                        value={moeExperts}
                        onChange={(e) => setMoeExperts(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">CPU Threads (-t)</label>
                      <input
                        type="number"
                        required
                        value={threads}
                        onChange={(e) => setThreads(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Batch Size (-b)</label>
                      <input
                        type="number"
                        required
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Physical (-ub)</label>
                      <input
                        type="number"
                        required
                        value={ubatchSize}
                        onChange={(e) => setUbatchSize(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Flash Attn (-fa)</label>
                      <div className="relative">
                        <select 
                          value={flashAttention ? "1" : "0"}
                          onChange={(e) => setFlashAttention(e.target.value === "1")}
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                        >
                          <option value="1">Enabled (1)</option>
                          <option value="0">Disabled (0)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">KV Cache Key (-ctk)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. q4_0 or q8_0"
                        value={kvKey}
                        onChange={(e) => setKvKey(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">KV Cache Value (-ctv)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. tq3_0 or f16"
                        value={kvValue}
                        onChange={(e) => setKvValue(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !recipeName}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Committing to Git..." : "Publish to Registry"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Pane: Live YAML Editor & Preview */}
          <div className="sticky top-24 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <span className="ml-2 text-[10px] font-mono text-zinc-500">{user.username}/{recipeName || "recipe"}.yaml</span>
              </div>
              
              {/* Form vs Raw Sync Controls */}
              <div className="flex bg-black/60 border border-white/10 rounded-lg p-0.5 shrink-0">
                <button
                  onClick={() => setEditorMode("form")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-mono uppercase tracking-wider font-bold rounded-md transition-colors ${
                    editorMode === "form" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Eye className="w-3 h-3" /> Form Sync
                </button>
                <button
                  onClick={() => setEditorMode("raw")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-mono uppercase tracking-wider font-bold rounded-md transition-colors ${
                    editorMode === "raw" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Raw Editor
                </button>
              </div>
            </div>
            
            {editorMode === "form" ? (
              /* Synchronized visual YAML markup */
              <div className="p-6 overflow-x-auto min-h-[500px]">
                <pre className="text-[13px] font-mono leading-relaxed">
                  <code>
                    {compiledYaml.split('\n').map((line, i) => {
                      if (line.includes(':')) {
                        const idx = line.indexOf(':');
                        const key = line.substring(0, idx);
                        const value = line.substring(idx + 1);
                        return (
                          <div key={i}>
                            <span className="text-blue-400">{key}</span>:
                            <span className="text-green-400">{value}</span>
                          </div>
                        );
                      }
                      return <div key={i} className="text-zinc-500">{line}</div>;
                    })}
                  </code>
                </pre>
              </div>
            ) : (
              /* Writable Raw YAML editor text area */
              <div className="p-4 min-h-[500px] flex flex-col">
                <div className="text-[10px] text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg font-mono mb-3 flex items-center gap-2">
                  <span>⚠️</span> Editing raw YAML takes precedence. Click "Publish" to save exact overrides.
                </div>
                <textarea
                  value={rawYaml}
                  onChange={(e) => setRawYaml(e.target.value)}
                  className="flex-grow w-full bg-black/60 border border-white/5 rounded-xl p-4 text-[13px] font-mono text-zinc-300 focus:outline-none focus:border-blue-500/40 min-h-[420px] resize-none leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
