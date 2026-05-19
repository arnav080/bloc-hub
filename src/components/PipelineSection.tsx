"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Terminal, Cpu, Network, Check } from "lucide-react";

const stages = [
  {
    id: "01",
    label: "Pull",
    title: "The Hub",
    description: "A curated marketplace of verified recipes. Each manifest is benchmarked for maximum tokens/sec on specific hardware configurations. No more guessing which GGUF to download.",
    details: [
      "Hardware-aware filtering",
      "Community-verified benchmarks",
      "One-click manifest pull"
    ],
    icon: <Cpu className="w-5 h-5 text-blue-500" />
  },
  {
    id: "02",
    label: "Tune",
    title: "The CLI",
    description: "The engine that does the heavy lifting. A single 'bloc deploy' command auto-calculates quantization, KV cache, and GPU layers based on your local VRAM budget.",
    details: [
      "Auto-quantization engine",
      "Dynamic VRAM allocation",
      "OpenAI-compatible local API"
    ],
    icon: <Terminal className="w-5 h-5 text-blue-500" />
  },
  {
    id: "03",
    label: "Deploy",
    title: "The Mesh",
    description: "Turn your hardware into a shared office resource. Ray-powered orchestration ensures fair-use, intelligent queuing, and multi-tenancy for the whole team.",
    details: [
      "Shared office gateway (bloc.local)",
      "Fair-round-robin scheduling",
      "Live hardware telemetry"
    ],
    icon: <Network className="w-5 h-5 text-blue-500" />
  }
];

