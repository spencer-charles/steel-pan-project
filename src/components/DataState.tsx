"use client";

import { useSyncExternalStore } from "react";

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** True when the browser thinks it has a network connection. */
export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true // assume online on the server so nothing flashes during hydration
  );
}

export function ConnectionBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900"
    >
      <span className="material-symbols-outlined text-xl shrink-0">cloud_off</span>
      <p className="text-sm font-bold">
        You&apos;re offline. Changes are saved on this device and will sync when you reconnect.
      </p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-900"
    >
      <span className="material-symbols-outlined text-xl shrink-0">error</span>
      <div className="min-w-0">
        <p className="text-sm font-bold">Couldn&apos;t load the latest data.</p>
        <p className="text-sm mt-0.5 break-words opacity-80">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 min-h-11 px-4 rounded-xl bg-red-600 text-white text-sm font-bold active:scale-[0.98] transition-transform"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/** Placeholder rows so a slow connection doesn't render as "nothing here". */
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-40 rounded-xl bg-surface-container-high animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-40 rounded-[2rem] bg-surface-container-low animate-pulse" />
        ))}
      </div>
    </div>
  );
}
