"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { User, Terminal } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    bio: "",
    twitter: "",
    github: "",
    linkedin: "",
    website: ""
  });

  // Security Check: Ensure they actually have an Auth session before claiming a profile
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) {
          router.push("/login"); // Kick them out if not authenticated
        } else {
          // Pre-fill some data from OAuth if available
          setFormData(prev => ({
            ...prev,
            fullName: session.user.user_metadata?.full_name || "",
            username: session.user.user_metadata?.user_name || ""
          }));
        }
      });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName) return;

    setIsSubmitting(true);

    try {
      // 1. Get Auth session ID
      let authId = "mock-id-123";
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Authentication expired. Please log in again.");
        authId = session.user.id;
      }

      // 2. Submit to API to claim username
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, authId })
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Failed to create profile");
      }

      toast.success("Profile created successfully!");
      
      // 3. Force hard redirect to reload AuthContext and pick up the new profile
      window.location.href = "/registry";
      
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 pt-24 font-sans text-white">
      {/* Aesthetic Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-2xl bg-[#111827] border border-white/5 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header Block */}
        <div className="flex flex-col items-center text-center p-10 pb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 mb-6 flex items-center justify-center shadow-lg border-4 border-[#111827]">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Complete your profile</h1>
          <p className="text-zinc-400 text-sm">One last step to join the community</p>
        </div>

        {/* Form Block */}
        <form onSubmit={handleSubmit} className="px-10 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Username <span className="text-red-400">*</span></label>
              <input 
                required
                type="text" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")})}
                placeholder="Username"
                className="w-full bg-[#1f2937] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Full name <span className="text-red-400">*</span></label>
              <input 
                required
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="Full name"
                className="w-full bg-[#1f2937] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                Twitter username <span className="text-zinc-500 font-normal text-xs">(optional)</span>
              </label>
              <input 
                type="text" 
                value={formData.twitter}
                onChange={e => setFormData({...formData, twitter: e.target.value})}
                placeholder="Twitter account"
                className="w-full bg-[#1f2937] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                GitHub username <span className="text-zinc-500 font-normal text-xs">(optional)</span>
              </label>
              <input 
                type="text" 
                value={formData.github}
                onChange={e => setFormData({...formData, github: e.target.value})}
                placeholder="GitHub username"
                className="w-full bg-[#1f2937] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                LinkedIn profile <span className="text-zinc-500 font-normal text-xs">(optional)</span>
              </label>
              <input 
                type="url" 
                value={formData.linkedin}
                onChange={e => setFormData({...formData, linkedin: e.target.value})}
                placeholder="LinkedIn profile"
                className="w-full bg-[#1f2937] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                Homepage <span className="text-zinc-500 font-normal text-xs">(optional)</span>
              </label>
              <input 
                type="url" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder="Homepage"
                className="w-full bg-[#1f2937] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
              AI & ML interests <span className="text-zinc-500 font-normal text-xs">(optional)</span>
            </label>
            <textarea 
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell us what you're building..."
              className="w-full bg-[#1f2937] border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm h-24 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.username || !formData.fullName}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Saving Profile..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
