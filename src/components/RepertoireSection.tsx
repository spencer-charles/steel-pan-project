"use client";

import React, { useState } from "react";
import { Song } from "@/hooks/useSongs";
import { Member } from "@/hooks/useMembers";
import { useAssignments } from "@/hooks/useAssignments";
import { INSTRUMENTS } from "@/lib/constants";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface RepertoireSectionProps {
  songs: Song[];
  members: Member[];
  addSong: (song: Omit<Song, "id">) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
}

export function RepertoireSection({ songs, members, addSong, deleteSong }: RepertoireSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [assigningSongId, setAssigningSongId] = useState<string | null>(null);
  
  const { showToast } = useToast();
  const { assignments, assignMember, removeAssignment } = useAssignments("default_coverage");

  const filteredSongs = songs.filter(s => 
    (s.title || "").toLowerCase().includes((search || "").toLowerCase())
  );

  const handleAdd = async () => {
    if (!title) return;
    try {
      await addSong({ title, parts: [], tags: [] });
      setTitle("");
      setShowAdd(false);
      showToast(`"${title}" added to repertoire`);
    } catch (e) {
      showToast("Failed to add song", "error");
    }
  };

  const getCoverageForSong = (songId: string) => {
    return assignments.filter(a => a.songId === songId);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Repertoire</h1>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className={cn(
                "flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm border border-black/5",
                showAdd ? "bg-surface-container-high text-on-surface" : "bg-primary-gradient text-white"
            )}
          >
            <span className="material-symbols-outlined text-sm">{showAdd ? "close" : "add"}</span>
            {showAdd ? "Cancel" : "Add Song"}
          </button>
        </div>

        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">music_note</span>
          <input 
            placeholder="Search songs..." 
            className="w-full h-12 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-zinc-400 text-sm transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-black/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary px-1">New Song Details</h3>
              <div className="flex gap-2">
                <input 
                  placeholder="Song Title" 
                  className="flex-1 h-11 px-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none placeholder:text-zinc-400"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button onClick={handleAdd} className="h-11 px-6 bg-primary-gradient text-white rounded-lg text-sm font-bold active:scale-95 transition-transform">
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Songs List */}
      <div className="grid grid-cols-1 gap-4 pb-20">
        {filteredSongs.map((song) => {
          const songAssignments = getCoverageForSong(song.id);
          const coveredInstruments = Array.from(new Set(songAssignments.map(a => a.instrument)));
          const isExpanded = assigningSongId === song.id;

          return (
            <div key={song.id} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-black/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined">music_note</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{song.title || "Untitled Song"}</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                      {coveredInstruments.length} / {INSTRUMENTS.length} Instruments Covered
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setAssigningSongId(isExpanded ? null : song.id)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      isExpanded ? "bg-surface-container-high text-on-surface" : "text-zinc-400 hover:bg-surface-container-low"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-xl transition-transform", isExpanded && "rotate-180")}>expand_more</span>
                  </button>
                  <button 
                    onClick={() => {
                        if (confirm(`Remove "${song.title}"?`)) {
                            deleteSong(song.id);
                            showToast(`"${song.title}" removed`, "info");
                        }
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 hover:text-error hover:bg-error/10 transition-all font-light"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>

              {/* Instrument Badges */}
              <div className="flex flex-wrap gap-1.5">
                {INSTRUMENTS.map(inst => {
                    const isCovered = coveredInstruments.includes(inst);
                    return (
                        <span 
                            key={inst} 
                            className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all",
                                isCovered 
                                    ? "bg-green-50 text-green-600 border-green-100" 
                                    : "bg-slate-50 text-slate-400 border-slate-100"
                            )}
                        >
                            {inst}
                        </span>
                    );
                })}
              </div>

              <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50 rounded-xl"
                    >
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {INSTRUMENTS.map(inst => {
                                const instAssignments = songAssignments.filter(a => a.instrument === inst);
                                return (
                                    <div key={inst} className="space-y-2">
                                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">{inst}</h5>
                                        <div className="space-y-1.5">
                                            {instAssignments.map(assign => {
                                                const member = members.find(m => m.id === assign.memberId);
                                                return (
                                                    <div key={assign.id} className="flex items-center justify-between bg-white border border-slate-100 px-3 py-1.5 rounded-xl">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-sm text-blue-500">person</span>
                                                            <span className="text-xs font-semibold text-slate-700">{member?.name || "Unknown"}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => removeAssignment(song.id, inst, assign.memberId)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            <div className="relative">
                                                <select 
                                                    className="w-full h-8 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 px-3 outline-none focus:ring-1 focus:ring-blue-500/20 appearance-none"
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            assignMember(song.id, inst, e.target.value);
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                    value=""
                                                >
                                                    <option value="">+ Assign Player</option>
                                                    {members
                                                        .filter(m => !instAssignments.some(ia => ia.memberId === m.id))
                                                        .map(m => (
                                                            <option key={m.id} value={m.id}>{m.name}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-sm">add</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
            <span className="material-symbols-outlined text-4xl">music_note</span>
          </div>
          <p className="font-bold text-slate-400 text-sm">No songs found</p>
        </div>
      )}
    </div>
  );
}
