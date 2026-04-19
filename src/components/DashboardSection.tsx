"use client";

import React from "react";
import { Performance } from "@/hooks/usePerformances";
import { Member } from "@/hooks/useMembers";
import { Song } from "@/hooks/useSongs";
import { 
  Users, 
  Music, 
  CalendarDays, 
  ArrowUpRight,
  Clock,
  MapPin,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  members: Member[];
  songs: Song[];
  performances: Performance[];
  onTabChange: (tab: any) => void;
}

export function DashboardSection({ members, songs, performances, onTabChange }: DashboardSectionProps) {
  const upcomingGigs = performances
    .filter(p => new Date(p.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const stats = [
    { label: "Active Members", value: members.length, icon: Users, color: "text-primary", bg: "bg-primary/5", tab: "personnel" },
    { label: "Library Songs", value: songs.length, icon: Music, color: "text-secondary", bg: "bg-secondary/5", tab: "repertoire" },
    { label: "Upcoming Gigs", value: upcomingGigs.length, icon: CalendarDays, color: "text-tertiary", bg: "bg-tertiary/5", tab: "performances" },
  ];

  const nextGig = upcomingGigs[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome */}
      <div>
        <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight">Band Central Command</h2>
        <p className="text-sm font-bold text-outline uppercase tracking-widest opacity-60 mt-1">Status Overview & Operational Intelligence</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <button 
            key={i}
            onClick={() => onTabChange(stat.tab)}
            className="modern-card p-8 flex flex-col items-start gap-4 hover:border-primary/20 hover:shadow-xl transition-all group"
          >
            <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tighter">{stat.value}</h3>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
               Go to section <ArrowUpRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

      {/* Next Gig Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Strategic Spotlight</h4>
          {nextGig ? (
            <div className="modern-card bg-primary text-on-primary p-10 relative overflow-hidden group shadow-2xl shadow-primary/20">
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Up Next</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-2">{nextGig.title}</h3>
                  <div className="flex flex-wrap gap-6 mt-6">
                    <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 opacity-50" />
                       <p className="text-sm font-bold">{new Date(nextGig.date).toLocaleDateString()}</p>
                    </div>
                    {nextGig.location && (
                      <div className="flex items-center gap-2">
                         <MapPin className="w-4 h-4 opacity-50" />
                         <p className="text-sm font-bold">{nextGig.location}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => onTabChange("matrix")}
                  className="modern-button bg-white text-primary w-fit px-8 uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                >
                  Manage Deployment Matrix
                </button>
              </div>

              {/* Decorative background tokens */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none" />
              <CalendarDays className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 text-white/5 -rotate-12 pointer-events-none" />
            </div>
          ) : (
            <div className="modern-card p-10 text-center space-y-4 opacity-40">
               <CalendarDays className="w-12 h-12 mx-auto" />
               <p className="text-xs font-black uppercase tracking-widest">No upcoming gigs in the pipeline</p>
            </div>
          )}
        </div>

        {/* Quick Lists */}
        <div className="space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-outline">Recent Roster Additions</h4>
          <div className="space-y-3">
            {members.slice(0, 4).map((member) => (
              <div key={member.id} className="modern-card p-4 flex items-center justify-between hover:bg-white transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight">{member.name || "Unnamed Player"}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-outline/20 group-hover:text-primary transition-colors" />
              </div>
            ))}
            <button 
              onClick={() => onTabChange("personnel")}
              className="text-[10px] font-black uppercase tracking-widest text-primary ml-2 hover:underline"
            >
              View entire roster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
