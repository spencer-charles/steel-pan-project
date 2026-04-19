"use client";

import React from "react";
import { Member } from "@/hooks/useMembers";
import { Song } from "@/hooks/useSongs";
import { Performance } from "@/hooks/usePerformances";
import { Assignment } from "@/hooks/useAssignments";
import { INSTRUMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MatrixSectionProps {
  members: Member[];
  songs: Song[];
  performances: Performance[];
  assignments: Assignment[];
  availabilityMap: Record<string, string>;
  filterPerfId: string;
  setFilterPerfId: (id: string) => void;
  filterSongId: string;
  setFilterSongId: (id: string) => void;
  removeAssignment: (songId: string, instrument: string, memberId: string) => void;
}

export function MatrixSection({
  members,
  songs,
  performances,
  assignments,
  availabilityMap,
  filterPerfId,
  setFilterPerfId,
  filterSongId,
  setFilterSongId,
  removeAssignment
}: MatrixSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-900">Operational Matrix</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Coverage & Availability</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stage / Gig</label>
          <div className="relative">
            <select 
              value={filterPerfId} 
              onChange={e => setFilterPerfId(e.target.value)}
              className="w-full h-11 bg-slate-100 border-none rounded-2xl text-[11px] font-bold text-slate-700 px-4 appearance-none outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Choose a performance...</option>
              {performances.map((perf) => (
                <option key={perf.id} value={perf.id}>{perf.title}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Arrangement</label>
          <div className="relative">
            <select 
              value={filterSongId} 
              onChange={e => setFilterSongId(e.target.value)}
              className="w-full h-11 bg-slate-100 border-none rounded-2xl text-[11px] font-bold text-slate-700 px-4 appearance-none outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Choose a song...</option>
              {songs.map((song) => (
                <option key={song.id} value={song.id}>{song.title}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24">
        {INSTRUMENTS.map((inst) => {
          const filteredAssignments = assignments.filter(a => 
            a.instrument === inst && 
            (filterSongId ? a.songId === filterSongId : true)
          );

          return (
            <div key={inst} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col gap-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{inst}</h3>
              
              <div className="space-y-2">
                {filteredAssignments.map((a, i) => {
                  const member = members.find(m => m.id === a.memberId);
                  const status = availabilityMap?.[member?.id || ""] || "pending";
                  
                  return (
                    <div key={i} className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center justify-between relative group">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          status === "available" ? "bg-green-500" : status === "unavailable" ? "bg-red-500" : "bg-slate-300"
                        )}></div>
                        <span className="font-bold text-xs text-slate-800 truncate">{member?.name || "Unnamed Player"}</span>
                      </div>
                      <button 
                        onClick={() => removeAssignment(a.songId, inst, a.memberId)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all font-light"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  );
                })}

                {filteredAssignments.length === 0 && (
                  <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl text-slate-200">
                    <span className="material-symbols-outlined text-2xl">person_off</span>
                    <p className="text-[10px] font-bold uppercase mt-1">No Mapping</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
