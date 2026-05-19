"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onClick}
        className="w-full py-8 flex items-center justify-between text-left group cursor-pointer"
      >
        <span className="text-[16px] md:text-[18px] font-mono text-white/80 group-hover:text-white transition-colors duration-300">
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-white/30 transition-transform duration-500 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-[14px] font-mono text-white/40 leading-relaxed max-w-3xl">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function FAQ({ noBorder = false }: { noBorder?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What exactly is a Bloc Manifest?",
      answer: "A manifest is a blueprint for reliable local AI. It defines the exact model weights, quantization levels, and VRAM budgets required to ensure a model runs perfectly on your specific hardware configuration."
    },
    {
      question: "How is the Hub different from Hugging Face?",
      answer: "While Hugging Face is a general model library, the Bloc Hub is a registry of hardware-verified recipes. Every manifest is benchmarked on specific chips (M-series, RTX, etc.) to guarantee enterprise-grade tokens/sec."
    },
    {
      question: "Are the models on the Hub open source?",
      answer: "Yes. We optimize the highest-performing open-source weights (Llama, DeepSeek, Qwen) and provide them as sovereign recipes that you can deploy with a single CLI command."
    },
    {
      question: "How do I deploy a manifest from the Hub?",
      answer: "Use the Bloc CLI. Simply run 'bloc pull <manifest-id>' to fetch the weights and auto-optimize the local inference engine for your machine's specific compute budget."
    },
    {
      question: "Can I contribute my own hardware recipes?",
      answer: "Absolutely. The Hub is a community registry. You can submit your own optimized manifests for unique hardware setups to help others achieve zero-config local AI."
    },
    {
      question: "Does using the Hub compromise my data privacy?",
      answer: "Never. Your data remains entirely local. The Hub only serves the 'recipes' and model weights; all inference happens on your sovereign hardware without touching our servers."
    },
    {
      question: "Do I need a high-end GPU to use these manifests?",
      answer: "The Hub is built for everyone. We provide manifests specifically tuned for everything from high-VRAM clusters to power-efficient MacBooks and local NPU accelerators."
    }
  ];

  return (
    <section className={`bg-[#171616] py-32 px-6 md:px-12 flex flex-col items-center ${noBorder ? "" : "border-t border-white/5"}`}>
      <div className="w-full max-w-4xl">
        <h2 className="text-[24px] font-mono font-bold text-white/90 mb-12 uppercase tracking-tighter">
          Frequently Asked Questions
        </h2>
        <div className="border-t border-white/10">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
