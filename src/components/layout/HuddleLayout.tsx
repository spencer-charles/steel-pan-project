"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TabId } from "@/lib/constants";

interface HuddleLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  currentMemberName: string | null;
  onSwitchMember: () => void;
}

export function HuddleLayout({ children, activeTab, onTabChange, currentMemberName, onSwitchMember }: HuddleLayoutProps) {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-zinc-50/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex justify-between items-center gap-3 px-4 py-3">
        <span className="font-headline text-base tracking-tighter font-extrabold text-zinc-900 truncate">Seattle Steel Pan Project</span>
        {currentMemberName && (
          <button
            onClick={onSwitchMember}
            title="Not you? Tap to switch"
            className="shrink-0 min-h-11 pl-2 pr-3 flex items-center gap-2 rounded-full active:scale-95 transition-transform"
          >
            <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">
              {currentMemberName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <span className="material-symbols-outlined text-outline text-lg">expand_more</span>
          </button>
        )}
      </header>

      <main className="pt-20 px-6 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl transition-all duration-300">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 w-full z-50 bg-zinc-50/90 backdrop-blur-lg shadow-[0_-10px_40px_rgba(0,0,0,0.04)] rounded-t-2xl flex justify-around items-center px-2 py-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        {/* Home */}
        <button 
          onClick={() => onTabChange("master")}
          className={cn(
            "flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 min-h-11 py-1 transition-colors",
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
            "flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 min-h-11 py-1 transition-colors",
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
            "flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 min-h-11 py-1 transition-colors",
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
            "flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 min-h-11 py-1 transition-colors",
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
            "flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 min-h-11 py-1 transition-colors",
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
