"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Performance } from "@/hooks/usePerformances";
import { Song } from "@/hooks/useSongs";

import { useToast } from "@/components/ToastProvider";
import { Collapse } from "@/components/Collapse";
import { cn } from "@/lib/utils";

interface PerformancesSectionProps {
  performances: Performance[];
  songs: Song[];
  addPerformance: (perf: Omit<Performance, "id">) => Promise<string>;
  deletePerformance: (id: string) => Promise<void>;
  updatePerformance: (id: string, updates: Partial<Performance>) => Promise<void>;
}

export function PerformancesSection({
  performances,
  songs,
  addPerformance,
  deletePerformance,
  updatePerformance,
}: PerformancesSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const { showToast } = useToast();

  // Compare against today's local date string so a gig is "upcoming" all day.
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const upcoming = performances.filter(p => p.date >= todayKey);
  const past = performances.filter(p => p.date < todayKey);

  const handleAdd = async () => {
    if (!title.trim()) return setFormError("Give the gig a name.");
    if (!date) return setFormError("Pick a date.");
    if (startTime && endTime && endTime <= startTime) {
      return setFormError("The end time has to be after the start time.");
    }
    setFormError("");
    setSaving(true);
    try {
      await addPerformance({
        title: title.trim(), date, startTime, endTime,
        location: location.trim(), status: "pending", setlist: [],
      });
      setTitle(""); setDate(""); setLocation(""); setStartTime(""); setEndTime(""); setShowAdd(false);
      showToast(`Gig "${title.trim()}" scheduled`);
    } catch {
      setFormError("Couldn't save — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (perf: Performance) => {
    try {
      await deletePerformance(perf.id);
      showToast(`"${perf.title}" deleted`, "info");
    } catch {
      showToast("Couldn't delete that gig.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-3xl font-headline font-black tracking-tight text-on-surface">Gigs</h1>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-[0.2em]">Schedule &amp; Logistics</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={cn(
              "shrink-0 flex items-center gap-2 px-5 min-h-12 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm border border-black/5",
              showAdd ? "bg-surface-container-high text-on-surface" : "bg-primary-gradient text-white"
          )}
        >
          <span className="material-symbols-outlined text-lg">{showAdd ? "close" : "calendar_add_on"}</span>
          {showAdd ? "Cancel" : "Add Gig"}
        </button>
      </div>

      {/* Add Form */}
      <Collapse open={showAdd}>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-black/5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary px-1">New Gig Details</h3>
              <div className="space-y-3">
                <input
                  placeholder="Event name"
                  aria-label="Event name"
                  enterKeyHint="next"
                  className="w-full h-12 px-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/30 text-base outline-none placeholder:text-outline/60"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <input
                  placeholder="Location"
                  aria-label="Location"
                  autoComplete="street-address"
                  className="w-full h-12 px-4 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/30 text-base outline-none placeholder:text-outline/60"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
                <div>
                  <label htmlFor="gig-date" className="block text-sm font-bold text-on-surface-variant mb-1">Date</label>
                  <input
                    id="gig-date"
                    type="date"
                    className="w-full h-12 px-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/30 text-base outline-none text-on-surface"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                {/* Native time pickers need room — stacked on phones. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="gig-start" className="block text-sm font-bold text-on-surface-variant mb-1">Starts</label>
                    <input
                      id="gig-start"
                      type="time"
                      className="w-full h-12 px-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/30 text-base outline-none text-on-surface"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="gig-end" className="block text-sm font-bold text-on-surface-variant mb-1">Ends</label>
                    <input
                      id="gig-end"
                      type="time"
                      className="w-full h-12 px-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/30 text-base outline-none text-on-surface"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {formError && (
                <p role="alert" className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {formError}
                </p>
              )}
              <button
                onClick={handleAdd}
                disabled={saving}
                className="w-full h-12 bg-primary-gradient text-white rounded-lg text-base font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Gig"}
              </button>
            </div>
      </Collapse>

      {/* Upcoming */}
      <div className="grid grid-cols-1 gap-4">
        {upcoming.map((perf) => (
          <PerformanceCard
            key={perf.id}
            perf={perf}
            songs={songs}
            onDelete={() => handleDelete(perf)}
            onUpdate={(updates) => updatePerformance(perf.id, updates)}
          />
        ))}
        {upcoming.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl">event</span>
            </div>
            <p className="font-bold text-on-surface text-base">No upcoming gigs</p>
            <p className="text-sm text-on-surface-variant">Tap &ldquo;Add Gig&rdquo; to schedule one.</p>
          </div>
        )}
      </div>

      {/* Past — collapsed by default so it never buries what's next */}
      {past.length > 0 && (
        <div className="pb-32">
          <button
            onClick={() => setShowPast(!showPast)}
            aria-expanded={showPast}
            className="w-full min-h-12 flex items-center gap-2 text-on-surface-variant"
          >
            <span className={cn(
              "material-symbols-outlined transition-transform",
              showPast && "rotate-180"
            )}>expand_more</span>
            <span className="font-headline font-bold text-xl">Past gigs</span>
            <span className="bg-surface-container-high text-xs font-black px-2 py-0.5 rounded-full">{past.length}</span>
          </button>

          {showPast && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              {[...past].reverse().map((perf) => (
                <PerformanceCard
                  key={perf.id}
                  perf={perf}
                  songs={songs}
                  onDelete={() => handleDelete(perf)}
                  onUpdate={(updates) => updatePerformance(perf.id, updates)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PerformanceCard({
  perf,
  songs,
  onDelete,
  onUpdate
}: {
  perf: Performance,
  songs: Song[],
  onDelete: () => void,
  onUpdate: (u: Partial<Performance>) => Promise<void>
}) {
  const [showSetlist, setShowSetlist] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(perf.title);
  const [editDate, setEditDate] = useState(perf.date);
  const [editStartTime, setEditStartTime] = useState(perf.startTime || "");
  const [editEndTime, setEditEndTime] = useState(perf.endTime || "");
  const [editLocation, setEditLocation] = useState(perf.location || "");
  const [editError, setEditError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { showToast } = useToast();

  // Re-seed the editor from the latest snapshot each time it opens, so a
  // concurrent edit by someone else isn't silently reverted on save.
  const startEditing = () => {
    setEditTitle(perf.title);
    setEditDate(perf.date);
    setEditStartTime(perf.startTime || "");
    setEditEndTime(perf.endTime || "");
    setEditLocation(perf.location || "");
    setEditError("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return setEditError("The gig needs a name.");
    if (!editDate) return setEditError("The gig needs a date.");
    if (editStartTime && editEndTime && editEndTime <= editStartTime) {
      return setEditError("The end time has to be after the start time.");
    }
    setEditError("");
    try {
      await onUpdate({
        title: editTitle.trim(),
        date: editDate,
        startTime: editStartTime,
        endTime: editEndTime,
        location: editLocation.trim(),
      });
      setIsEditing(false);
      showToast("Gig details updated");
    } catch {
      setEditError("Couldn't save — check your connection and try again.");
    }
  };

  const updateSetlist = async (setlist: string[], message: string) => {
    try {
      await onUpdate({ setlist });
      showToast(message);
    } catch {
      showToast("Couldn't update the setlist.", "error");
    }
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
            <div className="space-y-3 mb-2">
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                aria-label="Gig name"
                className="w-full h-12 text-base font-bold bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Gig name"
              />
              <input
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
                aria-label="Location"
                autoComplete="street-address"
                className="w-full h-12 text-base bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Location"
              />
              <input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                aria-label="Date"
                className="w-full h-12 text-base bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="time"
                  value={editStartTime}
                  onChange={e => setEditStartTime(e.target.value)}
                  aria-label="Start time"
                  className="w-full h-12 text-base bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="time"
                  value={editEndTime}
                  onChange={e => setEditEndTime(e.target.value)}
                  aria-label="End time"
                  className="w-full h-12 text-base bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {editError && (
                <p role="alert" className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {editError}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-1">
              <h4 className="font-bold text-base text-on-surface leading-tight break-words">{perf.title}</h4>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                <p className="text-sm text-on-surface-variant truncate">{perf.location || "Location TBD"}</p>
                {(perf.startTime || perf.endTime) && (
                  <p className="text-sm text-primary font-bold">
                    {perf.startTime}{perf.endTime ? ` – ${perf.endTime}` : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-on-surface-variant font-semibold">
              {perf.setlist.length} {perf.setlist.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-1 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                aria-label="Save changes"
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">check</span>
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditError(""); }}
                aria-label="Cancel editing"
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/rsvp?id=${perf.id}`;
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: `RSVP: ${perf.title}`, url });
                    } else {
                      await navigator.clipboard.writeText(url);
                      showToast("RSVP link copied to clipboard!", "success");
                    }
                  } catch {
                    try {
                      await navigator.clipboard.writeText(url);
                      showToast("RSVP link copied to clipboard!", "success");
                    } catch {
                      showToast("Could not copy link", "error");
                    }
                  }
                }}
                aria-label="Share RSVP link"
                title="Share RSVP link"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </button>
              <button
                onClick={startEditing}
                aria-label="Edit gig"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
              <button
                onClick={() => setShowSetlist(!showSetlist)}
                aria-label="Manage setlist"
                aria-expanded={showSetlist}
                className={cn(
                   "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                   showSetlist ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container-low"
                )}
              >
                <span className="material-symbols-outlined text-xl">playlist_add_check</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete lives in edit mode only, and takes two taps to confirm. */}
      {isEditing && (
        <button
          onClick={() => {
            if (confirmDelete) onDelete();
            else {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 4000);
            }
          }}
          className={cn(
            "w-full min-h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-colors",
            confirmDelete
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          )}
        >
          <span className="material-symbols-outlined text-xl">delete</span>
          {confirmDelete ? "Tap again to delete for good" : "Delete this gig"}
        </button>
      )}

      <Collapse open={showSetlist}>
            <div className="grid grid-cols-1 gap-4 pt-2">
              {/* Setlist Management */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <h5 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Current Program</h5>
                </div>

                <div className="space-y-1.5">
                  {perf.setlist.map((songId, idx) => {
                    const song = songs.find(s => s.id === songId);
                    const move = (to: number) => {
                      const next = [...perf.setlist];
                      [next[idx], next[to]] = [next[to], next[idx]];
                      updateSetlist(next, "Setlist reordered");
                    };
                    return (
                      <div key={`${songId}-${idx}`} className="bg-surface-container-low p-2 rounded-2xl flex items-center gap-2 min-h-12">
                        <span className="text-sm font-bold text-on-surface-variant w-6 shrink-0 text-center">{idx + 1}</span>
                        <span className="font-bold text-sm text-on-surface flex-1 min-w-0 truncate">{song?.title || "Unknown Song"}</span>
                        <button
                          onClick={() => move(idx - 1)}
                          disabled={idx === 0}
                          aria-label={`Move ${song?.title || "song"} up`}
                          className="shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">arrow_upward</span>
                        </button>
                        <button
                          onClick={() => move(idx + 1)}
                          disabled={idx === perf.setlist.length - 1}
                          aria-label={`Move ${song?.title || "song"} down`}
                          className="shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">arrow_downward</span>
                        </button>
                        <button
                          onClick={() => updateSetlist(
                            perf.setlist.filter((_, i) => i !== idx),
                            `"${song?.title || "Song"}" removed`
                          )}
                          aria-label={`Remove ${song?.title || "song"} from setlist`}
                          className="shrink-0 min-w-11 min-h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                      </div>
                    );
                  })}

                  {perf.setlist.length === 0 && (
                    <div className="py-6 border-2 border-dashed border-outline-variant/40 rounded-2xl flex flex-col items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-2xl">queue_music</span>
                      <p className="text-sm font-bold mt-1">No songs yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Library Quick Add */}
              <div className="space-y-2">
                <h5 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant px-1">Add from Library</h5>
                <div className="max-h-[240px] overflow-y-auto pr-1 space-y-1">
                  {songs.filter(s => !perf.setlist.includes(s.id)).map(song => (
                    <button
                      key={song.id}
                      onClick={() => updateSetlist([...perf.setlist, song.id], `"${song.title}" added`)}
                      className="w-full text-left px-3 min-h-12 rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40 transition-all flex items-center justify-between gap-2"
                    >
                      <span className="text-sm font-semibold text-on-surface truncate">{song.title}</span>
                      <span className="material-symbols-outlined text-xl text-primary shrink-0">add</span>
                    </button>
                  ))}
                  {songs.filter(s => !perf.setlist.includes(s.id)).length === 0 && (
                    <p className="text-sm text-on-surface-variant py-3 px-1">Every song is already in this setlist.</p>
                  )}
                </div>
              </div>
            </div>
      </Collapse>
    </div>
  );
}
