import { useCallback, useEffect, useState } from "react";
import {
  bumpVisit,
  dismissFor,
  loadStats,
  markSeen,
  saveStats,
  type SessionStats,
} from "@/lib/session-stats";

// Module-level guard: ensure bumpVisit() runs exactly once per page load,
// even though this hook is mounted by multiple components.
let bumpedThisLoad = false;

export function useSessionStats() {
  const [stats, setStats] = useState<SessionStats>(() => loadStats());

  useEffect(() => {
    if (bumpedThisLoad) {
      setStats(loadStats());
      return;
    }
    bumpedThisLoad = true;
    setStats(bumpVisit());

    // Cross-tab/component sync: when stats change elsewhere, refresh.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "gst-session-stats-v1") setStats(loadStats());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const recordCalculation = useCallback(() => {
    setStats((prev) => {
      const next = { ...prev, calcCount: prev.calcCount + 1, totalCalcs: prev.totalCalcs + 1 };
      saveStats(next);
      return next;
    });
  }, []);

  const dismiss = useCallback((id: string, days = 7) => {
    dismissFor(id, days);
    setStats(loadStats());
  }, []);

  const see = useCallback((id: string) => {
    markSeen(id);
    setStats(loadStats());
  }, []);

  return { stats, recordCalculation, dismiss, see };
}
