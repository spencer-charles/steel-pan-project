"use client";

import React, { useState } from "react";
import { Member } from "@/hooks/useMembers";
import { Song } from "@/hooks/useSongs";
import { Performance } from "@/hooks/usePerformances";
import { AvailabilityStatus } from "@/hooks/useAvailability";
import { INSTRUMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

interface HuddleMasterCommandProps {
  members: Member[];
  songs: Song[];
  performances: Performance[];
  availability: Record<string, AvailabilityStatus>;
  updateAvailability: (memberId: string, status: AvailabilityStatus, perfId: string) => Promise<void>;
  addMember: (member: Omit<Member, "id">) => Promise<void>;
  addSong: (song: Omit<Song, "id">) => Promise<void>;
  filterPerfId: string;
  setFilterPerfId: (id: string) => void;
  filterSongId: string;
  setFilterSongId: (id: string) => void;
  onTabChange: (tab: TabId) => void;
  assignments: any[];
  removeAssignment: (songId: string, instrument: string, memberId: string) => void;
}

export function HuddleMasterCommand({ 
  members, 
  songs, 
  performances, 
  availability,
  updateAvailability,
  addMember,
  addSong,
  filterPerfId,
  setFilterPerfId,
  filterSongId,
  setFilterSongId,
  onTabChange,
  assignments,
  removeAssignment
}: HuddleMasterCommandProps) {
  const { showToast } = useToast();
  
  // State for Availability Update form
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const [selectedPerfId, setSelectedPerfId] = useState(performances[0]?.id || "");
  const [selectedStatus, setSelectedStatus] = useState<AvailabilityStatus>("available");

  const handleUpdateAvailability = async () => {
    if (!selectedMemberId || !selectedPerfId) {
        showToast("Please select a player and performance", "error");
        return;
    }
    try {
      await updateAvailability(selectedMemberId, selectedStatus, selectedPerfId);
      showToast("Availability updated successfully");
    } catch (e) {
      showToast("Failed to update availability", "error");
    }
  };

  const resetFilters = () => {
    setFilterPerfId("");
    setFilterSongId("");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Management Console Header */}
      <section className="mt-4 mb-8">
        <span className="font-headline text-sm tracking-widest uppercase font-bold text-primary mb-1 block">Overview</span>
        <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Management Console</h1>
      </section>

      {/* Quick Actions Horizontal Scroll */}
      <section className="space-y-4 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Quick Actions</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6">
          <button 
            onClick={() => onTabChange("personnel")}
            className="flex-shrink-0 flex items-center bg-surface-container-lowest px-6 py-4 rounded-xl shadow-sm border border-black/5 active:scale-95 transition-transform"
          >
            <span className="font-bold text-sm whitespace-nowrap">Add New Player</span>
          </button>
          <button 
            onClick={() => onTabChange("repertoire")}
            className="flex-shrink-0 flex items-center bg-surface-container-lowest px-6 py-4 rounded-xl shadow-sm border border-black/5 active:scale-95 transition-transform"
          >
            <span className="font-bold text-sm whitespace-nowrap">Add New Song</span>
          </button>
          <button 
            onClick={() => onTabChange("performances")}
            className="flex-shrink-0 flex items-center bg-surface-container-lowest px-6 py-4 rounded-xl shadow-sm border border-black/5 active:scale-95 transition-transform"
          >
            <span className="font-bold text-sm whitespace-nowrap">Add New Performance</span>
          </button>
        </div>
      </section>

      {/* Player Availability Section */}
      <section className="mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
            <h2 className="font-headline font-bold text-xl text-on-surface">Player Availability</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-tertiary-fixed-variant px-1">Select Player</label>
              <select 
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/40 appearance-none text-on-surface font-medium"
              >
                <option value="" disabled>Choose a player...</option>
                {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-tertiary-fixed-variant px-1">Performance</label>
              <select 
                value={selectedPerfId}
                onChange={(e) => setSelectedPerfId(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/40 appearance-none text-on-surface font-medium"
              >
                <option value="" disabled>Choose a performance...</option>
                {performances.map(p => (
                    <option key={p.id} value={p.id}>{p.title || p.date?.toString()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-tertiary-fixed-variant px-1">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AvailabilityStatus)}
                className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/40 appearance-none text-on-surface font-medium"
              >
                <option value="available">AVAILABLE</option>
                <option value="unavailable">UNAVAILABLE</option>
              </select>
            </div>
            <button 
               onClick={handleUpdateAvailability}
               className="w-full bg-primary-gradient text-on-primary font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity active:scale-[0.98] text-sm"
            >
              Update Availability
            </button>
          </div>
        </div>
      </section>

      {/* Operational Matrix Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-bold text-xl text-on-surface">Operational Matrix</h2>
          <button 
            onClick={resetFilters}
            className="text-primary flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">tune</span> Reset
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-zinc-400">theater_comedy</span>
            <select 
              value={filterPerfId}
              onChange={(e) => setFilterPerfId(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-12 pr-10 focus:ring-2 focus:ring-primary/40 text-sm appearance-none outline-none font-medium text-on-surface" 
            >
              <option value="">Full Band</option>
              {performances.map(p => (
                <option key={p.id} value={p.id}>{p.title || p.date?.toString()}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 text-zinc-400 pointer-events-none">expand_more</span>
          </div>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-zinc-400">music_note</span>
            <select 
              value={filterSongId}
              onChange={(e) => setFilterSongId(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-12 pr-10 focus:ring-2 focus:ring-primary/40 text-sm appearance-none outline-none font-medium text-on-surface" 
            >
              <option value="">All Music</option>
              {songs.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 text-zinc-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
          {INSTRUMENTS.map((inst) => {
            const filteredAssignments = assignments.filter(a => 
              a.instrument === inst && 
              (filterSongId ? a.songId === filterSongId : true)
            );

            return (
              <div key={inst} className="bg-surface-container-lowest border border-black/5 rounded-xl p-4 shadow-sm transition-all hover:shadow-md flex flex-col gap-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 px-1">{inst}</h3>
                
                <div className="space-y-2">
                  {filteredAssignments.map((a, i) => {
                    const member = members.find(m => m.id === a.memberId);
                    const status = availability[member?.id || ""] || "pending";
                    
                    return (
                      <div key={i} className="bg-surface-container-low px-3 py-1.5 rounded-xl border border-black/5 flex items-center justify-between relative group">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            status === "available" ? "bg-emerald-500" : status === "unavailable" ? "bg-rose-500" : "bg-zinc-300"
                          )}></div>
                          <span className="font-bold text-xs text-on-surface truncate">{member?.name || "Unnamed Player"}</span>
                        </div>
                        <button 
                          onClick={() => removeAssignment(a.songId, inst, a.memberId)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-error transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    );
                  })}

                  {filteredAssignments.length === 0 && (
                    <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-xl text-zinc-300">
                      <span className="material-symbols-outlined text-2xl opacity-20">person_off</span>
                      <p className="text-[10px] font-bold uppercase mt-1 opacity-20">No Mapping</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
