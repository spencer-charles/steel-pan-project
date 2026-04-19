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
  allAvailability?: Record<string, Record<string, AvailabilityStatus>>;
  updateAvailability: (memberId: string, status: AvailabilityStatus, perfId: string) => Promise<void>;
  addMember: (member: Omit<Member, "id">) => Promise<void>;
  addSong: (song: Omit<Song, "id">) => Promise<void>;
  filterPerfId: string;
  setFilterPerfId: (id: string) => void;
  filterSongId: string;
  setFilterSongId: (id: string) => void;
  onTabChange: (tab: any) => void; // Using any to avoid Sidebar dependency for now
  assignments: any[];
  defaultAssignments: any[];
  removeAssignment: (songId: string, instrument: string, memberId: string) => void;
  updatePerformance: (id: string, updates: Partial<Performance>) => Promise<void>;
}

export function HuddleMasterCommand({ 
  members, 
  songs, 
  performances, 
  availability,
  allAvailability = {},
  updateAvailability,
  addMember,
  addSong,
  filterPerfId,
  setFilterPerfId,
  filterSongId,
  setFilterSongId,
  onTabChange,
  assignments,
  defaultAssignments,
  removeAssignment,
  updatePerformance
}: HuddleMasterCommandProps) {
  const { showToast } = useToast();
  
  const [quickAddMemberId, setQuickAddMemberId] = useState<Record<string, string>>({});
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const handleQuickAvailability = async (memberId: string, perfId: string) => {
    if (!memberId || !perfId) return;
    try {
      await updateAvailability(memberId, 'available', perfId);
      showToast("Availability updated!", "success");
      setQuickAddMemberId(prev => ({ ...prev, [perfId]: "" }));
    } catch (error) {
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
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">Dashboard</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Management Overview</p>
        </div>
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
            <span className="font-bold text-sm whitespace-nowrap">Add New Gig</span>
          </button>
        </div>
      </section>

      {/* Player Availability Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
            <h2 className="font-headline font-bold text-xl text-on-surface">Gig Availability</h2>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Sign Up Sheet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performances
            .filter(p => !p.isArchived)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(perf => {
              // Parse date carefully to avoid timezone shifts
              let day, month;
              try {
                const dateParts = perf.date.split('-');
                if (dateParts.length === 3) {
                  const y = parseInt(dateParts[0]);
                  const m = parseInt(dateParts[1]) - 1;
                  const d = parseInt(dateParts[2]);
                  const dateObj = new Date(y, m, d);
                  day = dateObj.getDate();
                  month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                } else {
                  const dateObj = new Date(perf.date);
                  day = dateObj.getDate();
                  month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                }
              } catch (e) {
                day = "??";
                month = "ERR";
              }
              
              const perfAvailability = allAvailability[perf.id] || {};
              const availableMembers = members.filter(m => perfAvailability[m.id] === 'available');

              return (
                <div 
                  key={perf.id} 
                  className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm transition-all hover:shadow-md flex flex-col gap-5 relative overflow-hidden group"
                >
                  {/* Archive Button */}
                  <button 
                    onClick={() => updatePerformance(perf.id, { isArchived: true })}
                    className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:text-amber-500 hover:bg-amber-50 transition-all z-10"
                    title="Archive Gig"
                  >
                    <span className="material-symbols-outlined text-sm">archive</span>
                  </button>

                  {/* Calendar Widget */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-16 bg-blue-50 rounded-2xl flex flex-col items-center justify-center border border-blue-100">
                      <span className="text-[10px] font-black text-blue-400 mb-0.5">{month}</span>
                      <span className="text-xl font-black text-blue-700 leading-none">{day}</span>
                    </div>
                    <div className="min-w-0 pt-1 pr-8">
                      <h3 className="font-bold text-slate-800 truncate leading-tight">{perf.title || "TBD Performance"}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="truncate">{perf.location || "Location TBD"}</span>
                        {(perf.startTime || perf.endTime) && (
                          <span className="flex items-center gap-1 ml-2 text-blue-500 font-medium">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {perf.startTime}{perf.endTime ? ` - ${perf.endTime}` : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Available Personnel */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Available Players</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-2">
                      {availableMembers.map(m => (
                        <div 
                          key={m.id} 
                          className="flex items-center gap-1.5"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-bold text-slate-700">{m.name}</span>
                        </div>
                      ))}
                      {availableMembers.length === 0 && (
                        <span className="text-[10px] font-medium text-slate-300 italic">No one signed up yet</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Sign Up */}
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="relative flex items-center gap-2">
                      <select 
                        value={quickAddMemberId[perf.id] || ""}
                        onChange={(e) => handleQuickAvailability(e.target.value, perf.id)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 appearance-none outline-none focus:ring-2 focus:ring-blue-100 transition-all hover:bg-slate-100"
                      >
                        <option value="">Sign up for this gig...</option>
                        {members
                          .filter(m => perfAvailability[m.id] !== 'available')
                          .map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))
                        }
                      </select>
                      <div className="absolute right-3 pointer-events-none">
                        <span className="material-symbols-outlined text-slate-300 text-sm">person_add</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
          {performances.filter(p => !p.isArchived).length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-300">
              <span className="material-symbols-outlined text-4xl mb-2">calendar_today</span>
              <p className="font-bold text-sm">No upcoming gigs scheduled</p>
            </div>
          )}
        </div>
      </section>

      {/* Archived Gigs Section */}
      <section className="mb-20">
        <button 
          onClick={() => setIsArchiveOpen(!isArchiveOpen)}
          className="flex items-center gap-2 group mb-6 px-1"
        >
          <span className={cn(
            "material-symbols-outlined text-slate-300 transition-transform duration-300",
            isArchiveOpen ? "rotate-180" : ""
          )}>expand_more</span>
          <h2 className="font-headline font-bold text-xl text-slate-400">Archived Gigs</h2>
          <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full">
            {performances.filter(p => p.isArchived).length}
          </span>
        </button>

        {isArchiveOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
            {performances
              .filter(p => p.isArchived)
              .map(perf => (
                <div 
                  key={perf.id} 
                  className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 flex flex-col gap-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-600 truncate">{perf.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{perf.date}</p>
                    </div>
                    <button 
                      onClick={() => updatePerformance(perf.id, { isArchived: false })}
                      className="p-2 text-slate-300 hover:text-primary transition-colors"
                      title="Unarchive Gig"
                    >
                      <span className="material-symbols-outlined text-sm">unarchive</span>
                    </button>
                  </div>
                </div>
              ))
            }
            {performances.filter(p => p.isArchived).length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-300 text-xs font-bold uppercase tracking-widest italic opacity-50">
                No archived gigs
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
