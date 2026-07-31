"use client";

import { useMemo, useState } from "react";
import { Member } from "@/hooks/useMembers";
import { useCurrentMember } from "@/context/CurrentMemberContext";
import { useToast } from "@/components/ToastProvider";

interface IdentityGateProps {
  members: Member[];
  loading: boolean;
  addMember: (member: Omit<Member, "id">) => Promise<string>;
}

export function IdentityGate({ members, loading, addMember }: IdentityGateProps) {
  const { selectMember } = useCurrentMember();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? members.filter(m => m.name.toLowerCase().includes(q)) : members;
  }, [members, search]);

  const handleAddSelf = async () => {
    const name = newName.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      const id = await addMember({ name, email: "", role: "member", instruments: [] });
      selectMember(id);
      showToast(`Welcome, ${name}!`, "success");
    } catch {
      showToast("Couldn't add you to the roster. Check your connection.", "error");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface px-6 py-12 flex flex-col">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Seattle Steel Pan Project
          </p>
          <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface">
            Who are you?
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Pick your name once. We&apos;ll remember it on this device so you can sign up for gigs
            in a single tap.
          </p>
        </div>

        {isAdding ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="new-name" className="block text-sm font-bold text-on-surface mb-2">
                Your full name
              </label>
              <input
                id="new-name"
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddSelf()}
                placeholder="e.g. Alex Rivera"
                autoFocus
                autoComplete="name"
                enterKeyHint="done"
                className="w-full h-14 px-4 text-base bg-surface-container-lowest border border-outline-variant/30 rounded-2xl outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary placeholder:text-outline/60"
              />
            </div>
            <button
              onClick={handleAddSelf}
              disabled={!newName.trim() || saving}
              className="w-full h-14 rounded-2xl bg-primary text-on-primary text-base font-bold active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              {saving ? "Adding you…" : "Add me to the roster"}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="w-full h-12 rounded-2xl text-base font-bold text-on-surface-variant active:scale-[0.98] transition-transform"
            >
              Back to the list
            </button>
          </div>
        ) : (
          <>
            {members.length > 8 && (
              <div className="relative mb-4">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  search
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Find your name"
                  enterKeyHint="search"
                  className="w-full h-14 pl-12 pr-4 text-base bg-surface-container-lowest border border-outline-variant/30 rounded-2xl outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary placeholder:text-outline/60"
                />
              </div>
            )}

            <div className="flex-1 space-y-2">
              {loading && members.length === 0 ? (
                [0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 rounded-2xl bg-surface-container-low animate-pulse" />
                ))
              ) : filtered.length > 0 ? (
                filtered.map(m => (
                  <button
                    key={m.id}
                    onClick={() => selectMember(m.id)}
                    className="w-full min-h-14 px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-3 text-left active:scale-[0.98] transition-transform hover:border-primary/40"
                  >
                    <span className="w-10 h-10 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold">
                      {m.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-base font-bold text-on-surface truncate">{m.name}</span>
                  </button>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-on-surface-variant">
                  {search ? `No one matching "${search}"` : "The roster is empty."}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setNewName(search.trim());
                setIsAdding(true);
              }}
              className="mt-6 w-full h-14 rounded-2xl border-2 border-dashed border-outline-variant/40 text-base font-bold text-on-surface-variant active:scale-[0.98] transition-transform"
            >
              I&apos;m not on this list
            </button>
          </>
        )}
      </div>
    </div>
  );
}
