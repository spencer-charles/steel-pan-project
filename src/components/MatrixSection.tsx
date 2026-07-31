"use client";

import React from "react";
import { Member } from "@/hooks/useMembers";
import { Song } from "@/hooks/useSongs";
import { Performance } from "@/hooks/usePerformances";
import { Assignment } from "@/hooks/useAssignments";
import { INSTRUMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

interface MatrixSectionProps {
  members: Member[];
  songs: Song[];
  performances: Performance[];
  assignments: Assignment[];
  defaultAssignments: Assignment[];
  availabilityMap: Record<string, string>;
  filterPerfId: string;
  setFilterPerfId: (id: string) => void;
  filterSongId: string;
  setFilterSongId: (id: string) => void;
  removeAssignment: (songId: string, instrument: string, memberId: string) => Promise<void>;
}

export function MatrixSection({
  members,
  songs,
  performances,
  assignments,
  defaultAssignments,
  availabilityMap,
  filterPerfId,
  setFilterPerfId,
  filterSongId,
  setFilterSongId,
  removeAssignment
}: MatrixSectionProps) {
  const { showToast } = useToast();

  const onRemove = async (songId: string, instrument: string, memberId: string, name: string) => {
    try {
      await removeAssignment(songId, instrument, memberId);
      showToast(`Removed ${name} from ${instrument}`, "info");
    } catch {
      showToast("Couldn't remove that assignment.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">Matrix</h1>
        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-[0.2em]">Live Readiness Report</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Gig</label>
          <div className="relative">
            <select 
              value={filterPerfId} 
              onChange={e => setFilterPerfId(e.target.value)}
              className="w-full h-12 bg-surface-container-high border-none rounded-2xl text-base font-bold text-on-surface pl-4 pr-10 appearance-none outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Choose a gig...</option>
              {performances.map((perf) => (
                <option key={perf.id} value={perf.id}>{perf.title}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Song</label>
          <div className="relative">
            <select 
              value={filterSongId} 
              onChange={e => setFilterSongId(e.target.value)}
              className="w-full h-12 bg-surface-container-high border-none rounded-2xl text-base font-bold text-on-surface pl-4 pr-10 appearance-none outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Choose a song...</option>
              {songs.map((song) => (
                <option key={song.id} value={song.id}>{song.title}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>

      <div className="pb-32">
        {!filterPerfId && !filterSongId ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-outline-variant/40 rounded-3xl text-on-surface-variant text-center">
            <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
            <p className="font-bold text-sm">Pick a gig or a song above</p>
            <p className="text-sm mt-1">
              Choose a gig to see which songs are covered, or a song to see who plays each instrument.
            </p>
          </div>
        ) : filterPerfId && !filterSongId ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const selectedPerf = performances.find(p => p.id === filterPerfId);
              const setlist = selectedPerf?.setlist || [];
              
              // Calculate coverage for each song in the setlist
              const songCoverage = setlist.map(songId => {
                const song = songs.find(s => s.id === songId);
                const songAssignments = [...assignments, ...defaultAssignments].filter(a => a.songId === songId);
                
                // Group by instrument to see what's required vs available
                const instrumentRequirement = new Set(songAssignments.map(a => a.instrument));
                const instrumentAvailability = new Set(
                  songAssignments
                    .filter(a => availabilityMap?.[a.memberId] === 'available')
                    .map(a => a.instrument)
                );
                
                const missing = Array.from(instrumentRequirement).filter(inst => !instrumentAvailability.has(inst));
                const coverage = instrumentRequirement.size > 0 
                  ? (instrumentAvailability.size / instrumentRequirement.size) 
                  : 0;
                
                return {
                  id: songId,
                  title: song?.title || "Unknown Song",
                  coverage,
                  missing,
                  requirementCount: instrumentRequirement.size,
                  availableCount: instrumentAvailability.size
                };
              });

              // Sort by coverage descending, then by title
              const sortedSongs = [...songCoverage].sort((a, b) => {
                if (b.coverage !== a.coverage) return b.coverage - a.coverage;
                return a.title.localeCompare(b.title);
              });

              return sortedSongs.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => setFilterSongId(sc.id)}
                  className="w-full text-left bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.99] flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-base text-on-surface truncate">{sc.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              sc.coverage === 1 ? "bg-emerald-600" : sc.coverage > 0.5 ? "bg-amber-500" : "bg-red-600"
                            )}
                            style={{ width: `${sc.coverage * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-on-surface-variant shrink-0">
                          {Math.round(sc.coverage * 100)}%
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant shrink-0">chevron_right</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-bold text-on-surface-variant">
                      {sc.availableCount}/{sc.requirementCount} sections covered
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {sc.missing.length > 0 ? (
                        <>
                          <div className="w-full text-xs font-bold text-red-700 uppercase tracking-wide mb-0.5">Missing:</div>
                          {sc.missing.map((inst, i) => (
                            <span
                              key={i}
                              className="text-xs font-bold px-2 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200"
                            >
                              {inst}
                            </span>
                          ))}
                        </>
                      ) : sc.requirementCount > 0 ? (
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Full coverage
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-on-surface-variant">
                          Nobody assigned to this song yet
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ));
            })()}
            {performances.find(p => p.id === filterPerfId)?.setlist.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 rounded-3xl text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">queue_music</span>
                <p className="font-bold text-sm uppercase tracking-wider">Empty setlist</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INSTRUMENTS.map((inst) => {
              const allTargetAssignments = [...assignments, ...defaultAssignments];
              const filteredAssignments = allTargetAssignments.filter(a => 
                a.instrument === inst && 
                (filterSongId ? a.songId === filterSongId : true)
              );

              // Deduplicate by memberId per instrument
              const seenMembers = new Set();
              const uniqueAssignments = filteredAssignments.filter(a => {
                if (seenMembers.has(a.memberId)) return false;
                seenMembers.add(a.memberId);
                return true;
              });

              return (
                <div key={inst} className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">{inst}</h3>

                  <div className="space-y-2">
                    {uniqueAssignments.map((a, i) => {
                      const member = members.find(m => m.id === a.memberId);
                      const status = availabilityMap?.[member?.id || ""] || "pending";
                      const statusLabel = status === "available" ? "In" : status === "unavailable" ? "Out" : "No reply";

                      return (
                        <div key={i} className="bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20 flex items-center justify-between gap-2 min-h-12">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={cn(
                              "w-2.5 h-2.5 rounded-full shrink-0",
                              status === "available" ? "bg-emerald-600" : status === "unavailable" ? "bg-red-600" : "bg-outline/50"
                            )}></div>
                            <span className="font-bold text-sm truncate text-on-surface">
                              {member?.name || "Unnamed Player"}
                            </span>
                            {/* Status is spelled out, not just colour-coded. */}
                            <span className="text-xs font-bold text-on-surface-variant shrink-0">{statusLabel}</span>
                          </div>
                          <button
                            onClick={() => onRemove(a.songId, inst, a.memberId, member?.name || "Player")}
                            aria-label={`Remove ${member?.name || "player"} from ${inst}`}
                            className="shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      );
                    })}

                    {uniqueAssignments.length === 0 && (
                      <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 rounded-2xl text-on-surface-variant">
                        <span className="material-symbols-outlined text-2xl">person_off</span>
                        <p className="text-xs font-bold uppercase mt-1">Nobody assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
