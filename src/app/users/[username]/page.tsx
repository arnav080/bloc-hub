import React from "react";
import { supabase } from "@/lib/supabase";
import modelsData from "@/lib/models.json";
import Link from "next/link";
import { 
  Settings, 
  Edit3, 
  Plus, 
  Box, 
  Database,
  Terminal,
  Clock,
  Cpu
} from "lucide-react";

import { NativeProfileActions } from "@/components/profile/NativeProfileActions";

export function formatRelativeTime(dateString?: string, fallbackText: string = "Just added") {
  if (!dateString || dateString === "Just added") return "Just added";
  try {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    if (diffMs < 60000) return "Just added";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  } catch (e) {
    return fallbackText;
  }
}

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username || "";

  // 1. Fetch the user's recipes dynamically
  let userRecipes: any[] = [];
  
  if (supabase) {
    const { data } = await supabase
      .from('recipes')
      .select('*, models(name, family)')
      .ilike('name', `${username}/%`)
      .order('created_at', { ascending: false });
    if (data) userRecipes = data;
  } else {
    modelsData.forEach(model => {
      model.recipes.forEach(recipe => {
        if (recipe.name.toLowerCase().startsWith(`${username.toLowerCase()}/`)) {
          userRecipes.push({ 
            ...recipe, 
            models: { name: model.name, family: model.family } 
          });
        }
      });
    });
    // Sort local data by created_at or updated if available
    userRecipes.sort((a, b) => {
      const dateA = new Date(a.created_at || new Date().toISOString()).getTime();
      const dateB = new Date(b.created_at || new Date().toISOString()).getTime();
      return dateB - dateA;
    });
  }

  // Fetch Real Native Profile Metrics & Social Graph
  let followers = 0;
  let following = 0;
  let nativeProfile = { display_name: username, bio: "", twitter_handle: null };

  if (supabase) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
    if (profile) nativeProfile = profile;

    const { count: followersCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_username', username);
    const { count: followingCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_username', username);
    
    followers = followersCount || 0;
    following = followingCount || 0;
  }

  // Formatting display details
  const displayAvatar = `https://github.com/${username}.png`;
  const displayName = nativeProfile.display_name || username;
  const bio = nativeProfile.bio;
  const twitterHandle = nativeProfile.twitter_handle;
  const linkedinUrl = (nativeProfile as any).linkedin_url;
  const websiteUrl = (nativeProfile as any).website_url;
  const githubUrl = (nativeProfile as any).github_url || `https://github.com/${username}`;

  return (
    <div className="min-h-screen bg-[#171616] text-white pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row gap-16">
        
        {/* ======================= */}
        {/* LEFT COLUMN: IDENTITY   */}
        {/* ======================= */}
        <div className="w-full md:w-[300px] shrink-0">
          
          {/* Avatar Area */}
          <div className="relative mb-6">
            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-[#171616] ring-1 ring-white/10 relative z-10 shadow-2xl bg-zinc-900">
              <img 
                src={displayAvatar} 
                alt={`${username}'s avatar`} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Names */}
          <h1 className="text-2xl font-bold font-sans tracking-tight mb-2">{displayName}</h1>
          <div className="inline-block bg-zinc-900 border border-white/5 text-zinc-400 font-mono text-xs px-2 py-0.5 rounded mb-6">
            {username}
          </div>

          {/* Follower Stats */}
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-sans mb-8">
            <span className="hover:text-white cursor-pointer transition-colors">
              <span className="font-bold text-white">{followers}</span> followers
            </span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">
              <span className="font-bold text-white">{following}</span> following
            </span>
          </div>

          <NativeProfileActions 
            targetUsername={username}
            initialIsFollowing={false} 
            initialProfileData={{
              displayName: displayName,
              bio: bio || "",
              twitterHandle: twitterHandle || "",
              linkedinUrl: linkedinUrl || "",
              websiteUrl: websiteUrl || "",
              githubUrl: (nativeProfile as any).github_url || ""
            }}
          />

          {bio && (
            <div className="mb-8">
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">{bio}</p>
            </div>
          )}

          {/* Social Links */}
          <div className="space-y-3 mb-10">
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm font-sans">
                <LinkIcon className="w-4 h-4" /> {websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
            {twitterHandle && (
              <a href={`https://twitter.com/${twitterHandle.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm font-sans">
                <TwitterIcon className="w-4 h-4" /> {twitterHandle}
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm font-sans">
                <LinkedinIcon className="w-4 h-4" /> LinkedIn
              </a>
            )}
            <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm font-sans">
              <GithubIcon className="w-4 h-4" /> {username}
            </a>
          </div>
        </div>

        {/* ======================= */}
        {/* RIGHT COLUMN: CONTENT   */}
        {/* ======================= */}
        <div className="flex-1">
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-8 border-b border-white/10 mb-8 px-2 overflow-x-auto whitespace-nowrap">
            <button className="flex items-center gap-2 pb-4 text-sm font-bold font-sans text-white border-b-2 border-white">
              <Box className="w-4 h-4" /> Recipes <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full ml-1">{userRecipes.length}</span>
            </button>
            <button className="flex items-center gap-2 pb-4 text-sm font-sans text-zinc-500 hover:text-zinc-300 transition-colors">
              <Database className="w-4 h-4" /> Namespaces <span className="bg-white/5 text-zinc-500 text-xs px-2 py-0.5 rounded-full ml-1">0</span>
            </button>
            <button className="flex items-center gap-2 pb-4 text-sm font-sans text-zinc-500 hover:text-zinc-300 transition-colors">
              <Terminal className="w-4 h-4" /> Nodes <span className="bg-white/5 text-zinc-500 text-xs px-2 py-0.5 rounded-full ml-1">0</span>
            </button>
          </div>

          {/* Recipes List Grid */}
          {userRecipes.length === 0 ? (
            <div className="text-sm font-sans text-zinc-500">None yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRecipes.map(recipe => (
                <Link 
                  href={`/recipes/${recipe.id}`}
                  key={recipe.id}
                  className="block group bg-zinc-900/30 border border-white/5 hover:border-white/20 rounded-xl p-5 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <h4 className="text-[15px] font-mono text-blue-100 group-hover:text-white transition-colors truncate">
                        <span className="text-zinc-500">{username}/</span>
                        <span className="font-bold">{recipe.name.split('/')[1] || recipe.name}</span>
                      </h4>
                    </div>
                  </div>
                  
                  <div className="text-xs font-mono text-zinc-500 mb-4 flex items-center gap-2">
                    <span className="text-zinc-400 font-semibold px-2 py-0.5 bg-white/5 rounded border border-white/5">{recipe.models?.name || "Base Model"}</span>
                    <span>•</span>
                    <span className="text-zinc-300 font-bold">{recipe.hardware_requirements}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatRelativeTime(recipe.created_at || recipe.updated)}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>{recipe.quantization} quant</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
