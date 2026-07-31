"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "steelpan.currentMemberId";

// localStorage is an external store, so it's read through useSyncExternalStore
// rather than an effect — that keeps the server render and the hydration render
// in agreement without a cascading setState.
let listeners: (() => void)[] = [];
let cached: string | null = null;
let cacheValid = false;

function subscribe(onChange: () => void) {
  listeners.push(onChange);
  // Fires when another tab changes the identity.
  window.addEventListener("storage", onChange);
  return () => {
    listeners = listeners.filter(l => l !== onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  if (!cacheValid) {
    try {
      cached = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage blocked (private mode, embedded webview) — identity falls back
      // to session-only, which still beats no identity at all.
      cached = null;
    }
    cacheValid = true;
  }
  return cached;
}

function getServerSnapshot(): string | null {
  return null;
}

function write(value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, value);
  } catch {}
  cacheValid = false;
  listeners.forEach(l => l());
}

const neverResubscribe = () => () => {};

interface CurrentMemberContextType {
  currentMemberId: string | null;
  // False on the server and during hydration, so callers don't flash the
  // identity picker at someone who has already chosen.
  isReady: boolean;
  selectMember: (id: string) => void;
  clearMember: () => void;
}

const CurrentMemberContext = createContext<CurrentMemberContextType>({
  currentMemberId: null,
  isReady: false,
  selectMember: () => {},
  clearMember: () => {},
});

export function CurrentMemberProvider({ children }: { children: React.ReactNode }) {
  const currentMemberId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isReady = useSyncExternalStore(neverResubscribe, () => true, () => false);

  const selectMember = useCallback((id: string) => write(id), []);
  const clearMember = useCallback(() => write(null), []);

  return (
    <CurrentMemberContext.Provider value={{ currentMemberId, isReady, selectMember, clearMember }}>
      {children}
    </CurrentMemberContext.Provider>
  );
}

export const useCurrentMember = () => useContext(CurrentMemberContext);
