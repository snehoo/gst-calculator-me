// Session + visit tracking. The backbone of the contextual-tip system.
// Persisted in localStorage so we can distinguish first-time vs power users,
// gate "show once" tips, and dismiss tips for N days.

const KEY = "gst-session-stats-v1";

export interface SessionStats {
  visits: number;              // total page loads, ever
  calcCount: number;           // calculations done, this session
  totalCalcs: number;          // calculations done, ever
  lastVisitISO: string;        // last visit date (YYYY-MM-DD)
  firstVisitISO: string;
  seen: Record<string, true>;  // tip ids shown-once flags
  dismissedUntil: Record<string, number>; // tip id -> epoch ms
}

const empty = (): SessionStats => ({
  visits: 0,
  calcCount: 0,
  totalCalcs: 0,
  lastVisitISO: "",
  firstVisitISO: new Date().toISOString().slice(0, 10),
  seen: {},
  dismissedUntil: {},
});

export function loadStats(): SessionStats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

export function saveStats(s: SessionStats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Bump visit counter on page load. Returns the new stats. */
export function bumpVisit(): SessionStats {
  const s = loadStats();
  s.visits += 1;
  s.calcCount = 0; // session-scoped
  s.lastVisitISO = new Date().toISOString().slice(0, 10);
  saveStats(s);
  return s;
}

export function markSeen(id: string) {
  const s = loadStats();
  s.seen[id] = true;
  saveStats(s);
}

export function dismissFor(id: string, days: number) {
  const s = loadStats();
  s.dismissedUntil[id] = Date.now() + days * 86_400_000;
  saveStats(s);
}

export function isDismissed(s: SessionStats, id: string) {
  const t = s.dismissedUntil[id];
  return typeof t === "number" && t > Date.now();
}
