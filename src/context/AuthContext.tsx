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
  login: (username: string) => Promise<void>;
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
      // Production Mode: Use real Supabase Session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            username: session.user.user_metadata.user_name || session.user.email?.split('@')[0] || "Unknown",
            avatar_url: session.user.user_metadata.avatar_url || `https://github.com/${session.user.user_metadata.user_name}.png`,
          });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            username: session.user.user_metadata.user_name || session.user.email?.split('@')[0] || "Unknown",
            avatar_url: session.user.user_metadata.avatar_url || `https://github.com/${session.user.user_metadata.user_name}.png`,
          });
        } else {
          setUser(null);
        }
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

  const login = async (username: string) => {
    if (supabase) {
      // Trigger real GitHub OAuth Redirect
      await supabase.auth.signInWithOAuth({
        provider: 'github',
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
