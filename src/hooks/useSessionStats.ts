import { useCallback, useEffect, useState } from "react";
import {
  bumpVisit,
  dismissFor,
  loadStats,
  markSeen,
  saveStats,
  type SessionStats,
} from "@/lib/session-stats";

export function useSessionStats() {
  const [stats, setStats] = useState<SessionStats>(() => loadStats());

  // Bump exactly once per page load.
  useEffect(() => {
    setStats(bumpVisit());
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
