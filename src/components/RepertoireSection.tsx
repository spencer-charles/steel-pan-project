"use client";

import React, { useState } from "react";
import { Song } from "@/hooks/useSongs";
import { Member } from "@/hooks/useMembers";
import { useAssignments } from "@/hooks/useAssignments";
import { INSTRUMENTS, DEFAULT_COVERAGE_ID } from "@/lib/constants";
import { useToast } from "@/components/ToastProvider";
import { Collapse } from "@/components/Collapse";
import { cn } from "@/lib/utils";

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
  
  const [formError, setFormError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { assignments, assignMember, removeAssignment } = useAssignments(DEFAULT_COVERAGE_ID);

  const filteredSongs = songs.filter(s => 
    (s.title || "").toLowerCase().includes((search || "").toLowerCase())
  );

  const handleAdd = async () => {
    if (!title.trim()) return setFormError("Give the song a title.");
    setFormError("");
    try {
      await addSong({ title: title.trim(), parts: [], tags: [] });
      showToast(`"${title.trim()}" added to repertoire`);
      setTitle("");
      setShowAdd(false);
    } catch {
      setFormError("Couldn't save — check your connection and try again.");
    }
  };

  const handleDelete = async (songId: string, songTitle: string) => {
    try {
      await deleteSong(songId);
      showToast(`"${songTitle}" removed`, "info");
    } catch {
      showToast("Couldn't remove that song.", "error");
    }
  };

  const handleAssign = async (songId: string, inst: string, memberId: string) => {
    try {
      await assignMember(songId, inst, memberId);
    } catch {
      showToast("Couldn't save that assignment.", "error");
    }
  };

  const handleUnassign = async (songId: string, inst: string, memberId: string) => {
    try {
      await removeAssignment(songId, inst, memberId);
    } catch {
      showToast("Couldn't remove that assignment.", "error");
    }
  };

  const getCoverageForSong = (songId: string) => {
    return assignments.filter(a => a.songId === songId);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">Songs</h1>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-[0.2em]">Arrangements &amp; Coverage</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={cn(
              "shrink-0 flex items-center gap-2 px-5 min-h-12 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm border border-black/5",
              showAdd ? "bg-surface-container-high text-on-surface" : "bg-primary-gradient text-white"
          )}
        >
          <span className="material-symbols-outlined text-lg">{showAdd ? "close" : "add"}</span>
          {showAdd ? "Cancel" : "Add Song"}
        </button>
      </div>

        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors pointer-events-none">music_note</span>
          <input
            type="search"
            placeholder="Search songs"
            aria-label="Search songs"
            enterKeyHint="search"
            className="w-full h-12 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/30 text-on-surface placeholder:text-outline/60 text-base outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

      {/* Add Form */}
      <Collapse open={showAdd}>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-black/5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary px-1">New Song Details</h3>
              <div className="flex gap-2">
                <input
                  placeholder="Song title"
                  aria-label="Song title"
                  enterKeyHint="done"
                  className="flex-1 min-w-0 h-12 px-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/30 text-base outline-none placeholder:text-outline/60"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button onClick={handleAdd} className="shrink-0 h-12 px-6 bg-primary-gradient text-white rounded-lg text-base font-bold active:scale-95 transition-transform">
                  Save
                </button>
              </div>
              {formError && (
                <p role="alert" className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {formError}
                </p>
              )}
            </div>
      </Collapse>

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
                  <div className="min-w-0">
                    <h4 className="font-bold text-base text-on-surface truncate">{song.title || "Untitled Song"}</h4>
                    <p className="text-sm text-on-surface-variant font-bold">
                      {coveredInstruments.length} of {INSTRUMENTS.length} instruments covered
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setAssigningSongId(isExpanded ? null : song.id)}
                    aria-label={`${isExpanded ? "Hide" : "Show"} assignments for ${song.title}`}
                    aria-expanded={isExpanded}
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
                      isExpanded ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container-low"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-xl transition-transform", isExpanded && "rotate-180")}>expand_more</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirmDeleteId === song.id) {
                        handleDelete(song.id, song.title);
                        setConfirmDeleteId(null);
                      } else {
                        setConfirmDeleteId(song.id);
                        setTimeout(() => setConfirmDeleteId(null), 4000);
                      }
                    }}
                    aria-label={confirmDeleteId === song.id ? `Confirm removing ${song.title}` : `Remove ${song.title}`}
                    className={cn(
                      "min-h-11 px-3 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      confirmDeleteId === song.id
                        ? "bg-error text-white"
                        : "w-11 text-on-surface-variant hover:text-error hover:bg-error/10"
                    )}
                  >
                    {confirmDeleteId === song.id ? "Confirm" : <span className="material-symbols-outlined text-xl">delete</span>}
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
                                "text-xs font-bold px-2 py-1 rounded-lg border transition-all",
                                isCovered
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-surface-container-low text-on-surface-variant border-outline-variant/30"
                            )}
                        >
                            {inst}
                        </span>
                    );
                })}
              </div>

              <Collapse open={isExpanded}>
                        <div className="bg-surface-container-low rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {INSTRUMENTS.map(inst => {
                                const instAssignments = songAssignments.filter(a => a.instrument === inst);
                                return (
                                    <div key={inst} className="space-y-2">
                                        <h5 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant px-1">{inst}</h5>
                                        <div className="space-y-1.5">
                                            {instAssignments.map(assign => {
                                                const member = members.find(m => m.id === assign.memberId);
                                                return (
                                                    <div key={assign.id} className="flex items-center justify-between gap-2 bg-surface-container-lowest border border-outline-variant/20 pl-3 pr-1 rounded-xl min-h-12">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="material-symbols-outlined text-lg text-primary shrink-0">person</span>
                                                            <span className="text-sm font-semibold text-on-surface truncate">{member?.name || "Unknown"}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnassign(song.id, inst, assign.memberId)}
                                                            aria-label={`Remove ${member?.name || "player"} from ${inst}`}
                                                            className="shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">close</span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            <div className="relative">
                                                <select
                                                    aria-label={`Assign a player to ${inst}`}
                                                    className="w-full h-12 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-base font-bold text-on-surface pl-3 pr-10 outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleAssign(song.id, inst, e.target.value);
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                    value=""
                                                >
                                                    <option value="">Add a player…</option>
                                                    {members
                                                        .filter(m => !instAssignments.some(ia => ia.memberId === m.id))
                                                        .map(m => (
                                                            <option key={m.id} value={m.id}>{m.name}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">add</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
              </Collapse>
            </div>
          );
        })}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-2 text-on-surface-variant">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-4xl">music_note</span>
          </div>
          <p className="font-bold text-on-surface text-base">
            {search ? `No songs matching "${search}"` : "No songs yet"}
          </p>
          <p className="text-sm">
            {search ? "Try a different spelling." : "Tap “Add Song” to start the repertoire."}
          </p>
        </div>
      )}
    </div>
  );
}
