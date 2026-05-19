"use client";

import React, { useState } from "react";
import { Edit3, Settings, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProfileData {
  displayName: string;
  bio: string;
  twitterHandle: string;
  linkedinUrl: string;
  websiteUrl: string;
  githubUrl: string;
}

export function NativeProfileActions({
  targetUsername,
  initialIsFollowing,
  initialProfileData
}: {
  targetUsername: string;
  initialIsFollowing: boolean;
  initialProfileData: ProfileData;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const currentUsername = user?.username;
  const isOwner = currentUsername?.toLowerCase() === targetUsername.toLowerCase();
  
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialProfileData);

  const toggleFollow = async () => {
    if (!currentUsername) {
      toast.error("Please login to follow developers!");
      return;
    }
    
    setIsLoading(true);
    const action = isFollowing ? "unfollow" : "follow";
    
    // Optimistic UI Update
    setIsFollowing(!isFollowing);

    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUsername, targetUsername, action })
      });
      if (!res.ok) throw new Error("Failed to update follow status");
      toast.success(isFollowing ? `Unfollowed ${targetUsername}` : `Following ${targetUsername}`);
      router.refresh();
    } catch (e) {
      setIsFollowing(isFollowing); // Revert on failure
      toast.error("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUsername, ...formData })
      });
      if (!res.ok) throw new Error("Failed to save profile");
      toast.success("Profile saved successfully!");
      setIsEditModalOpen(false);
      router.refresh();
    } catch (e) {
      toast.error("Error saving profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        {isOwner ? (
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono px-4 py-2 rounded-lg transition-colors text-white"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        ) : (
          <button 
            onClick={toggleFollow}
            disabled={isLoading}
            className={`flex items-center gap-1.5 text-xs font-mono px-4 py-2 rounded-lg transition-all ${
              isFollowing 
                ? "bg-zinc-900 border border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-white" 
                : "bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            }`}
          >
            {isFollowing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} 
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#171616] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl relative my-8">
            <h2 className="text-xl font-bold font-sans text-white mb-6">Edit Profile</h2>
            
            <div className="space-y-4 font-mono text-xs max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="text-zinc-500 block mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={formData.displayName} 
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-zinc-500 block mb-1">Bio</label>
                <textarea 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                  placeholder="Tell us about your hardware lab..."
                />
              </div>
              <div>
                <label className="text-zinc-500 block mb-1">X/Twitter Handle</label>
                <input 
                  type="text" 
                  value={formData.twitterHandle} 
                  onChange={e => setFormData({...formData, twitterHandle: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="elonmusk"
                />
              </div>
              <div>
                <label className="text-zinc-500 block mb-1">LinkedIn URL</label>
                <input 
                  type="url" 
                  value={formData.linkedinUrl} 
                  onChange={e => setFormData({...formData, linkedinUrl: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="text-zinc-500 block mb-1">Custom Website URL</label>
                <input 
                  type="url" 
                  value={formData.websiteUrl} 
                  onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://my-agency.com"
                />
              </div>
              <div>
                <label className="text-zinc-500 block mb-1">Custom GitHub URL</label>
                <input 
                  type="url" 
                  value={formData.githubUrl} 
                  onChange={e => setFormData({...formData, githubUrl: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://github.com/my-org"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white py-2 rounded transition-colors text-xs font-mono"
              >
                Cancel
              </button>
              <button 
                onClick={saveProfile}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors text-xs font-mono font-bold"
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
