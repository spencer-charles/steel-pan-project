"use client";

import React, { useState } from "react";
import { Member } from "@/hooks/useMembers";
import { Performance } from "@/hooks/usePerformances";
import { AvailabilityStatus } from "@/hooks/useAvailability";
import { TabId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

interface HuddleMasterCommandProps {
  members: Member[];
  performances: Performance[];
  allAvailability?: Record<string, Record<string, AvailabilityStatus>>;
  updateAvailability: (memberId: string, status: AvailabilityStatus, perfId: string) => Promise<void>;
  onTabChange: (tab: TabId) => void;
  updatePerformance: (id: string, updates: Partial<Performance>) => Promise<void>;
  currentMemberId: string | null;
}

export function HuddleMasterCommand({
  members,
  performances,
  allAvailability = {},
  updateAvailability,
  onTabChange,
  updatePerformance,
  currentMemberId
}: HuddleMasterCommandProps) {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Management Console Header */}
      <section className="mt-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">Dashboard</h1>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-[0.2em]">Management Overview</p>
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
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">Sign Up Sheet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performances
            .filter(p => !p.isArchived)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(perf => (
              <GigCard
                key={perf.id}
                perf={perf}
                members={members}
                perfAvailability={allAvailability[perf.id] || {}}
                currentMemberId={currentMemberId}
                updateAvailability={updateAvailability}
                updatePerformance={updatePerformance}
              />
            ))
          }
          {performances.filter(p => !p.isArchived).length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-surface-container-low rounded-[2rem] border-2 border-dashed border-outline-variant/40 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">calendar_today</span>
              <p className="font-bold text-sm">No upcoming gigs scheduled</p>
            </div>
          )}
        </div>
      </section>

      {/* Archived Gigs Section */}
      <section className="mb-32">
        <button 
          onClick={() => setIsArchiveOpen(!isArchiveOpen)}
          aria-expanded={isArchiveOpen}
          className="flex items-center gap-2 min-h-12 mb-4 px-1"
        >
          <span className={cn(
            "material-symbols-outlined text-on-surface-variant transition-transform duration-300",
            isArchiveOpen ? "rotate-180" : ""
          )}>expand_more</span>
          <h2 className="font-headline font-bold text-xl text-on-surface-variant">Archived Gigs</h2>
          <span className="bg-surface-container-high text-on-surface-variant text-xs font-black px-2 py-0.5 rounded-full">
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
                  className="bg-surface-container-low border border-outline-variant/20 rounded-[2rem] p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-on-surface-variant truncate">{perf.title}</h3>
                      <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">{perf.date}</p>
                    </div>
                    <button
                      onClick={() => updatePerformance(perf.id, { isArchived: false })}
                      className="shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Unarchive Gig"
                    >
                      <span className="material-symbols-outlined text-lg">unarchive</span>
                    </button>
                  </div>
                </div>
              ))
            }
            {performances.filter(p => p.isArchived).length === 0 && (
              <div className="col-span-full py-8 text-center text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                No archived gigs
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

const STATUS_META: Record<AvailabilityStatus, { label: string; dot: string; pill: string }> = {
  available: { label: "In", dot: "bg-emerald-600", pill: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  unavailable: { label: "Out", dot: "bg-red-600", pill: "bg-red-50 text-red-800 border-red-200" },
  pending: { label: "Maybe", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 border-amber-200" },
};

interface GigCardProps {
  perf: Performance;
  members: Member[];
  perfAvailability: Record<string, AvailabilityStatus>;
  currentMemberId: string | null;
  updateAvailability: (memberId: string, status: AvailabilityStatus, perfId: string) => Promise<void>;
  updatePerformance: (id: string, updates: Partial<Performance>) => Promise<void>;
}

function GigCard({
  perf,
  members,
  perfAvailability,
  currentMemberId,
  updateAvailability,
  updatePerformance,
}: GigCardProps) {
  const { showToast } = useToast();
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [savingFor, setSavingFor] = useState<string | null>(null);

  // Dates are stored as "YYYY-MM-DD"; split rather than parse so the day never
  // shifts by a timezone offset.
  const [y, m, d] = perf.date.split("-").map(Number);
  const parsed = y && m && d ? new Date(y, m - 1, d) : null;
  const day = parsed ? parsed.getDate() : "??";
  const month = parsed ? parsed.toLocaleString("default", { month: "short" }).toUpperCase() : "—";

  const myStatus = currentMemberId ? perfAvailability[currentMemberId] : undefined;
  const responded = members.filter(mem => perfAvailability[mem.id]).length;
  const inCount = members.filter(mem => perfAvailability[mem.id] === "available").length;

  const setStatus = async (memberId: string, status: AvailabilityStatus, name: string) => {
    setSavingFor(memberId);
    try {
      await updateAvailability(memberId, status, perf.id);
      const isMe = memberId === currentMemberId;
      showToast(
        isMe ? `You're ${STATUS_META[status].label.toLowerCase()} for ${perf.title}` : `${name} marked ${STATUS_META[status].label.toLowerCase()}`,
        "success"
      );
    } catch {
      showToast("Couldn't save — check your connection and try again.", "error");
    } finally {
      setSavingFor(null);
    }
  };

  const handleArchive = async () => {
    try {
      await updatePerformance(perf.id, { isArchived: true });
      showToast(`${perf.title} archived`, "info");
    } catch {
      showToast("Couldn't archive that gig.", "error");
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] p-5 shadow-sm flex flex-col gap-5">
      {/* Header: date badge + title */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-14 h-16 bg-primary-container rounded-2xl flex flex-col items-center justify-center">
          <span className="text-[11px] font-black text-on-primary-container/70">{month}</span>
          <span className="text-xl font-black text-on-primary-container leading-none">{day}</span>
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="font-bold text-on-surface leading-tight break-words">{perf.title || "TBD Performance"}</h3>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1 min-w-0">
            <span className="material-symbols-outlined text-base shrink-0">location_on</span>
            <span className="truncate">{perf.location || "Location TBD"}</span>
          </p>
          {(perf.startTime || perf.endTime) && (
            <p className="text-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-base shrink-0">schedule</span>
              {perf.startTime}{perf.endTime ? ` – ${perf.endTime}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Your answer — the primary action on this card */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Your answer</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => currentMemberId && setStatus(currentMemberId, "available", "You")}
            disabled={!currentMemberId || savingFor === currentMemberId}
            aria-pressed={myStatus === "available"}
            className={cn(
              "h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.98] disabled:opacity-50",
              myStatus === "available"
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-surface-container-low border-transparent text-on-surface-variant"
            )}
          >
            <span className="material-symbols-outlined text-xl">check_circle</span>
            I&apos;m In
          </button>
          <button
            onClick={() => currentMemberId && setStatus(currentMemberId, "unavailable", "You")}
            disabled={!currentMemberId || savingFor === currentMemberId}
            aria-pressed={myStatus === "unavailable"}
            className={cn(
              "h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.98] disabled:opacity-50",
              myStatus === "unavailable"
                ? "bg-red-600 border-red-600 text-white"
                : "bg-surface-container-low border-transparent text-on-surface-variant"
            )}
          >
            <span className="material-symbols-outlined text-xl">cancel</span>
            Can&apos;t Make It
          </button>
        </div>
        <button
          onClick={() => currentMemberId && setStatus(currentMemberId, "pending", "You")}
          disabled={!currentMemberId || savingFor === currentMemberId}
          aria-pressed={myStatus === "pending"}
          className={cn(
            "mt-2 w-full h-12 rounded-xl text-sm font-bold border-2 transition-all active:scale-[0.98] disabled:opacity-50",
            myStatus === "pending"
              ? "bg-amber-500 border-amber-500 text-white"
              : "bg-transparent border-transparent text-on-surface-variant"
          )}
        >
          Not sure yet
        </button>
        {!myStatus && (
          <p className="mt-2 text-sm text-on-surface-variant text-center">You haven&apos;t answered yet.</p>
        )}
      </div>

      {/* Response tracking + full roster */}
      <div className="border-t border-outline-variant/20 pt-4">
        <button
          onClick={() => setIsRosterOpen(!isRosterOpen)}
          aria-expanded={isRosterOpen}
          className="w-full min-h-12 flex items-center justify-between gap-2 text-left"
        >
          <span className="text-sm font-bold text-on-surface">
            {responded} of {members.length} answered
            <span className="text-on-surface-variant font-medium"> · {inCount} in</span>
          </span>
          <span className={cn(
            "material-symbols-outlined text-on-surface-variant transition-transform",
            isRosterOpen && "rotate-180"
          )}>expand_more</span>
        </button>

        <div className="mt-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: members.length ? `${(responded / members.length) * 100}%` : "0%" }}
          />
        </div>

        {isRosterOpen && (
          <ul className="mt-3 space-y-1">
            {members.map(mem => {
              const status = perfAvailability[mem.id];
              const meta = status ? STATUS_META[status] : null;
              return (
                <li
                  key={mem.id}
                  className="min-h-12 px-3 py-2 rounded-xl bg-surface-container-low flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", meta ? meta.dot : "bg-outline/40")} />
                    <span className="text-sm font-bold text-on-surface truncate">
                      {mem.name}
                      {mem.id === currentMemberId && <span className="text-on-surface-variant font-medium"> (you)</span>}
                    </span>
                  </span>
                  {/* The pill is the control — anyone can correct anyone, the
                      roster is shared on purpose. */}
                  <div className="relative shrink-0">
                    <select
                      value={status ?? ""}
                      onChange={e => setStatus(mem.id, e.target.value as AvailabilityStatus, mem.name)}
                      disabled={savingFor === mem.id}
                      aria-label={`Availability for ${mem.name}`}
                      className={cn(
                        "min-h-12 pl-3 pr-8 rounded-xl border text-base font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50",
                        meta ? meta.pill : "bg-transparent text-on-surface-variant border-outline-variant/40"
                      )}
                    >
                      <option value="" disabled>No reply</option>
                      <option value="available">In</option>
                      <option value="unavailable">Out</option>
                      <option value="pending">Maybe</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-base pointer-events-none opacity-60">
                      expand_more
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Archive lives at the bottom, in reach and out of mis-tap range */}
      <button
        onClick={handleArchive}
        className="min-h-12 -mb-1 flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant rounded-xl hover:bg-surface-container-low transition-colors"
      >
        <span className="material-symbols-outlined text-lg">archive</span>
        Archive gig
      </button>
    </div>
  );
}
