"use client";

import React, { useState } from "react";
import { Member } from "@/hooks/useMembers";
import { Song } from "@/hooks/useSongs";
import { useAssignments } from "@/hooks/useAssignments";
import { INSTRUMENTS } from "@/lib/constants";
import {
  Music,
  Users,
  Plus,
  Search,
  X,
  Check,
  ListMusic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

interface MasterCommandSectionProps {
  members: Member[];
  songs: Song[];
  addMember: (member: Omit<Member, "id">) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

type MobileTab = "library" | "desk" | "roster";

export function MasterCommandSection({ members, songs, addMember, deleteMember }: MasterCommandSectionProps) {
  const [selectedSongId, setSelectedSongId] = useState<string | null>(songs[0]?.id || null);
  const [songSearch, setSongSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("desk");

  const { showToast } = useToast();
  const { assignments, assignMember, removeAssignment } = useAssignments("default_coverage");

  const filteredSongs = songs.filter(s =>
    (s.title || "").toLowerCase().includes(songSearch.toLowerCase())
  );

  const filteredMembers = members.filter(m =>
    (m.name || "").toLowerCase().includes(memberSearch.toLowerCase())
  );

  const activeSong = songs.find(s => s.id === selectedSongId);
  const songAssignments = assignments.filter(a => a.songId === selectedSongId);

  const [assignmentRequest, setAssignmentRequest] = useState<{ instrument: string } | null>(null);

  const handleAddMember = async () => {
    if (!newMemberName) return;
    try {
      await addMember({ name: newMemberName, email: "", instruments: [], role: "member" });
      setNewMemberName("");
      showToast(`${newMemberName} added to roster`);
    } catch (e) {
      showToast("Failed to add player", "error");
    }
  };

  const handlePersonnelClick = (memberId: string) => {
    if (activeSong && assignmentRequest) {
      assignMember(activeSong.id, assignmentRequest.instrument, memberId);
      setAssignmentRequest(null);
      setMobileTab("desk"); // Navigate back to desk so user sees the result
      showToast("Player assigned ✓");
    }
  };


  // ── Shared Panel Components ────────────────────────────────────────────────

  const LibraryPanel = () => (
    <div className="flex flex-col h-full gap-3">
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-outline/60 px-1">Library</h3>
        <div className="flex items-center gap-2 bg-white border border-outline-variant/30 rounded-lg px-3 shadow-sm focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-outline/40 shrink-0" />
          <input
            placeholder="Filter songs..."
            className="flex-1 h-9 text-xs font-bold uppercase tracking-tight outline-none bg-transparent"
            value={songSearch}
            onChange={e => setSongSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
        {filteredSongs.length === 0 && (
          <p className="text-[10px] text-outline/30 uppercase font-bold px-2 pt-4">No songs found</p>
        )}
        {filteredSongs.map(song => (
          <button
            key={song.id}
            onClick={() => {
              setSelectedSongId(song.id);
              setAssignmentRequest(null);
              setMobileTab("desk");
            }}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs font-bold uppercase tracking-tight flex items-center gap-3",
              selectedSongId === song.id
                ? "bg-primary text-white shadow-sm"
                : "bg-white hover:bg-surface-container text-on-surface border border-transparent hover:border-outline-variant/20"
            )}
          >
            <Music className={cn("w-3.5 h-3.5 shrink-0", selectedSongId === song.id ? "text-white" : "text-outline/40")} />
            <span className="truncate">{song.title || "Untitled"}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const DeskPanel = () => (
    <div className="flex flex-col h-full">
      {activeSong ? (
        <div className="flex-1 bg-white border border-outline-variant/20 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <Music className="w-4 h-4 text-primary shrink-0" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-tight text-on-surface leading-none">{activeSong.title}</h2>
                <p className="text-[9px] uppercase font-bold text-outline/40 tracking-widest mt-0.5">Orchestration Desk</p>
              </div>
            </div>
            <span className="text-[9px] font-black text-outline/30 uppercase shrink-0">{members.length} Players</span>
          </div>

          {/* Assignment notice */}
          {assignmentRequest && (
            <div className="px-4 py-2 bg-secondary/10 border-b border-secondary/20 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-secondary uppercase animate-pulse">
                ← Select a player from the Roster tab
              </span>
              <button onClick={() => setAssignmentRequest(null)} className="text-secondary/60 hover:text-secondary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Rows */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-outline-variant/5">
              {INSTRUMENTS.map(inst => {
                const instAssignments = songAssignments.filter(a => a.instrument === inst);
                const isRequesting = assignmentRequest?.instrument === inst;

                return (
                  <div
                    key={inst}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-all",
                      isRequesting
                        ? "bg-secondary/5 ring-1 ring-inset ring-secondary/20"
                        : "hover:bg-surface-container-low/30"
                    )}
                  >
                    {/* Instrument label */}
                    <div className="w-20 sm:w-28 shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-on-surface/50 leading-none">{inst}</span>
                    </div>

                    {/* Assignments */}
                    <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
                      {instAssignments.map(assign => {
                        const member = members.find(m => m.id === assign.memberId);
                        return (
                          <div key={assign.id} className="inline-flex items-center gap-1 bg-surface-container/40 border border-outline-variant/15 pl-2 pr-0.5 py-0.5 rounded">
                            <span className="text-[10px] font-bold uppercase text-on-surface leading-none">{member?.name || "???"}</span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                removeAssignment(activeSong.id, inst, assign.memberId);
                              }}
                              className="p-0.5 text-outline/30 hover:text-error transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                      {instAssignments.length === 0 && !isRequesting && (
                        <span className="text-[9px] text-outline/20 italic">—</span>
                      )}
                      {isRequesting && (
                        <span className="text-[9px] font-black text-secondary uppercase animate-pulse">Tap player →</span>
                      )}
                    </div>

                    {/* Add/Cancel button */}
                    <button
                      onClick={() => {
                        setAssignmentRequest(isRequesting ? null : { instrument: inst });
                        setMobileTab("roster");
                      }}
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center transition-all shrink-0 border",
                        isRequesting
                          ? "bg-secondary text-white border-secondary"
                          : "bg-surface-container/20 text-primary border-outline-variant/10 hover:border-primary/40"
                      )}
                    >
                      {isRequesting ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-surface-container/10 rounded-2xl border border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-outline/30 gap-3">
          <Music className="w-10 h-10 opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Select a song from the Library to open the desk</p>
        </div>
      )}
    </div>
  );

  const RosterPanel = () => (
    <div className="flex flex-col h-full gap-3">
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-outline/60 px-1">Roster</h3>

        {/* Add player */}
        <div className="flex gap-2">
          <input
            placeholder="New player name..."
            className="flex-1 h-9 px-3 text-xs border border-outline-variant/30 rounded-lg outline-none focus:border-primary bg-white"
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddMember()}
          />
          <button
            onClick={handleAddMember}
            className="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search roster */}
        <div className="flex items-center gap-2 bg-white border border-outline-variant/30 rounded-lg px-3 shadow-sm focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-outline/40 shrink-0" />
          <input
            placeholder="Filter roster..."
            className="flex-1 h-9 text-xs font-bold uppercase tracking-tight outline-none bg-transparent"
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
          />
        </div>
      </div>

      {assignmentRequest && (
        <div className="px-3 py-2 bg-secondary/10 rounded-lg border border-secondary/20">
          <p className="text-[10px] font-black text-secondary uppercase">
            Assigning: <span className="text-secondary/70">{assignmentRequest.instrument}</span>
          </p>
          <p className="text-[9px] text-secondary/50 mt-0.5">Tap a player below to assign them</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
        {filteredMembers.length === 0 && (
          <p className="text-[10px] text-outline/30 uppercase font-bold px-2 pt-4">No players in roster</p>
        )}
        {filteredMembers.map(member => (
          <button
            key={member.id}
            onClick={() => handlePersonnelClick(member.id)}
            className={cn(
              "w-full text-left p-3 rounded-lg flex items-center gap-3 group transition-all border",
              assignmentRequest
                ? "bg-secondary/5 border-secondary/20 hover:bg-secondary/15 hover:border-secondary"
                : "bg-white border-transparent hover:bg-surface-container"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
              assignmentRequest ? "bg-secondary text-white" : "bg-outline-variant/10 text-outline"
            )}>
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-tight block text-on-surface leading-none truncate">{member.name || "Unnamed"}</span>
              <span className="text-[9px] font-bold uppercase text-outline/40 tracking-wider">Player</span>
            </div>
            {assignmentRequest && (
              <Check className="w-3.5 h-3.5 text-secondary ml-auto shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Mobile Tab Bar ─────────────────────────────────────────────────────────
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: "library", label: "Library", icon: <ListMusic className="w-4 h-4" /> },
    { id: "desk",    label: "Desk",    icon: <Music className="w-4 h-4" /> },
    { id: "roster",  label: "Roster",  icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-140px)] w-full animate-in fade-in duration-500">

      {/* ── Mobile Tab Bar (hidden on lg+) ─────────────────────────────── */}
      <div className="flex lg:hidden border-b border-outline-variant/20 bg-white mb-3 rounded-xl overflow-hidden shadow-sm shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
              mobileTab === tab.id
                ? "bg-primary text-white"
                : "text-outline/50 hover:text-on-surface hover:bg-surface-container/50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Layout ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex gap-4">

        {/* Desktop: Song Library (always visible lg+) */}
        <div className={cn(
          "w-52 shrink-0 hidden lg:flex flex-col"
        )}>
          <LibraryPanel />
        </div>

        {/* Desktop: Orchestration Desk (always visible lg+) */}
        <div className={cn(
          "flex-1 min-w-0 hidden lg:flex flex-col"
        )}>
          <DeskPanel />
        </div>

        {/* Desktop: Roster (always visible lg+) */}
        <div className={cn(
          "w-60 shrink-0 hidden lg:flex flex-col"
        )}>
          <RosterPanel />
        </div>

        {/* Mobile: Active Panel (only one visible at a time) */}
        <div className="flex-1 min-w-0 flex flex-col lg:hidden">
          {mobileTab === "library" && <LibraryPanel />}
          {mobileTab === "desk"    && <DeskPanel />}
          {mobileTab === "roster"  && <RosterPanel />}
        </div>
      </div>
    </div>
  );
}
