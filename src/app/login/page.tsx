"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const [username, setUsername] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const isSupabaseConfigured = !!supabase;

  useEffect(() => {
    if (!loading && user) {
      router.push("/registry");
    }
  }, [loading, user, router]);

  // If already logged in, redirect to registry
  if (!loading && user) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured && !username.trim()) return;
    
    setIsLoggingIn(true);
    await login(username);
    setIsLoggingIn(false);
    if (!isSupabaseConfigured) {
      router.push("/registry");
    }
  };

  return (
    <div className="min-h-screen bg-[#171616] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none -z-10" />

      <Link href="/" className="mb-12 flex items-center px-6 h-10 bg-[#2563EB] rounded-md shrink-0 shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:opacity-90 transition-opacity">
        <span className="font-mono text-[16px] font-medium leading-none text-white tracking-tight whitespace-nowrap">Bloc</span>
      </Link>

      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
        
        <div className="flex items-center justify-center w-12 h-12 bg-zinc-900 border border-white/5 rounded-xl mb-6 shadow-inner">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold font-mono tracking-tighter mb-2 text-white">Connect Developer Account</h1>
        <p className="text-sm font-mono text-zinc-400 mb-8 leading-relaxed">
          Sign in via GitHub to submit optimized recipes, track your pulls, and manage namespaces.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {!isSupabaseConfigured && (
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Mock Github Username</label>
              <div className="relative">
                <Terminal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  required
                  placeholder="e.g. arnavgautam"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || (!isSupabaseConfigured && !username.trim())}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoggingIn 
              ? "Authenticating..." 
              : isSupabaseConfigured 
                ? "Sign in with GitHub" 
                : "Connect Session"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
            {isSupabaseConfigured ? (
              <>
                <span className="text-blue-400 font-bold">PRODUCTION MODE:</span> Supabase environment detected. Authenticating securely via official GitHub OAuth.
              </>
            ) : (
              <>
                <span className="text-blue-400 font-bold">DEVELOPER FALLBACK MODE:</span> Supabase environment variables not detected. Local mock authentication enabled.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
