"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useCurrentMember } from "@/context/CurrentMemberContext";
import { useMembers } from "@/hooks/useMembers";
import { usePerformances } from "@/hooks/usePerformances";
import { useAvailability, AvailabilityStatus } from "@/hooks/useAvailability";
import { HuddleLayout } from "@/components/layout/HuddleLayout";
import { ConnectionBanner, ErrorBanner, SectionSkeleton } from "@/components/DataState";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";

const STATUS_META: Record<AvailabilityStatus, { label: string; dot: string; pill: string }> = {
  available: { label: "In", dot: "bg-emerald-600", pill: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  unavailable: { label: "Out", dot: "bg-red-600", pill: "bg-red-50 text-red-800 border-red-200" },
  pending: { label: "Maybe", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 border-amber-200" },
};

export default function RsvpClient() {
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const perfIdFromParams = (params?.id as string) || "";
  const perfIdFromQuery = searchParams?.get("id") || searchParams?.get("gig") || "";
  const perfIdFromPath = pathname?.startsWith("/rsvp/")
    ? pathname.replace("/rsvp/", "").split("/")[0]
    : "";

  const perfId = perfIdFromParams || perfIdFromQuery || perfIdFromPath || "";

  const { currentMemberId, selectMember, clearMember, isReady } = useCurrentMember();
  const { members, loading: membersLoading, error: membersError } = useMembers();
  const { performances, loading: perfLoading, error: perfError } = usePerformances();
  const { availability, updateAvailability, error: availError } = useAvailability(perfId);
  const { showToast } = useToast();

  const [savingFor, setSavingFor] = useState<string | null>(null);
  const [isRosterOpen, setIsRosterOpen] = useState(true);

  const currentMember = members.find(m => m.id === currentMemberId) ?? null;
  const perf = performances.find(p => p.id === perfId) ?? null;

  const isLoading = !isReady || membersLoading || perfLoading;
  const dataError = membersError || perfError || availError;

  const handleShare = async () => {
    try {
      const shareUrl = perf ? `${window.location.origin}/rsvp?id=${perf.id}` : window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: perf ? `RSVP: ${perf.title}` : "Gig RSVP",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast("RSVP link copied to clipboard!", "success");
      }
    } catch {
      try {
        const shareUrl = perf ? `${window.location.origin}/rsvp?id=${perf.id}` : window.location.href;
        await navigator.clipboard.writeText(shareUrl);
        showToast("RSVP link copied to clipboard!", "success");
      } catch {
        showToast("Could not copy link", "error");
      }
    }
  };

  const setStatus = async (memberId: string, status: AvailabilityStatus, name: string) => {
    setSavingFor(memberId);
    try {
      await updateAvailability(memberId, status, perfId);
      const isMe = memberId === currentMemberId;
      showToast(
        isMe
          ? `You're ${STATUS_META[status].label.toLowerCase()} for ${perf?.title || "this gig"}`
          : `${name} marked ${STATUS_META[status].label.toLowerCase()}`,
        "success"
      );
    } catch {
      showToast("Couldn't save — check your connection and try again.", "error");
    } finally {
      setSavingFor(null);
    }
  };

  if (isLoading) {
    return (
      <HuddleLayout
        activeTab="master"
        onTabChange={() => {}}
        currentMemberName={currentMember?.name ?? null}
        onSwitchMember={clearMember}
      >
        <SectionSkeleton />
      </HuddleLayout>
    );
  }

  // Parse date
  let day = "??";
  let month = "—";
  if (perf?.date) {
    const [y, m, d] = perf.date.split("-").map(Number);
    const parsed = y && m && d ? new Date(y, m - 1, d) : null;
    day = parsed ? String(parsed.getDate()) : "??";
    month = parsed ? parsed.toLocaleString("default", { month: "short" }).toUpperCase() : "—";
  }

  const myStatus = currentMemberId ? availability[currentMemberId] : undefined;
  const responded = members.filter(mem => availability[mem.id]).length;
  const inCount = members.filter(mem => availability[mem.id] === "available").length;

  return (
    <HuddleLayout
      activeTab="master"
      onTabChange={() => {}}
      currentMemberName={currentMember?.name ?? null}
      onSwitchMember={clearMember}
    >
      <ConnectionBanner />
      {dataError && <ErrorBanner message={dataError} />}

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto py-4">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors min-h-11 px-3 bg-surface-container-low rounded-xl"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-bold text-primary bg-primary-container px-4 min-h-11 rounded-xl active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">share</span>
            Share Link
          </button>
        </div>

        {!perf ? (
          <div className="py-16 text-center bg-surface-container-low rounded-[2rem] border border-outline-variant/20 p-8">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">event_busy</span>
            <h2 className="font-bold text-xl text-on-surface">Gig Not Found</h2>
            <p className="text-sm text-on-surface-variant mt-2 mb-6">
              This gig may have been deleted or the link is incorrect.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center min-h-12 px-6 bg-primary text-on-primary rounded-xl font-bold text-sm"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] p-6 sm:p-8 shadow-md flex flex-col gap-6">
            {/* Gig Info */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-16 h-20 bg-primary-container rounded-2xl flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs font-black text-on-primary-container/70 tracking-wider">{month}</span>
                <span className="text-2xl font-black text-on-primary-container leading-none">{day}</span>
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <h1 className="font-headline font-black text-2xl text-on-surface leading-tight break-words">
                  {perf.title || "TBD Performance"}
                </h1>
                <p className="text-sm font-medium text-on-surface-variant mt-1.5 flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-base shrink-0">location_on</span>
                  <span className="truncate">{perf.location || "Location TBD"}</span>
                </p>
                {(perf.startTime || perf.endTime) && (
                  <p className="text-sm font-medium text-on-surface-variant mt-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base shrink-0">schedule</span>
                    {perf.startTime}{perf.endTime ? ` – ${perf.endTime}` : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Member Identity Selector */}
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Who is responding?
                </p>
                {currentMember && (
                  <span className="text-xs font-semibold text-primary">Self Selected</span>
                )}
              </div>
              
              <div className="relative">
                <select
                  value={currentMemberId ?? ""}
                  onChange={e => selectMember(e.target.value)}
                  className="w-full min-h-14 px-4 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-base font-bold text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="" disabled>-- Select your name from the band roster --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant pointer-events-none">
                  unfold_more
                </span>
              </div>
              {!currentMemberId && (
                <p className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Select your name to submit your RSVP.
                </p>
              )}
            </div>

            {/* Availability Response Buttons */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                Your Answer {currentMember ? `for ${currentMember.name}` : ""}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => currentMemberId && setStatus(currentMemberId, "available", currentMember?.name || "You")}
                  disabled={!currentMemberId || savingFor === currentMemberId}
                  aria-pressed={myStatus === "available"}
                  className={cn(
                    "h-14 rounded-2xl text-base font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.98] disabled:opacity-40",
                    myStatus === "available"
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                      : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                  I&apos;m In
                </button>
                <button
                  onClick={() => currentMemberId && setStatus(currentMemberId, "unavailable", currentMember?.name || "You")}
                  disabled={!currentMemberId || savingFor === currentMemberId}
                  aria-pressed={myStatus === "unavailable"}
                  className={cn(
                    "h-14 rounded-2xl text-base font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.98] disabled:opacity-40",
                    myStatus === "unavailable"
                      ? "bg-red-600 border-red-600 text-white shadow-sm"
                      : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  <span className="material-symbols-outlined text-2xl">cancel</span>
                  I&apos;m Out
                </button>
              </div>
              <button
                onClick={() => currentMemberId && setStatus(currentMemberId, "pending", currentMember?.name || "You")}
                disabled={!currentMemberId || savingFor === currentMemberId}
                aria-pressed={myStatus === "pending"}
                className={cn(
                  "mt-3 w-full h-14 rounded-2xl text-base font-bold border-2 transition-all active:scale-[0.98] disabled:opacity-40",
                  myStatus === "pending"
                    ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                    : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                Not sure yet
              </button>
              {!myStatus && currentMemberId && (
                <p className="mt-2 text-sm text-on-surface-variant text-center font-medium">You haven&apos;t answered yet for this gig.</p>
              )}
            </div>

            {/* Band Roster & Responses */}
            <div className="border-t border-outline-variant/20 pt-5">
              <button
                onClick={() => setIsRosterOpen(!isRosterOpen)}
                aria-expanded={isRosterOpen}
                className="w-full min-h-12 flex items-center justify-between gap-2 text-left"
              >
                <span className="text-base font-bold text-on-surface">
                  {responded} of {members.length} answered
                  <span className="text-on-surface-variant font-normal"> · {inCount} in</span>
                </span>
                <span className={cn(
                  "material-symbols-outlined text-on-surface-variant transition-transform",
                  isRosterOpen && "rotate-180"
                )}>
                  expand_more
                </span>
              </button>

              <div className="mt-2 h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: members.length ? `${(responded / members.length) * 100}%` : "0%" }}
                />
              </div>

              {isRosterOpen && (
                <ul className="mt-4 space-y-2">
                  {members.map(mem => {
                    const status = availability[mem.id];
                    const meta = status ? STATUS_META[status] : null;
                    return (
                      <li
                        key={mem.id}
                        className="min-h-12 px-4 py-2.5 rounded-2xl bg-surface-container-low flex items-center justify-between gap-3"
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span className={cn("w-3 h-3 rounded-full shrink-0", meta ? meta.dot : "bg-outline/40")} />
                          <span className="text-sm font-bold text-on-surface truncate">
                            {mem.name}
                            {mem.id === currentMemberId && <span className="text-on-surface-variant font-normal"> (you)</span>}
                          </span>
                        </span>

                        <div className="relative shrink-0">
                          <select
                            value={status ?? ""}
                            onChange={e => setStatus(mem.id, e.target.value as AvailabilityStatus, mem.name)}
                            disabled={savingFor === mem.id}
                            aria-label={`Availability for ${mem.name}`}
                            className={cn(
                              "min-h-10 pl-3 pr-8 rounded-xl border text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50",
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
          </div>
        )}
      </div>
    </HuddleLayout>
  );
}
