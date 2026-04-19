"use client";

import React, { useState } from "react";
import { Performance } from "@/hooks/usePerformances";
import { Song } from "@/hooks/useSongs";
import { Member } from "@/hooks/useMembers";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PerformancesSectionProps {
  performances: Performance[];
  songs: Song[];
  members: Member[];
  availabilityMap: Record<string, string>;
  addPerformance: (perf: Omit<Performance, "id">) => Promise<string>;
  deletePerformance: (id: string) => Promise<void>;
  updatePerformance: (id: string, updates: Partial<Performance>) => Promise<void>;
  updateAvailability: (memberId: string, status: "available" | "unavailable" | "pending", perfId: string) => Promise<void>;
  assignMember: (songId: string, instrument: string, memberId: string, perfId: string) => Promise<void>;
}

export function PerformancesSection({ 
  performances, 
  songs, 
  members, 
  availabilityMap,
  addPerformance, 
  deletePerformance,
  updatePerformance,
  updateAvailability,
  assignMember
}: PerformancesSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const { showToast } = useToast();

  const handleAdd = async () => {
    if (!title || !date) return;
    try {
      await addPerformance({ title, date, startTime, endTime, location: "", status: "pending", setlist: [] });
      setTitle(""); setDate(""); setStartTime(""); setEndTime(""); setShowAdd(false);
      showToast(`Gig "${title}" scheduled`);
    } catch (e) {
      showToast("Failed to schedule gig", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">Gigs</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Schedule & Logistics</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={cn(
              "flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm border border-black/5",
              showAdd ? "bg-surface-container-high text-on-surface" : "bg-primary-gradient text-white"
          )}
        >
          <span className="material-symbols-outlined text-sm">{showAdd ? "close" : "calendar_add_on"}</span>
          {showAdd ? "Cancel" : "Add Gig"}
        </button>
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
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary px-1">New Gig Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  placeholder="Event Name" 
                  className="h-11 px-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none placeholder:text-zinc-400"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <input 
                  type="date" 
                  className="h-11 px-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none text-zinc-400"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="time" 
                    className="h-11 px-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none text-zinc-400"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                  <input 
                    type="time" 
                    className="h-11 px-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none text-zinc-400"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <button onClick={handleAdd} className="w-full h-11 bg-primary-gradient text-white rounded-lg text-sm font-bold active:scale-95 transition-transform">
                Save Gig
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 gap-4 pb-32">
        {performances.map((perf) => (
          <PerformanceCard 
            key={perf.id} 
            perf={perf} 
            songs={songs}
            members={members}
            availabilityMap={availabilityMap}
            onDelete={() => {
              if (confirm("Delete this gig?")) {
                deletePerformance(perf.id);
                showToast(`Gig deleted`, "info");
              }
            }}
            onUpdate={(updates) => updatePerformance(perf.id, updates)}
          />
        ))}
      </div>

      {performances.length === 0 && (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
            <span className="material-symbols-outlined text-4xl">event</span>
          </div>
          <p className="font-bold text-slate-400 text-sm">No gigs scheduled</p>
        </div>
      )}
    </div>
  );
}

