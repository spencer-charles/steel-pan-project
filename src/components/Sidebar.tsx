"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  CalendarDays, 
  Grid3X3,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home
} from "lucide-react";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type TabId = "master" | "dashboard" | "personnel" | "repertoire" | "performances" | "matrix";

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  logout: () => void;
}

const NAV_ITEMS = [
  { id: "master",       label: "Master Command", icon: LayoutDashboard },
  { id: "dashboard",    label: "Dashboard",       icon: Home },
  { id: "personnel",    label: "Personnel",       icon: Users },
  { id: "repertoire",   label: "Repertoire",      icon: Music },
  { id: "performances", label: "Gigs",            icon: CalendarDays },
  { id: "matrix",       label: "Matrix",          icon: Grid3X3 },
] as const;

export function Sidebar({ activeTab, onTabChange, logout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabChange = (id: TabId) => {
    onTabChange(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Desktop Sidebar (hidden on mobile) ─────────────────────────── */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white/40 backdrop-blur-2xl border-r border-outline-variant/10 z-[100] hidden lg:flex flex-col p-6 overflow-hidden">
        {/* Brand */}
        <div className="mb-12 px-4">
          <h1 className="text-2xl font-black tracking-tighter text-primary uppercase leading-tight">
            Sonic<br />Horizon
          </h1>
          <div className="h-1 w-12 bg-primary-container mt-2 rounded-full" />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group",
                  isActive
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "text-outline hover:bg-surface-container-low hover:text-on-surface"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "opacity-60 group-hover:opacity-100")} />
                <span className="text-[13px] font-black uppercase tracking-[0.1em]">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="active-indicator" className="absolute right-4">
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pt-6 border-t border-outline-variant/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-error hover:bg-error/5 transition-colors group"
          >
            <LogOut className="w-5 h-5 opacity-60 group-hover:opacity-100" />
            <span className="text-[13px] font-black uppercase tracking-[0.1em]">Logout</span>
          </button>
        </div>

        {/* Decoration */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      </aside>

      {/* ── Mobile Top Bar (hidden on desktop) ─────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 flex items-center justify-between px-4 h-14 shadow-sm">
        <h1 className="text-lg font-black tracking-tighter text-primary uppercase">
          Sonic Horizon
        </h1>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-surface-container transition-colors"
        >
          <Menu className="w-5 h-5 text-on-surface" />
        </button>
      </header>

      {/* ── Mobile Drawer Overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-[110] bg-black/30 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-[120] w-72 bg-white flex flex-col p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-10">
                <h1 className="text-xl font-black tracking-tighter text-primary uppercase">
                  Sonic Horizon
                </h1>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-surface-container transition-colors"
                >
                  <X className="w-5 h-5 text-outline" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 space-y-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all",
                        isActive
                          ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                          : "text-outline hover:bg-surface-container-low hover:text-on-surface"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "opacity-60")} />
                      <span className="text-[13px] font-black uppercase tracking-[0.1em]">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="pt-6 border-t border-outline-variant/10">
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-error hover:bg-error/5 transition-colors"
                >
                  <LogOut className="w-5 h-5 opacity-70" />
                  <span className="text-[13px] font-black uppercase tracking-[0.1em]">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
