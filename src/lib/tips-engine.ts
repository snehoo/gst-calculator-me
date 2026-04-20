// Contextual tips engine.
//
// Implementation rule (from spec): no more than one tip is visible per *slot*
// at any time. Tips compete on `priority` — higher wins.
//
// Slots:
//   - "topBanner"     : sticky top strip (date-aware compliance reminders)
//   - "belowResult"   : single tip directly under the result breakdown
//   - "sidebar"       : swaps the default sidebar card for returning/seasonal users
//   - "inlineToggle"  : tiny one-liner under the transaction-type toggle
//   - "breakdownRow"  : extra row inserted into the breakdown table
//
// The WhatsApp share card and the 18%-tooltip are handled outside this engine
// because they have bespoke UI behaviour.

import type { SessionStats } from "./session-stats";
import { isDismissed } from "./session-stats";

export type Slot =
  | "topBanner"
  | "belowResult"
  | "sidebar"
  | "inlineToggle"
  | "breakdownRow";

export interface TipContext {
  slab: number;
  amount: number;
  type: "intra" | "inter";
  stats: SessionStats;
  /** today's day-of-month, 1-31 */
  day: number;
  /** today's 0-indexed month */
  month: number;
}

export interface Tip {
  id: string;
  slot: Slot;
  /** Higher = wins when multiple tips qualify for the same slot. */
  priority: number;
  /** "session" = forget on next page load. "persistent" = remember across visits. */
  persistence?: "session" | "persistent";
  /** If true, only show once ever (uses `seen` flag). */
  oncePerUser?: boolean;
  /** UI tone, used by the renderer to pick a colour. */
  tone: "info" | "warning" | "danger" | "success" | "muted";
  icon: string;
  /** HTML allowed in body (we control the strings). */
  body: string;
  /** Optional dismiss; if provided, tip can be closed and hidden for `days`. */
  dismissDays?: number;
  /** Eligibility predicate. */
  when: (c: TipContext) => boolean;
}