function PerformanceCard({ 
  perf, 
  songs, 
  members, 
  availabilityMap,
  onDelete, 
  onUpdate
}: { 
  perf: Performance, 
  songs: Song[], 
  members: Member[],
  availabilityMap: Record<string, string>,
  onDelete: () => void, 
  onUpdate: (u: Partial<Performance>) => void
}) {
  const [showSetlist, setShowSetlist] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(perf.title);
  const [editDate, setEditDate] = useState(perf.date);
  const [editStartTime, setEditStartTime] = useState(perf.startTime || "");
  const [editEndTime, setEditEndTime] = useState(perf.endTime || "");
  const [editLocation, setEditLocation] = useState(perf.location || "");
  const { showToast } = useToast();

  const handleSave = () => {
    onUpdate({ 
      title: editTitle, 
      date: editDate, 
      startTime: editStartTime,
      endTime: editEndTime,
      location: editLocation 
    });
    setIsEditing(false);
    showToast("Gig details updated");
  };

  // Robust date parsing for local time display
  let month = "ERR";
  let day = "??";
  try {
    const parts = perf.date.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const d = parseInt(parts[2]);
      const dateObj = new Date(y, m, d);
      month = dateObj.toLocaleString("default", { month: "short" });
      day = dateObj.getDate().toString();
    } else {
      const dateObj = new Date(perf.date);
      month = dateObj.toLocaleString("default", { month: "short" });
      day = dateObj.getDate().toString();
    }
  } catch (e) {
    console.error("Date parse error", e);
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-black/5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        {/* Date Box */}
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex flex-col items-center justify-center text-on-surface shrink-0 border border-black/5 mt-0.5">
          <span className="text-[10px] font-bold uppercase opacity-60 leading-none">{month}</span>
          <span className="text-lg font-black leading-none mt-0.5">{day}</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pt-0.5">
          {isEditing ? (
            <div className="space-y-2 mb-2">
              <input 
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full text-sm font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none ring-primary/20 focus:ring-2"
                placeholder="Gig Name"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-500"
                />
                <input 
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-500"
                  placeholder="Location"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="time"
                  value={editStartTime}
                  onChange={e => setEditStartTime(e.target.value)}
                  className="w-full text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-500"
                />
                <input 
                  type="time"
                  value={editEndTime}
                  onChange={e => setEditEndTime(e.target.value)}
                  className="w-full text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-500"
                />
              </div>
            </div>
          ) : (
            <div className="mb-1">
              <h4 className="font-bold text-sm text-on-surface leading-tight truncate">{perf.title}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-slate-400 font-medium truncate">{perf.location || "Location TBD"}</p>
                {(perf.startTime || perf.endTime) && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-200 shadow-inner" />
                    <p className="text-[10px] text-primary font-bold">
                      {perf.startTime}{perf.endTime ? ` - ${perf.endTime}` : ""}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 rounded-lg",
              perf.status === "confirmed" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
            )}>
              {perf.status === "confirmed" ? "Confirmed" : "Tentative"}
            </span>
            <p className="text-[10px] text-slate-400 font-semibold">{perf.setlist.length} Songs</p>
          </div>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-0.5 shrink-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <button 
                onClick={onDelete} 
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors mr-2"
                title="Delete Gig"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
              <button onClick={handleSave} className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                <span className="material-symbols-outlined text-lg">check</span>
              </button>
              <button onClick={() => setIsEditing(false)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-surface-container-low transition-colors"
                title="Edit Gig"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
              <button 
                onClick={() => setShowSetlist(!showSetlist)}
                className={cn(
                   "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                   showSetlist ? "bg-surface-container-high text-on-surface" : "text-zinc-400 hover:bg-surface-container-low"
                )}
                title="Manage Setlist"
              >
                <span className="material-symbols-outlined text-lg">playlist_add_check</span>
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSetlist && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4 pt-2"
          >
            <div className="grid grid-cols-1 gap-4">
              {/* Setlist Management */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Program</h5>
                  <button 
                    onClick={() => onUpdate({ status: perf.status === "confirmed" ? "pending" : "confirmed" })}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider transition-colors",
                      perf.status === "confirmed" ? "text-green-600" : "text-blue-600"
                    )}
                  >
                    {perf.status === "confirmed" ? "Set Tentative" : "Set Confirmed"}
                  </button>
                </div>
                
                <div className="space-y-1.5">
                  {perf.setlist.map((songId, idx) => {
                    const song = songs.find(s => s.id === songId);
                    return (
                      <div key={idx} className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
                          <span className="font-bold text-xs text-slate-700">{song?.title || "Unknown Song"}</span>
                        </div>
                        <button 
                          onClick={() => {
                            const newSetlist = perf.setlist.filter((_, i) => i !== idx);
                            onUpdate({ setlist: newSetlist });
                          }}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                           <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    );
                  })}
                  
                  {perf.setlist.length === 0 && (
                    <div className="py-6 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined text-2xl">queue_music</span>
                      <p className="text-[10px] font-bold uppercase mt-1">Empty Setlist</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Library Quick Add */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Add from Library</h5>
                <div className="max-h-[200px] overflow-y-auto pr-2 space-y-1 hide-scrollbar">
                  {songs.filter(s => !perf.setlist.includes(s.id)).map(song => (
                    <button 
                      key={song.id}
                      onClick={() => {
                        onUpdate({ setlist: [...perf.setlist, song.id] });
                        showToast(`"${song.title}" added`);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between group"
                    >
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600">{song.title}</span>
                      <span className="material-symbols-outlined text-sm text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">add</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
