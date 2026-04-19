"use client";

import React, { useState } from "react";
import { Member } from "@/hooks/useMembers";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";

interface PersonnelSectionProps {
  members: Member[];
  addMember: (member: Omit<Member, "id">) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

export function PersonnelSection({ members, addMember, deleteMember }: PersonnelSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  const filteredMembers = members.filter(m =>
    (m.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await addMember({ name: name.trim(), email: "", instruments: [], role: "member" });
      setName("");
      setShowAdd(false);
      showToast(`${name.trim()} added to the roster`);
    } catch (e) {
      showToast("Failed to add player", "error");
    }
  };

  const handleDelete = async (member: Member) => {
    if (confirmDeleteId === member.id) {
      try {
        await deleteMember(member.id);
        showToast(`${member.name} removed from roster`, "info");
        setConfirmDeleteId(null);
      } catch (e) {
        showToast("Failed to remove player", "error");
      }
    } else {
      setConfirmDeleteId(member.id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <section className="mt-4">
        <span className="font-headline text-sm tracking-widest uppercase font-bold text-primary mb-1 block">Management</span>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Band Personnel</h1>
            <button
                onClick={() => setShowAdd(!showAdd)}
                className={cn(
                    "flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm border border-black/5",
                    showAdd ? "bg-surface-container-high text-on-surface" : "bg-primary-gradient text-white"
                )}
            >
                {showAdd ? "Cancel" : <><span className="material-symbols-outlined text-sm">person_add</span> Add Player</>}
            </button>
          </div>
      </section>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-black/5 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary px-1">Register New Player</h3>
          <div className="flex gap-3">
            <input
              placeholder="Full Name"
              className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/40 text-sm placeholder:text-zinc-400" 
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="bg-primary-gradient text-on-primary font-bold px-6 rounded-lg disabled:opacity-40 text-sm active:scale-95 transition-transform"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Search & Refine */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 text-zinc-400">group</span>
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-container-low border-none rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/40 text-sm placeholder:text-zinc-400" 
          placeholder="Search roster..." 
          type="text" 
        />
        {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 text-zinc-400 hover:text-zinc-600">
                <span className="material-symbols-outlined text-sm">close</span>
            </button>
        )}
      </div>

      {/* Member Grid */}
      <div className="grid grid-cols-1 gap-2">
        {filteredMembers.map((member) => {
          const isConfirming = confirmDeleteId === member.id;
          return (
            <div
              key={member.id}
              className={cn(
                "bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm border border-black/5 transition-all",
                isConfirming && "border-error bg-error/5"
              )}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm",
                  isConfirming ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container"
                )}>
                  {member.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-on-surface truncate">
                    {member.name || "Unnamed Player"}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {member.role || "Member"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(member)}
                className={cn(
                  "shrink-0 ml-2 px-3 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all",
                  isConfirming
                    ? "bg-error text-white"
                    : "text-zinc-300 hover:text-error hover:bg-error/10"
                )}
              >
                {isConfirming ? "Confirm" : <span className="material-symbols-outlined text-lg">delete</span>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-16 opacity-30">
          <span className="material-symbols-outlined text-5xl mb-4">group_off</span>
          <p className="font-bold uppercase tracking-widest text-xs">
            {search ? "No matches found" : "Roster is currently empty"}
          </p>
        </div>
      )}
    </div>
  );
}
