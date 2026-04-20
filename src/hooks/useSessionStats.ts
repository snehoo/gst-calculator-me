import { useCallback, useEffect, useState } from "react";
import {
  bumpVisit,
  dismissFor,
  loadStats,
  markSeen,
  saveStats,
  type SessionStats,
} from "@/lib/session-stats";

// Module-level guard: bumpVisit() runs exactly once per page load even though
// this hook is mounted by multiple components.
let bumpedThisLoad = false;

// Tiny in-process pubsub so all hook instances stay in sync when any one of
// them dismisses a tip / records a calculation.
const listeners = new Set<(s: SessionStats) => void>();
const broadcast = (s: SessionStats) => listeners.forEach((l) => l(s));

export function useSessionStats() {
  const [stats, setStats] = useState<SessionStats>(() => loadStats());

  useEffect(() => {
    const onChange = (s: SessionStats) => setStats(s);
    listeners.add(onChange);

    if (!bumpedThisLoad) {
      bumpedThisLoad = true;
      const next = bumpVisit();
      setStats(next);
      broadcast(next);
    } else {
      setStats(loadStats());
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "gst-session-stats-v1") setStats(loadStats());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const recordCalculation = useCallback(() => {
    const prev = loadStats();
    const next = { ...prev, calcCount: prev.calcCount + 1, totalCalcs: prev.totalCalcs + 1 };
    saveStats(next);
    broadcast(next);
  }, []);

  const dismiss = useCallback((id: string, days = 7) => {
    dismissFor(id, days);
    broadcast(loadStats());
  }, []);

  const see = useCallback((id: string) => {
    markSeen(id);
    broadcast(loadStats());
  }, []);

  return { stats, recordCalculation, dismiss, see };
}
