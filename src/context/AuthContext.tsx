"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type User = {
  id: string;
  username: string;
  avatar_url: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, provider?: 'github' | 'google') => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      const handleSession = async (session: any) => {
        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Fetch Native Profile to see if they've completed onboarding
        const { data: profile } = await supabase!.from('profiles').select('username').eq('auth_id', session.user.id).maybeSingle();
        
        if (!profile) {
          // Native profile missing! Enforce Onboarding.
          setUser({
            id: session.user.id,
            username: "", // Blank until claimed
            avatar_url: session.user.user_metadata.avatar_url || "",
          });
          
          if (window.location.pathname !== '/onboarding' && window.location.pathname !== '/login') {
            window.location.href = '/onboarding';
          }
        } else {
          // Profile exists! Complete login.
          setUser({
            id: session.user.id,
            username: profile.username,
            avatar_url: session.user.user_metadata.avatar_url || `https://github.com/${profile.username}.png`,
          });
        }
        setLoading(false);
      };

      // Production Mode: Evaluate active session
      supabase.auth.getSession().then(({ data: { session } }) => handleSession(session));

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Local Dev Fallback: Mock Session Check
      const savedSession = localStorage.getItem("bloc_mock_session");
      if (savedSession) {
        try {
          setUser(JSON.parse(savedSession));
        } catch (e) {}
      }
      setLoading(false);
    }
  }, []);

  const login = async (username: string, provider: 'github' | 'google' = 'github') => {
    if (supabase) {
      // Trigger real OAuth Redirect
      await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/registry`
        }
      });
      return; // The browser will navigate away
    }

    // Local Dev Fallback Mock Logic
    await new Promise(res => setTimeout(res, 800));
    
    const cleanUsername = username.toLowerCase().replace(/\s+/g, "");
    const mockUser: User = {
      id: crypto.randomUUID(),
      username: cleanUsername,
      avatar_url: `https://github.com/${cleanUsername}.png`,
    };
    
    setUser(mockUser);
    localStorage.setItem("bloc_mock_session", JSON.stringify(mockUser));
    toast.success(`Successfully authenticated as ${mockUser.username}`, {
      description: "Secure session established."
    });
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      toast.info("Logged out of GitHub securely");
    } else {
      setUser(null);
      localStorage.removeItem("bloc_mock_session");
      toast.info("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