export const TIPS: Tip[] = [
  // ── COMPLIANCE / TOP BANNER (date-aware) ────────────────────────────────
  {
    id: "gstr3b-due",
    slot: "topBanner",
    priority: 100,
    tone: "warning",
    icon: "📅",
    dismissDays: 30,
    body:
      "<strong>Reminder:</strong> GSTR-3B for last month is due by the <strong>20th</strong>. Late filing attracts ₹50/day (₹20/day for nil returns).",
    when: (c) => c.day >= 15 && c.day <= 20,
  },
  {
    id: "gstr3b-late",
    slot: "topBanner",
    priority: 95,
    tone: "danger",
    icon: "💸",
    dismissDays: 3,
    body:
      "<strong>Already late?</strong> GSTR-3B fee is ₹50/day (₹20/day nil), capped at ₹10,000. Interest on unpaid tax is 18% p.a. — file now.",
    when: (c) => c.day >= 21 && c.day <= 31,
  },
  {
    id: "itc-deadline",
    slot: "topBanner",
    priority: 90,
    tone: "warning",
    icon: "⏰",
    dismissDays: 7,
    body:
      "<strong>ITC deadline:</strong> Input Tax Credit for the previous FY must be claimed by Nov 30 (or September return, whichever is earlier).",
    when: (c) => c.month >= 8 && c.month <= 10, // Sep–Nov
  },

  // ── BELOW-RESULT TIPS ───────────────────────────────────────────────────
  {
    id: "register-threshold",
    slot: "belowResult",
    priority: 100,
    tone: "danger",
    icon: "🚨",
    dismissDays: 1,
    body:
      "<strong>Registration alert:</strong> Annual turnover above ₹40L (goods) or ₹20L (services) requires GST registration. Unregistered businesses cannot legally collect GST.",
    // single transaction > ₹3.3L roughly implies > ₹40L annualised
    when: (c) => c.amount > 330_000,
  },
  {
    id: "eway-bill-inter",
    slot: "belowResult",
    priority: 85,
    tone: "warning",
    icon: "🛣️",
    body:
      "<strong>E-way bill required:</strong> Inter-state movement of goods worth more than ₹50,000 needs a valid e-way bill on the GST portal.",
    when: (c) => c.type === "inter" && c.amount > 50_000,
  },
  {
    id: "rcm-high-service",
    slot: "belowResult",
    priority: 70,
    tone: "info",
    icon: "💰",
    dismissDays: 1,
    body:
      "<strong>Reverse Charge (RCM):</strong> On certain services (legal fees, GTA freight, imported services), the recipient pays GST directly to the government. Check if RCM applies here.",
    when: (c) => c.slab === 18 && c.amount > 500_000,
  },
  {
    id: "slab-28-itc",
    slot: "belowResult",
    priority: 60,
    tone: "info",
    icon: "💡",
    body:
      "<strong>Did you know?</strong> Registered businesses can claim Input Tax Credit (ITC) on this 28% GST — offset it against GST you've paid on purchases.",
    when: (c) => c.slab === 28,
  },
  {
    id: "slab-0-zero-rated",
    slot: "belowResult",
    priority: 55,
    tone: "warning",
    icon: "⚠️",
    body:
      "<strong>Heads up:</strong> 0% (nil rate) is different from \"exempt\" supplies and \"zero-rated\" exports. All three mean no GST, but only zero-rated exports let you claim ITC refunds.",
    when: (c) => c.slab === 0,
  },
  {
    id: "slab-12-realestate",
    slot: "belowResult",
    priority: 50,
    tone: "info",
    icon: "🏠",
    body:
      "<strong>Real estate tip:</strong> 12% GST applies to under-construction property. Ready-to-move homes with an Occupancy Certificate are fully exempt.",
    when: (c) => c.slab === 12,
  },
  {
    id: "small-amount-explore",
    slot: "belowResult",
    priority: 20,
    tone: "muted",
    icon: "🧮",
    body:
      "Just exploring? If you're not a GST-registered business, you don't need to add GST — only registered businesses must charge GST on sales.",
    when: (c) => c.amount > 0 && c.amount < 500 && c.stats.calcCount <= 2,
  },

  // ── INLINE TOGGLE TIPS ──────────────────────────────────────────────────
  {
    id: "exports-zero-rated",
    slot: "inlineToggle",
    priority: 60,
    tone: "success",
    icon: "✈️",
    body:
      "<strong>Exporters:</strong> Exports are zero-rated. You pay 0% AND can claim a full refund of ITC on inputs. File LUT to export without paying IGST.",
    when: (c) => c.type === "inter",
  },
  {
    id: "healthcare-exempt",
    slot: "inlineToggle",
    priority: 40,
    tone: "muted",
    icon: "🏥",
    body:
      "Healthcare by hospitals/doctors and education by recognised institutions are fully exempt from GST.",
    when: (c) => c.slab === 5 && c.amount > 0 && c.amount < 5_000,
  },
  {
    id: "packaged-food-5",
    slot: "inlineToggle",
    priority: 35,
    tone: "info",
    icon: "🥦",
    body:
      "5% applies to <strong>packaged / branded</strong> food. Unpackaged staples (rice, wheat, vegetables, milk) are at 0%.",
    when: (c) => c.slab === 5 && c.amount >= 5_000,
  },

  // ── BREAKDOWN-ROW (spec: amount-based, inserted into breakdown table) ───
  {
    id: "eway-row",
    slot: "breakdownRow",
    priority: 50,
    tone: "warning",
    icon: "📦",
    body:
      "<strong>E-way bill required</strong> — generate at ewaybillgst.gov.in before dispatch.",
    when: (c) => c.type === "inter" && c.amount > 50_000,
  },

  // ── SIDEBAR (returning users / seasonal) ────────────────────────────────
  {
    id: "annual-return",
    slot: "sidebar",
    priority: 80,
    tone: "info",
    icon: "🔄",
    dismissDays: 14,
    body:
      "<strong>Annual return GSTR-9</strong> is due Dec 31 for the previous FY. Mandatory for businesses with turnover above ₹2 Cr.",
    when: (c) => c.month >= 9 && c.month <= 11, // Oct–Dec
  },
  {
    id: "composition-power",
    slot: "sidebar",
    priority: 70,
    tone: "info",
    icon: "📋",
    body:
      "<strong>Composition Scheme:</strong> Businesses up to ₹1.5 Cr (₹75L for services) can pay GST at 1–6% flat with quarterly filing. Simpler — but no ITC.",
    when: (c) => c.stats.visits >= 3,
  },
  {
    id: "gstr1-vs-3b-newbie",
    slot: "sidebar",
    priority: 60,
    tone: "info",
    icon: "📊",
    body:
      "<strong>Two key returns:</strong> GSTR-1 (sales, due 11th) reports invoices. GSTR-3B (due 20th) is the summary where you pay tax. Both are mandatory.",
    when: (c) => c.stats.visits <= 1,
  },
];

export function pickTip(slot: Slot, ctx: TipContext): Tip | null {
  let best: Tip | null = null;
  for (const t of TIPS) {
    if (t.slot !== slot) continue;
    if (isDismissed(ctx.stats, t.id)) continue;
    if (t.oncePerUser && ctx.stats.seen[t.id]) continue;
    if (!t.when(ctx)) continue;
    if (!best || t.priority > best.priority) best = t;
  }
  return best;
}

export function buildContext(args: {
  slab: number;
  amount: number;
  type: "intra" | "inter";
  stats: SessionStats;
}): TipContext {
  const now = new Date();
  return {
    slab: args.slab,
    amount: args.amount,
    type: args.type,
    stats: args.stats,
    day: now.getDate(),
    month: now.getMonth(),
  };
}
