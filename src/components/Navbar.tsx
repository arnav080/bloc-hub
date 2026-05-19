"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function ArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 9L9 1M9 1H1M9 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CTAButton({ 
  label, 
  className = "", 
  variant = "small",
  href,
  type = "button",
  onClick,
  disabled = false
}: { 
  label: string; 
  className?: string;
  variant?: "small" | "large";
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const isLarge = variant === "large";
  
  const content = (
    <div className="flex items-center relative gap-0">
      <div className={`opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center overflow-hidden ${
        isLarge ? "w-0 group-hover:w-4 group-hover:mr-3" : "w-0 group-hover:w-3 group-hover:mr-2"
      }`}>
        <ArrowIcon />
      </div>
      <span className="relative z-10">{label}</span>
      <div className={`opacity-100 translate-x-0 group-hover:translate-x-full group-hover:opacity-0 transition-all duration-300 flex items-center overflow-hidden ${
        isLarge ? "w-4 ml-3 group-hover:w-0 group-hover:ml-0" : "w-3 ml-2 group-hover:w-0 group-hover:ml-0"
      }`}>
        <ArrowIcon />
      </div>
    </div>
  );

  const styles = `group relative flex items-center justify-center transition-all duration-300 overflow-hidden pointer-events-auto bg-[#2563EB] text-white font-mono font-bold uppercase tracking-wider ${
    isLarge 
      ? "h-12 px-8 text-[13px] rounded-[14px]" 
      : "h-7 px-4 text-[10px] rounded-md hover:opacity-90"
  } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={styles}>
      {content}
    </button>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems: { label: string; href: string; disabled?: boolean }[] = user 
    ? [
        { label: "Home", href: "/" },
        { label: "Registry", href: "/registry" },
        { label: "CLI", href: "/#pipeline" },
        { label: "Docs", href: "/docs" },
        { label: "Blog", href: "/blog" },
      ]
    : [
        { label: "Registry", href: "/registry" },
        { label: "CLI", href: "/#pipeline" },
        { label: "Thesis", href: "/thesis" },
        { label: "Docs", href: "/docs" },
        { label: "Blog", href: "/blog" },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col px-4 pt-2 gap-1 pointer-events-none">
      <div className="max-w-7xl w-full mx-auto hidden md:flex items-center h-10 gap-1 pointer-events-auto px-4 border-x border-transparent">
        <div className="flex items-center px-4 h-7 bg-[#2563EB] rounded-md shrink-0 shadow-sm">
          <Link href="/" className="font-mono text-[13px] font-medium leading-none text-white tracking-tight whitespace-nowrap">Bloc</Link>
        </div>
        
        {/* Placeholder Search Bar */}
        <div className="flex-1 flex items-center h-7 px-3 bg-white/5 border border-white/10 rounded-md gap-2 transition-all duration-300 hover:border-white/20 group/search">
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/40 group-hover/search:text-white/60">
            <path d="M14.5 14.5L10.5 10.5M12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-mono text-white/40 group-hover/search:text-white/60">Search models, manifests...</span>
        </div>

        {navItems.map((item) => {
          const commonClasses = "flex items-center flex-1 max-w-[120px] h-7 px-4 backdrop-blur-md border border-white/5 bg-white/10 text-white/80 rounded-md text-[10px] font-mono font-medium transition-all duration-300";
          
          if (item.disabled) {
            return (
              <div
                key={item.label + Math.random()}
                className={`${commonClasses} cursor-not-allowed`}
              >
                <span className="flex-1 text-center truncate opacity-30">{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${commonClasses} group hover:bg-white hover:text-black`}
            >
              <span className="flex-1 text-left truncate">{item.label}</span>
            </Link>
          );
        })}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 h-7 px-2 bg-zinc-900 border border-white/10 rounded-md shrink-0 cursor-pointer hover:border-white/20 transition-all pointer-events-auto select-none outline-none">
              <img src={user.avatar_url} alt="Avatar" className="w-4 h-4 rounded-full" />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{user.username}</span>
              <span className="text-zinc-500 text-[6px]">▼</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#171616]/95 border border-white/10 text-white font-mono rounded-lg p-1 shadow-2xl backdrop-blur-xl">
              <DropdownMenuItem className="flex items-center justify-between text-[10px] rounded-md hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer transition-colors text-blue-400 hover:text-blue-300 uppercase tracking-wider font-bold p-0">
                <Link href="/registry/submit" className="w-full h-full px-3 py-2 block">
                  + Submit Recipe
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              <DropdownMenuItem className="flex items-center justify-between text-[10px] rounded-md hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer transition-colors text-zinc-300 hover:text-white uppercase tracking-wider font-bold p-0">
                <Link href="/profile" className="w-full h-full px-3 py-2 block">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between text-[10px] px-3 py-2 rounded-md hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer transition-colors text-zinc-300 hover:text-white uppercase tracking-wider font-bold">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between text-[10px] px-3 py-2 rounded-md hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer transition-colors text-zinc-300 hover:text-white uppercase tracking-wider font-bold">
                Access Tokens
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between text-[10px] px-3 py-2 rounded-md hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer transition-colors text-zinc-300 hover:text-white uppercase tracking-wider font-bold">
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between text-[10px] px-3 py-2 rounded-md hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer transition-colors text-zinc-300 hover:text-white uppercase tracking-wider font-bold">
                <span>Changelog</span>
                <span className="flex items-center gap-1 text-[9px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                  3
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              <DropdownMenuItem onClick={logout} className="flex items-center justify-between text-[10px] px-3 py-2 rounded-md hover:bg-red-950/20 focus:bg-red-950/20 cursor-pointer transition-colors text-red-400 font-bold uppercase tracking-wider">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <CTAButton label="get started" href="/login" variant="small" className="shrink-0 pointer-events-auto" />
        )}
      </div>

      <div className="flex md:hidden flex-col gap-1 w-full pointer-events-auto">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex items-center h-7 rounded-md transition-colors duration-300 w-full overflow-hidden ${isMenuOpen ? 'bg-white text-black' : 'bg-[#2563EB] text-white'}`}
        >
          <span className="flex-1 font-mono text-[13px] font-medium leading-none tracking-tight text-left px-3">Bloc</span>
          <div className="flex items-center justify-center h-full aspect-square border-l border-white/10">
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-current rounded-full" />
              ))}
            </div>
          </div>
        </button>
        <div className={`flex flex-col gap-1 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[400px] mt-0' : 'max-h-0'}`}>
          {navItems.map((item) => {
            const commonClasses = "flex items-center h-7 px-3 bg-white/10 backdrop-blur-md border border-white/5 rounded-md text-[10px] font-mono font-medium text-white/80 transition-all duration-200";

            if (item.disabled) {
              return (
                <div
                  key={item.label + Math.random()}
                  className={`${commonClasses} cursor-not-allowed`}
                >
                  <span className="flex-1 text-center opacity-30">{item.label}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${commonClasses} hover:bg-white hover:text-black`}
              >
                <span className="flex-1 text-left">{item.label}</span>
              </Link>
            );
          })}
          {user ? (
            <div className="flex items-center justify-between h-7 px-3 bg-zinc-900 border border-white/10 rounded-md w-full mt-1">
              <div className="flex items-center gap-2">
                <img src={user.avatar_url} alt="Avatar" className="w-4 h-4 rounded-full" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{user.username}</span>
              </div>
              <button onClick={logout} className="text-[10px] font-mono text-zinc-500 hover:text-red-400">Logout</button>
            </div>
          ) : (
            <CTAButton label="get started" href="/login" className="w-full mt-1 pointer-events-auto" variant="small" />
          )}
        </div>
      </div>
    </nav>
  );
}