export default function PipelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate discrete active stage index for non-motion elements
  const activeIndex = useTransform(
    scrollYProgress,
    [0, START_BUFFER + 0.05, START_BUFFER + STAGE_DURATION + 0.05, START_BUFFER + (STAGE_DURATION * 2) + 0.05, 1],
    [0, 0, 1, 2, 2]
  );

  // Use state to track index for non-motion components if needed, 
  // but for Framer Motion children we can just pass the motion value.
  
  const terminalStages = [
    {
      command: "bloc pull qwen-3.5-4b",
      logs: [
        "[01:12:45] downloading model weights... 84%",
        "[01:12:48] verifying manifest checksum...",
        "[01:12:50] model successfully cached locally"
      ],
      gradient: "from-blue-500/10"
    },
    {
      command: "bloc deploy qwen-3.5-4b",
      logs: [
        "[01:13:02] optimizing for M2 Max (32GB VRAM)",
        "[01:13:05] applying 4-bit quantization...",
        "[01:13:10] local api live at http://localhost:8080"
      ],
      gradient: "from-emerald-500/10"
    },
    {
      command: "bloc mesh status",
      logs: [
        "[01:13:20] discovered 4 nodes on 'office-mesh'",
        "[01:13:22] load balancer: healthy",
        "[01:13:25] total throughput: 142 tokens/sec"
      ],
      gradient: "from-amber-500/10"
    }
  ];

  return (
    <div ref={containerRef} className="relative w-full py-32 md:py-48">
      {/* Sticky Header and Background */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="text-left mb-8">
            <span className="text-blue-500 font-mono text-[10px] uppercase tracking-widest mb-3 block">The Pipeline.</span>
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tighter text-white mb-4 leading-tight">
              One manifest. Three pillars. <br className="hidden md:block" /> Zero friction.
            </h2>
            <p className="text-zinc-500 font-mono text-[13px] max-w-xl">
              Bloc handles the technical friction of local AI—optimization, DevOps, and multi-tenancy—so you can focus on building.
            </p>
          </div>

          {/* Progress Indicator (Pills) */}
          <div className="flex items-center gap-4 mb-10 relative">
            {stages.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <Pill stage={stage} idx={idx} scrollYProgress={scrollYProgress} />
                {idx < stages.length - 1 && (
                  <ConnectorLine idx={idx} scrollYProgress={scrollYProgress} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Stage Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start h-full">
            {/* Left side: Animated Content */}
            <div className="relative min-h-[300px]">
              {stages.map((stage, idx) => (
                <Stage key={stage.id} stage={stage} idx={idx} scrollYProgress={scrollYProgress} />
              ))}
            </div>

            {/* Right side: Visual Terminal (Dynamic) */}
            <div className="hidden lg:block relative aspect-video w-full max-w-xl">
              <div className="absolute inset-0 rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden group shadow-2xl">
                 {/* Fake Terminal Background */}
                <div className="absolute inset-0 opacity-20 dither-pattern" />
                
                <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>

                <div className="pt-12 p-8 font-mono text-xs text-zinc-500 space-y-6">
                  {terminalStages.map((t, idx) => (
                    <TerminalContent key={idx} content={t} idx={idx} activeIndex={activeIndex} />
                  ))}
                </div>

                {/* Animated Gradient Overlay - Dynamic */}
                {terminalStages.map((t, idx) => (
                  <TerminalGradient key={idx} gradient={t.gradient} idx={idx} activeIndex={activeIndex} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to allow scrolling */}
      <div className="h-[300vh]" />
    </div>
  );
}

const TerminalGradient = React.memo(({ gradient, idx, activeIndex }: { gradient: string, idx: number, activeIndex: any }) => {
  const opacity = useTransform(activeIndex, [idx - 0.5, idx, idx + 0.5], [0, 0.5, 0]);
  return (
    <motion.div 
      style={{ opacity }}
      className={`absolute inset-0 bg-gradient-to-br ${gradient} via-transparent to-transparent pointer-events-none`} 
    />
  );
});

const TerminalContent = React.memo(({ content, idx, activeIndex }: { content: any, idx: number, activeIndex: any }) => {
  const opacity = useTransform(activeIndex, [idx - 0.5, idx, idx + 0.5], [0, 1, 0]);
  const y = useTransform(activeIndex, [idx - 0.5, idx, idx + 0.5], [10, 0, -10]);

  return (
    <motion.div 
      style={{ opacity, y, display: useTransform(activeIndex, (v: any) => Math.round(v) === idx ? "block" : "none") }}
      className="absolute inset-x-8 top-12"
    >
      <div className="flex gap-2 mb-4">
        <span className="text-blue-500">$</span>
        <span className="text-white">{content.command}</span>
      </div>
      <div className="space-y-2">
        {content.logs.map((log: string, i: number) => (
          <div key={i} className="opacity-60">{log}</div>
        ))}
      </div>
    </motion.div>
  );
});

const START_BUFFER = 0.1;
const STAGE_DURATION = 0.3;

const Stage = React.memo(({ stage, idx, scrollYProgress }: { stage: typeof stages[0], idx: number, scrollYProgress: any }) => {
  const start = START_BUFFER + (idx * STAGE_DURATION);
  const end = start + STAGE_DURATION;
  
  // Hard snap thresholds for absolute synchronization
  const opacity = useTransform(
    scrollYProgress,
    [0, start - 0.001, start, end - 0.001, end, 1],
    [0, 0, 1, 1, 0, 0]
  );

  const y = useTransform(
    scrollYProgress,
    [0, start - 0.001, start, end - 0.001, end, 1],
    [10, 10, 0, 0, -10, -10]
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col items-start will-change-[transform,opacity]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          {stage.icon}
        </div>
        <h3 className="text-xl md:text-2xl font-bold font-mono uppercase">{stage.title}</h3>
      </div>
      <p className="text-zinc-400 font-mono text-[13px] leading-relaxed mb-6 max-w-lg">
        {stage.description}
      </p>
      <div className="space-y-3">
        {stage.details.map((detail, i) => (
          <div key={i} className="flex items-center gap-3 text-xs font-mono text-zinc-500">
            <Check className="w-3 h-3 text-blue-500" />
            {detail}
          </div>
        ))}
      </div>
    </motion.div>
  );
});

const Pill = React.memo(({ stage, idx, scrollYProgress }: { stage: typeof stages[0], idx: number, scrollYProgress: any }) => {
  const start = START_BUFFER + (idx * STAGE_DURATION);
  
  // Pill activates exactly at the start milestone
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, start - 0.001, start, 1],
    ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.05)", "rgba(37,99,235,1)", "rgba(37,99,235,1)"]
  );
  const color = useTransform(
    scrollYProgress,
    [0, start - 0.001, start, 1],
    ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.2)", "rgba(255,255,255,1)", "rgba(255,255,255,1)"]
  );

  return (
    <motion.div
      style={{
        backgroundColor,
        color
      }}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 font-mono text-[10px] font-bold uppercase transition-all duration-300"
    >
      <span className="opacity-40">{stage.id}</span>
      <span>{stage.label}</span>
    </motion.div>
  );
});

const ConnectorLine = React.memo(({ idx, scrollYProgress }: { idx: number, scrollYProgress: any }) => {
  const start = START_BUFFER + (idx * STAGE_DURATION);
  const end = START_BUFFER + ((idx + 1) * STAGE_DURATION);

  const scaleX = useTransform(
    scrollYProgress,
    [0, start, end, 1],
    [0, 0, 1, 1]
  );

  return (
    <div className="w-12 h-[1px] bg-white/5 relative overflow-hidden">
      <motion.div
        style={{ scaleX, originX: 0 }}
        className="absolute inset-0 bg-blue-500"
      />
    </div>
  );
});
