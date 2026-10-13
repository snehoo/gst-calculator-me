// GST late fee + interest rules (CGST Act s.47 and s.50(1), as amended).
// Late fee caps per Notification 19/2021-CT (GSTR-3B) and 20/2021-CT (GSTR-1),
// applicable to returns from June 2021 onwards. Verified 2026-10-14.

export type ReturnType = "GSTR-3B" | "GSTR-1";
export type TurnoverSlab = "upto1.5" | "1.5to5" | "above5";

export const PER_DAY = { nil: 20, normal: 50 } as const; // total (half CGST, half SGST)
export const CAPS: Record<TurnoverSlab, number> = { "upto1.5": 2000, "1.5to5": 5000, above5: 10000 };
export const NIL_CAP = 500;
export const INTEREST_RATE = 0.18; // s.50(1): 18% p.a. on tax paid late (net cash liability)

const DAY_MS = 86_400_000;

/** Whole days late: due date itself is on time; the day after is day 1. */
export const daysBetween = (due: string, filed: string): number => {
  const d = Date.parse(due + "T00:00:00Z");
  const f = Date.parse(filed + "T00:00:00Z");
  if (Number.isNaN(d) || Number.isNaN(f)) return 0;
  return Math.max(0, Math.round((f - d) / DAY_MS));
};

export const lateFee = (days: number, nil: boolean, slab: TurnoverSlab) => {
  const perDay = nil ? PER_DAY.nil : PER_DAY.normal;
  const cap = nil ? NIL_CAP : CAPS[slab];
  const total = Math.min(days * perDay, cap);
  const capDay = Math.ceil(cap / perDay); // day on which the cap is reached
  return { perDay, cap, total, cgst: total / 2, sgst: total / 2, capped: days * perDay >= cap, capDay };
};

export const interest = (taxInCash: number, days: number) =>
  Math.round((Math.max(0, taxInCash) * INTEREST_RATE * days) / 365);

/** Monthly-filer due dates: GSTR-1 on the 11th, GSTR-3B on the 20th of the next month. */
export const monthlyDueDate = (type: ReturnType, period: string): string => {
  // period = "YYYY-MM"
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return "";
  const next = new Date(Date.UTC(y, m, type === "GSTR-1" ? 11 : 20)); // month index m = next month
  return next.toISOString().slice(0, 10);
};
