"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TabId } from "@/components/Sidebar";

interface HuddleLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  userInitials: string;
}

export function HuddleLayout({ children, activeTab, onTabChange, userInitials }: HuddleLayoutProps) {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-zinc-50/80 backdrop-blur-xl dark:bg-zinc-950/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex justify-center items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-headline text-lg tracking-tighter font-extrabold text-zinc-900 dark:text-zinc-50">Seattle Steel Pan Project</span>
        </div>
      </header>

      <main className="pt-20 px-6 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl transition-all duration-300">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 w-full z-50 bg-zinc-50/90 backdrop-blur-lg dark:bg-zinc-950/90 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] rounded-t-2xl flex justify-around items-center px-2 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        {/* Home */}
        <button 
          onClick={() => onTabChange("master")}
          className={cn(
            "flex flex-col items-center justify-center transition-colors min-w-[64px]",
            activeTab === "master" ? "text-primary font-bold" : "text-zinc-400"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: ` 'FILL' ${activeTab === "master" ? 1 : 0}` }}>grid_view</span>
          <span className="font-body text-[10px] font-medium tracking-wide">Home</span>
        </button>

        {/* Players */}
        <button 
          onClick={() => onTabChange("personnel")}
          className={cn(
            "flex flex-col items-center justify-center transition-colors min-w-[64px]",
            activeTab === "personnel" ? "text-primary font-bold" : "text-zinc-400"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: ` 'FILL' ${activeTab === "personnel" ? 1 : 0}` }}>group</span>
          <span className="font-body text-[10px] font-medium tracking-wide">Players</span>
        </button>

        {/* Songs */}
        <button 
          onClick={() => onTabChange("repertoire")}
          className={cn(
            "flex flex-col items-center justify-center transition-colors min-w-[64px]",
            activeTab === "repertoire" ? "text-primary font-bold" : "text-zinc-400"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: ` 'FILL' ${activeTab === "repertoire" ? 1 : 0}` }}>music_note</span>
          <span className="font-body text-[10px] font-medium tracking-wide">Songs</span>
        </button>

        {/* Performances */}
        <button 
          onClick={() => onTabChange("performances")}
          className={cn(
            "flex flex-col items-center justify-center transition-colors min-w-[64px]",
            activeTab === "performances" ? "text-primary font-bold" : "text-zinc-400"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: ` 'FILL' ${activeTab === "performances" ? 1 : 0}` }}>event</span>
          <span className="font-body text-[10px] font-medium tracking-wide">Gigs</span>
        </button>

        {/* Matrix */}
        <button 
          onClick={() => onTabChange("matrix")}
          className={cn(
            "flex flex-col items-center justify-center transition-colors min-w-[64px]",
            activeTab === "matrix" ? "text-primary font-bold" : "text-zinc-400"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: ` 'FILL' ${activeTab === "matrix" ? 1 : 0}` }}>analytics</span>
          <span className="font-body text-[10px] font-medium tracking-wide">Matrix</span>
        </button>
      </nav>
    </div>
  );
}
