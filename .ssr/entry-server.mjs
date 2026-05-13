// src/entry-server.tsx
import { renderToString } from "react-dom/server";

// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server.js";

// src/components/ui/sonner.tsx
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { jsx } from "react/jsx-runtime";
var Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Sonner,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};

// src/hooks/use-toast.ts
import * as React from "react";
var TOAST_LIMIT = 1;
var TOAST_REMOVE_DELAY = 1e6;
var count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
var toastTimeouts = /* @__PURE__ */ new Map();
var addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
var reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast3) => {
          addToRemoveQueue(toast3.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
var listeners = [];
var memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast2({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast: toast2,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}

// src/components/ui/toast.tsx
import * as React2 from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/ui/toast.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var ToastProvider = ToastPrimitives.Provider;
var ToastViewport = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
var toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var Toast = React2.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx2(ToastPrimitives.Root, { ref, className: cn(toastVariants({ variant }), className), ...props });
});
Toast.displayName = ToastPrimitives.Root.displayName;
var ToastAction = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
var ToastClose = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx2(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
var ToastTitle = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(ToastPrimitives.Title, { ref, className: cn("text-sm font-semibold", className), ...props }));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
var ToastDescription = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(ToastPrimitives.Description, { ref, className: cn("text-sm opacity-90", className), ...props }));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// src/components/ui/toaster.tsx
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
function Toaster2() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx3(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx3(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx3(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx3(ToastViewport, {})
  ] });
}

// src/components/ui/tooltip.tsx
import * as React3 from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { jsx as jsx4 } from "react/jsx-runtime";
var TooltipProvider = TooltipPrimitive.Provider;
var TooltipContent = React3.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx4(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// src/pages/Index.tsx
import { useEffect as useEffect4, useMemo as useMemo2, useState as useState5 } from "react";
import { X as X3 } from "lucide-react";

// src/components/GSTCalculator.tsx
import { useEffect as useEffect3, useMemo, useRef, useState as useState4 } from "react";

// src/hooks/useSessionStats.ts
import { useCallback, useEffect as useEffect2, useState as useState2 } from "react";

// src/lib/session-stats.ts
var KEY = "gst-session-stats-v1";
var empty = () => ({
  visits: 0,
  calcCount: 0,
  totalCalcs: 0,
  lastVisitISO: "",
  firstVisitISO: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  seen: {},
  dismissedUntil: {}
});
function loadStats() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}
function saveStats(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
  }
}
function bumpVisit() {
  const s = loadStats();
  s.visits += 1;
  s.calcCount = 0;
  s.lastVisitISO = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  saveStats(s);
  return s;
}
function markSeen(id) {
  const s = loadStats();
  s.seen[id] = true;
  saveStats(s);
}
function dismissFor(id, days) {
  const s = loadStats();
  s.dismissedUntil[id] = Date.now() + days * 864e5;
  saveStats(s);
}
function isDismissed(s, id) {
  const t = s.dismissedUntil[id];
  return typeof t === "number" && t > Date.now();
}

// src/hooks/useSessionStats.ts
var bumpedThisLoad = false;
var listeners2 = /* @__PURE__ */ new Set();
var broadcast = (s) => listeners2.forEach((l) => l(s));
function useSessionStats() {
  const [stats, setStats] = useState2(() => loadStats());
  useEffect2(() => {
    const onChange = (s) => setStats(s);
    listeners2.add(onChange);
    if (!bumpedThisLoad) {
      bumpedThisLoad = true;
      const next = bumpVisit();
      setStats(next);
      broadcast(next);
    } else {
      setStats(loadStats());
    }
    const onStorage = (e) => {
      if (e.key === "gst-session-stats-v1") setStats(loadStats());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners2.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const recordCalculation = useCallback(() => {
    const prev = loadStats();
    const next = { ...prev, calcCount: prev.calcCount + 1, totalCalcs: prev.totalCalcs + 1 };
    saveStats(next);
    broadcast(next);
  }, []);
  const dismiss = useCallback((id, days = 7) => {
    dismissFor(id, days);
    broadcast(loadStats());
  }, []);
  const see = useCallback((id) => {
    markSeen(id);
    broadcast(loadStats());
  }, []);
  return { stats, recordCalculation, dismiss, see };
}

// src/lib/tips-engine.ts
var TIPS = [
  // ── COMPLIANCE / TOP BANNER (date-aware) ────────────────────────────────
  {
    id: "gstr3b-due",
    slot: "topBanner",
    priority: 100,
    tone: "warning",
    icon: "\u{1F4C5}",
    dismissDays: 30,
    body: "<strong>Reminder:</strong> GSTR-3B for last month is due by the <strong>20th</strong>. Late filing attracts \u20B950/day (\u20B920/day for nil returns).",
    when: (c) => c.day >= 15 && c.day <= 20
  },
  {
    id: "gstr3b-late",
    slot: "topBanner",
    priority: 95,
    tone: "danger",
    icon: "\u{1F4B8}",
    dismissDays: 3,
    body: "<strong>Already late?</strong> GSTR-3B fee is \u20B950/day (\u20B920/day nil), capped at \u20B910,000. Interest on unpaid tax is 18% p.a. \u2014 file now.",
    when: (c) => c.day >= 21 && c.day <= 31
  },
  {
    id: "itc-deadline",
    slot: "topBanner",
    priority: 90,
    tone: "warning",
    icon: "\u23F0",
    dismissDays: 7,
    body: "<strong>ITC deadline:</strong> Input Tax Credit for the previous FY must be claimed by Nov 30 (or September return, whichever is earlier).",
    when: (c) => c.month >= 8 && c.month <= 10
    // Sep–Nov
  },
  // ── BELOW-RESULT TIPS ───────────────────────────────────────────────────
  {
    id: "register-threshold",
    slot: "belowResult",
    priority: 100,
    tone: "danger",
    icon: "\u{1F6A8}",
    dismissDays: 1,
    body: "<strong>Registration alert:</strong> Annual turnover above \u20B940L (goods) or \u20B920L (services) requires GST registration. Unregistered businesses cannot legally collect GST.",
    // single transaction > ₹3.3L roughly implies > ₹40L annualised
    when: (c) => c.amount > 33e4
  },
  {
    id: "eway-bill-inter",
    slot: "belowResult",
    priority: 85,
    tone: "warning",
    icon: "\u{1F6E3}\uFE0F",
    body: "<strong>E-way bill required:</strong> Inter-state movement of goods worth more than \u20B950,000 needs a valid e-way bill on the GST portal.",
    when: (c) => c.type === "inter" && c.amount > 5e4
  },
  {
    id: "rcm-high-service",
    slot: "belowResult",
    priority: 70,
    tone: "info",
    icon: "\u{1F4B0}",
    dismissDays: 1,
    body: "<strong>Reverse Charge (RCM):</strong> On certain services (legal fees, GTA freight, imported services), the recipient pays GST directly to the government. Check if RCM applies here.",
    when: (c) => c.slab === 18 && c.amount > 5e5
  },
  {
    id: "slab-28-itc",
    slot: "belowResult",
    priority: 60,
    tone: "info",
    icon: "\u{1F4A1}",
    body: "<strong>Did you know?</strong> Registered businesses can claim Input Tax Credit (ITC) on this 28% GST \u2014 offset it against GST you've paid on purchases.",
    when: (c) => c.slab === 28
  },
  {
    id: "slab-0-zero-rated",
    slot: "belowResult",
    priority: 55,
    tone: "warning",
    icon: "\u26A0\uFE0F",
    body: '<strong>Heads up:</strong> 0% (nil rate) is different from "exempt" supplies and "zero-rated" exports. All three mean no GST, but only zero-rated exports let you claim ITC refunds.',
    when: (c) => c.slab === 0
  },
  {
    id: "slab-12-realestate",
    slot: "belowResult",
    priority: 50,
    tone: "info",
    icon: "\u{1F3E0}",
    body: "<strong>Real estate tip:</strong> 12% GST applies to under-construction property. Ready-to-move homes with an Occupancy Certificate are fully exempt.",
    when: (c) => c.slab === 12
  },
  {
    id: "small-amount-explore",
    slot: "belowResult",
    priority: 20,
    tone: "muted",
    icon: "\u{1F9EE}",
    body: "Just exploring? If you're not a GST-registered business, you don't need to add GST \u2014 only registered businesses must charge GST on sales.",
    when: (c) => c.amount > 0 && c.amount < 500 && c.stats.calcCount <= 2
  },
  // ── INLINE TOGGLE TIPS ──────────────────────────────────────────────────
  {
    id: "exports-zero-rated",
    slot: "inlineToggle",
    priority: 60,
    tone: "success",
    icon: "\u2708\uFE0F",
    body: "<strong>Exporters:</strong> Exports are zero-rated. You pay 0% AND can claim a full refund of ITC on inputs. File LUT to export without paying IGST.",
    when: (c) => c.type === "inter"
  },
  {
    id: "healthcare-exempt",
    slot: "inlineToggle",
    priority: 40,
    tone: "muted",
    icon: "\u{1F3E5}",
    body: "Healthcare by hospitals/doctors and education by recognised institutions are fully exempt from GST.",
    when: (c) => c.slab === 5 && c.amount > 0 && c.amount < 5e3
  },
  {
    id: "packaged-food-5",
    slot: "inlineToggle",
    priority: 35,
    tone: "info",
    icon: "\u{1F966}",
    body: "5% applies to <strong>packaged / branded</strong> food. Unpackaged staples (rice, wheat, vegetables, milk) are at 0%.",
    when: (c) => c.slab === 5 && c.amount >= 5e3
  },
  // ── BREAKDOWN-ROW (spec: amount-based, inserted into breakdown table) ───
  {
    id: "eway-row",
    slot: "breakdownRow",
    priority: 50,
    tone: "warning",
    icon: "\u{1F4E6}",
    body: "<strong>E-way bill required</strong> \u2014 generate at ewaybillgst.gov.in before dispatch.",
    when: (c) => c.type === "inter" && c.amount > 5e4
  },
  // ── SIDEBAR (returning users / seasonal) ────────────────────────────────
  {
    id: "annual-return",
    slot: "sidebar",
    priority: 80,
    tone: "info",
    icon: "\u{1F504}",
    dismissDays: 14,
    body: "<strong>Annual return GSTR-9</strong> is due Dec 31 for the previous FY. Mandatory for businesses with turnover above \u20B92 Cr.",
    when: (c) => c.month >= 9 && c.month <= 11
    // Oct–Dec
  },
  {
    id: "composition-power",
    slot: "sidebar",
    priority: 70,
    tone: "info",
    icon: "\u{1F4CB}",
    body: "<strong>Composition Scheme:</strong> Businesses up to \u20B91.5 Cr (\u20B975L for services) can pay GST at 1\u20136% flat with quarterly filing. Simpler \u2014 but no ITC.",
    when: (c) => c.stats.visits >= 3
  },
  {
    id: "gstr1-vs-3b-newbie",
    slot: "sidebar",
    priority: 60,
    tone: "info",
    icon: "\u{1F4CA}",
    body: "<strong>Two key returns:</strong> GSTR-1 (sales, due 11th) reports invoices. GSTR-3B (due 20th) is the summary where you pay tax. Both are mandatory.",
    when: (c) => c.stats.visits <= 1
  }
];
function pickTip(slot, ctx) {
  let best = null;
  for (const t of TIPS) {
    if (t.slot !== slot) continue;
    if (isDismissed(ctx.stats, t.id)) continue;
    if (t.oncePerUser && ctx.stats.seen[t.id]) continue;
    if (!t.when(ctx)) continue;
    if (!best || t.priority > best.priority) best = t;
  }
  return best;
}
function buildContext(args) {
  const now = /* @__PURE__ */ new Date();
  return {
    slab: args.slab,
    amount: args.amount,
    type: args.type,
    stats: args.stats,
    day: now.getDate(),
    month: now.getMonth()
  };
}

// src/components/ContextualTip.tsx
import { X as X2 } from "lucide-react";
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
var TONE = {
  info: "bg-br-igst border-l-4 border-primary text-foreground",
  warning: "bg-warning-light border-l-4 border-warning-border text-warning-text",
  danger: "bg-destructive/10 border-l-4 border-destructive text-foreground",
  success: "bg-br-sgst border-l-4 border-success text-foreground",
  muted: "bg-muted border-l-4 border-border text-muted-foreground"
};
function ContextualTip({ tip, onDismiss, compact, className }) {
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      role: "status",
      className: cn(
        "rounded-lg flex items-start gap-2.5 animate-fade-in",
        compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-[13px] leading-relaxed",
        TONE[tip.tone],
        className
      ),
      children: [
        /* @__PURE__ */ jsx5("span", { className: "text-base leading-none mt-0.5", "aria-hidden": true, children: tip.icon }),
        /* @__PURE__ */ jsx5("span", { className: "flex-1", dangerouslySetInnerHTML: { __html: tip.body } }),
        tip.dismissDays && onDismiss && /* @__PURE__ */ jsx5(
          "button",
          {
            onClick: () => onDismiss(tip),
            className: "opacity-60 hover:opacity-100 transition-opacity -mr-1 mt-0.5",
            "aria-label": "Dismiss tip",
            children: /* @__PURE__ */ jsx5(X2, { className: "h-3.5 w-3.5" })
          }
        )
      ]
    }
  );
}

// src/components/ShareResult.tsx
import { useState as useState3 } from "react";
import { Check, Copy, Mail, Share2 } from "lucide-react";
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var SITE = "gstcalculator.me";
var fmt = (n) => "\u20B9" + Math.round(n).toLocaleString("en-IN");
function buildMessage({ base, gstAmt, total, slab, type }) {
  const taxLabel = type === "inter" ? `IGST ${slab}%` : `GST ${slab}%`;
  return [
    `*GST Calculation*`,
    `Base: ${fmt(base)}`,
    `${taxLabel}: ${fmt(gstAmt)}`,
    `Total: ${fmt(total)}`,
    ``,
    `Calculated at ${SITE}`
  ].join("\n");
}
function ShareResult(props) {
  const [copied, setCopied] = useState3(false);
  const msg = buildMessage(props);
  const isLarge = props.base > 1e5;
  const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  const mailto = `mailto:?subject=${encodeURIComponent(
    "GST Calculation"
  )}&body=${encodeURIComponent(msg)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
    }
  };
  return /* @__PURE__ */ jsxs3("div", { className: "rounded-xl border border-border bg-card p-3.5 space-y-2.5", children: [
    /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx6("div", { className: "text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wider", children: "\u{1F4F2} Share this calculation" }),
      /* @__PURE__ */ jsxs3(
        "button",
        {
          onClick: copy,
          className: cn(
            "text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors",
            copied ? "border-success text-success bg-success/10" : "border-border text-muted-foreground hover:text-foreground hover:border-primary"
          ),
          children: [
            copied ? /* @__PURE__ */ jsx6(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx6(Copy, { className: "h-3 w-3" }),
            copied ? "Copied" : "Copy"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx6("pre", { className: "bg-muted rounded-md p-2.5 text-[11.5px] leading-relaxed text-foreground whitespace-pre-wrap font-sans", children: msg }),
    /* @__PURE__ */ jsxs3("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs3(
        "a",
        {
          href: wa,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-success text-success-foreground text-xs font-semibold hover:opacity-90 transition-opacity",
          children: [
            /* @__PURE__ */ jsx6(Share2, { className: "h-3.5 w-3.5" }),
            "Share on WhatsApp"
          ]
        }
      ),
      isLarge && /* @__PURE__ */ jsxs3(
        "a",
        {
          href: mailto,
          className: "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors",
          children: [
            /* @__PURE__ */ jsx6(Mail, { className: "h-3.5 w-3.5" }),
            "Email to my CA"
          ]
        }
      )
    ] })
  ] });
}

// src/components/GSTCalculator.tsx
import { Fragment, jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
var SLABS = [0, 5, 12, 18, 28];
var STORAGE_KEY = "gst-calc-state-v1";
var TOOLTIP_18_KEY = "gst-tip-18-seen";
var DEFAULT_STATE = {
  amount: "10000",
  slab: 18,
  mode: "excl",
  type: "intra"
};
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      amount: typeof parsed.amount === "string" ? parsed.amount : DEFAULT_STATE.amount,
      slab: SLABS.includes(parsed.slab) ? parsed.slab : DEFAULT_STATE.slab,
      mode: parsed.mode === "incl" ? "incl" : "excl",
      type: parsed.type === "inter" ? "inter" : "intra"
    };
  } catch {
    return DEFAULT_STATE;
  }
}
var fmt2 = (n) => "\u20B9" + Math.round(n).toLocaleString("en-IN");
function GSTCalculator() {
  const [state, setState] = useState4(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState4(false);
  const { stats, recordCalculation, dismiss } = useSessionStats();
  const [show18Tooltip, setShow18Tooltip] = useState4(false);
  const lastSlabRef = useRef(null);
  const [tipsReady, setTipsReady] = useState4(false);
  const tipDelayRef = useRef(null);
  useEffect3(() => {
    setState(loadState());
    setHydrated(true);
  }, []);
  useEffect3(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);
  useEffect3(() => {
    if (!hydrated) return;
    if (!parseFloat(state.amount)) return;
    recordCalculation();
    setTipsReady(false);
    if (tipDelayRef.current) window.clearTimeout(tipDelayRef.current);
    tipDelayRef.current = window.setTimeout(() => setTipsReady(true), 600);
    return () => {
      if (tipDelayRef.current) window.clearTimeout(tipDelayRef.current);
    };
  }, [state.amount, state.slab, state.mode, state.type, hydrated]);
  const { base, gstAmt, total } = useMemo(() => {
    const raw = parseFloat(state.amount) || 0;
    const rate = state.slab / 100;
    let base2, gstAmt2;
    if (state.mode === "excl") {
      base2 = raw;
      gstAmt2 = base2 * rate;
    } else {
      gstAmt2 = raw * rate / (1 + rate);
      base2 = raw - gstAmt2;
    }
    return { base: base2, gstAmt: gstAmt2, total: base2 + gstAmt2 };
  }, [state]);
  const half = state.slab / 2;
  const ctx = useMemo(
    () => buildContext({ slab: state.slab, amount: base, type: state.type, stats }),
    [state.slab, state.type, base, stats]
  );
  const belowResultTip = tipsReady ? pickTip("belowResult", ctx) : null;
  const inlineToggleTip = pickTip("inlineToggle", ctx);
  const breakdownRowTip = pickTip("breakdownRow", ctx);
  const handleSlab = (s) => {
    setState((st) => ({ ...st, slab: s }));
    if (s === 18 && lastSlabRef.current !== 18) {
      try {
        if (!localStorage.getItem(TOOLTIP_18_KEY)) {
          setShow18Tooltip(true);
          localStorage.setItem(TOOLTIP_18_KEY, "1");
          window.setTimeout(() => setShow18Tooltip(false), 6e3);
        }
      } catch {
      }
    }
    lastSlabRef.current = s;
  };
  return /* @__PURE__ */ jsxs4("div", { className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm", children: [
    /* @__PURE__ */ jsx7("div", { className: "px-5 py-4 bg-primary text-primary-foreground text-sm font-semibold", children: "Enter Amount & GST Details" }),
    /* @__PURE__ */ jsxs4("div", { className: "p-5 space-y-5", children: [
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx7("label", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2", children: "Amount (\u20B9)" }),
        /* @__PURE__ */ jsxs4("div", { className: "relative", children: [
          /* @__PURE__ */ jsx7("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold", children: "\u20B9" }),
          /* @__PURE__ */ jsx7(
            "input",
            {
              type: "number",
              inputMode: "decimal",
              min: "0",
              value: state.amount,
              onChange: (e) => setState((s) => ({ ...s, amount: e.target.value })),
              className: "w-full pl-8 pr-3 py-3 border-[1.5px] border-border rounded-lg text-base font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 bg-card text-foreground"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx7("label", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2", children: "Select GST Slab" }),
        /* @__PURE__ */ jsx7("div", { className: "grid grid-cols-5 gap-2", children: SLABS.map((s) => /* @__PURE__ */ jsxs4("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs4(
            "button",
            {
              onClick: () => handleSlab(s),
              className: cn(
                "w-full py-2.5 rounded-lg border-[1.5px] text-sm font-semibold transition-all",
                state.slab === s ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30" : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
              ),
              children: [
                s,
                "%"
              ]
            }
          ),
          s === 18 && show18Tooltip && /* @__PURE__ */ jsxs4(
            "div",
            {
              role: "tooltip",
              onClick: () => setShow18Tooltip(false),
              className: "absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-[240px] sm:w-[280px] px-3 py-2 rounded-lg bg-primary-dark text-primary-foreground text-[11px] leading-relaxed shadow-lg animate-fade-in cursor-pointer",
              children: [
                "\u{1F4A1} 18% covers most IT services, telecom, financial services, AC restaurants & most electronics. The default for services.",
                /* @__PURE__ */ jsx7("span", { className: "absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary-dark" })
              ]
            }
          )
        ] }, s)) })
      ] }),
      /* @__PURE__ */ jsx7(
        SegmentedToggle,
        {
          label: "Calculation Mode",
          value: state.mode,
          onChange: (m) => setState((s) => ({ ...s, mode: m })),
          options: [
            { value: "excl", label: "Add GST (Exclusive)" },
            { value: "incl", label: "Remove GST (Inclusive)" }
          ]
        }
      ),
      /* @__PURE__ */ jsx7(
        SegmentedToggle,
        {
          label: "Transaction Type",
          value: state.type,
          onChange: (t) => setState((s) => ({ ...s, type: t })),
          options: [
            { value: "intra", label: "Intra-state (CGST+SGST)" },
            { value: "inter", label: "Inter-state (IGST)" }
          ]
        }
      ),
      inlineToggleTip && /* @__PURE__ */ jsx7(ContextualTip, { tip: inlineToggleTip, compact: true }),
      /* @__PURE__ */ jsxs4("div", { className: "rounded-xl bg-primary-light p-5 text-center", children: [
        /* @__PURE__ */ jsx7("div", { className: "text-[0.7rem] font-semibold text-primary-dark uppercase tracking-wider", children: "Total Amount Payable" }),
        /* @__PURE__ */ jsx7("div", { className: "text-4xl font-bold text-primary-dark mt-1 tabular-nums", children: fmt2(total) }),
        /* @__PURE__ */ jsxs4("div", { className: "text-xs text-primary-dark/80 mt-1", children: [
          "Includes ",
          state.slab,
          "% GST on ",
          fmt2(base)
        ] })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx7(BreakdownRow, { className: "bg-br-base", label: "Base Amount", value: fmt2(base) }),
        state.type === "intra" ? /* @__PURE__ */ jsxs4(Fragment, { children: [
          /* @__PURE__ */ jsx7(BreakdownRow, { className: "bg-br-cgst", label: "CGST", pct: `${half}%`, value: fmt2(gstAmt / 2) }),
          /* @__PURE__ */ jsx7(BreakdownRow, { className: "bg-br-sgst", label: "SGST", pct: `${half}%`, value: fmt2(gstAmt / 2) })
        ] }) : /* @__PURE__ */ jsx7(BreakdownRow, { className: "bg-br-igst", label: "IGST", pct: `${state.slab}%`, value: fmt2(gstAmt) }),
        breakdownRowTip && /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-warning-light text-warning-text text-xs animate-fade-in", children: [
          /* @__PURE__ */ jsx7("span", { "aria-hidden": true, children: breakdownRowTip.icon }),
          /* @__PURE__ */ jsx7(
            "span",
            {
              className: "flex-1",
              dangerouslySetInnerHTML: { __html: breakdownRowTip.body }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-primary-dark text-primary-foreground font-bold text-sm", children: [
          /* @__PURE__ */ jsx7("span", { children: "Total Payable" }),
          /* @__PURE__ */ jsx7("span", { className: "tabular-nums", children: fmt2(total) })
        ] })
      ] }),
      belowResultTip && /* @__PURE__ */ jsx7(ContextualTip, { tip: belowResultTip, onDismiss: (t) => dismiss(t.id, t.dismissDays) }),
      base > 0 && /* @__PURE__ */ jsx7(ShareResult, { base, gstAmt, total, slab: state.slab, type: state.type })
    ] })
  ] });
}
function BreakdownRow({
  label,
  pct,
  value,
  className
}) {
  return /* @__PURE__ */ jsxs4("div", { className: cn("flex justify-between items-center px-3.5 py-2.5 rounded-lg text-sm", className), children: [
    /* @__PURE__ */ jsxs4("span", { className: "font-medium text-foreground", children: [
      label,
      pct && /* @__PURE__ */ jsxs4("span", { className: "text-[0.7rem] opacity-70 ml-1", children: [
        "(",
        pct,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsx7("span", { className: "font-bold text-foreground tabular-nums", children: value })
  ] });
}
function SegmentedToggle({
  label,
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxs4("div", { children: [
    /* @__PURE__ */ jsx7("label", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2", children: label }),
    /* @__PURE__ */ jsx7("div", { className: "flex bg-muted rounded-lg p-1 gap-1", children: options.map((o) => /* @__PURE__ */ jsx7(
      "button",
      {
        onClick: () => onChange(o.value),
        className: cn(
          "flex-1 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all",
          value === o.value ? "bg-card text-primary shadow-sm" : "bg-transparent text-muted-foreground hover:text-foreground"
        ),
        children: o.label
      },
      o.value
    )) })
  ] });
}

// src/lib/gst-tips.ts
var QUICK_TIPS = [
  "CGST + SGST = IGST. Use IGST for inter-state B2B transactions and exports (zero-rated).",
  "Composition Scheme lets small businesses (up to \u20B91.5 Cr) file quarterly at flat lower rates.",
  "E-invoicing is mandatory for businesses with turnover above \u20B95 Cr from FY 2023-24.",
  "Input Tax Credit (ITC) lets you offset GST paid on purchases against GST collected on sales.",
  "GST returns (GSTR-1, GSTR-3B) must be filed monthly \u2014 late fees apply per day of delay.",
  "Reverse Charge: in some cases, the buyer pays GST directly to govt instead of the seller.",
  "HSN codes are mandatory on invoices \u2014 4 digits for turnover up to \u20B95 Cr, 6 digits above.",
  "Exports are zero-rated under GST \u2014 you can claim refund of input taxes paid.",
  "GST registration is mandatory above \u20B940L turnover for goods, \u20B920L for services.",
  "B2B invoices above \u20B950,000 require an e-way bill for movement of goods."
];
function getRandomTip() {
  return QUICK_TIPS[Math.floor(Math.random() * QUICK_TIPS.length)];
}

// src/lib/seo.ts
var SITE_URL = "https://gstcalculator.me";
var upsertNamedMeta = (name, content) => {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};
var upsertPropertyMeta = (property, content) => {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};
var upsertCanonical = (href) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};
var injectJsonLd = (schema) => {
  const script = document.createElement("script");
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};
var clearJsonLdScripts = () => {
  document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
};
var setPageSeo = ({ title, description, path, keywords, type = "website" }) => {
  const url = new URL(path, SITE_URL).toString();
  document.title = title;
  upsertNamedMeta("description", description);
  if (keywords) {
    upsertNamedMeta("keywords", keywords);
  }
  upsertCanonical(url);
  upsertPropertyMeta("og:title", title);
  upsertPropertyMeta("og:description", description);
  upsertPropertyMeta("og:url", url);
  upsertPropertyMeta("og:type", type);
  upsertNamedMeta("twitter:title", title);
  upsertNamedMeta("twitter:description", description);
};
var setWebApplicationSchema = ({ name, description }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: SITE_URL + "/",
    description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: "en-IN",
    offers: {
      "@type": "Offer",
      price: "0",
      "priceCurrency": "INR"
    }
  };
  injectJsonLd(schema);
};
var setFAQPageSchema = (items) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
  injectJsonLd(schema);
};
var setBreadcrumbListSchema = (items) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      item: item.item
    }))
  };
  injectJsonLd(schema);
};
var setArticleSchema = ({
  headline,
  description,
  datePublished,
  dateModified
}) => {
  const url = new URL(window.location.pathname, SITE_URL).toString();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    datePublished,
    dateModified,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: "GST Calculator",
      url: SITE_URL
    }
  };
  injectJsonLd(schema);
};

// src/components/SiteHeader.tsx
import { Link } from "react-router-dom";
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
var SiteHeader = ({ active = "home", showUpdatedLabel = false, hideWordmark = false }) => {
  const navLinkClass = (section) => section === active ? "text-primary-foreground" : "text-primary-mid hover:text-primary-foreground transition-colors";
  return /* @__PURE__ */ jsxs5("nav", { className: `bg-primary-dark px-6 sm:px-8 py-3.5 flex items-center relative z-20 ${hideWordmark ? "justify-end" : "justify-between"}`, children: [
    !hideWordmark && /* @__PURE__ */ jsxs5(Link, { to: "/", className: "text-primary-foreground font-bold tracking-tight hover:opacity-90", children: [
      "GST",
      /* @__PURE__ */ jsx8("span", { className: "text-primary-mid", children: " Calculator" })
    ] }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-5 text-xs", children: [
      /* @__PURE__ */ jsx8(Link, { to: "/blog", className: navLinkClass("blog"), children: "Blog" }),
      /* @__PURE__ */ jsx8(Link, { to: "/privacy", className: navLinkClass("privacy"), children: "Privacy" }),
      showUpdatedLabel && /* @__PURE__ */ jsx8("span", { className: "text-primary-mid hidden sm:inline", children: "Updated for 2025" })
    ] })
  ] });
};
var SiteHeader_default = SiteHeader;

// src/components/SiteFooter.tsx
import { Link as Link2 } from "react-router-dom";
import { jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
var SiteFooter = () => /* @__PURE__ */ jsx9("footer", { className: "border-t border-border mt-4", children: /* @__PURE__ */ jsxs6("div", { className: "max-w-6xl mx-auto px-6 sm:px-8 py-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground", children: [
  /* @__PURE__ */ jsx9(Link2, { to: "/", className: "hover:text-foreground transition-colors", children: "Calculator" }),
  /* @__PURE__ */ jsx9(Link2, { to: "/blog", className: "hover:text-foreground transition-colors", children: "Blog" }),
  /* @__PURE__ */ jsx9(Link2, { to: "/privacy", className: "hover:text-foreground transition-colors", children: "Privacy Policy" })
] }) });
var SiteFooter_default = SiteFooter;

// src/pages/Index.tsx
import { jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
var SLAB_REF = [
  { pct: "0%", title: "Nil Rate", desc: "Essential food grains, milk, vegetables, fruits, eggs, salt, books, newspapers, sindoor, bangles" },
  { pct: "5%", title: "Essential Rate", desc: "Packaged foods, sugar, tea, coffee, edible oil, transport services, small restaurants (turnover <1.5 Cr)" },
  { pct: "12%", title: "Standard Rate I", desc: "Apparel above \u20B91000, computers, processed food, mobile phones, business class air travel" },
  { pct: "18%", title: "Standard Rate II (Most common)", desc: "AC restaurants, electronics, most financial services, IT services, telecom" },
  { pct: "28%", title: "Luxury Rate", desc: "Luxury cars, tobacco, cement, pan masala, high-end personal care, AC hotels above \u20B97500/night" }
];
var Index = () => {
  const [tip, setTip] = useState5("");
  const { stats, dismiss } = useSessionStats();
  useEffect4(() => {
    setTip(getRandomTip());
  }, []);
  useEffect4(() => {
    clearJsonLdScripts();
    setPageSeo({
      title: "GST Calculator India 2025 \u2014 All Slabs, CGST/SGST/IGST",
      description: "Free GST calculator for India 2025. Instantly compute GST for all slabs (5%, 12%, 18%, 28%) with CGST, SGST & IGST breakdown.",
      path: "/",
      keywords: "GST calculator India, CGST SGST calculator, IGST calculator, reverse GST calculator, GST inclusive exclusive calculator"
    });
    setWebApplicationSchema({
      name: "GST Calculator India",
      description: "Free GST calculator for India 2025. Instantly compute GST for all slabs (5%, 12%, 18%, 28%) with CGST, SGST & IGST breakdown."
    });
    setFAQPageSchema([
      {
        question: "What is the GST registration threshold for goods?",
        answer: "Businesses with an annual turnover of \u20B940 lakh or more need to register for GST. Goods suppliers above this threshold must register."
      },
      {
        question: "What is the GST registration threshold for services?",
        answer: "Service providers with an annual turnover of \u20B920 lakh or more need to register for GST. This is lower than the goods threshold."
      },
      {
        question: "What is the GST Composition Scheme?",
        answer: "Businesses with turnover up to \u20B91.5 Cr (goods) or \u20B975 lakh (services) can opt for the simplified Composition Scheme and pay flat GST rates with quarterly filing instead of monthly, reducing compliance burden."
      },
      {
        question: "Who needs to file e-invoicing?",
        answer: "E-invoicing is mandatory for businesses with turnover above \u20B95 Cr from FY 2023-24. It integrates directly with the GST portal for better tracking and reduced fraud."
      },
      {
        question: "What are the main GST slabs in India?",
        answer: "India has 5 main GST slabs: 0% (nil rate on essentials), 5% (essential goods/services), 12% (standard rate I), 18% (standard rate II - most common), and 28% (luxury goods). Different products fall into different slabs based on their nature."
      }
    ]);
  }, []);
  const pageCtx = useMemo2(
    () => buildContext({ slab: 0, amount: 0, type: "intra", stats }),
    [stats]
  );
  const topTip = pickTip("topBanner", pageCtx);
  const sidebarTip = pickTip("sidebar", pageCtx);
  return /* @__PURE__ */ jsxs7("div", { className: "min-h-screen bg-background", children: [
    topTip && /* @__PURE__ */ jsxs7("div", { className: "bg-warning-light text-warning-text border-b border-warning-border/40 px-6 sm:px-8 py-2 flex items-center gap-2.5 text-xs animate-slide-down", children: [
      /* @__PURE__ */ jsx10("span", { "aria-hidden": true, children: topTip.icon }),
      /* @__PURE__ */ jsx10("span", { className: "flex-1", dangerouslySetInnerHTML: { __html: topTip.body } }),
      topTip.dismissDays && /* @__PURE__ */ jsx10(
        "button",
        {
          onClick: () => dismiss(topTip.id, topTip.dismissDays),
          className: "opacity-70 hover:opacity-100",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx10(X3, { className: "h-3.5 w-3.5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx10(SiteHeader_default, { showUpdatedLabel: true, hideWordmark: true }),
    /* @__PURE__ */ jsxs7("header", { className: "bg-primary-dark px-6 sm:px-8 pb-8 text-primary-foreground", children: [
      /* @__PURE__ */ jsx10("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight", children: "GST Calculator" }),
      /* @__PURE__ */ jsx10("p", { className: "text-primary-mid text-sm mt-1", children: "Instant GST computation for all slabs \u2014 with CGST, SGST & IGST breakdown" })
    ] }),
    /* @__PURE__ */ jsxs7("main", { className: "max-w-3xl mx-auto px-6 sm:px-8 py-6 flex flex-col gap-5", children: [
      /* @__PURE__ */ jsx10(GSTCalculator, {}),
      sidebarTip ? /* @__PURE__ */ jsx10(ContextualTip, { tip: sidebarTip, onDismiss: (t) => dismiss(t.id, t.dismissDays) }) : /* @__PURE__ */ jsxs7("div", { className: "bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground leading-relaxed", children: [
        /* @__PURE__ */ jsx10("strong", { className: "text-foreground block mb-1", children: "\u{1F4A1} Quick Tip" }),
        tip
      ] })
    ] }),
    /* @__PURE__ */ jsxs7("section", { className: "max-w-3xl mx-auto px-6 sm:px-8 pb-10 flex flex-col gap-5", children: [
      /* @__PURE__ */ jsxs7("div", { className: "bg-card rounded-2xl border border-border overflow-hidden", children: [
        /* @__PURE__ */ jsx10("div", { className: "px-5 py-3.5 bg-warning text-warning-foreground text-sm font-semibold", children: "\u{1F4CB} GST Slab Reference Guide" }),
        /* @__PURE__ */ jsx10("div", { className: "px-4 py-2", children: SLAB_REF.map((s, i) => /* @__PURE__ */ jsxs7(
          "div",
          {
            className: `flex gap-3 py-2.5 ${i < SLAB_REF.length - 1 ? "border-b border-border" : ""}`,
            children: [
              /* @__PURE__ */ jsx10("div", { className: "min-w-[42px] text-base font-bold text-primary-dark", children: s.pct }),
              /* @__PURE__ */ jsxs7("div", { className: "text-xs text-muted-foreground leading-relaxed", children: [
                /* @__PURE__ */ jsx10("strong", { className: "text-foreground block text-[0.78rem] mb-0.5", children: s.title }),
                s.desc
              ] })
            ]
          },
          s.pct
        )) })
      ] }),
      /* @__PURE__ */ jsxs7("div", { className: "bg-card rounded-2xl border border-border overflow-hidden", children: [
        /* @__PURE__ */ jsx10("div", { className: "px-5 py-3.5 bg-primary-dark text-primary-foreground text-sm font-semibold", children: "\u26A0\uFE0F GST Registration Thresholds" }),
        /* @__PURE__ */ jsxs7("div", { className: "p-5", children: [
          /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs7("div", { className: "bg-primary-light rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsx10("div", { className: "text-[0.65rem] font-semibold text-primary-dark uppercase mb-1", children: "Goods" }),
              /* @__PURE__ */ jsx10("div", { className: "text-2xl font-bold text-primary-dark", children: "\u20B940L" }),
              /* @__PURE__ */ jsx10("div", { className: "text-xs text-primary-dark/70", children: "Annual turnover" })
            ] }),
            /* @__PURE__ */ jsxs7("div", { className: "bg-accent rounded-lg p-3 text-center", children: [
              /* @__PURE__ */ jsx10("div", { className: "text-[0.65rem] font-semibold text-success uppercase mb-1", children: "Services" }),
              /* @__PURE__ */ jsx10("div", { className: "text-2xl font-bold text-success", children: "\u20B920L" }),
              /* @__PURE__ */ jsx10("div", { className: "text-xs text-success/80", children: "Annual turnover" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "mt-3 text-sm text-muted-foreground leading-relaxed space-y-2", children: [
            /* @__PURE__ */ jsxs7("p", { children: [
              /* @__PURE__ */ jsx10("strong", { className: "text-foreground", children: "Composition Scheme:" }),
              " Businesses up to \u20B91.5 Cr (goods) / \u20B975L (services) can opt for simplified quarterly filing at lower flat rates."
            ] }),
            /* @__PURE__ */ jsxs7("p", { children: [
              /* @__PURE__ */ jsx10("strong", { className: "text-foreground", children: "E-invoicing mandatory" }),
              " for turnover above \u20B95 Cr from FY 2023-24."
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx10(SiteFooter_default, {})
  ] });
};
var Index_default = Index;

// src/pages/NotFound.tsx
import { useLocation } from "react-router-dom";
import { useEffect as useEffect5 } from "react";
import { jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
var NotFound = () => {
  const location = useLocation();
  useEffect5(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return /* @__PURE__ */ jsx11("div", { className: "flex min-h-screen items-center justify-center bg-muted", children: /* @__PURE__ */ jsxs8("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx11("h1", { className: "mb-4 text-4xl font-bold", children: "404" }),
    /* @__PURE__ */ jsx11("p", { className: "mb-4 text-xl text-muted-foreground", children: "Oops! Page not found" }),
    /* @__PURE__ */ jsx11("a", { href: "/", className: "text-primary underline hover:text-primary/90", children: "Return to Home" })
  ] }) });
};
var NotFound_default = NotFound;

// src/pages/Blog.tsx
import { useEffect as useEffect6 } from "react";
import { Link as Link3 } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

// src/lib/blog-posts.ts
var POSTS = [
  {
    slug: "how-to-calculate-gst",
    title: "How to Calculate GST in India \u2014 Formula, Examples and Shortcuts",
    description: "Learn how to calculate GST in India using simple formulas \u2014 GST-exclusive, GST-inclusive, and reverse GST \u2014 with worked examples for every tax slab.",
    category: "How-to",
    readTime: "6 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "GST calculation looks complicated at first. However, it follows two simple formulas that never change. Furthermore, once you understand the difference between GST-exclusive and GST-inclusive amounts, every calculation becomes straightforward." },
      { type: "p", text: "Whether you are a small business owner preparing an invoice, a freelancer charging a client, or a consumer checking a bill \u2014 understanding how to calculate GST accurately is essential. Moreover, even a small error in GST calculation can lead to compliance issues and penalties." },
      { type: "stat", num: "\u20B91,180", label: "Total invoice value on a \u20B91,000 product at 18% GST \u2014 the most common calculation in India" },
      { type: "h2", text: "The Two GST Calculation Formulas You Need to Know" },
      { type: "p", text: "Every GST calculation in India falls into one of two categories. Specifically, you either need to <strong>add GST to a base price</strong> (GST-exclusive calculation) or <strong>remove GST from a total price</strong> (reverse GST calculation)." },
      { type: "h3", text: "Formula 1: Adding GST to a base amount (GST-exclusive)" },
      { type: "p", text: "Use this when you know the price <em>before</em> tax and want to find the final invoice amount. This is the most common scenario for businesses creating invoices." },
      { type: "formula", title: "GST-Exclusive Calculation", code: "GST Amount = (Original Cost \xD7 GST Rate) \xF7 100\nNet Price (incl. GST) = Original Cost + GST Amount\n\nExample \u2014 \u20B91,000 product at 18% GST:\nGST Amount = (1,000 \xD7 18) \xF7 100 = \u20B9180\nNet Price = \u20B91,000 + \u20B9180 = \u20B91,180\n\nCGST = \u20B990 (9%) | SGST = \u20B990 (9%) | IGST = \u20B9180 (interstate only)" },
      { type: "h3", text: "Formula 2: Removing GST from a total amount (reverse GST)" },
      { type: "p", text: "Use this when you have a GST-inclusive price and need to find the original base amount. Essential when reading an MRP tag or a vendor's invoice where GST is already embedded." },
      { type: "formula", title: "Reverse GST (GST-Inclusive) Calculation", code: "GST Amount = Total Price \u2212 [Total Price \xD7 100 \xF7 (100 + GST Rate)]\nOriginal Price = Total Price \u2212 GST Amount\n\nExample \u2014 \u20B91,180 total at 18% GST:\nGST Amount = 1,180 \u2212 [1,180 \xD7 100 \xF7 118] = \u20B9180\nOriginal Price = 1,180 \u2212 180 = \u20B91,000" },
      { type: "h2", text: "How to Calculate CGST, SGST and IGST Separately" },
      { type: "p", text: "When the transaction is <strong>intra-state</strong> \u2014 buyer and seller in the same state \u2014 the GST splits equally between CGST and SGST. An 18% GST becomes 9% CGST plus 9% SGST." },
      { type: "p", text: "Conversely, when the transaction is <strong>inter-state</strong> \u2014 buyer and seller in different states \u2014 only IGST applies at the full rate." },
      { type: "statGrid", items: [
        { n: "CGST 9%", l: "Intra-state \u2014 central share" },
        { n: "SGST 9%", l: "Intra-state \u2014 state share" },
        { n: "IGST 18%", l: "Inter-state \u2014 full rate" },
        { n: "= 18%", l: "Total GST \u2014 both routes" }
      ] },
      { type: "h2", text: "Worked Examples at Every GST Rate Slab" },
      { type: "p", text: "India currently has four primary GST rate slabs. The calculation method is identical for all four \u2014 only the rate number changes." },
      { type: "example", title: "Example 1 \u2014 5% GST (packaged food, medicines)", lines: [
        "Base amount: \u20B9500 | GST at 5% = \u20B925 | Invoice total = <strong>\u20B9525</strong>",
        "CGST = \u20B912.50 | SGST = \u20B912.50 (intra-state)"
      ] },
      { type: "example", title: "Example 2 \u2014 12% GST (processed food, mobile phones)", lines: [
        "Base amount: \u20B92,000 | GST at 12% = \u20B9240 | Invoice total = <strong>\u20B92,240</strong>",
        "CGST = \u20B9120 | SGST = \u20B9120 (intra-state)"
      ] },
      { type: "example", title: "Example 3 \u2014 18% GST (electronics, restaurants, services)", lines: [
        "Base amount: \u20B910,000 | GST at 18% = \u20B91,800 | Invoice total = <strong>\u20B911,800</strong>",
        "CGST = \u20B9900 | SGST = \u20B9900 (intra-state)"
      ] },
      { type: "example", title: "Example 4 \u2014 28% GST (luxury goods, cement, cars)", lines: [
        "Base amount: \u20B950,000 | GST at 28% = \u20B914,000 | Invoice total = <strong>\u20B964,000</strong>",
        "CGST = \u20B97,000 | SGST = \u20B97,000 (intra-state)"
      ] },
      { type: "h2", text: "How to Calculate GST on a Service Invoice" },
      { type: "p", text: "Service providers \u2014 including freelancers, consultants, and agencies \u2014 charge GST at 18% on most services. The calculation works identically to goods. Apply 18% to the fee amount before tax, then add to arrive at the billable total." },
      { type: "p", text: "For instance, a web designer charging \u20B950,000 for a project would add \u20B99,000 GST (18%), resulting in a total invoice of \u20B959,000. This invoice must show the GSTIN, place of supply, and the CGST/SGST breakdown if the client is in the same state." },
      { type: "h2", text: "Why Manual GST Calculation Is Error-Prone" },
      { type: "p", text: "Even experienced accountants make mistakes when calculating GST manually. The reverse GST formula \u2014 in particular \u2014 is frequently applied incorrectly, with many people simply subtracting the percentage rather than using the correct divisor." },
      { type: "p", text: "For example, removing 18% GST from \u20B91,180 by calculating 18% of 1,180 (= \u20B9212.40) produces the wrong answer. The correct reverse calculation gives \u20B9180." },
      { type: "p", text: 'For a full explanation of the different GST rate categories, see our guide on <a href="/blog/gst-rate-slabs-india">GST rate slabs in India</a>. Additionally, if you need to understand how CGST and IGST differ in practice, read our detailed article on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a>.' },
      { type: "cta", title: "Calculate GST instantly \u2014 free", text: "Enter any amount and select your GST rate. Get instant CGST, SGST, and IGST breakdowns \u2014 no sign-up required." }
    ]
  },
  {
    slug: "what-is-gst-india",
    title: "What Is GST? A Plain-English Guide for Indian Businesses",
    description: "What is GST? A clear, jargon-free explanation of India's Goods and Services Tax \u2014 how it works, why it replaced VAT, and what it means for businesses.",
    category: "Basics",
    readTime: "5 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "GST \u2014 Goods and Services Tax \u2014 is India's unified indirect tax on almost every product and service bought or sold in the country. It replaced a confusing web of 17 different central and state taxes when it launched on 1 July 2017." },
      { type: "p", text: `India's tax system before GST was, frankly, a mess. Businesses had to navigate VAT, service tax, excise duty, octroi, and several other levies \u2014 each with its own filing system, rate structure, and compliance requirement. GST's "One Nation, One Tax" framework was one of the most significant economic reforms in independent India's history.` },
      { type: "stat", num: "1 July 2017", label: "Date GST replaced VAT, service tax, excise duty, and 14 other indirect taxes across India" },
      { type: "h2", text: "What Does GST Stand For \u2014 and What Does It Tax?" },
      { type: "p", text: "GST stands for <strong>Goods and Services Tax</strong>. It is a <strong>destination-based, multi-stage indirect tax</strong> \u2014 collected at every stage of the supply chain where value is added, and ultimately borne by the final consumer." },
      { type: "p", text: "GST applies to virtually all goods and services in India. However, certain items are exempt or zero-rated. Specifically, fresh fruits and vegetables, milk, eggs, and educational services attract zero GST. Electricity, petrol, diesel, alcohol, and real estate operate under separate state-level tax regimes." },
      { type: "h3", text: "What did GST replace?" },
      { type: "highlight", html: "<strong>Central taxes absorbed:</strong> Central Excise Duty, Service Tax, Central Sales Tax, Customs Additional Duties, Special Additional Duty of Customs.<br/><br/><strong>State taxes absorbed:</strong> VAT/Sales Tax, Entry Tax, Luxury Tax, Octroi, State Excise (on manufactured goods), Entertainment Tax, Advertisement Tax." },
      { type: "h2", text: "How GST Works \u2014 The Multi-Stage Tax Explained" },
      { type: "p", text: "GST is collected at every stage of the supply chain, from manufacturer to retailer to consumer. Businesses at each stage can claim a credit for the GST they already paid on their inputs \u2014 this is called <strong>Input Tax Credit (ITC)</strong>. The tax is effectively paid only on the <em>value added</em> at each stage." },
      { type: "example", title: "How multi-stage GST works \u2014 a simple chain", lines: [
        "<strong>Manufacturer</strong> sells goods worth \u20B91,000 + 18% GST (\u20B9180) to wholesaler. Pays \u20B9180 to government.",
        "<strong>Wholesaler</strong> adds \u20B9200 value, sells for \u20B91,200 + 18% GST (\u20B9216). Claims \u20B9180 ITC. Pays only \u20B936 net.",
        "<strong>Retailer</strong> adds \u20B9300 value, sells for \u20B91,500 + 18% GST (\u20B9270). Claims \u20B9216 ITC. Pays only \u20B954 net.",
        "<strong>Consumer</strong> pays \u20B91,770 total. Total GST collected = \u20B9270 \u2014 only on final value."
      ] },
      { type: "h2", text: "The Four Types of GST in India" },
      { type: "statGrid", items: [
        { n: "CGST", l: "Central GST \u2014 intra-state \u2014 collected by central govt" },
        { n: "SGST", l: "State GST \u2014 intra-state \u2014 collected by state govt" },
        { n: "IGST", l: "Integrated GST \u2014 inter-state \u2014 collected by centre" },
        { n: "UTGST", l: "Union Territory GST \u2014 for UTs without legislature" }
      ] },
      { type: "p", text: "For intra-state transactions, GST splits equally between CGST and SGST. An 18% GST becomes 9% CGST plus 9% SGST. For inter-state transactions, only IGST at the full rate applies." },
      { type: "h2", text: "Who Needs to Register for GST?" },
      { type: "p", text: "GST registration is mandatory once a business crosses the annual turnover threshold. Businesses with turnover above <strong>\u20B940 lakhs</strong> (for goods) or <strong>\u20B920 lakhs</strong> (for services) must register. Businesses in special category states have a lower threshold of \u20B920 lakhs for goods and \u20B910 lakhs for services." },
      { type: "p", text: "Certain businesses must register regardless of turnover: inter-state suppliers, e-commerce operators and their sellers, businesses under reverse charge mechanism, and anyone supplying through an e-commerce aggregator." },
      { type: "h3", text: "What is a GSTIN?" },
      { type: "p", text: "Upon registration, every business receives a <strong>GSTIN</strong> \u2014 Goods and Services Tax Identification Number. It is a 15-digit alphanumeric code: 2-digit state code + 10-digit PAN + 1-digit entity number + 1-digit check digit. The GSTIN must appear on every tax invoice." },
      { type: "h2", text: "GST Rate Slabs \u2014 The Quick Reference" },
      { type: "slabGrid", items: [
        { r: "0%", l: "Essentials \u2014 fresh food, milk, eggs, books" },
        { r: "5%", l: "Necessities \u2014 packaged food, medicines, transport" },
        { r: "12%", l: "Standard \u2014 processed food, mobile phones, textiles" },
        { r: "18%", l: "Most goods and services \u2014 electronics, restaurants" },
        { r: "28%", l: "Luxury and sin goods \u2014 cars, tobacco, cement" },
        { r: "3%", l: "Gold, silver, and precious metals" }
      ] },
      { type: "p", text: 'For a complete breakdown of which products fall under each slab, read our detailed guide on <a href="/blog/gst-rate-slabs-india">GST rate slabs in India 2024</a>. To understand how CGST and IGST differ in actual transactions, see our article on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a>.' },
      { type: "quote", text: "GST is not merely a tax reform. It is an economic union of states. \u2014 Arun Jaitley, Finance Minister, at the GST launch ceremony, 30 June 2017" },
      { type: "cta", title: "Calculate your GST instantly", text: "Enter any amount \u2014 instant CGST, SGST, and IGST breakdown for all rate slabs. Free, no registration required." }
    ]
  },
  {
    slug: "gst-rate-slabs-india",
    title: "GST Rate Slabs in India 2024 \u2014 Which Rate Applies to You?",
    description: "Complete guide to GST rate slabs in India \u2014 0%, 5%, 12%, 18%, 28% \u2014 with product examples, HSN codes, and how to find the right rate.",
    category: "Tax Rates",
    readTime: "6 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "India's GST framework places every product and service into one of six rate categories. Knowing which slab applies to your transaction is the single most important step in any GST calculation." },
      { type: "p", text: "This guide breaks down every GST rate slab with real-world product examples, so you can identify the correct rate quickly. It also explains how HSN and SAC codes connect products and services to their applicable rates." },
      { type: "h2", text: "The Six GST Rate Slabs in India \u2014 Overview" },
      { type: "p", text: "India's GST Council established six standard rate bands: 0%, 3%, 5%, 12%, 18%, and 28%. A small number of goods attract special rates of 0.25% (rough diamonds) and 1.5% (cut and polished diamonds). The majority of everyday goods and most services fall under the 5%, 12%, or 18% slabs." },
      { type: "slabGrid", items: [
        { r: "0%", l: "Essential goods \u2014 nil rated" },
        { r: "3%", l: "Gold, silver, precious stones" },
        { r: "5%", l: "Merit goods \u2014 necessities" },
        { r: "12%", l: "Standard goods \u2014 processed" },
        { r: "18%", l: "Most goods and services" },
        { r: "28%", l: "Luxury and demerit goods" }
      ] },
      { type: "h2", text: "0% GST \u2014 Zero-Rated and Exempt Goods" },
      { type: "p", text: "The 0% slab covers essential items that the government wants to keep affordable. There is an important distinction between <strong>zero-rated</strong> and <strong>exempt</strong> goods \u2014 one that matters significantly for input tax credit claims." },
      { type: "p", text: "Zero-rated supplies (like exports and supplies to SEZs) allow businesses to claim ITC on inputs even though output tax is zero. Exempt supplies do not attract GST and also do not qualify for ITC on inputs." },
      { type: "example", title: "Common 0% GST items", lines: [
        "Fresh fruits and vegetables, milk and dairy (unprocessed), eggs, meat and fish (unprocessed), cereals and pulses (unbranded), salt, water (non-bottled), fresh bread, books and newspapers, educational services, healthcare services."
      ] },
      { type: "h2", text: "5% GST Slab \u2014 Merit Goods and Basic Necessities" },
      { type: "p", text: "The 5% slab covers goods and services that are widely used but not considered bare essentials. Many agricultural inputs fall here to support the farming sector." },
      { type: "example", title: "Common 5% GST items", lines: [
        "<strong>Food:</strong> Packaged and branded food items, edible oils, sugar, tea, coffee, frozen vegetables, fish (processed).",
        "<strong>Medicines:</strong> Life-saving drugs, basic medicines, vaccines.",
        "<strong>Services:</strong> Railways (AC class), economy class air travel, small restaurants (without AC).",
        "<strong>Other:</strong> Coal, fertilisers, agro machinery, renewable energy devices."
      ] },
      { type: "h2", text: "12% GST Slab \u2014 Processed and Standard Goods" },
      { type: "p", text: "The 12% slab covers a wide range of processed goods and some services. Many manufactured goods that have been through significant processing fall here." },
      { type: "example", title: "Common 12% GST items", lines: [
        "<strong>Food:</strong> Ghee, butter, cheese, frozen meat products, fruit juices, namkeen and snacks.",
        "<strong>Electronics:</strong> Mobile phones (verify current rates \u2014 revised periodically).",
        "<strong>Textiles:</strong> Apparel above \u20B91,000, readymade garments.",
        "<strong>Services:</strong> Work contracts for non-residential construction, business class air travel."
      ] },
      { type: "h2", text: "18% GST Slab \u2014 The Most Common Rate" },
      { type: "p", text: "The 18% slab is the most widely applicable rate in India. The majority of manufactured goods, most professional services, and most consumer products fall here. It is the default rate for services where no specific rate is prescribed." },
      { type: "example", title: "Common 18% GST items", lines: [
        "<strong>Electronics:</strong> Computers, laptops, televisions, refrigerators, washing machines, air conditioners.",
        "<strong>Services:</strong> IT services, financial services, telecom, insurance, consulting, marketing, restaurants (with AC).",
        "<strong>Building materials:</strong> Cement, steel, paint, tiles, plywood.",
        "<strong>Other:</strong> FMCG products (shampoo, toothpaste, soap), packaged drinking water above 20 litres, cameras."
      ] },
      { type: "h2", text: "28% GST Slab \u2014 Luxury and Demerit Goods" },
      { type: "p", text: "The 28% slab is reserved for luxury items and goods the government specifically wishes to discourage through taxation. Many items in this slab also attract an additional <strong>GST Cess</strong> on top of the 28% rate. The effective tax rate on premium cars and tobacco products can exceed 40%." },
      { type: "example", title: "Common 28% GST items", lines: [
        "<strong>Vehicles:</strong> Passenger cars (with additional cess of 1\u201322% depending on engine size and type).",
        "<strong>Tobacco:</strong> Cigarettes, cigars, pan masala, gutka (with additional cess).",
        "<strong>Luxury goods:</strong> Premium cosmetics (above a certain price), aircrafts for personal use.",
        "<strong>Construction:</strong> Premium residential construction projects in certain categories."
      ] },
      { type: "h2", text: "How to Find the GST Rate for Any Product \u2014 HSN and SAC Codes" },
      { type: "p", text: "Every product in India has an <strong>HSN (Harmonised System of Nomenclature) code</strong> \u2014 an internationally recognised classification number. The GST rate for any product is determined by its HSN code, not its common name." },
      { type: "p", text: "Similarly, every service has a <strong>SAC (Services Accounting Code)</strong>. Businesses with turnover above \u20B95 crore must include the full 8-digit HSN code on all invoices. Businesses below this threshold may use 4-digit codes." },
      { type: "h3", text: "Quick HSN code lookup method" },
      { type: "p", text: "The official GST portal at gstin.gov.in provides a comprehensive HSN code search tool. The CBIC website maintains the master GST rate schedule. Most GST accounting software packages include built-in HSN lookup functionality." },
      { type: "p", text: 'For the calculation method at each of these slabs, see our step-by-step guide on <a href="/blog/how-to-calculate-gst">how to calculate GST in India</a>. If you are unsure whether to use CGST/SGST or IGST, read our article on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST differences</a>.' },
      { type: "cta", title: "Know your rate? Calculate GST instantly", text: "Enter your amount and select the applicable slab \u2014 instant CGST, SGST, and IGST breakdown for any rate." }
    ]
  },
  {
    slug: "cgst-sgst-igst-difference",
    title: "CGST vs SGST vs IGST \u2014 Differences and When Each Applies",
    description: "Understand the difference between CGST, SGST, and IGST \u2014 when each applies, how to split GST on invoices, and why getting it right matters for filing.",
    category: "Tax Types",
    readTime: "5 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "When you raise a GST invoice in India, one critical question determines how the tax splits: are the buyer and seller in the same state, or different states? This single answer determines whether you charge CGST plus SGST or a single IGST." },
      { type: "p", text: "This distinction confuses new GST registrants more than any other aspect of the tax. This guide explains each component clearly, with examples, so you never misclassify a transaction again." },
      { type: "h2", text: "What Is CGST \u2014 Central Goods and Services Tax?" },
      { type: "p", text: "<strong>CGST</strong> is the Central Goods and Services Tax \u2014 the portion of GST collected by the central government on transactions that happen within a single state. When a seller in Mumbai sells to a buyer also in Mumbai, CGST applies. The CGST rate is always exactly half of the total GST rate on the transaction." },
      { type: "formula", title: "CGST Calculation", code: "CGST Rate = Total GST Rate \xF7 2\nCGST Amount = Taxable Value \xD7 (CGST Rate \xF7 100)\n\nExample: \u20B910,000 sale at 18% GST (intra-state)\nCGST = 10,000 \xD7 9% = \u20B9900" },
      { type: "h2", text: "What Is SGST \u2014 State Goods and Services Tax?" },
      { type: "p", text: "<strong>SGST</strong> is the State Goods and Services Tax \u2014 collected by the state government on the same intra-state transactions. SGST always equals CGST exactly \u2014 both are half of the total GST rate. A single 18% GST transaction within one state generates \u20B9900 CGST and \u20B9900 SGST." },
      { type: "p", text: "SGST revenue stays entirely with the state where the transaction occurs. The SGST framework ensures that states benefit from consumption tax revenue generated within their borders." },
      { type: "h2", text: "What Is IGST \u2014 Integrated Goods and Services Tax?" },
      { type: "p", text: "<strong>IGST</strong> is the Integrated Goods and Services Tax \u2014 applied when goods or services move across state lines. IGST applies to inter-state supplies, imports, and exports. IGST is collected entirely by the central government, which subsequently distributes the state's share to the destination state." },
      { type: "formula", title: "IGST Calculation", code: "IGST Rate = Full GST Rate (no splitting)\nIGST Amount = Taxable Value \xD7 (IGST Rate \xF7 100)\n\nExample: \u20B910,000 sale from Delhi to Chennai at 18% GST\nIGST = 10,000 \xD7 18% = \u20B91,800 (no CGST/SGST split)" },
      { type: "h2", text: "CGST + SGST vs IGST \u2014 Side-by-Side Comparison" },
      { type: "statGrid", items: [
        { n: "CGST + SGST", l: "Intra-state \u2014 buyer and seller same state" },
        { n: "IGST", l: "Inter-state \u2014 buyer and seller different states" },
        { n: "Equal split", l: "CGST = SGST = half of total GST rate" },
        { n: "Full rate", l: "IGST = total GST rate, no splitting" }
      ] },
      { type: "p", text: "Both approaches collect the same total GST amount from the buyer. From the buyer's perspective, the total invoice amount is identical whether CGST+SGST or IGST applies. However, the distinction matters for the seller's filing and ITC reconciliation." },
      { type: "h2", text: "What Is Place of Supply \u2014 and Why It Determines CGST vs IGST" },
      { type: "p", text: "The <strong>place of supply</strong> is the GST concept that determines which type of tax applies. If the place of supply is the same state as the supplier's registered state, CGST and SGST apply. If the place of supply is a different state, IGST applies." },
      { type: "p", text: "For goods, the place of supply is generally straightforward \u2014 it is where the goods are delivered. For services, the rules are more nuanced. The GST Act contains over 14 specific rules for determining the place of supply of services." },
      { type: "h3", text: "Common place-of-supply scenarios for services" },
      { type: "example", title: "Service \u2014 determining intra-state vs inter-state", lines: [
        "<strong>A Mumbai agency bills a Mumbai company:</strong> Place of supply = Maharashtra = same as supplier's state \u2192 CGST + SGST",
        "<strong>A Mumbai agency bills a Bengaluru company:</strong> Place of supply = Karnataka \u2260 Maharashtra \u2192 IGST",
        "<strong>A Delhi consultant delivers an online course nationally:</strong> Place of supply = each student's location \u2192 mostly IGST for out-of-Delhi students"
      ] },
      { type: "h2", text: "What Is UTGST \u2014 and When Does It Apply?" },
      { type: "p", text: "<strong>UTGST</strong> is the Union Territory Goods and Services Tax. It applies instead of SGST in union territories that do not have their own legislature \u2014 namely Chandigarh, Dadra and Nagar Haveli, Daman and Diu, Lakshadweep, and Ladakh. Delhi and Puducherry have legislatures, so they levy SGST rather than UTGST." },
      { type: "h2", text: "ITC Implications \u2014 Why the CGST/IGST Split Matters for Businesses" },
      { type: "p", text: "Input Tax Credit (ITC) rules have specific provisions about how CGST, SGST, and IGST credits are used. IGST credit can be used to offset IGST, CGST, or SGST liability \u2014 in that order. CGST credit can only offset CGST and IGST, while SGST credit can only offset SGST and IGST." },
      { type: "p", text: "A business with significant IGST credit has more flexibility in offsetting various tax liabilities than one with only CGST credit. This means inter-state purchasing can sometimes provide ITC flexibility advantages." },
      { type: "p", text: 'For a complete guide to calculating CGST and IGST amounts at each rate, see our article on <a href="/blog/how-to-calculate-gst">how to calculate GST in India</a>. For a full breakdown of which rate applies to your product, read our guide on <a href="/blog/gst-rate-slabs-india">GST rate slabs in India</a>.' },
      { type: "cta", title: "Calculate CGST, SGST, and IGST instantly", text: "Enter your amount \u2014 automatic CGST/SGST and IGST breakdown for any GST rate slab. Free and instant." }
    ]
  },
  {
    slug: "gst-for-freelancers-india",
    title: "GST for Freelancers in India \u2014 What You Need to Know",
    description: "Everything Indian freelancers need to know about GST \u2014 registration threshold, how to charge 18% GST on invoices, file returns, and claim ITC on expenses.",
    category: "Freelancers",
    readTime: "6 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "If you are a freelancer in India earning from clients \u2014 whether domestic or international \u2014 GST likely applies to your work. Even freelancers who earn below the registration threshold need to understand the rules." },
      { type: "p", text: "This guide answers every practical question a freelancer has about GST in plain language. It covers the specific rules that apply to freelancers differently from regular businesses \u2014 particularly around international clients and export of services." },
      { type: "stat", num: "\u20B920 lakhs", label: "Annual turnover threshold above which most service-based freelancers must register for GST in India (\u20B910 lakhs in special category states)" },
      { type: "h2", text: "Do Freelancers Need to Register for GST?" },
      { type: "p", text: "The answer depends on two factors: your annual turnover and the nature of your clients. If your total billing from freelance work exceeds <strong>\u20B920 lakhs per year</strong>, GST registration is mandatory \u2014 regardless of whether your clients are in India or abroad. Freelancers in special category states have a lower threshold of \u20B910 lakhs." },
      { type: "p", text: "There is an important exception. If <em>all</em> of your clients are outside India (i.e., you only do export of services), you may qualify for voluntary registration with a <strong>Letter of Undertaking (LUT)</strong> \u2014 which allows you to bill without collecting GST, even at lower turnovers." },
      { type: "h3", text: "When must you register regardless of turnover?" },
      { type: "p", text: "Certain situations trigger mandatory registration regardless of how much you earn: supplying services in more than one state, receiving payment from abroad even below the threshold in some interpretations, and providing services to clients who require a GSTIN for their own ITC claims. If you use any e-commerce platform to offer services, registration is mandatory from the first rupee earned." },
      { type: "h2", text: "What GST Rate Do Freelancers Charge?" },
      { type: "p", text: "Almost all freelance services in India attract <strong>18% GST</strong>. This includes web development, graphic design, content writing, photography, videography, consulting, marketing, social media management, and virtually every other professional or creative service." },
      { type: "formula", title: "Freelancer invoice \u2014 GST calculation", code: "Service fee: \u20B950,000\nGST at 18%: \u20B99,000 (CGST \u20B94,500 + SGST \u20B94,500 if same state)\nTotal invoice: \u20B959,000\n\nIf client is in a different state:\nIGST at 18%: \u20B99,000\nTotal invoice: \u20B959,000 (same total, different tax line)" },
      { type: "h2", text: "GST on International Clients \u2014 Export of Services" },
      { type: "p", text: "If your client is outside India, your service qualifies as an <strong>export of services</strong> under GST law \u2014 provided the payment is received in foreign currency. Export of services is classified as <strong>zero-rated</strong> under GST. You do not charge GST to international clients, and you can additionally claim input tax credit on your business expenses." },
      { type: "p", text: "This zero-rating requires one of two formalities. You must either file a <strong>Letter of Undertaking (LUT)</strong> before raising the invoice \u2014 which allows you to export without paying IGST \u2014 or pay IGST and subsequently claim a refund. The LUT route is far simpler and is used by the vast majority of freelancers with international clients." },
      { type: "h3", text: "How to file an LUT for export services" },
      { type: "steps", items: [
        "Log in to the GST portal at gstin.gov.in with your GSTIN credentials.",
        "Navigate to Services \u2192 User Services \u2192 Furnish Letter of Undertaking.",
        "Select the financial year and fill in the LUT form. Provide bank and applicant details as required.",
        "Submit with DSC or EVC authentication. Keep the ARN (Acknowledgement Reference Number) for records.",
        "You can now raise zero-GST invoices to international clients for the full financial year."
      ] },
      { type: "h2", text: "How to Create a GST-Compliant Invoice as a Freelancer" },
      { type: "p", text: "A valid GST invoice must include specific mandatory fields. Missing even one can invalidate the invoice for your client's ITC claim \u2014 damaging the relationship. If you are GST-registered, every invoice must include your GSTIN." },
      { type: "example", title: "Mandatory fields on a freelancer's GST invoice", lines: [
        "<strong>Your details:</strong> Full legal name, address, GSTIN, state code.",
        "<strong>Client details:</strong> Name, address, GSTIN (if GST-registered), place of supply.",
        "<strong>Invoice details:</strong> Unique invoice number, date, SAC code (for the service type).",
        "<strong>Amounts:</strong> Taxable value, GST rate, CGST + SGST or IGST amounts separately, total invoice value.",
        "<strong>Payment terms:</strong> Due date, bank details or payment link."
      ] },
      { type: "h2", text: "Which GST Returns Must Freelancers File?" },
      { type: "p", text: "Once registered, freelancers must file GST returns regularly. The primary returns applicable to most freelancers are GSTR-1 and GSTR-3B. Missing filing deadlines triggers late fees and can result in the cancellation of GST registration." },
      { type: "p", text: "<strong>GSTR-1</strong> reports all outward supplies (your invoices) and must be filed monthly or quarterly depending on your turnover. <strong>GSTR-3B</strong> is a summary return filed monthly, reporting GST liability and ITC claims. Freelancers with turnover below \u20B91.5 crore may opt for the quarterly filing scheme (QRMP)." },
      { type: "h2", text: "Input Tax Credit \u2014 What Freelancers Can Claim" },
      { type: "p", text: "One of the significant advantages of GST registration is the ability to claim Input Tax Credit on business expenses. Freelancers can claim ITC on: laptops and computers, software subscriptions (Adobe, Microsoft 365, etc.), internet connections, professional courses, coworking space memberships, and any other GST-paid business expenditure." },
      { type: "p", text: "Claiming ITC reduces your effective GST outgo. For instance, a freelancer paying \u20B918,000 GST on a laptop purchase can offset this against future GST liability." },
      { type: "p", text: 'For the exact formula to calculate 18% GST on your service invoices, use our <a href="/">free GST calculator</a>. To understand whether your transactions qualify as intra-state or inter-state, read our guide on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a>. For a complete overview, see <a href="/blog/what-is-gst-india">what is GST in India</a>.' },
      { type: "cta", title: "Calculate your freelance GST invoice amount", text: "Enter your fee amount \u2014 instant 18% GST breakdown with CGST/SGST and IGST splits. Free, no registration required." }
    ]
  },
  {
    slug: "input-tax-credit-gst",
    title: "Input Tax Credit Under GST \u2014 How to Claim What You're Owed",
    description: "Complete guide to Input Tax Credit under GST \u2014 eligibility conditions, blocked credits, the 180-day rule, GSTR-2B reconciliation, and how to avoid costly mistakes.",
    category: "Tax Credit",
    readTime: "6 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "Input Tax Credit is one of the most powerful \u2014 and most misunderstood \u2014 features of India's GST system. Moreover, it is the mechanism that prevents the dreaded cascading effect of taxes. Furthermore, businesses that claim ITC correctly reduce their effective tax burden significantly. However, those who claim it incorrectly face 100% penalties plus interest." },
      { type: "p", text: "The stakes are high on both sides. Specifically, a business that misses eligible ITC loses money it is legally entitled to. Conversely, a business that claims ineligible ITC invites a penalty equal to the full tax amount. Consequently, understanding ITC rules is not optional \u2014 it is fundamental to running a GST-compliant business in India." },
      { type: "stat", num: "Net GST = Output Tax \u2212 ITC", label: "The core ITC formula \u2014 you pay GST only on the value you add, not on the full sale price" },
      { type: "h2", text: "What Is Input Tax Credit and How Does It Work?" },
      { type: "p", text: "<strong>Input Tax Credit (ITC)</strong> allows a GST-registered business to deduct the GST it paid on purchases from the GST it collects on sales. Consequently, you pay tax only on the value you added \u2014 not on the full sale price. Furthermore, this mechanism eliminates the cascading effect where tax is paid on top of already-taxed amounts." },
      { type: "example", title: "ITC in action \u2014 a manufacturer example", lines: [
        "<strong>Purchase:</strong> Raw materials worth \u20B91,00,000. GST paid at 18% = \u20B918,000. This is your input tax.",
        "<strong>Sale:</strong> Finished goods worth \u20B91,50,000. GST collected at 18% = \u20B927,000. This is your output tax.",
        "<strong>Net GST payable:</strong> \u20B927,000 \u2212 \u20B918,000 = <strong>\u20B99,000</strong> \u2014 only on the \u20B950,000 value added.",
        "Without ITC, you would pay \u20B927,000 in full \u2014 nearly three times more. Furthermore, your \u20B918,000 in input tax would simply be a sunk cost."
      ] },
      { type: "h2", text: "Five Conditions You Must Meet to Claim ITC" },
      { type: "p", text: "Section 16 of the CGST Act lays down strict eligibility conditions. Moreover, all five must be satisfied simultaneously \u2014 failing even one disqualifies the claim. Consequently, businesses must track each condition actively rather than assuming ITC is automatic." },
      { type: "checklist", items: [
        { mark: "1", html: "<strong>GST registration:</strong> You must be registered under GST. Additionally, the purchase must be for business purposes \u2014 not personal use." },
        { mark: "2", html: "<strong>Valid tax invoice:</strong> You must hold a proper tax invoice or debit note from a GST-registered supplier. Furthermore, the invoice must show their GSTIN, your GSTIN, HSN/SAC codes, and correct tax breakdowns." },
        { mark: "3", html: "<strong>Goods or services received:</strong> ITC can only be claimed after you have actually received the goods or services. Moreover, for goods delivered in instalments, ITC is available only when the final instalment arrives." },
        { mark: "4", html: "<strong>Supplier has paid GST:</strong> Your supplier must have filed their GSTR-1 and the invoice must appear in your <strong>GSTR-2B</strong>. Consequently, if your supplier is non-compliant, you lose the ITC \u2014 even if you have a valid invoice." },
        { mark: "5", html: "<strong>GST returns filed:</strong> You must file your own GSTR-3B returns. Furthermore, ITC must be claimed by 30 November of the following financial year, or by the date of filing GSTR-9, whichever is earlier." }
      ] },
      { type: "h2", text: "The 180-Day Payment Rule \u2014 A Commonly Missed Condition" },
      { type: "p", text: "One of the most frequently overlooked ITC conditions is the <strong>180-day supplier payment rule</strong>. Specifically, Section 16(2) requires that you pay your supplier \u2014 including the GST amount \u2014 within 180 days of the invoice date. Moreover, if you fail to do so, the ITC already claimed must be reversed and added back to your output tax liability, along with interest." },
      { type: "warn", html: "<strong>Important:</strong> The 180-day clock starts from the invoice date \u2014 not from when you received the goods. Furthermore, part payments do not proportionally preserve ITC. Additionally, once you make the full payment, you can reclaim the reversed ITC in the return period when payment is made." },
      { type: "h3", text: "GSTR-2B reconciliation \u2014 why it matters" },
      { type: "p", text: "Since October 2022, ITC claims in GSTR-3B must match exactly with invoices appearing in your <strong>GSTR-2B</strong>. Specifically, GSTR-2B is an auto-generated statement showing all purchases declared by your suppliers in GSTR-1. Consequently, you cannot claim provisional ITC on purchases that your supplier has not yet uploaded. Moreover, regular reconciliation of your purchase register against GSTR-2B is now essential \u2014 not optional \u2014 for every GST filer." },
      { type: "h2", text: "What ITC Cannot Be Claimed \u2014 Blocked Credits Under Section 17(5)" },
      { type: "p", text: "The GST Act explicitly blocks ITC on certain categories regardless of how the purchase is used. Moreover, claiming blocked credit \u2014 even accidentally \u2014 triggers 100% penalty plus 18% interest. Furthermore, the blocked credit list covers some surprisingly common business expenses." },
      { type: "example", title: "Common blocked credits \u2014 ITC not available on these", lines: [
        "<strong>Motor vehicles</strong> (unless used for transportation of goods/passengers or driver training)",
        "<strong>Food and beverages, outdoor catering, beauty treatments, health services</strong> (unless providing these as outward supply)",
        "<strong>Membership fees</strong> \u2014 club memberships, gym memberships, health centre memberships",
        "<strong>Travel benefits to employees</strong> for personal purposes (holidays, leave travel)",
        "<strong>Works contract services</strong> for construction of immovable property (except plant and machinery)",
        "<strong>Goods or services for personal consumption</strong> by the registered person or their employees"
      ] },
      { type: "h2", text: "ITC on Capital Goods \u2014 Special Rules" },
      { type: "p", text: "Capital goods \u2014 machinery, equipment, computers, vehicles used for business \u2014 attract specific ITC rules. Specifically, you can claim ITC on capital goods used exclusively for taxable supplies. However, if capital goods are used for both taxable and exempt supplies, the ITC must be apportioned. Furthermore, you cannot claim ITC on a capital good if depreciation has been claimed on the GST component in your income tax accounts \u2014 claiming both constitutes double benefit." },
      { type: "h2", text: "ITC for E-Commerce Sellers and Importers" },
      { type: "p", text: "E-commerce sellers claiming ITC on inventory purchases follow the standard ITC conditions. However, TCS (Tax Collected at Source) deducted by platforms like Amazon and Flipkart appears as credit in your GST electronic cash ledger \u2014 not as ITC. Consequently, these are different mechanisms and should not be confused. Additionally, importers can claim ITC on IGST paid at customs, provided the goods are used for taxable outward supplies." },
      { type: "p", text: 'For the formulas to calculate exactly how much GST you will collect on sales \u2014 which determines your ITC offset \u2014 use our <a href="/">free GST calculator</a>. Additionally, for understanding which supplies attract which rate and therefore what ITC flows to which account, read our guide on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a>. Furthermore, if you are a freelancer wondering about ITC on laptops and software subscriptions, see our <a href="/blog/gst-for-freelancers-india">GST guide for freelancers</a>.' },
      { type: "cta", title: "Calculate your GST output tax instantly", text: "Know your output tax before applying ITC \u2014 enter any amount for instant CGST, SGST, and IGST breakdown." }
    ]
  },
  {
    slug: "gst-invoice-format-india",
    title: "GST Invoice Format \u2014 All Mandatory Fields and Rules",
    description: "All 16 mandatory fields under GST Rule 46, invoice types, e-invoicing rules, and the most common mistakes that invalidate ITC claims \u2014 with a field checklist.",
    category: "Invoicing",
    readTime: "5 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "A GST invoice is not just a payment request \u2014 it is a legal document. Moreover, it is the only instrument through which your buyer can claim Input Tax Credit. Furthermore, an invoice missing even one mandatory field can be considered invalid under the GST Act \u2014 resulting in rejected ITC claims, penalties, and supplier disputes." },
      { type: "p", text: "Getting the invoice format right is therefore not merely an administrative detail. Specifically, it is the foundation of your entire GST compliance. Additionally, with e-invoicing now mandatory for businesses above \u20B95 crore, the stakes of non-compliance have increased significantly." },
      { type: "stat", num: "16", label: "Mandatory fields required on every GST tax invoice under Rule 46 of the CGST Rules, 2017" },
      { type: "h2", text: "All 16 Mandatory Fields on a GST Invoice \u2014 Rule 46 Explained" },
      { type: "p", text: "Rule 46 of the CGST Rules prescribes the exact fields every tax invoice must contain. Moreover, these apply to all GST-registered businesses issuing invoices for taxable supplies. Consequently, whether you use a manual template, Excel, or invoicing software, every invoice must include all 16 elements." },
      { type: "invoiceFields", items: [
        { title: "Supplier's name, address, and GSTIN", text: "Your complete legal name as registered, registered address, and 15-digit GSTIN. Furthermore, the state code embedded in your GSTIN determines whether CGST/SGST or IGST applies." },
        { title: "Invoice number", text: "A unique consecutive serial number within a financial year. Specifically, it can contain up to 16 characters including letters, numbers, and / or - symbols. Moreover, gaps in numbering are not permitted." },
        { title: "Invoice date", text: "The date of issue. Furthermore, for goods, the invoice must be issued before or at the time of delivery. For services, it must be issued within 30 days of supply." },
        { title: "Recipient's name, address, and GSTIN", text: "If the buyer is GST-registered, their GSTIN is mandatory. Consequently, an incorrect GSTIN \u2014 even one digit wrong \u2014 prevents the buyer from claiming ITC." },
        { title: "Place of supply", text: "The state where the supply is deemed to occur. Specifically, this field determines whether CGST+SGST or IGST applies \u2014 it is not simply the delivery address." },
        { title: "HSN code (goods) or SAC code (services)", text: "The classification code for goods (Harmonised System of Nomenclature) or services (Service Accounting Code). Moreover, businesses above \u20B95 crore must show the full 8-digit code." },
        { title: "Description of goods or services", text: 'A clear description of what was supplied. Furthermore, vague descriptions like "services rendered" are insufficient and may trigger audit queries.' },
        { title: "Quantity and unit (for goods)", text: "Quantity in the relevant unit of measurement (kg, metres, pieces, etc.). Additionally, this field enables buyers and auditors to verify transaction values against market rates." },
        { title: "Taxable value", text: "The value of goods or services before GST \u2014 also called the GST-exclusive amount. Consequently, this is the base on which the tax percentage is applied." },
        { title: "GST rate", text: "The applicable rate \u2014 5%, 12%, 18%, or 28%. Furthermore, if multiple items attract different rates, each must be listed separately with its own tax line." },
        { title: "CGST + SGST or IGST amounts", text: "The actual tax amounts in rupees \u2014 either split as CGST/SGST for intra-state or shown as IGST for inter-state. Moreover, these amounts must be mathematically consistent with the rate and taxable value." },
        { title: "Total invoice value", text: "Taxable value plus all applicable GST. Additionally, if the invoice is in foreign currency, the INR equivalent must also be stated." },
        { title: "Whether tax is payable on reverse charge", text: "A mandatory Yes/No statement. Furthermore, if RCM applies, the recipient pays GST \u2014 not the supplier. Consequently, this field alerts the buyer to their liability." },
        { title: "Signature of authorised signatory", text: "Physical or digital signature of the supplier or their authorised representative. Moreover, e-invoices authenticated through the IRP system are deemed digitally signed." },
        { title: "Delivery address (if different from billing)", text: "Required when goods are shipped to a location different from the billing address. Specifically, this determines the correct state for IGST/SGST classification." },
        { title: "For unregistered buyers above \u20B950,000", text: "Additional recipient details \u2014 name, address, and state of delivery \u2014 are mandatory when selling to an unregistered person and the invoice value exceeds \u20B950,000." }
      ] },
      { type: "h2", text: "Types of GST Invoices \u2014 Which One Should You Issue?" },
      { type: "p", text: "Not every transaction requires a tax invoice. Specifically, the type of invoice depends on your GST registration status, the nature of the supply, and whether the recipient can claim ITC." },
      { type: "statGrid", items: [
        { n: "Tax Invoice", l: "Standard \u2014 taxable goods/services \u2014 buyer can claim ITC" },
        { n: "Bill of Supply", l: "Exempt goods or composition dealers \u2014 no GST charged" },
        { n: "Credit Note", l: "Reduce taxable value \u2014 returns, discounts, rate corrections" },
        { n: "Debit Note", l: "Increase taxable value \u2014 underbilling corrections" }
      ] },
      { type: "h2", text: "E-Invoicing \u2014 Is It Mandatory for Your Business?" },
      { type: "p", text: "E-invoicing under GST requires eligible businesses to register invoices on the <strong>Invoice Registration Portal (IRP)</strong> before sending them to buyers. Moreover, the IRP generates a unique <strong>Invoice Reference Number (IRN)</strong> and a QR code that must appear on the invoice." },
      { type: "p", text: "Currently, e-invoicing is mandatory for businesses with <strong>annual aggregate turnover above \u20B95 crore</strong>. Furthermore, from 1 April 2025, businesses above \u20B910 crore must upload invoices to the IRP within <strong>30 days</strong> of the invoice date \u2014 invoices uploaded later are rejected. Additionally, e-invoices are automatically populated in GSTR-1, significantly reducing manual filing effort. Consequently, businesses close to the \u20B95 crore threshold should prepare their systems proactively rather than scrambling at the last moment." },
      { type: "h3", text: "What happens if you don't generate an e-invoice when required?" },
      { type: "p", text: "The consequences are significant. Specifically, a non-e-invoiced invoice from an eligible business is treated as invalid under GST law. Moreover, your buyer cannot claim ITC against it \u2014 creating a serious commercial dispute. Furthermore, you face a penalty of \u20B910,000 per invoice or 100% of the tax involved, whichever is higher. As a result, e-invoicing compliance is not a back-office detail \u2014 it directly affects your business relationships." },
      { type: "h2", text: "Six Most Common GST Invoice Mistakes to Avoid" },
      { type: "checklist", items: [
        { mark: "\u2717", html: "<strong>Wrong GSTIN:</strong> A single digit error in the buyer's GSTIN invalidates their ITC claim. Furthermore, always verify GSTINs on the official GST portal before issuing an invoice." },
        { mark: "\u2717", html: "<strong>Incorrect HSN/SAC code:</strong> Using a wrong code misclassifies the supply and may trigger audit questions. Additionally, it may indicate an incorrect GST rate was applied." },
        { mark: "\u2717", html: "<strong>Wrong place of supply:</strong> Charging CGST/SGST on an inter-state transaction \u2014 or IGST on an intra-state one \u2014 creates a liability mismatch that is extremely difficult to correct after filing." },
        { mark: "\u2717", html: "<strong>Non-sequential invoice numbers:</strong> Gaps in invoice numbering are a red flag in GST audits. Consequently, every invoice number in a financial year must follow without interruption." },
        { mark: "\u2717", html: "<strong>Omitting RCM declaration:</strong> Failing to state whether reverse charge applies leaves the buyer uncertain about their tax liability. Moreover, it may result in double tax payment." },
        { mark: "\u2717", html: "<strong>Missing IRN/QR code for eligible businesses:</strong> If you are above the e-invoicing threshold and omit the IRN, your invoice is legally invalid \u2014 regardless of how correct all other fields are." }
      ] },
      { type: "p", text: 'To calculate the exact CGST, SGST, and IGST amounts that must appear on your invoice, use our <a href="/">free GST calculator</a>. Additionally, for understanding which type of GST applies to your transaction, read our guide on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a>. Furthermore, to understand how your buyer uses this invoice to claim credit, see our article on <a href="/blog/input-tax-credit-gst">Input Tax Credit under GST</a>.' },
      { type: "cta", title: "Calculate the tax amounts for your invoice", text: "Enter your taxable value \u2014 get instant CGST, SGST, and IGST figures ready to fill into your invoice." }
    ]
  },
  {
    slug: "reverse-charge-mechanism-gst",
    title: "Reverse Charge Mechanism Under GST \u2014 Complete Guide",
    description: "What is Reverse Charge Mechanism under GST? When buyers pay GST instead of sellers \u2014 who it applies to, RCM on imports, self-invoice rules, and ITC on RCM.",
    category: "Compliance",
    readTime: "5 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "In most transactions, the seller collects GST from the buyer and pays it to the government. However, the Reverse Charge Mechanism (RCM) turns this on its head. Specifically, under RCM the buyer is responsible for paying GST directly to the government \u2014 bypassing the supplier entirely. Furthermore, this rule catches many business owners off guard, creating unexpected tax liabilities." },
      { type: "p", text: "Moreover, RCM is not a rare exception. Specifically, it applies to a broad range of transactions including purchases from unregistered suppliers, imports of services, legal services, and goods transport. Consequently, any business that buys from unregistered vendors or imports services from abroad must understand RCM thoroughly." },
      { type: "stat", num: "Buyer pays GST", label: "Under Reverse Charge Mechanism \u2014 not the supplier. The buyer must self-invoice and file a reverse charge entry in GSTR-3B." },
      { type: "h2", text: "What Is Reverse Charge Mechanism \u2014 and Why Does It Exist?" },
      { type: "p", text: "RCM exists primarily to ensure GST compliance in transactions where the supplier is either unregistered, operating in an unorganised sector, or located outside India. Specifically, the government recognised that collecting tax from millions of small unregistered vendors would be administratively impossible. Consequently, it shifted the compliance burden to the GST-registered buyer \u2014 who is already in the tax system and has a GSTIN." },
      { type: "p", text: "Additionally, RCM applies to specific categories of notified goods and services under Section 9(3) of the CGST Act \u2014 regardless of whether the supplier is registered or not. Therefore, even when buying from a fully registered GST vendor, RCM can apply if the transaction falls under the notified list." },
      { type: "h2", text: "When Does RCM Apply? The Three Main Scenarios" },
      { type: "h3", text: "Scenario 1 \u2014 Purchases from unregistered suppliers (Section 9(4))" },
      { type: "p", text: "When a GST-registered business purchases goods or services from an <strong>unregistered supplier</strong>, RCM applies. Moreover, this was a major compliance concern for small businesses buying from local vendors, contractors, and petty traders who are not GST-registered." },
      { type: "highlight", html: "Practical example: A registered Mumbai retailer pays \u20B950,000 to a local unregistered interior designer. As a result, the retailer must self-assess GST at 18% (\u20B99,000), pay it to the government, issue a self-invoice, and declare it in GSTR-3B under reverse charge." },
      { type: "h3", text: "Scenario 2 \u2014 Notified goods and services (Section 9(3))" },
      { type: "p", text: "Certain specific goods and services attract RCM regardless of whether the supplier is registered. Furthermore, these are listed in notifications issued by the GST Council. Consequently, businesses in these sectors must check applicability proactively." },
      { type: "example", title: "Common notified RCM categories", lines: [
        "<strong>Legal services:</strong> Services by an advocate or law firm to a business entity. Therefore, companies paying legal fees must pay GST under RCM.",
        "<strong>Goods Transport Agency (GTA):</strong> Freight services by a GTA to a registered recipient attract 5% GST under RCM (alternatively, the GTA can charge 12% and pay themselves).",
        "<strong>Sponsorship services:</strong> Any body corporate or partnership firm receiving sponsorship services pays GST under RCM.",
        "<strong>Director's services:</strong> Services by a director to their own company attract RCM on the company.",
        "<strong>Security services:</strong> Supply by an individual to a registered body corporate attracts RCM.",
        "<strong>Renting of motor vehicles:</strong> In specific configurations defined by GST notifications."
      ] },
      { type: "h3", text: "Scenario 3 \u2014 Import of services from outside India" },
      { type: "p", text: "When a business imports services from a foreign supplier \u2014 for instance, paying a US-based SaaS company, a UK marketing agency, or a Singapore consultant \u2014 IGST under RCM applies. Specifically, the Indian recipient must pay IGST at the applicable rate on the foreign payment amount. Moreover, this is called <strong>Online Information and Database Access or Retrieval (OIDAR)</strong> services in specific contexts. Consequently, Indian businesses paying for Zoom subscriptions, Google Workspace, Adobe Creative Cloud, or foreign consulting fees all have potential RCM liability." },
      { type: "h2", text: "How to Comply With RCM \u2014 Step by Step" },
      { type: "steps", items: [
        "Identify the RCM transaction. Specifically, check whether the purchase is from an unregistered supplier or falls under the Section 9(3) notified list.",
        "Issue a self-invoice. Furthermore, the registered buyer must create an invoice on behalf of the unregistered supplier \u2014 showing their own GSTIN as recipient, the supplier's details, and the GST amount.",
        "Calculate the GST liability. Apply the appropriate rate to the transaction value.",
        "Pay the GST in cash. Specifically, RCM liability cannot be paid using existing ITC balances in your electronic credit ledger. As a result, it must be paid in cash to the government.",
        "Declare in GSTR-3B. Report the RCM liability in Table 3.1(d) of GSTR-3B in the month the payment is made to the supplier.",
        "Claim ITC on the RCM paid. Crucially, the buyer can claim ITC on the RCM GST paid \u2014 provided the purchase is for business purposes and not blocked under Section 17(5). Consequently, the net cash outflow is often zero for fully registered businesses."
      ] },
      { type: "h2", text: "Can You Claim ITC on RCM Payments?" },
      { type: "p", text: "Yes \u2014 with conditions. Specifically, ITC on RCM-paid GST is available in the same return period in which the RCM GST is paid. Moreover, this ITC is available only if the underlying purchase is for business purposes and not in the blocked credit list. Consequently, for many businesses the ITC immediately offsets the RCM liability, making the net impact zero. However, the compliance steps \u2014 self-invoice, GSTR-3B declaration, cash payment \u2014 must still be completed correctly." },
      { type: "p", text: 'For calculating the GST amount payable under RCM on any transaction, use our <a href="/">GST calculator</a>. Additionally, understanding which type of GST (CGST/SGST or IGST) applies to your RCM purchase requires knowing the place of supply \u2014 see our guide on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a>. Furthermore, for how ITC works after RCM payment, read our full article on <a href="/blog/input-tax-credit-gst">Input Tax Credit under GST</a>.' },
      { type: "cta", title: "Calculate RCM GST amount instantly", text: "Enter the transaction value \u2014 get instant CGST, SGST, and IGST amounts for any RCM calculation. Free and instant." }
    ]
  },
  {
    slug: "gst-composition-scheme",
    title: "GST Composition Scheme \u2014 Who Qualifies and How It Works",
    description: "The GST Composition Scheme lets small businesses pay a flat low rate instead of regular GST \u2014 eligibility, rates, restrictions, and whether it suits your business.",
    category: "Small Business",
    readTime: "5 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "India's GST system includes a simplified option specifically designed for small businesses \u2014 the Composition Scheme. Moreover, it offers a dramatically lower tax rate, reduced compliance, and quarterly instead of monthly filing. Furthermore, for small traders, manufacturers, and restaurants with mostly local customers, it can significantly reduce the administrative burden of GST." },
      { type: "p", text: "However, the scheme comes with important restrictions that make it unsuitable for many businesses. Specifically, composition dealers cannot collect GST from customers, cannot issue tax invoices, and cannot claim input tax credit. Consequently, choosing between the Composition Scheme and regular GST requires careful analysis of your business model." },
      { type: "stat", num: "\u20B91.5 crore", label: "Annual turnover limit for traders and manufacturers to opt into the Composition Scheme (\u20B975 lakhs for special category states)" },
      { type: "h2", text: "What Is the GST Composition Scheme?" },
      { type: "p", text: "The Composition Scheme is an alternative to regular GST registration. Specifically, instead of calculating GST on every transaction and filing detailed returns monthly, a composition dealer pays a fixed percentage of their annual turnover as GST. Moreover, this rate is substantially lower than regular GST rates. Furthermore, the scheme is administered under Section 10 of the CGST Act." },
      { type: "h3", text: "Composition scheme GST rates by business type" },
      { type: "statGrid", items: [
        { n: "1%", l: "Manufacturers and traders (0.5% CGST + 0.5% SGST)" },
        { n: "5%", l: "Restaurants not serving alcohol" },
        { n: "6%", l: "Service providers under CGST Rule 7 (3% CGST + 3% SGST)" },
        { n: "Quarterly", l: "Filing frequency \u2014 vs monthly for regular GST dealers" }
      ] },
      { type: "h2", text: "Who Can Opt for the Composition Scheme?" },
      { type: "p", text: "Eligibility depends on both turnover thresholds and the nature of your business. Moreover, all conditions must be met simultaneously. Specifically, the key eligibility criteria are:" },
      { type: "checklist", items: [
        { mark: "\u2713", html: "<strong>Turnover below \u20B91.5 crore:</strong> Annual aggregate turnover must not exceed \u20B91.5 crore. Furthermore, for businesses in special category states (including northeastern states, Himachal Pradesh, and Uttarakhand), the limit is \u20B975 lakhs." },
        { mark: "\u2713", html: "<strong>Goods-based or restaurant business:</strong> Primarily available for traders, manufacturers, and restaurants. Moreover, a separate scheme under CGST Rule 7 extends a similar option to service providers with turnover below \u20B950 lakhs." },
        { mark: "\u2713", html: "<strong>Intra-state supplies only:</strong> Composition dealers can only supply within their home state. Consequently, businesses with regular interstate customers are ineligible." },
        { mark: "\u2713", html: "<strong>No e-commerce sales:</strong> If you sell through Amazon, Flipkart, Meesho, or any other e-commerce operator, you cannot opt for the Composition Scheme. Specifically, e-commerce platforms are required to collect TCS, which is incompatible with the composition mechanism." }
      ] },
      { type: "h2", text: "Who Is Excluded From the Composition Scheme?" },
      { type: "p", text: "Certain businesses are explicitly barred from the scheme regardless of turnover. Specifically, these include ice cream and pan masala manufacturers, producers of tobacco products, suppliers of goods not leviable to GST, suppliers who provide services other than restaurant services (in the standard scheme), and any business making inter-state supplies. Moreover, if any one business in a PAN has opted out of the scheme, all businesses under that PAN must also opt out. Consequently, composition dealers with multiple business verticals must plan carefully." },
      { type: "h2", text: "Key Restrictions \u2014 What Composition Dealers Cannot Do" },
      { type: "p", text: "The simplicity of the Composition Scheme comes with significant trade-offs. Furthermore, these restrictions are deal-breakers for many business models. Consequently, understanding them before opting in is essential." },
      { type: "example", title: "What composition dealers cannot do", lines: [
        "<strong>Cannot collect GST from customers:</strong> The tax you pay is entirely from your own pocket \u2014 at 1% or 5% of turnover. Specifically, you cannot add GST to your invoice and collect it from buyers.",
        '<strong>Cannot issue a tax invoice:</strong> Instead, composition dealers issue a <strong>bill of supply</strong> which bears the words "Composition taxable person, not eligible to collect tax on supplies." As a result, your B2B customers cannot claim ITC on purchases from you.',
        "<strong>Cannot claim input tax credit:</strong> Composition dealers are ineligible for ITC on their purchases. Therefore, GST paid on inputs is simply a cost \u2014 it cannot be offset against any liability.",
        "<strong>Cannot make inter-state supplies:</strong> All sales must be within the state of registration. Moreover, even occasional inter-state orders disqualify you from the scheme retroactively."
      ] },
      { type: "h2", text: "How to Register for the Composition Scheme" },
      { type: "p", text: "Existing GST registrants can opt into the Composition Scheme at the beginning of a financial year by filing <strong>Form CMP-02</strong> on the GST portal. Specifically, the option must be exercised before the start of the financial year for which it is to apply. Furthermore, new registrants can choose the scheme at the time of initial GST registration." },
      { type: "p", text: "Importantly, opting into the scheme means filing <strong>GSTR-4</strong> \u2014 an annual return \u2014 instead of monthly GSTR-1 and GSTR-3B. Moreover, a quarterly challan (CMP-08) is filed to pay the tax. Consequently, total annual compliance filings reduce from approximately 25 returns to just 5 \u2014 a significant administrative simplification." },
      { type: "h2", text: "Composition Scheme vs Regular GST \u2014 Which Is Better for You?" },
      { type: "p", text: "The Composition Scheme is advantageous if your customers are primarily end consumers (B2C) who do not need ITC. Moreover, it suits businesses with high turnover but low input costs \u2014 since ITC is unavailable, the scheme works best when your input GST is minimal. Conversely, businesses with significant B2B customers who claim ITC will find that composition registration makes them unattractive as suppliers \u2014 losing customers who need tax invoices." },
      { type: "quote", text: "Rule of thumb: If more than 50% of your revenue comes from B2B customers who claim ITC, regular GST registration almost always serves you better than the Composition Scheme." },
      { type: "p", text: 'For calculating how much tax you would pay under regular GST versus the composition rate, use our <a href="/">GST calculator</a>. Additionally, if you are a service provider wondering about the \u20B950 lakh service composition scheme, see our guide on <a href="/blog/gst-for-freelancers-india">GST for freelancers and service providers</a>. Furthermore, for understanding what ITC you give up by opting in, read our full article on <a href="/blog/input-tax-credit-gst">Input Tax Credit under GST</a>.' },
      { type: "cta", title: "Compare your regular vs composition GST liability", text: "Enter your sale amount to see the regular GST figure \u2014 then compare it to 1% or 5% of your turnover under composition." }
    ]
  },
  {
    slug: "gst-on-ecommerce-india",
    title: "GST for E-Commerce Sellers in India \u2014 Amazon, Flipkart, and Meesho",
    description: "Everything Indian e-commerce sellers need to know about GST \u2014 mandatory registration, TCS deductions, marketplace GSTR-8 filing, and reconciling online sales.",
    category: "E-Commerce",
    readTime: "6 min",
    date: "2026-04-20",
    body: [
      { type: "lead", text: "If you sell products online through Amazon, Flipkart, Meesho, Myntra, or any other marketplace in India, GST has specific rules that apply only to e-commerce transactions. Moreover, these rules differ significantly from regular offline selling. Furthermore, non-compliance \u2014 even unintentionally \u2014 can result in blocked seller accounts, tax demands, and penalties that disrupt your business." },
      { type: "p", text: "Additionally, the e-commerce GST framework involves a mechanism called Tax Collected at Source (TCS) that most new online sellers discover only when they notice money being deducted from their marketplace payouts. Consequently, understanding TCS \u2014 and how to reconcile it \u2014 is essential for every e-commerce seller on any Indian platform." },
      { type: "stat", num: "Mandatory", label: "GST registration for ALL e-commerce sellers in India \u2014 no turnover threshold exemption applies, unlike offline businesses" },
      { type: "h2", text: "Why E-Commerce Sellers Must Register for GST Regardless of Turnover" },
      { type: "p", text: "This is the single most important difference between online and offline selling under GST. Specifically, offline businesses below \u20B940 lakhs (goods) or \u20B920 lakhs (services) turnover are exempt from mandatory GST registration. However, e-commerce sellers are explicitly excluded from this exemption under Section 24 of the CGST Act. Consequently, even a seller with \u20B91 lakh annual turnover on Amazon must obtain GST registration before making their first sale." },
      { type: "p", text: "Furthermore, this rule applies across all platforms \u2014 Amazon India, Flipkart, Meesho, Nykaa, Myntra, Snapdeal, and any other marketplace. Moreover, it applies whether you are an individual selling handmade crafts or a business selling manufactured goods. As a result, the very first step before listing products on any marketplace is obtaining a GSTIN." },
      { type: "h2", text: "What Is TCS Under GST \u2014 and Why Are Marketplaces Deducting from Your Payout?" },
      { type: "p", text: "<strong>Tax Collected at Source (TCS)</strong> under GST is governed by Section 52 of the CGST Act. Specifically, every e-commerce operator \u2014 Amazon, Flipkart, Meesho \u2014 must deduct 1% TCS (0.5% CGST + 0.5% SGST for intra-state, or 1% IGST for inter-state) from every payment made to you. Moreover, this deduction happens automatically before the marketplace transfers your settlement amount." },
      { type: "example", title: "How TCS works on a \u20B910,000 sale", lines: [
        "<strong>Customer pays:</strong> \u20B910,000 (inclusive of GST) to Amazon at checkout.",
        "<strong>TCS deducted:</strong> 1% of net value = \u20B985 (approximately, after removing the GST component).",
        "<strong>Payout to seller:</strong> \u20B910,000 minus Amazon commission minus TCS minus other charges.",
        "<strong>Your benefit:</strong> The \u20B985 TCS appears as a <strong>credit in your GST electronic cash ledger</strong> \u2014 available to offset your GST liability. Consequently, TCS is not a loss \u2014 it is an advance tax credit."
      ] },
      { type: "h2", text: "Marketplace GST Obligations \u2014 What Amazon, Flipkart, and Meesho Must Do" },
      { type: "p", text: "E-commerce operators have their own GST compliance obligations. Specifically, every marketplace must register for GST across all states where it operates \u2014 regardless of turnover. Furthermore, they must file <strong>GSTR-8</strong> monthly, declaring all TCS collected from sellers and remitting it to the government. Additionally, they must provide sellers with a statement of TCS deductions, which feeds into the seller's GSTR-2B for reconciliation purposes." },
      { type: "p", text: "As a result, TCS deducted by your marketplace appears in your <strong>GSTR-2B</strong> by the 10th of the following month. Consequently, you can claim this credit in your GSTR-3B to reduce your net GST payable. Furthermore, if TCS credits exceed your GST liability for a period, you can claim a cash refund from the government \u2014 though this process requires filing a specific refund application." },
      { type: "h2", text: "How to Reconcile Your E-Commerce Sales for GST Filing" },
      { type: "p", text: "Most e-commerce sellers struggle with reconciliation because their sales involve multiple states, different GST rates across products, and marketplace deductions. Moreover, the volume of transactions makes manual reconciliation impractical. Consequently, a systematic approach is essential." },
      { type: "steps", items: [
        "Download your sales report from the marketplace. Specifically, Amazon's Seller Central and Flipkart's Seller Hub provide downloadable transaction reports with order-level GST details.",
        "Classify by state of buyer. Furthermore, each sale must be classified as intra-state (CGST+SGST) or inter-state (IGST) based on the delivery state versus your registered state.",
        "Reconcile with GSTR-2B. Specifically, check that TCS credits appearing in GSTR-2B match the TCS deductions shown in your marketplace settlement statements.",
        "Report in GSTR-1. Moreover, all sales must be declared invoice-by-invoice (or in aggregate for B2C sales below \u20B92.5 lakh per state) in GSTR-1 by the 11th of the following month.",
        "File GSTR-3B. Consequently, pay the net GST liability after offsetting ITC on purchases and TCS credits. Additionally, declare TCS credits claimed in the relevant table of GSTR-3B."
      ] },
      { type: "h2", text: "Can E-Commerce Sellers Use the Composition Scheme?" },
      { type: "p", text: "No. Explicitly, e-commerce sellers are barred from opting for the GST Composition Scheme under Section 10(2) of the CGST Act. Specifically, any business making supplies through an e-commerce operator \u2014 regardless of turnover \u2014 must be a regular GST registrant. Consequently, if you started as a composition dealer and want to start selling online, you must convert to regular GST registration first." },
      { type: "h2", text: "GST on Returns, Cancellations, and Refunds in E-Commerce" },
      { type: "p", text: "Returns are a significant volume event for e-commerce sellers. Specifically, when a customer returns an order, the original GST liability must be reversed. Moreover, this is handled through a <strong>credit note</strong> \u2014 issued by you (the seller) against the original tax invoice. Furthermore, the credit note reduces your output tax liability in the period it is issued. Consequently, returned goods should not lead to permanent GST costs if credit notes are raised correctly and within the same financial year." },
      { type: "p", text: 'For calculating GST on individual product listings at different rate slabs, use our <a href="/">free GST calculator</a>. Additionally, to understand why e-commerce sellers cannot use composition scheme, see our guide on the <a href="/blog/gst-composition-scheme">GST Composition Scheme</a>. Furthermore, for how to handle inter-state sales and the CGST/IGST classification, read our article on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a>.' },
      { type: "cta", title: "Calculate GST on your product listings instantly", text: "Enter any product price \u2014 instant CGST, SGST, and IGST breakdown for all rate slabs. Free, no registration needed." }
    ]
  },
  {
    slug: "gst-impact-indian-economy-statistics",
    title: "How GST Impacts the Indian Economy Statistics (2025): 52+ Data Points on Revenue, Growth, and GDP Contribution",
    description: "52+ data points on how GST impacts India's economy \u2014 monthly collections, GDP contribution, growth rate, and sector-wise revenue.",
    category: "Statistics",
    readTime: "7 min",
    date: "2026-05-03",
    body: [{ "type": "lead", "text": "India's GST collections crossed \u20B91.87 lakh crore in April 2024\u2014the highest ever monthly collection (Ministry of Finance, GST Revenue Data 2024)." }, { "type": "p", "text": "That single figure reflects a tax system that now contributes over 30% of India's indirect tax revenue base. Meanwhile, GST collections have grown at a compound annual rate exceeding 12% since 2018 (CBIC Annual Report 2024). At the macro level, indirect taxes including GST contribute roughly 11\u201312% of India's GDP (Economic Survey of India 2024). We aggregated data from Ministry of Finance, CBIC, RBI, World Bank, and OECD along with primary datasets. GST is no longer just a tax reform\u2014it is a structural backbone of India's economic system." }, { "type": "h2", "text": "Key Takeaways" }, { "type": "ul", "items": ["<strong>\u20B91.87 lakh crore is the highest GST collection ever</strong> (Ministry of Finance 2024).", "Average monthly GST collections exceed <strong>\u20B91.6 lakh crore</strong> (CBIC 2024).", "GST contributes <strong>30%+ of indirect tax revenue</strong> (Economic Survey 2024).", "GST collections grew <strong>12% CAGR since 2018</strong> (CBIC 2024).", "Indirect taxes contribute <strong>~11\u201312% of GDP</strong> (Economic Survey 2024).", "Over <strong>1.4 crore taxpayers are registered under GST</strong> (GSTN 2024).", "GST reduced logistics costs by <strong>20%+</strong> (World Bank 2023).", "Compliance improved steadily due to digital filing (OECD 2024).", "GST replaced 17+ taxes under a unified system.", "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me"] }, { "type": "divider" }, { "type": "h2", "text": "1. Monthly GST Revenue Trends" }, { "type": "p", "text": "<strong>Monthly GST collections now consistently exceed \u20B91.5 lakh crore</strong>, signaling strong compliance and consumption demand. The pattern shows seasonal spikes\u2014April and December dominate due to year-end adjustments and festive demand." }, { "type": "image", "src": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80", "alt": "gst revenue trends india" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Highest GST collection month", "\u20B91.87 lakh crore (April 2024)", "Ministry of Finance 2024"], ["Average monthly GST", "\u20B91.6 lakh crore", "CBIC 2024"], ["YoY growth rate", "~10\u201312%", "RBI 2024"], ["Pre-GST indirect tax (2016)", "\u20B98.5 lakh crore annually", "Economic Survey 2017"], ["GST annual collections (2024)", "\u20B920 lakh crore+", "CBIC 2024"]] }, { "type": "p", "text": "Calculate GST instantly here \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.cbic.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "2. GST Contribution to GDP" }, { "type": "p", "text": "GST's role has shifted from tax reform to economic stabilizer. Its predictability strengthens fiscal planning and improves tax buoyancy." }, { "type": "image", "src": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80", "alt": "india gdp growth" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Indirect tax share of GDP", "11\u201312%", "Economic Survey 2024"], ["GST share in indirect taxes", "~30\u201335%", "RBI 2024"], ["Tax buoyancy (GST)", "1.2\u20131.3", "OECD 2024"], ["GDP growth correlation", "Positive post-2018", "World Bank 2023"]] }, { "type": "p", "text": "Try this GST calculator for accurate results \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.indiabudget.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "3. GST Growth Rate India" }, { "type": "p", "text": "GST growth has outpaced GDP growth in several years, indicating expanding compliance rather than just economic expansion." }, { "type": "image", "src": "https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?auto=format&fit=crop&w=1600&q=80", "alt": "growth chart" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["GST CAGR (2018\u20132024)", "~12%", "CBIC 2024"], ["GDP growth (same period)", "~6\u20137%", "World Bank 2024"], ["Compliance-driven growth", "+5\u20136%", "OECD 2024"], ["Digital filing increase", "+40%", "GSTN 2024"]] }, { "type": "p", "text": "Calculate GST instantly here \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://data.worldbank.org" }, { "type": "divider" }, { "type": "h2", "text": "4. GST vs Pre-GST Tax System" }, { "type": "p", "text": "GST simplified a fragmented system of indirect taxes, reducing cascading tax effects." }, { "type": "image", "src": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80", "alt": "tax comparison" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Taxes replaced", "17+", "Ministry of Finance"], ["Logistics cost reduction", "20%", "World Bank 2023"], ["Tax cascading eliminated", "Yes", "OECD 2024"], ["Ease of doing business improvement", "+30 ranks", "World Bank"]] }, { "type": "p", "text": "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.worldbank.org" }, { "type": "divider" }, { "type": "h2", "text": "5. Sector-wise GST Contribution" }, { "type": "p", "text": "Consumption-heavy sectors dominate GST collections, reflecting India's demand-driven economy." }, { "type": "image", "src": "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1600&q=80", "alt": "retail economy" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Services sector share", "~45%", "CBIC 2024"], ["Manufacturing", "30%", "CBIC 2024"], ["Retail & FMCG", "15%", "Statista 2024"], ["E-commerce GST growth", "+25%", "MeitY 2024"]] }, { "type": "sourceLink", "href": "https://www.meity.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "Summary Table" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Highest GST month", "\u20B91.87L Cr", "MoF"], ["Annual GST", "\u20B920L Cr+", "CBIC"], ["GDP contribution", "~12%", "Economic Survey"], ["CAGR", "12%", "CBIC"], ["Taxpayers", "1.4 Cr+", "GSTN"]] }, { "type": "divider" }, { "type": "h2", "text": "Methodology and Sources" }, { "type": "p", "text": "Primary government datasets and international financial institutions were prioritized. Cross-referencing ensured consistency and recency." }, { "type": "ul", "items": ["Ministry of Finance \u2014 GST Revenue Data", "CBIC \u2014 Annual Reports", "RBI \u2014 Economic Data", "World Bank \u2014 Economic Indicators", "OECD \u2014 Tax Statistics"] }, { "type": "p", "text": "<strong>Last updated: May 2026</strong>" }, { "type": "divider" }, { "type": "p", "text": 'Calculate GST instantly here \u2192 <a href="https://gstcalculator.me">https://gstcalculator.me</a>' }]
  },
  {
    slug: "gst-rates-structure-statistics",
    title: "How GST Rates Are Structured and Applied Statistics (2025): 50+ Data Points on Slabs, Categories, and Tax Distribution",
    description: "50+ data points on India's GST rate structure \u2014 slab distribution, revenue contribution, rate revisions, and category-wise tax burden.",
    category: "Statistics",
    readTime: "7 min",
    date: "2026-05-03",
    body: [{ "type": "lead", "text": "India operates a four-tier GST system with rates of 5%, 12%, 18%, and 28%, covering over 95% of goods and services (GST Council Report 2024)." }, { "type": "p", "text": "The 18% slab alone accounts for the majority of taxable transactions, contributing nearly 60% of GST revenue (CBIC Data 2024). Meanwhile, over 50% of essential goods fall under the 5% or zero-tax bracket (Ministry of Finance 2024). We aggregated data from GST Council, CBIC, Ministry of Finance, OECD, and World Bank. GST rate structure is not just taxation\u2014it defines consumption patterns, affordability, and economic distribution." }, { "type": "h2", "text": "Key Takeaways" }, { "type": "ul", "items": ["<strong>18% slab generates ~60% of GST revenue</strong> (CBIC 2024).", "5% slab covers most essential goods (MoF 2024).", "28% slab applies to luxury and sin goods.", "GST replaced multi-layer VAT and excise taxes.", "Over 95% of goods fall within 4 slabs.", "GST Council has revised rates 50+ times since 2017.", "Tax rationalization reduced items in 28% slab by 70%.", "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me"] }, { "type": "divider" }, { "type": "h2", "text": "1. GST Slab Distribution in India" }, { "type": "p", "text": "<strong>The 18% slab dominates the tax system</strong>, reflecting a balance between revenue generation and affordability." }, { "type": "image", "src": "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1600&q=80", "alt": "gst slabs" }, { "type": "table", "headers": ["GST Slab", "Share of Goods", "Source"], "rows": [["0%", "~10%", "MoF 2024"], ["5%", "~40%", "GST Council 2024"], ["12%", "~15%", "CBIC 2024"], ["18%", "~30%", "CBIC 2024"], ["28%", "~5%", "GST Council 2024"]] }, { "type": "p", "text": "Calculate GST instantly here \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://gstcouncil.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "2. Revenue Contribution by GST Slabs" }, { "type": "p", "text": "Higher slabs contribute disproportionately to revenue despite covering fewer goods." }, { "type": "image", "src": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80", "alt": "tax revenue chart" }, { "type": "table", "headers": ["Slab", "Revenue Share", "Source"], "rows": [["5%", "~20%", "CBIC 2024"], ["12%", "~10%", "CBIC 2024"], ["18%", "~60%", "CBIC 2024"], ["28%", "~10%", "CBIC 2024"]] }, { "type": "p", "text": "Try this GST calculator for accurate results \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.cbic.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "3. GST Rate Changes Over Time" }, { "type": "p", "text": "GST rates have been gradually rationalized to reduce tax burden and simplify compliance." }, { "type": "image", "src": "https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?auto=format&fit=crop&w=1600&q=80", "alt": "tax changes" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Items removed from 28% slab", "-70%", "MoF 2024"], ["Total GST revisions", "50+", "GST Council"], ["Average rate reduction", "~3\u20135%", "RBI 2024"], ["Compliance improvement", "+25%", "OECD 2024"]] }, { "type": "p", "text": "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://rbi.org.in" }, { "type": "divider" }, { "type": "h2", "text": "4. GST vs VAT System Comparison" }, { "type": "p", "text": "GST eliminated cascading taxes and unified multiple indirect tax layers." }, { "type": "image", "src": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80", "alt": "vat vs gst" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Taxes replaced", "17+", "MoF"], ["VAT average rate", "12\u201314%", "OECD"], ["GST average effective rate", "11.6%", "RBI 2024"], ["Tax cascading", "Removed", "OECD"]] }, { "type": "sourceLink", "href": "https://www.oecd.org" }, { "type": "divider" }, { "type": "h2", "text": "5. Tax Burden by Category" }, { "type": "p", "text": "Luxury and sin goods carry the highest tax burden, while essentials are lightly taxed." }, { "type": "image", "src": "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=80", "alt": "consumer goods" }, { "type": "table", "headers": ["Category", "GST Rate", "Source"], "rows": [["Essential food", "0\u20135%", "MoF"], ["Household goods", "12\u201318%", "CBIC"], ["Electronics", "18%", "CBIC"], ["Luxury cars", "28% + cess", "GST Council"]] }, { "type": "sourceLink", "href": "https://gstcouncil.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "Summary Table" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["18% slab share", "60%", "CBIC"], ["5% goods share", "40%", "MoF"], ["28% goods share", "5%", "GST Council"], ["Revisions", "50+", "GST Council"]] }, { "type": "divider" }, { "type": "h2", "text": "Methodology and Sources" }, { "type": "p", "text": "Primary government datasets and international comparisons were used to ensure accuracy and recency." }, { "type": "ul", "items": ["GST Council Reports", "CBIC Data", "Ministry of Finance", "RBI Reports", "OECD Tax Data"] }, { "type": "p", "text": "<strong>Last updated: May 2026</strong>" }, { "type": "divider" }, { "type": "p", "text": 'Calculate GST instantly here \u2192 <a href="https://gstcalculator.me">https://gstcalculator.me</a>' }]
  },
  {
    slug: "gst-business-compliance-statistics",
    title: "How Businesses Interact with GST Statistics (2025): 55+ Data Points on Filing Trends, Compliance, and Taxpayer Growth",
    description: "55+ data points on how Indian businesses interact with GST \u2014 taxpayer growth, return filings, compliance rates, and MSME participation.",
    category: "Statistics",
    readTime: "7 min",
    date: "2026-05-03",
    body: [{ "type": "lead", "text": "India has over 1.4 crore registered GST taxpayers as of 2024 (GSTN Annual Report 2024)." }, { "type": "p", "text": "Monthly GST return filings consistently exceed 1.1 crore submissions, reflecting one of the largest digital tax ecosystems globally. At the same time, GST compliance rates have improved to over 85% in recent years due to automation and stricter enforcement (CBIC Compliance Report 2024). Meanwhile, MSMEs account for more than 60% of GST-registered entities (Ministry of MSME 2024). We aggregated data from GSTN, CBIC, Ministry of Finance, RBI, and OECD. GST is not just a tax system\u2014it is India's largest digital compliance infrastructure." }, { "type": "h2", "text": "Key Takeaways" }, { "type": "ul", "items": ["<strong>1.4 crore+ businesses are registered under GST</strong> (GSTN 2024).", "Monthly GST filings exceed <strong>1.1 crore returns</strong> (CBIC 2024).", "Compliance rate reached <strong>85%+</strong> (CBIC 2024).", "MSMEs contribute <strong>60%+ of GST registrations</strong> (MSME Ministry 2024).", "Digital filing adoption exceeds <strong>95%</strong> (GSTN 2024).", "GSTR-3B is the most filed return type.", "Late filing penalties significantly improved compliance.", "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me"] }, { "type": "divider" }, { "type": "h2", "text": "1. GST Registered Taxpayers Data" }, { "type": "p", "text": "<strong>GST has formalized millions of businesses</strong>, especially small enterprises that were previously outside the tax net." }, { "type": "image", "src": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80", "alt": "business registration" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Total GST registered taxpayers", "1.4 crore+", "GSTN 2024"], ["Growth since 2017", "+85%", "CBIC 2024"], ["MSME share", "60%", "MSME Ministry 2024"], ["New registrations annually", "10\u201312 lakh", "GSTN 2024"], ["Composition scheme taxpayers", "~20 lakh", "CBIC 2024"]] }, { "type": "p", "text": "Calculate GST instantly here \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.gstn.org.in" }, { "type": "divider" }, { "type": "h2", "text": "2. GST Return Filing Trends" }, { "type": "p", "text": "Filing frequency and consistency reflect system maturity and compliance efficiency." }, { "type": "image", "src": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80", "alt": "tax filing" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Monthly GSTR-3B filings", "1.1 crore+", "CBIC 2024"], ["Monthly GSTR-1 filings", "90 lakh+", "GSTN 2024"], ["Annual returns filed", "80%+", "CBIC 2024"], ["Digital filing share", "95%+", "GSTN 2024"], ["Late filing reduction", "-30%", "OECD 2024"]] }, { "type": "p", "text": "Try this GST calculator for accurate results \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.cbic.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "3. GST Compliance Rate and Penalties" }, { "type": "p", "text": "<strong>Compliance improvements are driven by enforcement and automation</strong>, including e-invoicing and matching systems." }, { "type": "image", "src": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80", "alt": "compliance stats" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Compliance rate", "85%+", "CBIC 2024"], ["Penalty for late filing", "\u20B950/day", "GST Rules"], ["E-invoicing adoption", "70% large firms", "GSTN 2024"], ["Fake invoice detection increase", "+40%", "CBIC 2024"]] }, { "type": "p", "text": "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.cbic.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "4. MSME Participation in GST" }, { "type": "p", "text": "GST has significantly expanded MSME participation in formal taxation." }, { "type": "image", "src": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80", "alt": "small business india" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["MSME GST share", "60%", "MSME Ministry 2024"], ["MSME contribution to GDP", "30%", "MSME Ministry"], ["GST adoption growth MSMEs", "+50%", "RBI 2024"], ["Digital invoice adoption MSMEs", "65%", "GSTN 2024"]] }, { "type": "sourceLink", "href": "https://msme.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "5. GST Digital Infrastructure Growth" }, { "type": "p", "text": "<strong>GST is one of the largest digital tax platforms globally</strong>, handling millions of filings monthly." }, { "type": "image", "src": "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1600&q=80", "alt": "digital infrastructure" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Annual filings processed", "12+ crore", "GSTN 2024"], ["Portal uptime", "99.9%", "GSTN"], ["E-invoice volume", "1 billion+", "GSTN 2024"], ["API-based filings", "40%", "GSTN 2024"]] }, { "type": "sourceLink", "href": "https://www.gstn.org.in" }, { "type": "divider" }, { "type": "h2", "text": "Summary Table" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["GST taxpayers", "1.4 Cr+", "GSTN"], ["Monthly filings", "1.1 Cr+", "CBIC"], ["Compliance rate", "85%", "CBIC"], ["MSME share", "60%", "MSME"], ["Digital filings", "95%", "GSTN"]] }, { "type": "divider" }, { "type": "h2", "text": "Methodology and Sources" }, { "type": "p", "text": "Primary government datasets and institutional reports were prioritized. Cross-referencing ensured accuracy and recency." }, { "type": "ul", "items": ["GSTN \u2014 Annual Reports", "CBIC \u2014 Compliance Data", "Ministry of MSME", "RBI Reports", "OECD \u2014 Tax Compliance"] }, { "type": "p", "text": "<strong>Last updated: May 2026</strong>" }, { "type": "divider" }, { "type": "p", "text": 'Calculate GST instantly here \u2192 <a href="https://gstcalculator.me">https://gstcalculator.me</a>' }]
  },
  {
    slug: "gst-vs-vat-global-comparison-statistics",
    title: "GST vs VAT Global Comparison Statistics (2025): 55+ Data Points on Tax Rates, Adoption, and Revenue Share",
    description: "55+ data points comparing India's GST with global VAT systems \u2014 adoption, country rates, tax structure, and revenue share.",
    category: "Statistics",
    readTime: "7 min",
    date: "2026-05-03",
    body: [{ "type": "lead", "text": "Over 170 countries globally use VAT or GST systems, making consumption tax the dominant indirect taxation model (OECD Consumption Tax Trends 2024)." }, { "type": "p", "text": "India's GST system\u2014with multiple slabs\u2014differs from the global norm where most countries use a single or dual VAT rate. The global average VAT rate stands at approximately 15\u201316%, compared to India's effective GST rate of ~11.6% (OECD 2024; RBI 2024). Meanwhile, indirect taxes contribute over 30% of total government revenue in many OECD countries (OECD 2024). We aggregated data from OECD, World Bank, IMF, RBI, and global tax authorities. India's GST system is unique\u2014both in scale and structural complexity." }, { "type": "h2", "text": "Key Takeaways" }, { "type": "ul", "items": ["<strong>170+ countries use VAT/GST systems globally</strong> (OECD 2024).", "Global average VAT rate is <strong>15\u201316%</strong> (OECD 2024).", "India's effective GST rate is <strong>~11.6%</strong> (RBI 2024).", "EU countries typically use single or dual VAT rates.", "Indirect taxes contribute <strong>30%+ of revenue globally</strong> (OECD 2024).", "India's multi-slab GST system is among the most complex.", "Developing economies rely more on indirect taxes.", "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me"] }, { "type": "divider" }, { "type": "h2", "text": "1. Global VAT and GST Adoption" }, { "type": "p", "text": "<strong>Consumption taxes dominate global tax systems</strong>, especially in emerging economies where income tax collection is harder to enforce." }, { "type": "image", "src": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80", "alt": "global tax systems map" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Countries using VAT/GST", "170+", "OECD 2024"], ["Countries without VAT", "~20", "World Bank 2024"], ["Adoption rate globally", "90%+", "IMF 2024"], ["First VAT introduced", "France (1954)", "OECD"]] }, { "type": "p", "text": "Calculate GST instantly here \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.oecd.org/tax/consumption/" }, { "type": "divider" }, { "type": "h2", "text": "2. Indirect Tax Rates by Country" }, { "type": "p", "text": "India's GST rates are relatively moderate compared to many developed nations." }, { "type": "image", "src": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80", "alt": "tax rate comparison" }, { "type": "table", "headers": ["Country", "VAT/GST Rate", "Source"], "rows": [["India (effective)", "~11.6%", "RBI 2024"], ["Germany", "19%", "OECD 2024"], ["UK", "20%", "HMRC 2024"], ["Australia", "10%", "ATO 2024"], ["Japan", "10%", "OECD 2024"], ["Brazil", "17\u201325%", "World Bank 2024"]] }, { "type": "p", "text": "Try this GST calculator for accurate results \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://data.oecd.org/tax/" }, { "type": "divider" }, { "type": "h2", "text": "3. Tax Structure: India vs Global Systems" }, { "type": "p", "text": "<strong>India's multi-slab GST is an exception</strong>\u2014most countries operate simpler structures with fewer rates." }, { "type": "image", "src": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80", "alt": "tax structure comparison" }, { "type": "table", "headers": ["Metric", "India", "Global Avg", "Source"], "rows": [["Number of slabs", "4\u20135", "1\u20132", "OECD 2024"], ["Average rate", "11.6%", "15\u201316%", "OECD"], ["Complexity ranking", "High", "Moderate", "IMF"], ["Tax cascading", "Removed", "Removed", "OECD"]] }, { "type": "p", "text": "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.imf.org" }, { "type": "divider" }, { "type": "h2", "text": "4. Indirect Tax Share of Revenue" }, { "type": "p", "text": "Indirect taxes play a larger role in developing economies compared to developed nations." }, { "type": "image", "src": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80", "alt": "tax revenue chart" }, { "type": "table", "headers": ["Region", "Indirect Tax Share", "Source"], "rows": [["India", "~30\u201335%", "RBI 2024"], ["OECD average", "~32%", "OECD 2024"], ["EU", "~28%", "Eurostat 2024"], ["Africa", "~40%", "World Bank 2024"]] }, { "type": "sourceLink", "href": "https://ec.europa.eu/eurostat" }, { "type": "divider" }, { "type": "h2", "text": "5. Global Consumption Tax Trends" }, { "type": "p", "text": "<strong>Governments are increasingly relying on consumption taxes</strong> due to ease of collection and economic neutrality." }, { "type": "image", "src": "https://images.unsplash.com/photo-1518182170546-07661fd94144?auto=format&fit=crop&w=1600&q=80", "alt": "global economy" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["VAT revenue growth globally", "+5\u20137% annually", "OECD 2024"], ["Digital tax compliance increase", "+35%", "IMF 2024"], ["E-invoicing adoption countries", "80+", "World Bank 2024"], ["Shift toward indirect taxes", "Increasing", "OECD 2024"]] }, { "type": "sourceLink", "href": "https://www.worldbank.org" }, { "type": "divider" }, { "type": "h2", "text": "Summary Table" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Countries using VAT", "170+", "OECD"], ["Global avg VAT", "15\u201316%", "OECD"], ["India GST rate", "11.6%", "RBI"], ["Indirect tax share India", "30\u201335%", "RBI"], ["Global adoption rate", "90%", "IMF"]] }, { "type": "divider" }, { "type": "h2", "text": "Methodology and Sources" }, { "type": "p", "text": "Primary international datasets and government reports were used. Cross-referencing ensured accuracy and comparability." }, { "type": "ul", "items": ["OECD \u2014 Consumption Tax Trends", "IMF \u2014 Fiscal Monitor", "World Bank \u2014 Tax Data", "RBI \u2014 Indian Economy Reports", "Eurostat \u2014 EU Tax Data"] }, { "type": "p", "text": "<strong>Last updated: May 2026</strong>" }, { "type": "divider" }, { "type": "p", "text": 'Calculate GST instantly here \u2192 <a href="https://gstcalculator.me">https://gstcalculator.me</a>' }]
  },
  {
    slug: "gst-impact-consumer-prices-statistics",
    title: "GST Impact on Consumer Prices Statistics (2025): 52+ Data Points on Inflation, FMCG, and Cost of Living",
    description: "52+ data points on how GST has affected consumer prices in India \u2014 inflation, FMCG, real estate, restaurants, and consumer spending.",
    category: "Statistics",
    readTime: "7 min",
    date: "2026-05-03",
    body: [{ "type": "lead", "text": "GST initially reduced prices for over 80% of consumer goods by eliminating cascading taxes (Economic Survey of India 2018 \u2013 most recent available)." }, { "type": "p", "text": "However, price effects vary widely across sectors, with some categories seeing increases due to higher effective tax rates. Inflation remained stable post-GST, averaging 4\u20136% in subsequent years (RBI Inflation Report 2024). Meanwhile, sectors like FMCG and logistics saw cost reductions of up to 15\u201320% due to improved supply chains (World Bank 2023). We aggregated data from RBI, Ministry of Finance, Economic Survey, World Bank, and industry reports. GST doesn't uniformly raise or lower prices\u2014it redistributes cost structures across the economy." }, { "type": "h2", "text": "Key Takeaways" }, { "type": "ul", "items": ["<strong>80% of goods saw price reductions post-GST</strong> (Economic Survey).", "Inflation remained stable at <strong>4\u20136%</strong> (RBI 2024).", "Logistics costs dropped <strong>15\u201320%</strong> (World Bank).", "FMCG prices decreased due to tax efficiency.", "Real estate prices increased due to input tax changes.", "Restaurant taxes simplified but input credit removed.", "Consumer savings vary by GST slab.", "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me"] }, { "type": "divider" }, { "type": "h2", "text": "1. GST Impact on Inflation in India" }, { "type": "p", "text": "<strong>GST had a neutral-to-moderate effect on inflation</strong>, with short-term adjustments but long-term stabilization." }, { "type": "image", "src": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80", "alt": "inflation chart india" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Inflation range post-GST", "4\u20136%", "RBI 2024"], ["Initial inflation spike", "+0.3\u20130.5%", "IMF 2019 (most recent available)"], ["Long-term inflation impact", "Neutral", "RBI 2024"], ["Supply chain efficiency gain", "+10\u201315%", "World Bank 2023"]] }, { "type": "p", "text": "Calculate GST instantly here \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.rbi.org.in" }, { "type": "divider" }, { "type": "h2", "text": "2. GST Impact on FMCG Prices" }, { "type": "p", "text": "FMCG products benefited from reduced cascading taxes and logistics efficiencies." }, { "type": "image", "src": "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=1600&q=80", "alt": "fmcg products" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Price reduction FMCG", "5\u201310%", "Nielsen India 2023"], ["Supply chain savings", "10\u201315%", "World Bank 2023"], ["Warehouse consolidation", "-30%", "Industry Reports"], ["GST rate FMCG avg", "12\u201318%", "CBIC"]] }, { "type": "p", "text": "Try this GST calculator for accurate results \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://www.nielsen.com" }, { "type": "divider" }, { "type": "h2", "text": "3. GST Effect on Real Estate Prices" }, { "type": "p", "text": "<strong>Real estate experienced mixed pricing effects</strong>, largely due to removal of input tax credits in some segments." }, { "type": "image", "src": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80", "alt": "real estate india" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["GST on under-construction property", "5%", "MoF"], ["Affordable housing GST", "1%", "MoF"], ["Price increase (select segments)", "5\u20138%", "RERA Reports 2023"], ["Input credit removal impact", "Moderate", "Industry Analysis"]] }, { "type": "p", "text": "Use our GST calculator to apply this rate \u2192 https://gstcalculator.me" }, { "type": "sourceLink", "href": "https://rera.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "4. Restaurant and Service Pricing Impact" }, { "type": "p", "text": "GST simplified restaurant taxation but removed input tax credits, affecting margins and pricing." }, { "type": "image", "src": "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=1600&q=80", "alt": "restaurant india" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Restaurant GST rate", "5%", "GST Council"], ["Earlier service tax + VAT", "~18\u201320%", "Pre-GST"], ["Input credit availability", "Removed", "GST Council"], ["Menu price change", "Mixed impact", "Industry Reports"]] }, { "type": "sourceLink", "href": "https://gstcouncil.gov.in" }, { "type": "divider" }, { "type": "h2", "text": "5. Consumer Spending Trends After GST" }, { "type": "p", "text": "<strong>Consumption patterns shifted toward organized sectors</strong>, reflecting improved compliance and transparency." }, { "type": "image", "src": "https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?auto=format&fit=crop&w=1600&q=80", "alt": "consumer shopping" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Organized retail growth", "+20%", "Statista 2024"], ["E-commerce growth post-GST", "+25%", "MeitY 2024"], ["Consumer spending increase", "+8\u201310%", "RBI 2024"], ["Tax compliance impact on pricing", "Positive", "OECD 2024"]] }, { "type": "sourceLink", "href": "https://datareportal.com" }, { "type": "divider" }, { "type": "h2", "text": "Summary Table" }, { "type": "table", "headers": ["Metric", "Value", "Source"], "rows": [["Goods price reduction", "80%", "Economic Survey"], ["Inflation range", "4\u20136%", "RBI"], ["FMCG price drop", "5\u201310%", "Nielsen"], ["Real estate increase", "5\u20138%", "RERA"], ["Retail growth", "20%", "Statista"]] }, { "type": "divider" }, { "type": "h2", "text": "Methodology and Sources" }, { "type": "p", "text": "We prioritized government reports, central bank data, and industry research. Cross-referencing ensured accuracy and consistency." }, { "type": "ul", "items": ["RBI \u2014 Inflation Reports", "Ministry of Finance", "Economic Survey of India", "World Bank \u2014 Logistics Data", "Nielsen \u2014 FMCG Reports", "Statista \u2014 Retail Data", "OECD \u2014 Tax Impact Studies"] }, { "type": "p", "text": "<strong>Last updated: May 2026</strong>" }, { "type": "divider" }, { "type": "p", "text": 'Calculate GST instantly here \u2192 <a href="https://gstcalculator.me">https://gstcalculator.me</a>' }]
  },
  {
    slug: "zoho-vs-tally-gst-calculator",
    title: "Zoho GST Calculator vs Tally GST Calculator",
    description: "Zoho GST Calculator vs Tally GST Calculator explained for Indian businesses. Compare features, accuracy, and usability to choose the best tool today.",
    category: "Comparison",
    readTime: "5 min",
    date: "2026-05-03",
    body: [
      { type: "lead", text: "Choosing between Zoho and Tally for GST calculation can be confusing. Both tools are widely used in India. However, their approach to GST calculations differs significantly." },
      { type: "image", src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f", alt: "GST accounting tools" },
      { type: "p", text: "The debate around <strong>Zoho GST Calculator vs Tally GST Calculator</strong> is common among Indian business owners. Many SMEs rely on accurate GST calculations daily. Therefore, choosing the right tool directly impacts compliance and efficiency." },
      { type: "h2", text: "What is Zoho GST Calculator vs Tally GST Calculator comparison?" },
      { type: "p", text: "The comparison focuses on usability, accuracy, and integration. Zoho offers cloud-based simplicity. Meanwhile, Tally provides deep accounting integration." },
      { type: "h3", text: "Zoho GST Calculator overview" },
      { type: "p", text: "Zoho GST tools are part of Zoho Books. They are web-based and easy to access. Additionally, they are ideal for freelancers and small businesses." },
      { type: "p", text: 'Zoho allows quick GST calculations without complex setup. For example, you can calculate GST instantly via <a href="https://gstcalculator.me">our GST calculator tool at gstcalculator.me</a>.' },
      { type: "h3", text: "Tally GST Calculator overview" },
      { type: "p", text: "Tally is a full accounting software. It includes GST features within its system. However, it requires installation and training." },
      { type: "p", text: `You can explore Tally's official features here: <a href="https://tallysolutions.com/gst/" target="_blank" rel="noopener">Tally GST</a>. Additionally, Zoho's GST capabilities are explained here: <a href="https://www.zoho.com/in/books/gst/" target="_blank" rel="noopener">Zoho Books GST</a>.` },
      { type: "h2", text: "Zoho GST Calculator vs Tally GST Calculator: Which is easier?" },
      { type: "image", src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572", alt: "Ease of use business tools" },
      { type: "p", text: "Ease of use is critical for small business owners. Zoho wins in simplicity. However, Tally offers depth for experienced accountants." },
      { type: "p", text: "Zoho requires minimal setup. Therefore, beginners can start quickly. Tally, on the other hand, has a learning curve." },
      { type: "highlight", html: "Zoho is best for simplicity. Tally is better for advanced accounting workflows." },
      { type: "p", text: 'Additionally, if you only need quick GST numbers, tools like <a href="https://gstcalculator.me">gstcalculator.me GST calculator</a> are faster.' },
      { type: "h2", text: "Zoho GST Calculator vs Tally GST Calculator: Features comparison" },
      { type: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", alt: "Data comparison chart" },
      { type: "p", text: "Both tools offer GST calculation, but their features differ. Therefore, understanding these differences is essential." },
      { type: "ul", items: [
        "Zoho: Cloud-based, mobile-friendly, automated updates",
        "Tally: Offline support, detailed reporting, inventory integration"
      ] },
      { type: "p", text: "For example, Zoho automatically updates GST rates. Meanwhile, Tally requires manual updates in some cases." },
      { type: "p", text: "Furthermore, Tally excels in financial reporting. Zoho, however, is better for quick invoicing." },
      { type: "h2", text: "Zoho GST Calculator vs Tally GST Calculator for small businesses" },
      { type: "image", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", alt: "Small business team" },
      { type: "p", text: "Small businesses need speed and accuracy. Therefore, the right tool depends on business size." },
      { type: "p", text: "Freelancers prefer Zoho. It is simple and accessible anywhere. However, SMEs with accounting teams often prefer Tally." },
      { type: "p", text: 'Additionally, many businesses use standalone tools. For instance, <a href="/blog/gst-impact-indian-economy-statistics">how GST impacts the Indian economy</a> explains why accurate calculations matter.' },
      { type: "p", text: 'You can also explore <a href="/blog/how-to-calculate-gst">GST calculation guide</a> and <a href="/blog/input-tax-credit-gst">input tax credit explained</a> for deeper understanding.' },
      { type: "h2", text: "Zoho GST Calculator vs Tally GST Calculator: Which is more accurate?" },
      { type: "p", text: "Both tools are accurate when configured correctly. However, user input matters." },
      { type: "p", text: "Zoho reduces manual errors. Therefore, it is safer for beginners. Tally depends more on user expertise." },
      { type: "p", text: 'Additionally, using a dedicated calculator like <a href="https://gstcalculator.me">gstcalculator.me</a> ensures instant and accurate results without setup.' },
      { type: "cta", title: "Need instant GST calculation?", text: "Try GST Calculator Now" },
      { type: "h2", text: "Final verdict: Zoho GST Calculator vs Tally GST Calculator" },
      { type: "p", text: "The choice depends on your business needs. Zoho is ideal for simplicity. Tally is best for full accounting control." },
      { type: "p", text: "However, if your goal is quick GST calculation, standalone tools are better. They eliminate complexity and save time." },
      { type: "p", text: "Therefore, many businesses combine both approaches. They use accounting software and quick calculators together." }
    ]
  },
  {
    slug: "cleartax-vs-zoho-gst-calculator",
    title: "ClearTax GST Calculator vs Zoho GST Calculator",
    description: "ClearTax GST Calculator vs Zoho GST Calculator explained clearly. Compare features, ease, and accuracy to choose the best tool for your business.",
    category: "Comparison",
    readTime: "5 min",
    date: "2026-05-03",
    body: [
      { type: "lead", text: "Indian businesses often compare ClearTax and Zoho for GST calculations. Both tools are popular. However, their use cases differ more than most people realise." },
      { type: "image", src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f", alt: "GST tools India" },
      { type: "p", text: "The comparison of <strong>ClearTax GST Calculator vs Zoho GST Calculator</strong> is highly relevant today. Businesses need fast and accurate GST computation. Therefore, choosing the right tool affects compliance and efficiency." },
      { type: "h2", text: "What is ClearTax GST Calculator vs Zoho GST Calculator?" },
      { type: "p", text: "This comparison focuses on usability, features, and accessibility. ClearTax provides a simple standalone calculator. Meanwhile, Zoho integrates GST within a broader accounting system." },
      { type: "h3", text: "ClearTax GST Calculator overview" },
      { type: "p", text: "ClearTax offers a quick web-based GST calculator. It is designed for instant results. Additionally, it works well for freelancers and small businesses." },
      { type: "p", text: 'You can explore it here: <a href="https://cleartax.in/s/gst-calculator" target="_blank" rel="noopener">ClearTax GST Calculator</a>. Furthermore, it requires no login or setup.' },
      { type: "h3", text: "Zoho GST Calculator overview" },
      { type: "p", text: "Zoho's GST functionality is part of Zoho Books. It integrates with invoicing and accounting. However, it requires account setup." },
      { type: "p", text: 'Learn more here: <a href="https://www.zoho.com/in/books/gst/" target="_blank" rel="noopener">Zoho Books GST</a>. Additionally, it is ideal for businesses needing full accounting support.' },
      { type: "h2", text: "ClearTax GST Calculator vs Zoho GST Calculator: Which is easier?" },
      { type: "image", src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572", alt: "Ease of software use" },
      { type: "p", text: "Ease of use matters for daily operations. ClearTax is extremely simple. However, Zoho offers deeper features." },
      { type: "p", text: "ClearTax allows instant calculations. Therefore, users get results within seconds. Zoho, on the other hand, requires navigation within its system." },
      { type: "highlight", html: "ClearTax is best for quick calculations. Zoho is better for integrated workflows." },
      { type: "p", text: 'Additionally, for instant GST values, you can enter your amount using <a href="https://gstcalculator.me">gstcalculator.me calculator</a> without setup.' },
      { type: "h2", text: "ClearTax GST Calculator vs Zoho GST Calculator: Feature comparison" },
      { type: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", alt: "Data comparison" },
      { type: "p", text: "Both tools calculate GST correctly. However, their features differ significantly." },
      { type: "ul", items: [
        "ClearTax: Simple interface, quick results, no login",
        "Zoho: Accounting integration, invoicing, automation"
      ] },
      { type: "p", text: "For example, ClearTax focuses on calculation only. Meanwhile, Zoho handles invoices and reports." },
      { type: "p", text: "Furthermore, Zoho updates GST changes automatically. ClearTax keeps things lightweight and fast." },
      { type: "h2", text: "ClearTax GST Calculator vs Zoho GST Calculator for SMEs" },
      { type: "image", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", alt: "Small business India" },
      { type: "p", text: "Small businesses need efficiency and accuracy. Therefore, tool choice depends on workflow complexity." },
      { type: "p", text: "Freelancers often prefer ClearTax. It is quick and easy. However, SMEs with accounting teams prefer Zoho." },
      { type: "p", text: 'Additionally, understanding GST fundamentals helps. For example, read <a href="/blog/how-to-calculate-gst">GST calculation guide</a> and <a href="/blog/input-tax-credit-gst">input tax credit explained</a>.' },
      { type: "p", text: 'You can also explore <a href="/blog/gst-impact-indian-economy-statistics">how GST impacts the Indian economy</a> for broader context.' },
      { type: "h2", text: "ClearTax GST Calculator vs Zoho GST Calculator: Accuracy and reliability" },
      { type: "p", text: "Both tools are reliable when used correctly. However, input accuracy is critical." },
      { type: "p", text: "ClearTax minimizes complexity. Therefore, it reduces errors. Zoho depends on proper configuration." },
      { type: "p", text: 'Additionally, standalone tools like <a href="https://gstcalculator.me">gstcalculator.me GST calculator</a> provide instant and accurate results without setup.' },
      { type: "cta", title: "Want faster GST calculations without complexity?", text: "Try GST Calculator Now" },
      { type: "h2", text: "Final verdict: ClearTax GST Calculator vs Zoho GST Calculator" },
      { type: "p", text: "The best tool depends on your needs. ClearTax is perfect for quick calculations. Zoho is better for full accounting workflows." },
      { type: "p", text: "However, many businesses use both approaches. They combine accounting software with quick calculators." },
      { type: "p", text: "Therefore, choosing flexibility often works best. Use the right tool for the right task." }
    ]
  },
  {
    slug: "tally-vs-cleartax-gst-calculator",
    title: "Tally GST Calculator vs ClearTax GST Calculator",
    description: "Tally GST Calculator vs ClearTax GST Calculator explained clearly. Compare features, ease, and accuracy to choose the best GST tool for your business.",
    category: "Comparison",
    readTime: "5 min",
    date: "2026-05-03",
    body: [
      { type: "lead", text: "Choosing between Tally and ClearTax for GST calculations is a common dilemma. Both tools serve different needs. However, selecting the right one can simplify your entire workflow." },
      { type: "image", src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f", alt: "GST software comparison" },
      { type: "p", text: "The comparison of <strong>Tally GST Calculator vs ClearTax GST Calculator</strong> matters for Indian businesses today. GST compliance requires accuracy and speed. Therefore, using the right tool can reduce errors and save time." },
      { type: "h2", text: "Tally GST Calculator vs ClearTax GST Calculator: What's the difference?" },
      { type: "p", text: "The core difference lies in functionality and usage. Tally is a complete accounting software. Meanwhile, ClearTax offers a quick standalone GST calculator." },
      { type: "h3", text: "Tally GST Calculator overview" },
      { type: "p", text: "Tally integrates GST within its accounting ecosystem. It handles invoicing, inventory, and reporting. Additionally, it is widely used by chartered accountants." },
      { type: "p", text: 'Learn more about Tally here: <a href="https://tallysolutions.com/gst/" target="_blank" rel="noopener">Tally GST features</a>. Furthermore, it supports detailed financial workflows.' },
      { type: "h3", text: "ClearTax GST Calculator overview" },
      { type: "p", text: "ClearTax provides a simple GST calculator online. It requires no setup or installation. Therefore, it is ideal for quick calculations." },
      { type: "p", text: 'Explore it here: <a href="https://cleartax.in/s/gst-calculator" target="_blank" rel="noopener">ClearTax GST Calculator</a>. Additionally, it works instantly in the browser.' },
      { type: "h2", text: "Tally GST Calculator vs ClearTax GST Calculator: Which is easier to use?" },
      { type: "image", src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572", alt: "Ease of use software" },
      { type: "p", text: "Ease of use depends on your needs. ClearTax is simple and fast. However, Tally is more complex." },
      { type: "p", text: "ClearTax allows instant GST calculations. Therefore, beginners can use it easily. Tally, on the other hand, requires training." },
      { type: "highlight", html: "ClearTax suits quick calculations. Tally is better for accounting-heavy workflows." },
      { type: "p", text: 'Additionally, you can calculate GST instantly by entering your values at <a href="https://gstcalculator.me">gstcalculator.me</a>.' },
      { type: "h2", text: "Tally GST Calculator vs ClearTax GST Calculator: Feature comparison" },
      { type: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", alt: "Feature comparison chart" },
      { type: "p", text: "Both tools calculate GST accurately. However, their features differ significantly." },
      { type: "ul", items: [
        "Tally: Full accounting integration, reports, inventory",
        "ClearTax: Fast calculations, simple interface, no login"
      ] },
      { type: "p", text: "For example, Tally generates financial statements. Meanwhile, ClearTax focuses on quick GST computation." },
      { type: "p", text: "Furthermore, Tally is better for compliance management. ClearTax is ideal for fast decision-making." },
      { type: "h2", text: "Tally GST Calculator vs ClearTax GST Calculator for freelancers and SMEs" },
      { type: "image", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", alt: "Freelancers working" },
      { type: "p", text: "Freelancers prefer simplicity. Therefore, ClearTax works well for them. SMEs often need accounting features, so Tally becomes useful." },
      { type: "p", text: 'Additionally, understanding GST basics is important. For example, read <a href="/blog/how-to-calculate-gst">GST calculation guide</a> and <a href="/blog/input-tax-credit-gst">input tax credit explained</a>.' },
      { type: "p", text: 'You can also explore <a href="/blog/gst-impact-indian-economy-statistics">how GST impacts the Indian economy</a> for broader insights.' },
      { type: "h2", text: "Tally GST Calculator vs ClearTax GST Calculator: Accuracy and reliability" },
      { type: "p", text: "Both tools provide accurate GST values. However, correct input is essential." },
      { type: "p", text: "ClearTax reduces complexity. Therefore, it minimizes errors. Tally depends on correct configuration." },
      { type: "p", text: 'Additionally, standalone tools like <a href="https://gstcalculator.me">gstcalculator.me GST calculator</a> offer quick and reliable results.' },
      { type: "cta", title: "Need quick and accurate GST calculations?", text: "Use GST Calculator Now" },
      { type: "h2", text: "Tally GST Calculator vs ClearTax GST Calculator: Final verdict" },
      { type: "p", text: "The choice depends on your workflow. ClearTax is perfect for quick calculations. Tally is better for full accounting." },
      { type: "p", text: "However, many businesses use both tools together. They combine accounting systems with quick calculators." },
      { type: "p", text: "Therefore, flexibility often provides the best results for Indian businesses." }
    ]
  },
  {
    slug: "gstcalculator-net-vs-gstcalculator-app",
    title: "gstcalculator.net vs gstcalculator.app",
    description: "gstcalculator.net vs gstcalculator.app compared in detail. Discover accuracy, usability, and speed to choose the best GST calculator for your business.",
    category: "Comparison",
    readTime: "5 min",
    date: "2026-05-03",
    body: [
      { type: "lead", text: "Free GST calculators are widely used by Indian businesses today. However, not all tools perform equally well. Choosing the right one can improve both speed and accuracy." },
      { type: "image", src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f", alt: "GST calculator tools" },
      { type: "p", text: "The debate around <strong>gstcalculator.net vs gstcalculator.app</strong> is growing among freelancers and SMEs. Both tools offer quick GST calculations. Therefore, understanding their differences is essential before relying on them." },
      { type: "h2", text: "gstcalculator.net vs gstcalculator.app: What do these tools offer?" },
      { type: "p", text: "Both tools provide GST calculations for inclusive and exclusive values. However, their design and functionality differ." },
      { type: "h3", text: "gstcalculator.net overview" },
      { type: "p", text: "This platform focuses on simplicity. It provides instant GST results without distractions. Additionally, it is widely used for quick checks." },
      { type: "p", text: 'Explore it here: <a href="https://gstcalculator.net" target="_blank" rel="noopener">gstcalculator.net</a>. Furthermore, it works across devices easily.' },
      { type: "h3", text: "gstcalculator.app overview" },
      { type: "p", text: "This tool offers a modern interface. It includes additional calculation features. However, it may feel slightly heavier." },
      { type: "p", text: 'Visit here: <a href="https://gstcalculator.app" target="_blank" rel="noopener">gstcalculator.app</a>. Additionally, it supports multiple GST scenarios.' },
      { type: "h2", text: "gstcalculator.net vs gstcalculator.app: Which is more accurate?" },
      { type: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", alt: "Accuracy comparison" },
      { type: "p", text: "Accuracy is critical in GST calculation. Both tools use standard GST formulas. Therefore, results should match when inputs are correct." },
      { type: "p", text: "However, interface design can affect errors. For instance, confusing layouts may lead to wrong inputs." },
      { type: "highlight", html: "Accuracy depends more on input correctness than the tool itself." },
      { type: "p", text: 'Additionally, using a clean interface like <a href="https://gstcalculator.me">gstcalculator.me calculator</a> reduces mistakes.' },
      { type: "h2", text: "gstcalculator.net vs gstcalculator.app: Ease of use and speed" },
      { type: "image", src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572", alt: "Ease of use" },
      { type: "p", text: "Ease of use matters for daily operations. gstcalculator.net is extremely fast. However, gstcalculator.app provides more features." },
      { type: "p", text: "For example, gstcalculator.net loads quickly. Meanwhile, gstcalculator.app offers more options but slightly slower navigation." },
      { type: "p", text: "Additionally, if speed matters most, lightweight tools are better. Therefore, many users prefer simpler calculators." },
      { type: "h2", text: "gstcalculator.net vs gstcalculator.app for freelancers and SMEs" },
      { type: "image", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", alt: "Freelancers working" },
      { type: "p", text: "Freelancers need quick results. Therefore, gstcalculator.net is often preferred. SMEs, however, may want more features." },
      { type: "p", text: 'Additionally, understanding GST basics is important. For example, check <a href="/blog/how-to-calculate-gst">GST calculation guide</a> and <a href="/blog/input-tax-credit-gst">input tax credit explained</a>.' },
      { type: "p", text: 'You can also read <a href="/blog/gst-impact-indian-economy-statistics">how GST impacts the Indian economy</a> for broader insights.' },
      { type: "h2", text: "gstcalculator.net vs gstcalculator.app: Which tool should you choose?" },
      { type: "p", text: "The choice depends on your workflow. If you want speed, choose gstcalculator.net. However, if you need features, gstcalculator.app is useful." },
      { type: "p", text: "Additionally, many users combine tools. They use one for speed and another for flexibility." },
      { type: "p", text: 'For instance, you can enter your values directly into <a href="https://gstcalculator.me">gstcalculator.me</a> for instant and accurate results.' },
      { type: "cta", title: "Need faster and simpler GST calculations?", text: "Try GST Calculator Now" },
      { type: "h2", text: "Final verdict: gstcalculator.net vs gstcalculator.app" },
      { type: "p", text: "Both tools serve their purpose well. gstcalculator.net is simple and fast. gstcalculator.app offers more flexibility." },
      { type: "p", text: "However, the best tool depends on your needs. Therefore, choosing based on usage is key." },
      { type: "p", text: "Ultimately, combining tools often delivers the best efficiency for Indian businesses." }
    ]
  },
  {
    slug: "cleartax-vs-taxadda-gst-calculator",
    title: "ClearTax GST Calculator vs TaxAdda GST Calculator",
    description: "ClearTax GST Calculator vs TaxAdda GST Calculator explained clearly. Compare CGST/SGST breakdown accuracy and choose the best GST tool easily.",
    category: "Comparison",
    readTime: "5 min",
    date: "2026-05-03",
    body: [
      { type: "lead", text: "Understanding CGST and SGST breakdown is essential for GST compliance. Many tools promise accuracy. However, not all calculators present results equally clearly." },
      { type: "image", src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f", alt: "GST breakdown tools" },
      { type: "p", text: "The comparison of <strong>ClearTax GST Calculator vs TaxAdda GST Calculator</strong> is important for Indian businesses. Both tools provide GST calculations. Therefore, choosing the one with better CGST/SGST clarity can reduce accounting errors." },
      { type: "h2", text: "ClearTax GST Calculator vs TaxAdda GST Calculator: What do they offer?" },
      { type: "p", text: "Both tools calculate GST instantly. However, their focus and presentation differ significantly." },
      { type: "h3", text: "ClearTax GST Calculator overview" },
      { type: "p", text: "ClearTax offers a fast and simple GST calculator. It focuses on user-friendly design. Additionally, it is widely trusted by professionals." },
      { type: "p", text: 'Explore it here: <a href="https://cleartax.in/s/gst-calculator" target="_blank" rel="noopener">ClearTax GST Calculator</a>. Furthermore, it requires no setup.' },
      { type: "h3", text: "TaxAdda GST Calculator overview" },
      { type: "p", text: "TaxAdda provides a straightforward GST calculator. It focuses on clarity and simplicity. However, it may feel slightly basic." },
      { type: "p", text: 'Visit here: <a href="https://taxadda.com/gst-calculator/" target="_blank" rel="noopener">TaxAdda GST Calculator</a>. Additionally, it offers clear CGST and SGST splits.' },
      { type: "h2", text: "ClearTax GST Calculator vs TaxAdda GST Calculator: Which gives better CGST/SGST breakdown?" },
      { type: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", alt: "GST breakdown chart" },
      { type: "p", text: "CGST and SGST breakdown is critical for compliance. Both tools calculate it correctly. However, presentation matters." },
      { type: "p", text: "ClearTax displays breakdown clearly with structured output. Therefore, it is easy to understand. TaxAdda, meanwhile, shows values in a simpler format." },
      { type: "highlight", html: "ClearTax offers better visual clarity, while TaxAdda keeps things minimal." },
      { type: "p", text: 'Additionally, tools like <a href="https://gstcalculator.me">gstcalculator.me calculator</a> provide instant CGST and SGST splits with clean output.' },
      { type: "h2", text: "ClearTax GST Calculator vs TaxAdda GST Calculator: Ease of use and speed" },
      { type: "image", src: "https://images.unsplash.com/photo-1454165205744-3b78555e5572", alt: "Ease of use" },
      { type: "p", text: "Ease of use matters for daily work. TaxAdda is extremely lightweight. However, ClearTax provides a more polished experience." },
      { type: "p", text: "For instance, TaxAdda loads quickly. Meanwhile, ClearTax includes better formatting and UI." },
      { type: "p", text: "Additionally, if speed matters most, simple tools perform better. Therefore, many freelancers prefer lightweight options." },
      { type: "h2", text: "ClearTax GST Calculator vs TaxAdda GST Calculator for SMEs and professionals" },
      { type: "image", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", alt: "Indian professionals" },
      { type: "p", text: "Professionals need both accuracy and clarity. Therefore, ClearTax is often preferred by accountants. SMEs, however, may prefer simpler tools." },
      { type: "p", text: 'Additionally, understanding GST concepts is important. For example, read <a href="/blog/how-to-calculate-gst">GST calculation guide</a> and <a href="/blog/input-tax-credit-gst">input tax credit explained</a>.' },
      { type: "p", text: 'You can also explore <a href="/blog/gst-impact-indian-economy-statistics">how GST impacts the Indian economy</a> for broader insights.' },
      { type: "h2", text: "ClearTax GST Calculator vs TaxAdda GST Calculator: Accuracy and reliability" },
      { type: "p", text: "Both tools use standard GST formulas. Therefore, accuracy is consistent across both platforms." },
      { type: "p", text: "However, user experience impacts usability. ClearTax reduces confusion with better layout. TaxAdda keeps things straightforward." },
      { type: "p", text: 'Additionally, you can enter your amount at <a href="https://gstcalculator.me">gstcalculator.me</a> to calculate GST instantly with clarity.' },
      { type: "cta", title: "Want clearer GST breakdown instantly?", text: "Try GST Calculator Now" },
      { type: "h2", text: "Final verdict: ClearTax GST Calculator vs TaxAdda GST Calculator" },
      { type: "p", text: "Both tools are reliable for GST calculations. ClearTax offers better presentation. TaxAdda focuses on simplicity." },
      { type: "p", text: "However, your choice depends on your needs. Therefore, professionals may prefer ClearTax, while freelancers may prefer TaxAdda." },
      { type: "p", text: "Ultimately, combining tools often gives the best results for Indian businesses." }
    ]
  },
  {
    slug: "gst-2-0-reforms-india-2025",
    title: "GST 2.0 Reforms India 2025: New Rate Slabs, What's Cheaper & What Businesses Must Do Now",
    description: "The most comprehensive guide to India's GST 2.0 reforms effective September 22, 2025 \u2014 new 5%, 18% & 40% slabs, what got cheaper, what got expensive, business compliance checklist, and ITC transition rules.",
    category: "GST News & Updates",
    readTime: "14 min",
    date: "2025-10-01",
    body: [
      { type: "lead", text: "On September 22, 2025, India's indirect tax system entered its most significant overhaul since GST was first introduced in July 2017. The GST Council's 56th meeting approved sweeping reforms that replaced the 4-slab structure of 5%, 12%, 18%, and 28% with a cleaner 2-slab system of 5% and 18%, plus a new 40% slab for luxury and sin goods." },
      { type: "image", src: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=1200&q=75&auto=format&fit=crop", alt: "India tax reform announcement concept with Indian flag and financial documents" },
      { type: "p", text: "Finance Minister Nirmala Sitharaman chaired the 56th GST Council meeting, implementing reforms Prime Minister Modi had announced on Independence Day as a pre-Diwali gift to the common man. The headline: the <strong>12% and 28% slabs are effectively abolished</strong>, with items reclassified into 5% or 18% respectively \u2014 and a new 40% slab introduced for genuine luxury and sin goods." },
      { type: "p", text: "This is not a minor tweak. Over 100 product categories have changed rates. Businesses need to update pricing, invoices, billing software, and ITC accounting. Consumers will see direct savings on essentials, electronics, and vehicles. And some luxury goods just got more expensive." },
      { type: "statGrid", items: [
        { n: "100+", l: "Product categories that changed GST rates" },
        { n: "Sep 22, 2025", l: "Effective date of all GST 2.0 rate changes" },
        { n: "2 + 40%", l: "New simplified slab structure: 5%, 18%, plus luxury slab" },
        { n: "56th", l: "GST Council meeting that approved the reforms" }
      ] },
      { type: "warn", html: '<strong>\u{1F4C5} Effective Date:</strong> All GST 2.0 rate changes are effective from <strong>September 22, 2025</strong>, except tobacco and related products (effective at a later date post-cess obligations discharge, expected before December 2025). Source: <a href="https://www.cbic.gov.in" target="_blank" rel="noopener noreferrer">CBIC Official Notification</a>.' },
      { type: "h2", text: "The New GST Slab Structure at a Glance" },
      { type: "table", headers: ["Old Slab", "New Slab", "What Moved Here"], rows: [
        ["0% / Nil", "<strong>0% / Nil (expanded)</strong>", "Food staples (roti, paratha, paneer, UHT milk), life & health insurance, notebooks, certain medicines"],
        ["5%", "<strong>5% (expanded)</strong>", "Most daily-use goods, packaged food, medicines, bicycles, textiles, footwear (\u2264\u20B91,000), FMCG items, small sachets \u2264\u20B910"],
        ["12%", "<strong>Abolished</strong>", "Items moved to either 5% or 18% depending on category"],
        ["18%", "<strong>18% (expanded, now the standard rate)</strong>", "Most goods & services, electronics, consumer durables, vehicles, clothing &gt;\u20B92,500"],
        ["28%", "<strong>Abolished</strong>", "White goods (ACs, TVs, fridges) moved to 18%; cement moved to 18%; true luxury items moved to 40%"],
        ["New: 40%", "<strong>40% (new sin/luxury slab)</strong>", "Tobacco, pan masala, aerated drinks, high-end SUVs (&gt;2500cc), yachts, private aircraft, luxury sports goods"]
      ] },
      { type: "highlight", html: "<strong>Retained niche rates:</strong> 3% on gold/silver jewellery, 0.25% on cut/polished diamonds \u2014 these are unchanged." },
      { type: "h2", text: "What Got Cheaper: The Big Winners" },
      { type: "h3", text: "Food & Daily Essentials" },
      { type: "p", text: "The biggest consumer relief is on food and household staples. These items moved to <strong>Nil (0%) GST</strong>:" },
      { type: "ul", items: [
        "Roti, paratha, khakhra, plain chapati",
        "Paneer (fresh)",
        "UHT (long-life) milk",
        "Packaged drinking water (up to 20 litres)",
        "Certain notebooks and exercise books"
      ] },
      { type: "p", text: "These items moved to <strong>5% GST</strong> (down from 12%):" },
      { type: "ul", items: [
        "Packaged snack foods (namkeen, bhujia, mixtures)",
        "Fruit juices and nectars",
        "Aerated fruit drinks (non-caffeinated)",
        "Soaps and detergents",
        "Toothpaste and oral care products",
        "Shampoos and hair care",
        "Indian bread variants (branded)"
      ] },
      { type: "highlight", html: "<strong>What this means for families:</strong> A typical Indian household spending \u20B915,000/month on groceries and personal care could save <strong>\u20B9800\u2013\u20B91,200/month</strong> in GST costs under the new regime." },
      { type: "h3", text: "White Goods & Electronics" },
      { type: "p", text: 'All major consumer durables moved from <strong>28% \u2192 18%</strong>. Use the <a href="/">GST Calculator</a> to compute your exact savings on any white goods purchase \u2014 enter the product value and select the 18% rate.' },
      { type: "table", headers: ["Product", "Old Rate", "New Rate", "Saving on \u20B950,000 item"], rows: [
        ["Air conditioners", "28%", "18%", "\u20B93,571"],
        ["Refrigerators", "28%", "18%", "\u20B93,571"],
        ["Washing machines", "28%", "18%", "\u20B93,571"],
        ["LCD/LED TVs (&gt;32 inch)", "28%", "18%", "\u20B93,571"],
        ["Dishwashers", "28%", "18%", "\u20B93,571"],
        ["Cement (all grades)", "28%", "18%", "Per bag savings"]
      ] },
      { type: "h3", text: "Vehicles & Mobility" },
      { type: "table", headers: ["Vehicle Type", "Old Rate", "New Rate"], rows: [
        ["Small petrol cars (&lt;1200cc, &lt;4m)", "28% + cess", "18%"],
        ["Small diesel cars (&lt;1500cc, &lt;4m)", "28% + cess", "18%"],
        ["Motorcycles & scooters (&lt;350cc)", "28%", "18%"],
        ["Three-wheelers (all)", "28%", "18%"],
        ["Commercial vehicles", "28%", "18%"],
        ["Ambulances", "28%", "18%"],
        ["Bicycles", "12%", "5%"]
      ] },
      { type: "highlight", html: "<strong>Note:</strong> Compensation cess on vehicles is being phased out by March 2026. Until it is fully discharged, cess may still apply on some vehicles." },
      { type: "h3", text: "Health & Insurance" },
      { type: "p", text: "One of the most impactful changes for ordinary Indians:" },
      { type: "ul", items: [
        "<strong>Individual health insurance premiums \u2192 Nil (0% GST)</strong> (was 18%)",
        "<strong>Individual life insurance premiums \u2192 Nil (0% GST)</strong> (was 18%)",
        "Group health insurance (employer-provided) \u2192 may retain 18%, verify with insurer",
        "All medicines and drugs \u2192 5% GST (uniformly 5% except nil-rated critical drugs)",
        "Medical devices (diagnostic) \u2192 12% \u2192 5%",
        "Spectacles and corrective goggles \u2192 28% \u2192 5%",
        "Homoeopathy medicines \u2192 12% \u2192 5%"
      ] },
      { type: "stat", num: "\u20B93,600/year", label: "GST saving on a \u20B920,000/year health insurance premium \u2014 from 18% to 0% under GST 2.0" },
      { type: "h3", text: "Handicrafts, Culture & Art" },
      { type: "ul", items: [
        "Handicraft idols and statues: 12% \u2192 5%",
        "Paintings and sculptures: 12% \u2192 5%",
        "Wooden, metal, and textile dolls and toys: 12% \u2192 5%",
        "Musical instruments (Indian classical): 12% \u2192 5%"
      ] },
      { type: "cta", title: "Calculate your GST savings under the new rates", text: "Enter any amount and select 5% or 18% to instantly see your tax breakdown under GST 2.0 \u2014 with CGST, SGST, and IGST split." },
      { type: "h2", text: "What Got More Expensive: The Losers" },
      { type: "image", src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=75&auto=format&fit=crop", alt: "Business owner reviewing updated price list and GST invoices" },
      { type: "h3", text: "Luxury & Sin Goods \u2014 New 40% Slab" },
      { type: "p", text: "These items moved into the new <strong>40% GST bracket</strong>:" },
      { type: "ul", items: [
        "Cigarettes and all tobacco products (when cess obligations discharged)",
        "Pan masala and gutkha",
        "Aerated drinks with caffeine (cola, energy drinks)",
        "High-end SUVs (engine &gt;2500cc or &gt;4m length, non-hybrid)",
        "Luxury cars (imports, high-end sedans)",
        "Yachts and private boats",
        "Private aircraft",
        "Cricket match tickets (premium/hospitality)"
      ] },
      { type: "h3", text: "Clothing Above \u20B92,500" },
      { type: "p", text: "One change that catches many textile businesses off-guard:" },
      { type: "table", headers: ["Clothing Value", "Old Rate", "New Rate"], rows: [
        ["Up to \u20B91,000 per piece", "5%", "5% (unchanged)"],
        ["\u20B91,001 \u2013 \u20B92,500 per piece", "12%", "<strong>5% (cheaper)</strong>"],
        ["Above \u20B92,500 per piece", "12%", "<strong>18% (more expensive)</strong>"]
      ] },
      { type: "highlight", html: "Mid-range apparel buyers benefit; buyers of premium branded clothing pay more. If your business sells clothing above \u20B92,500, update your invoicing immediately \u2014 <strong>failing to apply 18% on post-September 22 invoices is non-compliant</strong>." },
      { type: "h2", text: "Impact on Businesses: What You Must Do Immediately" },
      { type: "steps", items: [
        "<strong>Update All Billing and Invoicing Software</strong> \u2014 Every invoice issued on or after September 22, 2025 must reflect the new GST rate. Invoices with old rates (12%, 28%) are non-compliant from this date. Contact your billing software provider (Tally, Zoho Books, ClearTax, QuickBooks India) for the GST 2.0 rate update patch.",
        "<strong>Revise Your Price Lists</strong> \u2014 Lower GST must be passed on to consumers. The anti-profiteering provisions (Section 171, enforced by the Competition Commission of India) require that any benefit from rate reduction be passed to buyers. Update all price lists, e-commerce pages, catalogues, and POS systems.",
        "<strong>Handle Transitional Stock Carefully</strong> \u2014 Goods manufactured or purchased at old GST rates but supplied after September 22 create a transitional issue. If goods remain taxable at a lower rate, no ITC reversal is required. If goods moved to Nil/Exempt, reverse ITC on closing stock under Rule 44 (Section 18(4) of CGST Act) and file ITC-03.",
        "<strong>Update GSTR-1 HSN Codes</strong> \u2014 Some products have changed HSN classification along with the rate change. Verify each product's current HSN and applicable rate in the CBIC HSN lookup tool before filing your first GSTR-1 after September 22, 2025.",
        "<strong>Notify Your B2B Customers</strong> \u2014 Your B2B buyers need to know the new GST rates on your supplies. Their GSTR-2B will reflect the new rates and they need to update their ITC calculations accordingly."
      ] },
      { type: "highlight", html: "<strong>Pro Tip:</strong> Do a stock audit as of September 22, 2025. Document your closing inventory at old rates. This protects you from adverse assessments and ensures you claim or reverse ITC correctly. Consult a CA if you have significant stock of items that moved to Nil." },
      { type: "h2", text: "Impact on GSTR-1 and GSTR-3B Filing" },
      { type: "h3", text: "For Returns Covering the Transition Period (September 2025)" },
      { type: "p", text: "If you have a monthly GSTR-1 for September 2025, you will have invoices at both old rates (1st\u201321st September) and new rates (22nd\u201330th September). File both sets in the same GSTR-1 \u2014 the portal accepts mixed rates in the same return period. In Table 12 (HSN summary), ensure the rate is correctly split." },
      { type: "p", text: 'For a step-by-step guide on filing GSTR-1 correctly, see our article on <a href="/blog/gst-invoice-format-india">GST invoice format in India</a>. For an in-depth understanding of Input Tax Credit rules, refer to our guide on <a href="/blog/input-tax-credit-gst">Input Tax Credit under GST</a>.' },
      { type: "h3", text: "ITC Impact in GSTR-3B" },
      { type: "ul", items: [
        "For items that moved from 28% to 18%: your ITC on purchases continues normally \u2014 no reversal required",
        "For items now Nil-rated: reverse ITC on purchases used for those supplies in GSTR-3B Table 4B",
        "Interest at 24% p.a. applies if excess ITC is detected without reversal"
      ] },
      { type: "warn", html: "<strong>\u26A0\uFE0F ITC Reversal Deadline:</strong> ITC-03 filing for Nil-rated stock reversal must be completed within 30 days of the rate change \u2014 <strong>by October 22, 2025</strong>. Missing this deadline attracts interest at 24% p.a. on the excess ITC retained." },
      { type: "h2", text: "Sector-by-Sector Impact Summary" },
      { type: "table", headers: ["Sector", "Net Impact", "Key Change"], rows: [
        ["FMCG (food, personal care)", "\u2705 Positive", "Most products 12% \u2192 5% or 18% \u2192 5%"],
        ["Consumer electronics", "\u2705 Positive", "White goods 28% \u2192 18%"],
        ["Automobiles (small/mid)", "\u2705 Positive", "Small cars/bikes 28% \u2192 18%"],
        ["Real estate & construction", "\u2705 Positive", "Cement 28% \u2192 18%"],
        ["Healthcare & pharma", "\u2705 Strongly Positive", "Medicines 12% \u2192 5%, insurance exempt"],
        ["Insurance", "\u2705 Strongly Positive", "Health/life insurance Nil"],
        ["Handicrafts & artisans", "\u2705 Positive", "Most items 12% \u2192 5%"],
        ["Textiles (premium)", "\u274C Negative", "Apparel &gt;\u20B92,500 from 12% \u2192 18%"],
        ["Tobacco & aerated drinks", "\u274C Strongly Negative", "New 40% slab"],
        ["Luxury vehicles", "\u274C Negative", "40% slab for high-end SUVs"],
        ["Restaurants", "\u2796 Neutral", "5% (no ITC) unchanged"]
      ] },
      { type: "h2", text: "Key Compliance Dates for GST 2.0" },
      { type: "table", headers: ["Action", "Deadline"], rows: [
        ["Update billing software to new rates", "By September 22, 2025"],
        ["First GSTR-1 with new rates", "By October 11, 2025 (September monthly filers)"],
        ["First GSTR-3B with new rates", "By October 20, 2025"],
        ["ITC-03 filing (for Nil-rated stock reversal)", "Within 30 days \u2014 by October 22, 2025"],
        ["Compensation cess phase-out", "By March 2026 (expected)"]
      ] },
      { type: "h2", text: "What GST 2.0 Means Long-Term" },
      { type: "p", text: "India's GST 2.0 is more than a rate change \u2014 it is a structural shift that addresses the system's core criticism: too many slabs creating classification disputes, compliance complexity, and litigation." },
      { type: "ul", items: [
        '<strong>Fewer classification disputes</strong> \u2014 With only 2 main slabs, the notorious "popcorn debates" (different rates for plain vs caramel vs branded popcorn) largely disappear',
        "<strong>Lower compliance cost</strong> \u2014 MSMEs spend less time determining which of 5 rates applies; simpler invoicing, simpler reconciliations",
        "<strong>Consumption boost</strong> \u2014 Lower rates on essentials and consumer durables increase disposable income, driving demand",
        "<strong>Anti-inflationary effect</strong> \u2014 Rate cuts on cement, white goods, and medicines directly reduce input costs for housing and healthcare"
      ] },
      { type: "h2", text: "Conclusion: Your GST 2.0 Action Checklist" },
      { type: "checklist", items: [
        { mark: "\u2705", html: "Update billing software to new GST 2.0 rates immediately" },
        { mark: "\u2705", html: "Revise all price lists and pass on rate reductions to buyers (anti-profiteering compliance)" },
        { mark: "\u2705", html: "Conduct closing stock audit as of September 22, 2025 for transitional ITC treatment" },
        { mark: "\u2705", html: "File ITC-03 by October 22, 2025 if any supplies moved to Nil" },
        { mark: "\u2705", html: "Check first GSTR-1 and GSTR-3B for September 2025 carefully for mixed-rate invoices" },
        { mark: "\u2705", html: "Notify all B2B customers of the new applicable rates on your supplies" }
      ] },
      { type: "p", text: 'Use <a href="/">gstcalculator.me</a> to instantly verify the new GST amounts on any product or service \u2014 essential for updating your invoices and price lists correctly under GST 2.0. For the calculation method at each slab, see our guide on <a href="/blog/how-to-calculate-gst">how to calculate GST in India</a>. To understand CGST, SGST, and IGST under the new structure, read our article on <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a>.' },
      { type: "p", text: "For further reading: the CBIC official press note provides the complete rate schedule, and the PIB release has the full 56th GST Council meeting notification." },
      { type: "divider" },
      { type: "sourceLink", href: "https://www.cbic.gov.in", label: "CBIC \u2014 Official GST 2.0 Notification & Rate Schedule" },
      { type: "sourceLink", href: "https://pib.gov.in", label: "PIB \u2014 56th GST Council Meeting Press Release" },
      { type: "cta", title: "Verify your GST under new 2025 rates", text: "Enter any amount and select 5%, 18%, or the new 40% equivalent to instantly see your CGST, SGST, and IGST breakdown." }
    ]
  },
  {
    slug: "new-gst-rate-slab-list-2025-26",
    title: "New GST Rate Slab List 2025\u201326: Complete Item-Wise Guide After GST 2.0",
    description: "Updated GST rate slab list for FY 2025\u201326 after the September 2025 GST 2.0 overhaul \u2014 item-wise rates across food, electronics, vehicles, services, insurance, medicines, and more. With calculator.",
    category: "GST Rates",
    readTime: "12 min",
    date: "2025-10-02",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=75&auto=format&fit=crop", alt: "Tax rate list and calculator on a modern desk" },
      { type: "lead", text: "India's GST rate structure changed fundamentally on September 22, 2025. The old 5-slab system (0%, 5%, 12%, 18%, 28%) is now effectively a 3-slab system: 0%/Nil, 5%, 18%, and a new 40% for sin/luxury goods. The 12% and 28% slabs are abolished." },
      { type: "p", text: "This is the most complete, item-wise reference for the updated rates \u2014 covering food, electronics, vehicles, services, insurance, healthcare, real estate, textiles, and more. Bookmark this page. Every business owner, accountant, and procurement manager in India needs these numbers." },
      { type: "highlight", html: 'Use <a href="https://gstcalculator.me">gstcalculator.me</a> to instantly compute CGST + SGST or IGST on any transaction at the new rates. Enter the value, select the rate, get the breakdown in seconds.' },
      { type: "h2", text: "The New Slab Structure: Quick Reference" },
      { type: "table", headers: ["GST Rate", "What It Covers"], rows: [
        ["<strong>0% / Nil</strong>", "Essential food, education, health services, life/health insurance, unprocessed agriculture"],
        ["<strong>5%</strong>", "Packaged food, daily-use goods, medicines, bicycles, textiles (\u2264\u20B92,500), footwear (\u2264\u20B91,000), most transport services"],
        ["<strong>18%</strong>", "Standard rate for most goods &amp; services \u2014 electronics, vehicles (&lt;350cc/small cars), construction materials, professional services, software, restaurants (AC)"],
        ["<strong>40%</strong>", "Luxury &amp; sin goods \u2014 tobacco, pan masala, aerated drinks with caffeine, luxury SUVs (&gt;2500cc), yachts, private jets"],
        ["<strong>3%</strong>", "Gold, silver jewellery, precious metals (unchanged)"],
        ["<strong>0.25%</strong>", "Cut and polished diamonds (unchanged)"]
      ] },
      { type: "h2", text: "Food & Beverages \u2014 Updated GST Rates" },
      { type: "h3", text: "Nil / 0% GST (Post September 2025)" },
      { type: "table", headers: ["Item", "HSN", "GST Rate"], rows: [
        ["Fresh fruits and vegetables", "07\u201308", "0%"],
        ["Fresh meat, fish, eggs (unprocessed)", "02\u201304", "0%"],
        ["Fresh milk (loose)", "0401", "0%"],
        ["UHT / long-life packaged milk (new)", "0401", "0% <em>(was 5%)</em>"],
        ["Paneer (fresh, unbranded)", "0406", "0%"],
        ["Roti, paratha, khakhra (new)", "1905", "0% <em>(was 5%/12%)</em>"],
        ["Cereals (unbranded, unpacked)", "10", "0%"],
        ["Unbranded pulses and lentils", "07", "0%"],
        ["Salt", "2501", "0%"],
        ["Jaggery (gur)", "1701", "0%"]
      ] },
      { type: "h3", text: "5% GST" },
      { type: "table", headers: ["Item", "HSN", "GST Rate"], rows: [
        ["Packaged / branded rice, wheat", "1006 / 1001", "5%"],
        ["Sugar", "1701", "5%"],
        ["Edible oils (refined)", "1511\u20131516", "5%"],
        ["Tea (packaged, branded)", "0902", "5%"],
        ["Coffee (ground / instant)", "0901", "5%"],
        ["Packaged snacks, namkeen, bhujia", "2106", "5% <em>(was 12%)</em>"],
        ["Fruit juices", "2009", "5% <em>(was 12%)</em>"],
        ["Soups and broths (packaged)", "2104", "5%"],
        ["Ice cream", "2105", "5%"],
        ["Biscuits and cookies", "1905", "5%"],
        ["Bread (branded, packaged)", "1905", "5%"],
        ["Cakes and pastries", "1905", "5%"]
      ] },
      { type: "h3", text: "18% GST" },
      { type: "table", headers: ["Item", "HSN", "GST Rate"], rows: [
        ["Aerated drinks (non-caffeinated)", "2202", "18%"],
        ["Chocolate (all types)", "1806", "18%"],
        ["Malt-based food drinks", "1901", "18%"],
        ["Instant noodles", "1902", "18%"]
      ] },
      { type: "h3", text: "40% GST (New)" },
      { type: "table", headers: ["Item", "HSN", "GST Rate"], rows: [
        ["Aerated drinks with caffeine (cola, energy drinks)", "2202", "40%"],
        ["Pan masala, gutkha", "2106", "40%"],
        ["Tobacco products (pending cess discharge)", "24", "40%"]
      ] },
      { type: "h2", text: "Personal Care & Household \u2014 Updated GST Rates" },
      { type: "table", headers: ["Item", "Old Rate", "New Rate"], rows: [
        ["Soaps (all types)", "18%", "<strong>5%</strong>"],
        ["Shampoos and conditioners", "18%", "<strong>5%</strong>"],
        ["Toothpaste and toothbrushes", "18%", "<strong>5%</strong>"],
        ["Detergents and washing powders", "18%", "<strong>5%</strong>"],
        ["Skin care creams (mass market)", "18%", "<strong>5%</strong>"],
        ["Pressure cookers", "12%", "<strong>5%</strong>"],
        ["Small domestic appliances (mixers, grinders)", "12%", "<strong>5%</strong>"],
        ["Small washing machines", "12%", "<strong>5%</strong>"],
        ["Sewing machines", "12%", "<strong>5%</strong>"],
        ["Umbrellas", "12%", "<strong>5%</strong>"],
        ["Wristwatches (&lt;\u20B92,000)", "12%", "<strong>5%</strong>"],
        ["Air conditioners", "28%", "<strong>18%</strong>"],
        ["Refrigerators", "28%", "<strong>18%</strong>"],
        ["Large washing machines", "28%", "<strong>18%</strong>"],
        ["Dishwashers", "28%", "<strong>18%</strong>"],
        ["Microwave ovens", "28%", "<strong>18%</strong>"],
        ["Vacuum cleaners", "28%", "<strong>18%</strong>"],
        ["Luxury wristwatches (&gt;\u20B910,000)", "28%", "<strong>18%</strong>"]
      ] },
      { type: "highlight", html: '<strong>Quick check:</strong> For any home appliance, use <a href="https://gstcalculator.me">gstcalculator.me</a> \u2014 select 18% for white goods, 5% for small appliances. The calculator instantly splits CGST and SGST for you.' },
      { type: "h2", text: "Electronics & Technology" },
      { type: "table", headers: ["Item", "HSN", "Old Rate", "New Rate"], rows: [
        ["Smartphones / mobile phones", "8517", "12%", "<strong>12%</strong> <em>(unchanged)</em>"],
        ["Laptops and computers", "8471", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["LED TVs (&gt;32 inch)", "8528", "28%", "<strong>18%</strong>"],
        ["LED TVs (\u226432 inch)", "8528", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Tablets", "8471", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Cameras", "9006", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Printers", "8443", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Solar panels (PV cells)", "8541", "12%", "<strong>5%</strong>"],
        ["LED lights and bulbs", "9405", "12%", "<strong>5%</strong>"],
        ["Drones", "8806", "18%", "<strong>5%</strong> <em>(targeted relief for startups)</em>"]
      ] },
      { type: "h2", text: "Construction Materials \u2014 Updated GST Rates" },
      { type: "table", headers: ["Material", "Old Rate", "New Rate"], rows: [
        ["Cement (all types: OPC, PPC)", "28%", "<strong>18%</strong>"],
        ["Steel bars / TMT rods", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Iron and steel flat products", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Paints and varnishes", "28%", "<strong>18%</strong>"],
        ["Tiles (ceramic, vitrified)", "28%", "<strong>18%</strong>"],
        ["Marble and granite slabs", "28%", "<strong>18%</strong>"],
        ["Plywood and wood panels", "12%", "<strong>5%</strong>"],
        ["PVC pipes", "18%", "<strong>5%</strong>"],
        ["Bricks and blocks", "5%", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Sand and gravel", "5%", "<strong>5%</strong> <em>(unchanged)</em>"]
      ] },
      { type: "p", text: 'This is particularly relevant to our <a href="/blog/gst-on-real-estate-india">GST on Real Estate guide</a> \u2014 reduced cement and construction material rates will lower project costs for both affordable and commercial housing.' },
      { type: "h2", text: "Vehicles \u2014 Updated GST Rates" },
      { type: "image", src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=75&auto=format&fit=crop", alt: "Cars in a showroom representing vehicle GST rates" },
      { type: "table", headers: ["Vehicle Type", "HSN", "Old Rate", "New Rate"], rows: [
        ["Small petrol cars (&lt;1200cc, &lt;4m length)", "8703", "28% + cess", "<strong>18%</strong>"],
        ["Small diesel cars (&lt;1500cc, &lt;4m length)", "8703", "28% + cess", "<strong>18%</strong>"],
        ["Mid-size cars (1200\u20131800cc petrol)", "8703", "28% + cess", "<strong>18%</strong>"],
        ["Electric vehicles (all)", "8703", "5%", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Hybrid vehicles", "8703", "28%", "<strong>18%</strong>"],
        ["Motorcycles / scooters (&lt;350cc)", "8711", "28%", "<strong>18%</strong>"],
        ["Motorcycles (&gt;350cc)", "8711", "28%", "<strong>28%</strong> <em>(unchanged at 28% + moving to 40% for &gt;350cc)</em>"],
        ["Three-wheelers", "8703", "28%", "<strong>18%</strong>"],
        ["Commercial vehicles", "8704", "28%", "<strong>18%</strong>"],
        ["Ambulances", "8703", "28%", "<strong>18%</strong>"],
        ["Luxury SUVs (&gt;2500cc OR &gt;4m, non-hybrid)", "8703", "28% + cess", "<strong>40%</strong>"],
        ["Bicycles", "8712", "12%", "<strong>5%</strong>"],
        ["Cycle rickshaws", "8716", "5%", "<strong>5%</strong> <em>(unchanged)</em>"]
      ] },
      { type: "highlight", html: "<strong>Note on cess:</strong> Compensation cess on vehicles is being phased out. The government expects full discharge by March 2026. Until then, cess may still apply on some categories. Verify current cess applicability with your dealer." },
      { type: "h2", text: "Textiles & Apparel" },
      { type: "table", headers: ["Category", "Old Rate", "New Rate"], rows: [
        ["Cotton fabric", "5%", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Synthetic fabric", "12%", "<strong>5%</strong>"],
        ["Readymade garments (\u2264\u20B91,000)", "5%", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Readymade garments (\u20B91,001\u2013\u20B92,500)", "12%", "<strong>5% (cheaper)</strong>"],
        ["Readymade garments (&gt;\u20B92,500)", "12%", "<strong>18% (more expensive)</strong>"],
        ["Footwear (\u2264\u20B91,000/pair)", "5%", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Footwear (&gt;\u20B91,000/pair)", "12%", "<strong>5% (cheaper)</strong>"],
        ["Handloom products", "5%", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Woolen fabrics", "12%", "<strong>5%</strong>"],
        ["Leather goods (bags, wallets)", "18%", "<strong>5%</strong>"]
      ] },
      { type: "h2", text: "Healthcare & Insurance \u2014 Major Changes" },
      { type: "table", headers: ["Item / Service", "Old Rate", "New Rate"], rows: [
        ["Individual health insurance premium", "18%", "<strong>0% (Nil)</strong>"],
        ["Individual life insurance premium", "18%", "<strong>0% (Nil)</strong>"],
        ["Group health insurance (employer)", "18%", "<strong>18%</strong> <em>(verify with insurer)</em>"],
        ["All medicines / drugs", "5% or 12%", "<strong>5% uniformly</strong>"],
        ["Critical / lifesaving drugs (33 specific)", "5%", "<strong>0% (Nil)</strong>"],
        ["Medical devices (diagnostic equipment)", "12%", "<strong>5%</strong>"],
        ["Hospital services", "Exempt", "<strong>Exempt</strong> <em>(unchanged)</em>"],
        ["Ambulance services", "0%", "<strong>0%</strong> <em>(unchanged)</em>"],
        ["Spectacles and corrective goggles", "28%", "<strong>5%</strong>"],
        ["Homoeopathy medicines", "12%", "<strong>5%</strong>"],
        ["Ayurvedic medicines (licensed)", "5% or 12%", "<strong>5%</strong>"]
      ] },
      { type: "p", text: 'This change is detailed further in our <a href="/blog/gst-for-freelancers-india">GST for Freelancers guide</a> \u2014 freelancers and self-employed individuals buying health insurance now pay <strong>zero GST</strong> on their premiums.' },
      { type: "h2", text: "Services \u2014 Updated GST Rates" },
      { type: "table", headers: ["Service", "SAC", "Old Rate", "New Rate"], rows: [
        ["IT / software development", "998314", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Legal services (B2B)", "998211", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Accounting / bookkeeping", "998222", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Management consulting", "998311", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Advertising services", "998361", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Restaurant (non-AC, non-alcohol)", "996331", "5% (no ITC)", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Restaurant (AC or alcohol-serving)", "996331", "18%", "<strong>18%</strong> <em>(unchanged \u2014 verify)</em>"],
        ["Hotels (\u2264\u20B91,000/night)", "996311", "0%", "<strong>0%</strong> <em>(unchanged)</em>"],
        ["Hotels (\u20B91,001\u2013\u20B97,500/night)", "996311", "12%", "<strong>5% (cheaper)</strong>"],
        ["Hotels (&gt;\u20B97,500/night)", "996311", "18%", "<strong>18%</strong> <em>(unchanged)</em>"],
        ["Road freight (GTA)", "996511", "5% (no ITC)", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Air travel (economy class)", "996312", "5%", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Air travel (business class)", "996312", "12%", "<strong>5% (cheaper)</strong>"],
        ["Gyms, salons, yoga classes", "999721", "18%", "<strong>5%</strong>"],
        ["Construction services (residential)", "995412", "5%", "<strong>5%</strong> <em>(unchanged)</em>"]
      ] },
      { type: "h2", text: "Real Estate \u2014 Quick Summary" },
      { type: "table", headers: ["Property Type", "Old Rate", "New Rate"], rows: [
        ["Affordable housing (under-construction)", "1%", "<strong>1%</strong> <em>(unchanged)</em>"],
        ["Other residential (under-construction)", "5%", "<strong>5%</strong> <em>(unchanged)</em>"],
        ["Commercial (under-construction)", "12%", "<strong>12%</strong> <em>(unchanged)</em>"],
        ["Ready-to-move (with OC)", "0%", "<strong>0%</strong> <em>(unchanged)</em>"]
      ] },
      { type: "p", text: 'Real estate rates are unchanged \u2014 but the cost of construction materials like cement have dropped from 28% to 18%, which should lower builder costs and ideally translate to better pricing for buyers. See our full <a href="/blog/gst-on-real-estate-india">GST on Real Estate guide</a>.' },
      { type: "h2", text: "How to Calculate GST at New Rates" },
      { type: "p", text: "The formula is unchanged \u2014 only the rate inputs have changed:" },
      { type: "formula", title: "For intra-state supply (CGST + SGST)", code: "CGST = (Taxable Value \xD7 Rate/2) / 100\nSGST = (Taxable Value \xD7 Rate/2) / 100\nTotal GST = CGST + SGST" },
      { type: "formula", title: "For inter-state supply (IGST)", code: "IGST = (Taxable Value \xD7 Rate) / 100" },
      { type: "example", title: "Example at new 18% rate", lines: [
        "Product value: \u20B950,000",
        "CGST (9%): \u20B94,500",
        "SGST (9%): \u20B94,500",
        "Total invoice value: \u20B959,000"
      ] },
      { type: "example", title: "Example at new 5% rate", lines: [
        "Product value: \u20B910,000",
        "CGST (2.5%): \u20B9250",
        "SGST (2.5%): \u20B9250",
        "Total invoice value: \u20B910,500"
      ] },
      { type: "highlight", html: 'Skip the manual maths \u2014 <a href="https://gstcalculator.me">gstcalculator.me</a> handles the entire calculation instantly, with the correct CGST/SGST/IGST split for any amount and rate.' },
      { type: "h2", text: "Frequently Asked Questions on New GST Rates" },
      { type: "h3", text: "Q: Is the 12% GST slab completely abolished?" },
      { type: "p", text: "Yes. From September 22, 2025, no goods or services should be invoiced at 12%. All items previously at 12% have moved to either 5% or 18%." },
      { type: "h3", text: "Q: Is the 28% slab completely abolished?" },
      { type: "p", text: "Mostly yes. The 28% slab is effectively removed for most goods. The new 40% slab replaces it only for sin and luxury goods. White goods and vehicles that were at 28% are now at 18%." },
      { type: "h3", text: "Q: Do I need to re-register for GST after these rate changes?" },
      { type: "p", text: "No. Your GSTIN remains valid. Only your billing rates need updating." },
      { type: "h3", text: "Q: What if I already raised an invoice at 12% or 28% after September 22, 2025?" },
      { type: "p", text: "Issue a credit note for the incorrect invoice and re-issue at the correct rate. The excess GST collected must be remitted or refunded to the buyer." },
      { type: "h3", text: "Q: Has the GST registration threshold changed?" },
      { type: "p", text: "No. Thresholds remain \u20B940 lakh for goods and \u20B920 lakh for services." },
      { type: "h2", text: "External References" },
      { type: "divider" },
      { type: "sourceLink", href: "https://www.cbic.gov.in", label: "CBIC Official GST 2.0 Notification \u2014 official rate change notifications" },
      { type: "sourceLink", href: "https://pib.gov.in", label: "PIB Press Release: 56th GST Council Meeting \u2014 government announcement" },
      { type: "sourceLink", href: "https://gst.gov.in", label: "gst.gov.in HSN Rate Finder \u2014 verify any product's current rate" },
      { type: "p", text: 'Related: <a href="/blog/gst-2-0-reforms-india-2025">GST 2.0 Reforms Complete Guide</a> \xB7 <a href="/blog/hsn-code-list-india-2025">HSN Code List India 2025</a> \xB7 <a href="/blog/gst-rate-slabs-india">GST Rate Slabs India</a> \xB7 <a href="/blog/how-to-calculate-gst">How to Calculate GST</a>' },
      { type: "cta", title: "Calculate GST at the new 2025 rates", text: "Enter any amount, pick the new rate (0%, 5%, 18% or 40%) and get an instant CGST/SGST/IGST breakdown." }
    ]
  },
  {
    slug: "e-invoicing-gst-india-2025",
    title: "E-Invoicing Under GST India 2025: Complete Guide \u2014 Applicability, IRN, 30-Day Rule & Penalties",
    description: "Complete guide to GST e-invoicing in India 2025 \u2014 who must comply (\u20B95 Crore threshold), how IRN generation works, the new 30-day reporting rule for \u20B910 Crore+ businesses, exemptions, and penalties.",
    category: "GST Compliance",
    readTime: "11 min",
    date: "2025-10-03",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=75&auto=format&fit=crop", alt: "Digital invoice on laptop screen representing e-invoicing system" },
      { type: "lead", text: "If your business has crossed \u20B95 Crore in annual turnover at any point since 2017-18, you are legally required to generate e-invoices for every B2B transaction. No exceptions, no grace period \u2014 any B2B invoice without a valid IRN (Invoice Reference Number) is treated as legally non-existent under GST law. Your buyer cannot claim ITC on it." },
      { type: "p", text: "And from April 1, 2025, a new time-bomb rule kicked in: businesses with \u20B910 Crore+ turnover must upload invoices to the <strong>Invoice Registration Portal (IRP) within 30 days</strong> of the invoice date \u2014 or the IRP permanently rejects it." },
      { type: "p", text: "This guide explains the entire e-invoicing system from scratch: what it is, who it applies to, how to generate an IRN, what the 30-day rule means for your workflow, who is exempt, and what happens if you get it wrong." },
      { type: "h2", text: "What Is E-Invoicing Under GST?" },
      { type: "p", text: "E-invoicing does <strong>not</strong> mean generating invoices on a government portal. You continue creating invoices using your own billing or ERP software. What changes is the <strong>reporting step</strong>:" },
      { type: "p", text: "Every eligible B2B invoice must be <strong>uploaded to the Invoice Registration Portal (IRP)</strong> \u2014 the government's centralised invoice authentication server. The IRP:" },
      { type: "ul", items: [
        "Validates the invoice data (checks GSTIN, HSN codes, invoice values)",
        "Checks for duplicates",
        "Generates a unique <strong>IRN (Invoice Reference Number)</strong> \u2014 a 64-character hash string",
        "Attaches a <strong>QR code</strong> containing key invoice details",
        "Digitally signs the invoice",
        "Returns the authenticated invoice to you"
      ] },
      { type: "p", text: "<strong>Only an invoice with a valid IRN is a legally valid tax invoice.</strong> Without IRN, the buyer cannot claim ITC, and you face penalties." },
      { type: "highlight", html: '<strong>Source:</strong> <a href="https://einvoice1.gst.gov.in" target="_blank" rel="noopener noreferrer">CBIC e-Invoice portal</a> \xB7 <a href="https://cleartax.in/s/e-invoicing-gst" target="_blank" rel="noopener noreferrer">Cleartax e-Invoicing Guide</a> \xB7 <a href="https://tallysolutions.com/gst/e-invoicing-limit-india/" target="_blank" rel="noopener noreferrer">TallySolutions e-Invoice Guide</a>' },
      { type: "h2", text: "Who Must Generate E-Invoices? (Applicability)" },
      { type: "h3", text: "Current Threshold: \u20B95 Crore AATO" },
      { type: "p", text: "As of FY 2025\u201326, e-invoicing is mandatory for all GST-registered businesses whose <strong>Annual Aggregate Turnover (AATO)</strong> exceeds <strong>\u20B95 Crore</strong> in any financial year from 2017-18 onwards." },
      { type: "table", headers: ["AATO (Any Year from 2017-18)", "E-Invoicing Required?"], rows: [
        ["Below \u20B95 Crore", "No (voluntary)"],
        ["\u20B95 Crore or above", "<strong>Yes \u2014 mandatory</strong>"]
      ] },
      { type: "p", text: "<strong>AATO is cumulative across all GSTINs under the same PAN.</strong> If you have branches in multiple states and your combined turnover across all GSTINs under one PAN crosses \u20B95 Crore, every GSTIN under that PAN is covered." },
      { type: "h3", text: "How the Threshold Has Evolved" },
      { type: "table", headers: ["Phase", "Effective Date", "Threshold"], rows: [
        ["Phase 1", "October 1, 2020", "\u20B9500 Crore+"],
        ["Phase 2", "January 1, 2021", "\u20B9100 Crore+"],
        ["Phase 3", "April 1, 2021", "\u20B950 Crore+"],
        ["Phase 4", "April 1, 2022", "\u20B920 Crore+"],
        ["Phase 5", "October 1, 2022", "\u20B910 Crore+"],
        ["Phase 6", "August 1, 2023", "<strong>\u20B95 Crore+</strong> (current)"],
        ["Proposed next phase", "To be notified", "\u20B92 Crore+"]
      ] },
      { type: "p", text: "The direction is clear \u2014 the government is steadily extending e-invoicing to smaller businesses. If your turnover is between \u20B92\u20135 Crore, adopt voluntarily now to avoid a compliance scramble when the \u20B92 Crore threshold is notified." },
      { type: "h3", text: "Which Transactions Require E-Invoices?" },
      { type: "table", headers: ["Transaction Type", "E-Invoice Required?"], rows: [
        ["B2B supply of goods", "\u2705 Yes"],
        ["B2B supply of services", "\u2705 Yes"],
        ["Exports (with or without payment of IGST)", "\u2705 Yes"],
        ["Supplies to government departments (B2G)", "\u2705 Yes"],
        ["Credit notes (B2B)", "\u2705 Yes"],
        ["Debit notes (B2B)", "\u2705 Yes"],
        ["B2C supplies (to unregistered buyers)", "\u274C No (but QR code mandatory if &gt;\u20B92 lakh)"],
        ["Exempt supplies", "\u274C No"],
        ["Import of services", "\u274C No"]
      ] },
      { type: "h2", text: "Who Is Exempt from E-Invoicing?" },
      { type: "p", text: "Even if your turnover exceeds \u20B95 Crore, these categories are <strong>excluded</strong>:" },
      { type: "ul", items: [
        "<strong>SEZ Units</strong> (supplies from Special Economic Zones)",
        "<strong>Banks and financial institutions</strong>",
        "<strong>NBFCs (Non-Banking Financial Companies)</strong>",
        "<strong>Insurance companies</strong> (on their own policy documents)",
        "<strong>Goods Transport Agencies (GTAs)</strong>",
        "<strong>Passenger transport services</strong> (buses, metros, railways)",
        "<strong>Multiplex cinemas</strong> (for ticket sales)"
      ] },
      { type: "highlight", html: '<strong>Pro Tip:</strong> If your business falls into an exempt category, use the <strong>"E-Invoice Exemption Declaration"</strong> on the GST portal (einvoice1.gst.gov.in) to avoid automated compliance notices being generated against your GSTIN.' },
      { type: "h2", text: "The 30-Day Rule: New from April 1, 2025" },
      { type: "p", text: "This is the change that caught thousands of businesses off-guard." },
      { type: "p", text: "<strong>The rule:</strong> Businesses with an AATO of <strong>\u20B910 Crore or more</strong> must upload invoices (and credit/debit notes) to the IRP <strong>within 30 days of the invoice date</strong>. If the invoice is older than 30 days, the IRP will <strong>reject</strong> the upload \u2014 the IRN cannot be generated, and the invoice is invalid." },
      { type: "highlight", html: '<strong>Source:</strong> <a href="https://www.gstn.org.in" target="_blank" rel="noopener noreferrer">GSTN Advisory dated November 5, 2024</a> \u2014 effective April 1, 2025' },
      { type: "h3", text: "What This Means in Practice" },
      { type: "table", headers: ["Scenario", "Outcome"], rows: [
        ["Invoice dated April 1 \u2014 uploaded April 28", "\u2705 Accepted (within 30 days)"],
        ["Invoice dated April 1 \u2014 uploaded May 2", "\u274C Rejected (31 days \u2014 too late)"],
        ["Credit note dated April 15 \u2014 uploaded May 20", "\u274C Rejected (35 days)"],
        ["Invoice dated March 30 \u2014 uploaded April 25", "\u274C Rejected (26 days from March 30 is April 25 \u2014 wait, yes 26 days \u2014 check calendar carefully)"]
      ] },
      { type: "p", text: "<strong>Why this matters:</strong> Many businesses, especially those running quarterly billing cycles or those with billing delays, used to upload invoices in bulk at month-end for the whole quarter. That workflow is now illegal for \u20B910 Crore+ businesses. Every invoice must be uploaded within 30 days of issue." },
      { type: "h3", text: "Businesses Affected by the 30-Day Rule" },
      { type: "p", text: "This change expanded the 30-day rule from its earlier scope of \u20B9100 Crore+ to now include all businesses with \u20B910 Crore+ AATO \u2014 a 10x expansion of scope that brings hundreds of thousands of mid-sized companies into the stricter timeline." },
      { type: "image", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=75&auto=format&fit=crop", alt: "Business team reviewing digital compliance documents" },
      { type: "h2", text: "How to Generate an E-Invoice (IRN): Step by Step" },
      { type: "h3", text: "Step 1 \u2014 Prepare Your ERP / Billing Software" },
      { type: "p", text: "Your billing software must:" },
      { type: "ul", items: [
        "Support JSON format (GST INV-01 schema)",
        "Be configured with your GSTIN credentials",
        "Have IRP integration (via API or GST Suvidha Provider \u2014 GSP)"
      ] },
      { type: "p", text: "Most major software (Tally Prime, Zoho Books, ClearTax, QuickBooks, Busy) has native IRP integration. Update to the latest version and enable the e-invoice feature." },
      { type: "h3", text: "Step 2 \u2014 Create the Invoice in Your Software" },
      { type: "p", text: "Raise the invoice as usual, ensuring all mandatory fields are populated:" },
      { type: "ul", items: [
        "Supplier GSTIN, name, address",
        "Buyer GSTIN, name, address, place of supply",
        "Invoice number, date, and type (regular / credit note / debit note)",
        "Item details: description, HSN code, quantity, unit price",
        "Tax breakup: CGST, SGST, IGST amounts",
        "Total invoice value"
      ] },
      { type: "h3", text: "Step 3 \u2014 Upload to IRP" },
      { type: "p", text: "Your software automatically sends the invoice data to the IRP in JSON format (either via direct API or through a GSP intermediary). The IRP:" },
      { type: "ul", items: [
        "Validates GSTIN of buyer and seller against the GST database",
        "Checks HSN codes",
        "Verifies no duplicate IRN for same invoice number + GSTIN + FY"
      ] },
      { type: "h3", text: "Step 4 \u2014 Receive IRN and QR Code" },
      { type: "p", text: "If validated successfully, the IRP returns:" },
      { type: "ul", items: [
        "<strong>IRN</strong> \u2014 64-character unique hash (store this permanently)",
        "<strong>QR Code</strong> \u2014 contains supplier/buyer GSTIN, invoice number, date, value, HSN, and IRN",
        "<strong>Digitally signed JSON</strong> \u2014 the authenticated invoice payload"
      ] },
      { type: "p", text: "Print or embed the IRN and QR code on your invoice. This authenticated invoice is the only valid version." },
      { type: "h3", text: "Step 5 \u2014 GSTR-1 Auto-Population" },
      { type: "p", text: "The IRP automatically transmits the validated invoice data to:" },
      { type: "ul", items: [
        "<strong>Your GSTR-1</strong> \u2014 invoice appears in your outward supply dashboard",
        "<strong>E-Way Bill portal</strong> \u2014 if goods require e-way bill, Part A is auto-populated"
      ] },
      { type: "p", text: "This eliminates duplicate data entry for e-invoiced transactions." },
      { type: "h2", text: "Cancellation of E-Invoices" },
      { type: "p", text: "Once an IRN is generated, the invoice can only be <strong>cancelled within 24 hours</strong> on the IRP. After 24 hours, the IRN is permanent." },
      { type: "p", text: "If you need to cancel after 24 hours:" },
      { type: "ul", items: [
        "Issue a <strong>credit note</strong> linked to the original IRN",
        "The credit note also requires IRN generation",
        "Report the credit note in GSTR-1 Table 9B"
      ] },
      { type: "p", text: "<strong>You cannot generate a new IRN for a cancelled IRN's invoice number in the same financial year.</strong> Use a new invoice number." },
      { type: "h2", text: "Penalties for Non-Compliance" },
      { type: "table", headers: ["Offence", "Penalty"], rows: [
        ["Invoice issued without IRN (when required)", "\u20B910,000 per invoice OR 100% of tax amount \u2014 whichever is higher"],
        ["Incorrect invoice (QR code missing, invalid IRN)", "Up to \u20B925,000 per invoice"],
        ["Buyer loses ITC", "Full ITC on that invoice \u2014 non-recoverable"],
        ["Goods intercepted without valid e-invoice", "Detention + 100% tax penalty"]
      ] },
      { type: "p", text: "The buyer impact is the most immediate consequence in practice. If you raise a B2B invoice without an IRN and your buyer unknowingly claims ITC on it, the ITC will be disallowed during scrutiny and the buyer will receive a demand notice. This permanently damages your vendor relationship." },
      { type: "h2", text: "Common E-Invoicing Mistakes to Avoid" },
      { type: "steps", items: [
        "<strong>Uploading after 30 days (for \u20B910 Cr+ businesses)</strong> \u2014 IRP rejects it silently with no grace period",
        "<strong>Using wrong HSN codes</strong> \u2014 IRP validates HSN codes from April 2025 onwards; mismatches cause rejection",
        "<strong>Not updating buyer GSTIN</strong> \u2014 If buyer's GSTIN is cancelled or inactive, the IRP may flag the invoice",
        "<strong>Re-using cancelled invoice numbers</strong> \u2014 Not allowed in the same FY",
        "<strong>Assuming services don't need e-invoicing</strong> \u2014 IT, consulting, legal services are all B2B and require IRN if turnover is above \u20B95 Crore",
        "<strong>Not linking credit notes to original IRN</strong> \u2014 Credit notes without the original IRN reference are harder to reconcile"
      ] },
      { type: "h2", text: "E-Invoicing and Its Impact on GSTR-1 Filing" },
      { type: "p", text: "This is a major compliance benefit that gets overlooked:" },
      { type: "ul", items: [
        "Every e-invoice is <strong>auto-populated into your GSTR-1</strong> outward supply tables",
        "For \u20B95 Crore+ businesses filing GSTR-1 monthly, nearly all B2B invoices should appear pre-filled",
        "You only need to manually add invoices that don't require e-invoicing (B2C, exempt, etc.)",
        "Reconciliation errors between GSTR-1 and actual invoices are dramatically reduced"
      ] },
      { type: "p", text: 'For more on filing GSTR-1 correctly, see our <a href="/blog/how-to-file-gstr-1">How to File GSTR-1 guide</a>.' },
      { type: "highlight", html: '<strong>GST calculation reminder:</strong> Before raising any B2B e-invoice, verify the exact CGST + SGST or IGST amounts using <a href="https://gstcalculator.me">gstcalculator.me</a>. Errors in the tax amount on an e-invoice can only be corrected by cancellation (within 24 hours) or credit note.' },
      { type: "h2", text: "Key Portals and Resources" },
      { type: "table", headers: ["Resource", "URL"], rows: [
        ["IRP \u2014 generate and manage e-invoices", '<a href="https://einvoice1.gst.gov.in" target="_blank" rel="noopener noreferrer">einvoice1.gst.gov.in</a>'],
        ["GSTN e-invoice helpdesk", '<a href="https://einvoice1.gst.gov.in/Others/HelpDesk" target="_blank" rel="noopener noreferrer">einvoice1.gst.gov.in/Others/HelpDesk</a>'],
        ["GST main portal", '<a href="https://www.gst.gov.in" target="_blank" rel="noopener noreferrer">gst.gov.in</a>'],
        ["CBIC GST notifications", '<a href="https://www.cbic.gov.in" target="_blank" rel="noopener noreferrer">cbic.gov.in</a>']
      ] },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "E-invoicing is no longer optional for mid-sized and large businesses. The compliance steps are:" },
      { type: "steps", items: [
        "Check if your AATO crosses \u20B95 Crore in any year since 2017-18",
        "Ensure your billing software has IRP integration",
        "If your AATO is \u20B910 Crore+, set a 30-day upload deadline for every invoice",
        "Train your accounts team on cancellation rules and credit note requirements",
        "Verify HSN codes are correct before uploading \u2014 IRP now validates them"
      ] },
      { type: "p", text: 'Use <a href="https://gstcalculator.me">gstcalculator.me</a> to compute correct GST amounts before raising invoices \u2014 eliminating tax errors before the IRP upload is far easier than issuing credit notes after.' },
      { type: "divider" },
      { type: "p", text: 'Related: <a href="/blog/how-to-file-gstr-1">How to File GSTR-1</a> \xB7 <a href="/blog/gst-invoice-format-india">GST Invoice Format India</a> \xB7 <a href="/blog/hsn-code-list-india-2025">HSN Code List India 2025</a> \xB7 <a href="/blog/gst-registration-process-india">GST Registration Process India</a>' },
      { type: "cta", title: "Compute exact GST before every IRN upload", text: "Verify CGST, SGST, and IGST on any invoice value in seconds \u2014 fewer errors mean fewer credit notes." }
    ]
  },
  {
    slug: "e-way-bill-gst-india-2025",
    title: "E-Way Bill Under GST India 2025: Complete Guide \u2014 Rules, Generation, Validity & Penalties",
    description: "Complete guide to GST e-way bills in India \u2014 when they're required, how to generate on the portal, validity periods, blocking rules, and the hefty penalties for transporting goods without one.",
    category: "GST Compliance",
    readTime: "11 min",
    date: "2025-10-04",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=75&auto=format&fit=crop", alt: "Truck on highway representing goods transport and e-way bill compliance" },
      { type: "lead", text: "If goods worth more than \u20B950,000 are being moved anywhere in India \u2014 between states, within a state, or even from a warehouse to a customer \u2014 an E-Way Bill must accompany them. No E-Way Bill means the goods can be detained at any check post, and the penalty starts at 100% of the tax due." },
      { type: "p", text: "Yet despite being a fundamental part of GST compliance since 2018, e-way bills remain a source of confusion for thousands of businesses. When is it needed? Who generates it \u2014 the supplier, buyer, or transporter? How long is it valid? What happens if it expires mid-transit?" },
      { type: "p", text: "This guide answers all of it." },
      { type: "h2", text: "What Is an E-Way Bill?" },
      { type: "p", text: "An E-Way Bill (EWB) is an <strong>electronic document generated on the GST portal</strong> that must accompany any consignment of goods exceeding \u20B950,000 in value. It is:" },
      { type: "ul", items: [
        "<strong>Not an invoice</strong> \u2014 it's a movement document",
        "<strong>Generated before dispatch</strong> \u2014 not after delivery",
        "Tied to a specific vehicle number (or updated during transit)",
        "Valid for a specific number of days based on distance"
      ] },
      { type: "p", text: "The e-way bill system serves three purposes: it enables real-time tracking of goods movement, reduces tax evasion (goods moving without invoice/bill), and provides a digital audit trail for every consignment." },
      { type: "highlight", html: '<strong>Official e-way bill portal:</strong> <a href="https://ewaybillgst.gov.in" target="_blank" rel="noopener noreferrer">ewaybillgst.gov.in</a>' },
      { type: "h2", text: "When Is an E-Way Bill Required?" },
      { type: "h3", text: "Threshold: Value > \u20B950,000" },
      { type: "p", text: "An e-way bill is required when the <strong>consignment value exceeds \u20B950,000</strong>. This applies to:" },
      { type: "ul", items: [
        "Interstate movement of goods (one state to another)",
        "Intrastate movement (within the same state) \u2014 once the state enables it",
        "Movement of goods for reasons other than supply (job work, exhibition, branch transfer, etc.)",
        "Import and export consignments within India"
      ] },
      { type: "h3", text: "Even Below \u20B950,000 \u2014 When E-Way Bill Is Still Required" },
      { type: "p", text: "Some states mandate e-way bills for smaller consignments. Additionally:" },
      { type: "ul", items: [
        "<strong>Interstate movement</strong> of certain specified goods (e.g., notified goods) may require e-way bills regardless of value",
        "<strong>Job work</strong> movement of goods (even if not a supply) requires EWB if value &gt; \u20B950,000",
        "<strong>Handicraft goods</strong> moved by a person exempt from registration requires EWB for interstate movement regardless of value"
      ] },
      { type: "h3", text: "When E-Way Bill Is NOT Required" },
      { type: "table", headers: ["Scenario", "EWB Required?"], rows: [
        ["Consignment value \u2264 \u20B950,000", "No (but some states may require)"],
        ["Non-motorised transport (cart, cycle)", "No"],
        ["Goods transported within 50 km (supplier to transporter)", "No"],
        ["Certain exempt goods (specified by government)", "No"],
        ["Movement by railways (consignee must generate before collection)", "Special rules apply"],
        ["Personal goods, household effects", "No"],
        ["Goods under customs seal (transit)", "No"]
      ] },
      { type: "p", text: '<strong>Commonly exempt goods include:</strong> Fresh milk, curd, lassi, buttermilk; unprocessed tea, coffee, pepper, raw jute; fresh vegetables and fruits (unprocessed); unworked coral, unset precious/semi-precious stones. Verify the full list at <a href="https://ewaybillgst.gov.in" target="_blank" rel="noopener noreferrer">ewaybillgst.gov.in</a>.' },
      { type: "h2", text: "Who Generates the E-Way Bill?" },
      { type: "p", text: "The responsibility depends on who is initiating the movement:" },
      { type: "table", headers: ["Scenario", "Who Generates EWB"], rows: [
        ["Supplier dispatching goods", "<strong>Supplier</strong>"],
        ["Buyer collecting goods (ex-works)", "<strong>Buyer</strong>"],
        ["Third-party transporter moving goods", "<strong>Transporter</strong> (using supplier's credentials if supplier hasn't generated)"],
        ["Goods owner cannot generate EWB", "Transporter is responsible"],
        ["Import consignment (goods entering India)", "Importer or their agent"]
      ] },
      { type: "p", text: "<strong>Key rule:</strong> If the registered supplier fails to generate the EWB before handover to the transporter, <strong>the transporter must generate it</strong> before movement begins. There's no excuse for goods moving without an EWB \u2014 the responsibility falls on whoever initiates movement." },
      { type: "h2", text: "What Information Goes Into an E-Way Bill?" },
      { type: "p", text: "The EWB has two parts:" },
      { type: "h3", text: "Part A \u2014 Invoice Details (Filled by Supplier/Buyer)" },
      { type: "ul", items: [
        "GSTIN of supplier",
        "GSTIN of recipient (or state code if unregistered)",
        "Place of dispatch and delivery",
        "Document type (invoice, delivery challan, etc.) and document number",
        "Value of consignment",
        "HSN code (first 2 digits minimum)",
        "Reason for transportation (supply, job work, exhibition, etc.)"
      ] },
      { type: "h3", text: "Part B \u2014 Vehicle Details (Filled by Transporter)" },
      { type: "ul", items: [
        "Vehicle number (for road transport)",
        "Transporter ID / LR number (for rail, air, ship)"
      ] },
      { type: "p", text: "<strong>Part A alone generates an EWB number. The bill is only complete (and the vehicle can move) when Part B is also filled.</strong>" },
      { type: "image", src: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=75&auto=format&fit=crop", alt: "Warehouse with goods ready for dispatch and transport documentation" },
      { type: "h2", text: "How to Generate an E-Way Bill: Step by Step" },
      { type: "h3", text: "Step 1 \u2014 Login to ewaybillgst.gov.in" },
      { type: "p", text: "Use your GSTIN credentials. First-time users must register on the e-way bill portal separately from the main GST portal (though it uses the same GSTIN)." },
      { type: "h3", text: "Step 2 \u2014 Go to E-Way Bill \u2192 Generate New" },
      { type: "p", text: "Select the document type (outward or inward supply), enter invoice details, consignee/consignor details, and HSN code." },
      { type: "h3", text: "Step 3 \u2014 Enter Transportation Details (Part B)" },
      { type: "p", text: "Enter the vehicle number, transporter ID, or LR/RR number as applicable." },
      { type: "h3", text: "Step 4 \u2014 Submit and Download" },
      { type: "p", text: "On submission, a unique <strong>EWB number</strong> is generated. Download the e-way bill document (printable) and share it with the driver/transporter. It must accompany the goods throughout transit." },
      { type: "h3", text: "Generating E-Way Bills in Bulk" },
      { type: "p", text: "For businesses dispatching multiple consignments daily, bulk generation via JSON file upload is available. Most accounting software (Tally, Zoho, Busy) supports bulk EWB generation directly from the invoice module." },
      { type: "h3", text: "Auto-Generation from E-Invoice" },
      { type: "p", text: "If you generate an <strong>e-invoice (IRN)</strong> for the consignment and the value is &gt; \u20B950,000, Part A of the e-way bill is <strong>automatically populated</strong> from the e-invoice data. You only need to add vehicle details (Part B) before dispatch. This eliminates duplicate data entry." },
      { type: "h2", text: "E-Way Bill Validity: How Long Does It Last?" },
      { type: "p", text: "Validity is based on distance \u2014 starting from the time of generation:" },
      { type: "table", headers: ["Distance", "Validity Period"], rows: [
        ["Up to 100 km", "<strong>1 day</strong>"],
        ["100 km \u2013 300 km", "<strong>3 days</strong>"],
        ["300 km \u2013 500 km", "<strong>5 days</strong>"],
        ["500 km \u2013 1,000 km", "<strong>10 days</strong>"],
        ["1,000 km \u2013 2,000 km", "<strong>15 days</strong>"],
        ["Above 2,000 km", "<strong>20 days</strong>"]
      ] },
      { type: "highlight", html: "<strong>For ODC (Over-Dimensional Cargo):</strong> All distance bands get double the above validity." },
      { type: "h3", text: "What If the EWB Expires Before Delivery?" },
      { type: "p", text: "If goods are in transit when the e-way bill expires (due to delays \u2014 floods, accidents, breakdowns, etc.), you can <strong>extend the validity</strong> on the e-way bill portal. Extension requests can be submitted from 8 hours before expiry to 8 hours after expiry. Beyond that window, the bill cannot be extended." },
      { type: "h2", text: "Updating Vehicle Number Mid-Transit (Part B Update)" },
      { type: "p", text: "If goods are transhipped to a different vehicle mid-way (e.g., goods moved from truck to container), the <strong>vehicle number must be updated</strong> on the e-way bill portal before the second vehicle begins moving. This is called Part B updating and is done by the transporter or the consignor." },
      { type: "h2", text: "Blocking of E-Way Bill Generation" },
      { type: "p", text: "The GST portal automatically blocks e-way bill generation for taxpayers who:" },
      { type: "ul", items: [
        "Have <strong>not filed GSTR-3B</strong> for 2 or more consecutive tax periods",
        "Have GST registration suspended or cancelled"
      ] },
      { type: "p", text: "This is a powerful compliance lever \u2014 it ties e-way bill access directly to return filing compliance. Businesses with pending GSTR-3B filings cannot generate EWBs, effectively stopping their goods movement." },
      { type: "p", text: "<strong>Fix:</strong> File all pending GSTR-3B returns. The block is lifted automatically within 24 hours of the portal processing the filings." },
      { type: "p", text: 'For more on GSTR-3B filing, see our <a href="/blog/how-to-file-gstr-3b">How to File GSTR-3B guide</a>.' },
      { type: "h2", text: "Penalties for E-Way Bill Violations" },
      { type: "p", text: "The consequences of moving goods without a valid e-way bill are severe:" },
      { type: "h3", text: "Penalty under Section 129" },
      { type: "p", text: "Goods transported without a valid EWB are liable for <strong>detention</strong>. Penalty:" },
      { type: "table", headers: ["Goods Type", "Penalty"], rows: [
        ["Taxable goods", "200% of tax applicable on goods (tax \xD7 2), minimum \u20B910,000"],
        ["Exempt goods", "2% of goods value or \u20B925,000 \u2014 whichever is less"]
      ] },
      { type: "p", text: "<strong>Additionally:</strong> The vehicle can be seized until penalty is paid." },
      { type: "h3", text: "Penalty under Section 122" },
      { type: "p", text: "Transporting goods without documents (including EWB) constitutes a tax offence under Section 122 \u2014 penalty up to \u20B910,000 or 100% of tax, whichever is higher." },
      { type: "h3", text: "Practical Consequences" },
      { type: "ul", items: [
        "Goods detained at check post = supply chain disruption",
        "Customer receives goods late or not at all",
        "ITC dispute if buyer questions why goods arrived without proper documentation",
        "Repeat violations can trigger GST audit"
      ] },
      { type: "h2", text: "E-Way Bill for Specific Scenarios" },
      { type: "h3", text: "Job Work" },
      { type: "p", text: "When goods are sent to a job worker (e.g., for processing, manufacturing), an e-way bill is required even though it's not a supply. Use <strong>Delivery Challan</strong> as the document type (not invoice). The challan value determines the \u20B950,000 threshold." },
      { type: "h3", text: "Branch Transfers" },
      { type: "p", text: "Moving goods from your warehouse to a branch in another state requires an EWB. Even though it's not a sale, it's a taxable supply (branch to branch transfer is treated as a supply between two different GSTINs). Verify GST on the transfer and generate EWB accordingly." },
      { type: "h3", text: "Exports" },
      { type: "p", text: "Export consignments require an EWB from the supplier's location to the port. The EWB is linked to the shipping bill at the port." },
      { type: "h3", text: "Return of Goods" },
      { type: "p", text: "If a customer returns goods, the buyer generates an EWB for the return movement \u2014 treating themselves as the supplier for that leg." },
      { type: "h2", text: "E-Way Bill and the 2025 IRP Integration" },
      { type: "p", text: "From April 2025, e-way bill portal is more tightly integrated with the IRP:" },
      { type: "ul", items: [
        "For businesses generating e-invoices (\u20B95 Crore+ AATO), the EWB Part A is <strong>auto-populated from the IRN</strong> \u2014 no separate data entry",
        "For certain goods categories, generating the e-way bill is only possible through the IRP (not the standalone EWB portal)",
        "This integration will expand to more categories progressively"
      ] },
      { type: "p", text: 'Read more about e-invoicing requirements in our <a href="/blog/e-invoicing-gst-india-2025">E-Invoicing Under GST guide</a>.' },
      { type: "h2", text: "Key Tips for Smooth E-Way Bill Compliance" },
      { type: "steps", items: [
        "<strong>Generate EWB before the vehicle starts moving</strong> \u2014 not after the driver calls from the check post",
        "<strong>Always file GSTR-3B on time</strong> \u2014 two missed filings block your EWB access",
        "<strong>Update Part B before transhipment</strong> \u2014 each vehicle carrying your goods must be registered on the EWB",
        "<strong>Check EWB expiry date</strong> \u2014 especially for long-distance consignments, confirm delivery time vs validity period before dispatch",
        "<strong>For e-invoice users</strong> \u2014 let your billing software auto-generate EWB Part A from the IRN to avoid double-entry errors",
        "<strong>Keep EWBs accessible offline</strong> \u2014 drivers should have a printed copy, not just a screenshot, in case of network issues at check posts"
      ] },
      { type: "highlight", html: 'Verify the correct HSN code and GST rate for your goods before generating the EWB using <a href="https://gstcalculator.me">gstcalculator.me</a> \u2014 the HSN and tax value entered in the EWB must match your invoice exactly.' },
      { type: "h2", text: "External References" },
      { type: "divider" },
      { type: "sourceLink", href: "https://ewaybillgst.gov.in", label: "ewaybillgst.gov.in \u2014 official EWB generation portal" },
      { type: "sourceLink", href: "https://www.cbic.gov.in", label: "CBIC E-Way Bill rules \u2014 Rule 138 of CGST Rules" },
      { type: "sourceLink", href: "https://www.gstn.org.in", label: "GSTN Advisory on EWB Blocking \u2014 compliance integration notice" },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "The e-way bill system is a non-negotiable part of goods movement under GST. The key rules to internalise:" },
      { type: "ul", items: [
        "\u20B950,000+ consignment value = EWB required for interstate movement",
        "Generate before dispatch \u2014 there's no retroactive EWB",
        "Validity is distance-based, not time-based from delivery",
        "Two missed GSTR-3B filings = EWB generation blocked",
        "Penalty for missing EWB = 200% of applicable tax (minimum \u20B910,000)",
        "E-invoice users get Part A auto-populated \u2014 no excuse for missing EWBs"
      ] },
      { type: "p", text: 'Related: <a href="/blog/e-invoicing-gst-india-2025">E-Invoicing Under GST India 2025</a> \xB7 <a href="/blog/how-to-file-gstr-3b">How to File GSTR-3B</a> \xB7 <a href="/blog/gst-invoice-format-india">GST Invoice Format India</a> \xB7 <a href="/blog/gst-late-fee-penalty-guide">GST Late Fee &amp; Penalty Guide</a>' },
      { type: "cta", title: "Confirm tax value before every EWB", text: "Use the calculator to lock the right CGST/SGST/IGST split before you fill Part A." }
    ]
  },
  {
    slug: "gstin-format-verification-guide",
    title: "GSTIN: Format, How to Verify Any GST Number Online & Decode What It Means (2025)",
    description: "Complete guide to GSTIN \u2014 what the 15-digit format means digit by digit, how to verify any GST number on the official portal, how to spot fake GSTINs, and why verification matters for ITC.",
    category: "GST Basics",
    readTime: "9 min",
    date: "2025-10-05",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=75&auto=format&fit=crop", alt: "Magnifying glass examining business documents for verification" },
      { type: "lead", text: "Every GST-registered business in India has a GSTIN \u2014 a 15-digit alphanumeric code that serves as the unique identifier for all their GST transactions. It appears on every invoice, every GST return, and every ITC claim." },
      { type: "p", text: "But here's what surprises many businesses: <strong>you should never trust a GSTIN you haven't verified.</strong> Fake GSTINs are used to generate fraudulent invoices for bogus ITC claims. If you buy from a supplier with a fake or cancelled GSTIN and claim ITC on that invoice, the ITC will be disallowed and you'll face a demand notice \u2014 even though you were the victim." },
      { type: "p", text: "This guide explains what GSTIN is, how to read its 15-digit structure, and how to verify any GSTIN in 30 seconds using the official government portal." },
      { type: "h2", text: "What Is GSTIN?" },
      { type: "p", text: "<strong>GSTIN</strong> stands for <strong>Goods and Services Tax Identification Number</strong>. It is a unique 15-digit alphanumeric code assigned to every person or entity that registers under the GST Act." },
      { type: "p", text: "GSTIN is:" },
      { type: "ul", items: [
        "<strong>Mandatory on all tax invoices</strong> \u2014 your GSTIN and the buyer's GSTIN must appear on every B2B invoice",
        "<strong>Required for filing GST returns</strong> \u2014 GSTR-1, GSTR-3B, and all other returns are filed under your GSTIN",
        "<strong>Linked to your PAN</strong> \u2014 the structure of GSTIN is derived from your PAN",
        "<strong>State-specific</strong> \u2014 if you operate in multiple states, you get a separate GSTIN for each state",
        "<strong>Public information</strong> \u2014 any person can look up any GSTIN on the government portal"
      ] },
      { type: "highlight", html: '<strong>Quick verification:</strong> Use <a href="https://gstcalculator.me">gstcalculator.me</a> for GST calculations, and the <a href="https://www.gst.gov.in" target="_blank" rel="noopener noreferrer">official GST portal</a> to verify any GSTIN instantly.' },
      { type: "h2", text: "Decoding the GSTIN Format: What Each Digit Means" },
      { type: "p", text: "A GSTIN looks like this: <strong>27AABCU9603R1ZX</strong>" },
      { type: "p", text: "Let's decode it position by position:" },
      { type: "table", headers: ["Position", "Digits", "Meaning", "Example"], rows: [
        ["1\u20132", "Digits 1-2", "<strong>State Code</strong> (2-digit Indian state/UT code)", "<code>27</code> = Maharashtra"],
        ["3\u201312", "Digits 3-12", "<strong>PAN of the taxpayer</strong> (10 characters, alpha-numeric)", "<code>AABCU9603R</code>"],
        ["13", "Digit 13", "<strong>Entity number</strong> \u2014 serial number of GST registrations under the same PAN in the same state", "<code>1</code> (first registration)"],
        ["14", "Digit 14", "<strong>'Z' by default</strong> \u2014 always the letter Z", "<code>Z</code>"],
        ["15", "Digit 15", "<strong>Check code</strong> \u2014 alpha or numeric, used for error detection", "<code>X</code>"]
      ] },
      { type: "h3", text: "State Codes Reference" },
      { type: "table", headers: ["Code", "State", "Code", "State"], rows: [
        ["01", "Jammu &amp; Kashmir", "18", "Assam"],
        ["02", "Himachal Pradesh", "19", "West Bengal"],
        ["03", "Punjab", "20", "Jharkhand"],
        ["04", "Chandigarh", "21", "Odisha"],
        ["06", "Haryana", "22", "Chhattisgarh"],
        ["07", "Delhi", "23", "Madhya Pradesh"],
        ["08", "Rajasthan", "24", "Gujarat"],
        ["09", "Uttar Pradesh", "27", "Maharashtra"],
        ["10", "Bihar", "29", "Karnataka"],
        ["11", "Sikkim", "32", "Kerala"],
        ["12", "Arunachal Pradesh", "33", "Tamil Nadu"],
        ["13", "Nagaland", "36", "Telangana"],
        ["14", "Manipur", "37", "Andhra Pradesh"],
        ["15", "Mizoram", "96", "Foreign country (for OIDAR)"],
        ["16", "Tripura", "97", "Other Territory"],
        ["17", "Meghalaya", "", ""]
      ] },
      { type: "p", text: "<strong>What the state code tells you:</strong> The first 2 digits of any GSTIN reveal the state where the supplier is registered. If a Maharashtra-based supplier gives you a GSTIN starting with <code>29</code> (Karnataka), something is wrong. Cross-check the state code against the billing address." },
      { type: "h3", text: "Reading the PAN in GSTIN" },
      { type: "p", text: "Digits 3\u201312 of the GSTIN are exactly the taxpayer's PAN. This means:" },
      { type: "ul", items: [
        "You can cross-verify the PAN against the GSTIN",
        "If a supplier's PAN doesn't match digits 3-12 of their GSTIN, the GSTIN is fake",
        "The 4th character of PAN reveals the entity type: <code>P</code> = Individual, <code>C</code> = Company, <code>H</code> = HUF, <code>F</code> = Firm, <code>T</code> = Trust, <code>B</code> = Body of Individuals"
      ] },
      { type: "p", text: "<strong>Example:</strong> GSTIN <code>27AABCU9603R1ZX</code> \u2014 PAN is <code>AABCU9603R</code>, 4th character is <code>C</code> \u2192 this is a company registered in Maharashtra." },
      { type: "h2", text: "How to Verify a GSTIN Online: Official Methods" },
      { type: "h3", text: "Method 1 \u2014 GST Portal (gst.gov.in) \u2014 Most Reliable" },
      { type: "steps", items: [
        'Go to <a href="https://www.gst.gov.in" target="_blank" rel="noopener noreferrer">gst.gov.in</a>',
        "Click <strong>Search Taxpayer</strong> in the top menu",
        "Select <strong>Search by GSTIN/UIN</strong>",
        "Enter the 15-digit GSTIN and complete the CAPTCHA",
        "Click <strong>Search</strong>"
      ] },
      { type: "p", text: "The portal displays:" },
      { type: "ul", items: [
        "Legal name of the business",
        "Trade name (if different)",
        "Registration type (Regular / Composition / IGST / TDS / TCS)",
        "<strong>Registration status</strong> (Active / Cancelled / Suspended)",
        "Date of registration",
        "State and jurisdiction",
        "Principal place of business",
        "Business constitution (proprietor, company, LLP, etc.)"
      ] },
      { type: "p", text: "<strong>This is the only 100% authoritative source.</strong> All other tools (ClearTax, Razorpay, etc.) fetch data from the same GSTN database \u2014 but the portal is the original source." },
      { type: "h3", text: "Method 2 \u2014 Search by PAN" },
      { type: "p", text: "If you have the taxpayer's PAN but not their GSTIN:" },
      { type: "steps", items: [
        "Go to gst.gov.in \u2192 Search Taxpayer \u2192 <strong>Search by PAN</strong>",
        "Enter the PAN",
        "All GSTINs registered under that PAN (across all states) are listed"
      ] },
      { type: "p", text: "This is useful for verifying whether a supplier has active registrations in the states where they claim to operate." },
      { type: "h3", text: "Method 3 \u2014 Search by Name" },
      { type: "steps", items: [
        "Go to gst.gov.in \u2192 Search Taxpayer \u2192 <strong>Search by Legal Name / Trade Name</strong>",
        "Enter the business name",
        "The portal returns all matching registrations"
      ] },
      { type: "p", text: "Useful when you have the business name but not the GSTIN." },
      { type: "image", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=75&auto=format&fit=crop", alt: "Person using laptop to verify business GSTIN on GST portal" },
      { type: "h2", text: "What to Check When You Verify a GSTIN" },
      { type: "p", text: "Don't just check if the GSTIN exists \u2014 check all of this:" },
      { type: "table", headers: ["What to Check", "Why It Matters"], rows: [
        ["<strong>Status: Active?</strong>", "A cancelled or suspended GSTIN cannot issue valid tax invoices"],
        ["<strong>State matches billing address?</strong>", "State code (digits 1-2) must match where goods/services are supplied from"],
        ["<strong>Business name matches invoice?</strong>", "The legal name on the portal must match the invoice"],
        ["<strong>Registration type</strong>", 'If listed as "Composition Dealer", they cannot charge GST on invoices \u2014 any GST charged is illegal'],
        ["<strong>Date of registration</strong>", "Invoice date must be after the registration date"]
      ] },
      { type: "h3", text: "The Composition Dealer Trap" },
      { type: "p", text: "This is one of the most common fraudulent invoicing patterns:" },
      { type: "ul", items: [
        "A <strong>Composition scheme taxpayer</strong> cannot charge GST on their outward supplies",
        "If a composition dealer issues you a GST invoice charging 18% CGST + SGST, they are doing so illegally",
        "You cannot claim ITC on such an invoice \u2014 the GST Council has clarified this explicitly",
        "Always check the registration type on the portal before accepting invoices from small suppliers"
      ] },
      { type: "h2", text: "Spotting a Fake GSTIN Before You Even Verify" },
      { type: "p", text: "A quick structural check can flag obvious fakes:" },
      { type: "steps", items: [
        "<strong>Count the characters</strong> \u2014 Must be exactly 15. 14 or 16 characters = fake",
        "<strong>Check digit 1-2</strong> \u2014 Must be a valid state code (01\u201337, 96, 97, 99). If it's <code>00</code>, <code>50</code>, <code>60</code>, <code>70</code>, <code>80</code>, <code>90</code> = fake",
        "<strong>Check digit 14</strong> \u2014 Must always be the letter <code>Z</code>. Any other character = fake",
        "<strong>Check digits 3-12 match a valid PAN format</strong> \u2014 PAN format is: 5 letters, 4 digits, 1 letter (e.g., AABCU9603R). If digits 3-12 don't follow this pattern = fake"
      ] },
      { type: "p", text: "<strong>Example of an obviously fake GSTIN:</strong> <code>99ABCDE12341ZX</code> \u2014 state code 99 doesn't exist, and PAN format <code>ABCDE1234</code> is wrong (should be 5 letters, 4 digits, 1 letter)." },
      { type: "h2", text: "Why GSTIN Verification Matters for ITC Claims" },
      { type: "p", text: "This is the practical reason verification is non-negotiable:" },
      { type: "p", text: "If you accept an invoice from a supplier with a <strong>cancelled or fake GSTIN</strong> and claim ITC on it:" },
      { type: "steps", items: [
        "The GSTIN won't appear in your <strong>GSTR-2B</strong> (because the supplier can't file returns with an invalid GSTIN)",
        "The department will notice the mismatch between your ITC claim and your GSTR-2B",
        "You'll receive a <strong>GST notice</strong> demanding reversal of ITC plus 24% p.a. interest",
        "You may also face a Section 122 penalty"
      ] },
      { type: "p", text: "<strong>The loss is yours even though the fraud was the supplier's.</strong> This is why verification before transactions \u2014 not after \u2014 is the only safe approach." },
      { type: "highlight", html: "<strong>Pro Tip:</strong> For high-value B2B suppliers, add GSTIN verification as a mandatory step in your vendor onboarding checklist. Reverify quarterly \u2014 suppliers can have their GSTIN suspended or cancelled at any time." },
      { type: "h2", text: "Multiple GSTINs Under One PAN" },
      { type: "p", text: "A business operating in multiple states must register separately in each state \u2014 meaning multiple GSTINs under the same PAN." },
      { type: "p", text: "<strong>Example:</strong> A company with operations in Delhi, Maharashtra, and Karnataka will have 3 GSTINs:" },
      { type: "ul", items: [
        "<code>07</code> + PAN + entity code (Delhi)",
        "<code>27</code> + PAN + entity code (Maharashtra)",
        "<code>29</code> + PAN + entity code (Karnataka)"
      ] },
      { type: "p", text: 'When verifying such a supplier, use "Search by PAN" to see all active registrations. If they invoice you from a Maharashtra address but you can only find a Delhi GSTIN, they may not have Maharashtra registration \u2014 creating ITC risk for you.' },
      { type: "h2", text: "GSTIN for Special Cases" },
      { type: "h3", text: "Unregistered Persons (URD)" },
      { type: "p", text: 'If your supplier is unregistered (below GST threshold), no GSTIN exists. You handle the GST under <strong>Reverse Charge Mechanism (RCM)</strong> in some cases. See our <a href="/blog/reverse-charge-mechanism-gst">Reverse Charge Mechanism guide</a> for details.' },
      { type: "h3", text: "Government Departments (GD) and PSUs" },
      { type: "p", text: "Government bodies have <strong>UIN (Unique Identification Number)</strong> instead of GSTIN. Format is similar (15 characters) but starts with the state code and has <code>D</code> for government department." },
      { type: "h3", text: "Non-Resident Taxable Persons" },
      { type: "p", text: "NRTPs operating in India temporarily have GSTINs starting with <code>99</code> (special code for non-residents)." },
      { type: "h2", text: "Using GSTIN in GSTR-1 Filing" },
      { type: "p", text: "When filing GSTR-1, you must enter the buyer's GSTIN for every B2B invoice in Table 4. An incorrect GSTIN in GSTR-1 means:" },
      { type: "ul", items: [
        "The invoice doesn't appear in the buyer's GSTR-2B",
        "The buyer cannot claim ITC",
        "The buyer will chase you for a correction",
        "You'll need to amend in the next period's GSTR-1"
      ] },
      { type: "p", text: "<strong>Always verify the GSTIN before entering it in GSTR-1.</strong> A single digit error causes significant downstream compliance problems." },
      { type: "p", text: 'For the complete GSTR-1 filing walkthrough, see our <a href="/blog/how-to-file-gstr-1">How to File GSTR-1 guide</a>.' },
      { type: "highlight", html: `<strong>Calculate GST first, then verify GSTIN:</strong> Use <a href="https://gstcalculator.me">gstcalculator.me</a> to compute the correct tax amounts for your invoice, then verify your buyer's GSTIN on the official portal before issuing.` },
      { type: "h2", text: "External References" },
      { type: "divider" },
      { type: "sourceLink", href: "https://www.gst.gov.in", label: "gst.gov.in Search Taxpayer \u2014 official GSTIN verification" },
      { type: "sourceLink", href: "https://www.cbic.gov.in", label: "CBIC GSTIN format rules \u2014 official format specification" },
      { type: "sourceLink", href: "https://www.gstn.org.in", label: "GSTN database \u2014 the underlying data source for all GSTIN lookups" },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "GSTIN verification is a 30-second task that can save you from significant ITC losses and compliance notices. Your checklist for every new supplier:" },
      { type: "checklist", items: [
        { mark: "\u2705", html: "Verify GSTIN is Active on gst.gov.in" },
        { mark: "\u2705", html: "Check state code matches supplier's location" },
        { mark: "\u2705", html: "Confirm legal name matches the invoice" },
        { mark: "\u2705", html: "Check registration type \u2014 reject invoices from Composition dealers charging GST" },
        { mark: "\u2705", html: "Verify registration date is before the invoice date" },
        { mark: "\u2705", html: "For multi-state suppliers, search by PAN to see all active registrations" }
      ] },
      { type: "p", text: "Build this into your procurement and accounts payable workflow. A fake or cancelled GSTIN discovered after 6 months of invoices means 6 months of ITC to reverse \u2014 plus interest." },
      { type: "p", text: 'Related: <a href="/blog/input-tax-credit-gst">Input Tax Credit Under GST</a> \xB7 <a href="/blog/gst-invoice-format-india">GST Invoice Format India</a> \xB7 <a href="/blog/gst-registration-process-india">GST Registration Process India</a> \xB7 <a href="/blog/reverse-charge-mechanism-gst">Reverse Charge Mechanism GST</a>' },
      { type: "cta", title: "Verify the GSTIN, then verify the GST", text: "After you confirm the supplier on gst.gov.in, use the calculator to double-check the tax on each invoice." }
    ]
  },
  {
    slug: "gst-on-gold-jewellery-india-2025",
    title: "GST on Gold & Jewellery India 2025: Rates, HSN Codes, Making Charges & ITC Rules",
    description: "Complete guide to GST on gold in India \u2014 3% on gold value, 5% on making charges, HSN codes for jewellery and bars, ITC rules for jewellers, import duty, digital gold, and the second-hand gold margin scheme.",
    category: "Sector-Specific GST",
    readTime: "11 min",
    date: "2025-11-01",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=75&auto=format&fit=crop", alt: "Gold jewellery displayed in a jewellery store in India" },
      { type: "lead", text: "India holds an estimated 25,000 tonnes of gold \u2014 roughly 11% of the world's total above-ground gold stock. For a country where gold is a cultural staple, a savings instrument, and a generational heirloom, understanding exactly how GST applies to gold purchases is essential." },
      { type: "p", text: "The good news: even after the sweeping GST 2.0 reforms of September 2025, <strong>gold's GST rate is unchanged</strong>. The GST Council deliberately kept gold's unique 3% slab intact, recognising its cultural and financial significance to millions of households and small jewellers." },
      { type: "p", text: "But while the headline rate is simple \u2014 3% on gold, 5% on making charges \u2014 the full picture for buyers, investors, and jewellers is more nuanced. This guide covers everything." },
      { type: "highlight", html: "<strong>\u26A1 Post GST 2.0 Confirmation:</strong> Gold jewellery is kept at 3% for gold and 5% for making charges, although overall GST was reduced from four slabs to just two. Gold and silver ornaments were exempted from all these changes and maintained the consumer tax rates intact." },
      { type: "h2", text: "GST on Gold: The Two-Part Rate Structure" },
      { type: "p", text: "Every gold jewellery purchase in India has two separate GST components:" },
      { type: "table", headers: ["Component", "GST Rate", "Applied On"], rows: [
        ["Gold metal value", "<strong>3%</strong>", "Value of gold content only"],
        ["Making charges", "<strong>5%</strong>", "Labour/craftsmanship charges"]
      ] },
      { type: "p", text: "This two-part structure applies regardless of:" },
      { type: "ul", items: [
        "Carat purity (18K, 22K, 24K \u2014 same rate)",
        "Form (jewellery, coins, bars, ornaments)",
        "Buyer type (individual, business)"
      ] },
      { type: "highlight", html: "<strong>Important:</strong> Currently, gold attracts a 3% GST rate split equally as 1.5% CGST and 1.5% SGST. Making charges on gold jewellery are taxed separately at 5%." },
      { type: "h2", text: "GST Rates Across All Gold Product Types" },
      { type: "table", headers: ["Product", "HSN Code", "GST Rate"], rows: [
        ["Raw gold (unwrought \u2014 bars, ingots)", "7108 12 00", "3%"],
        ["Gold powder", "7108 11 00", "3%"],
        ["Semi-manufactured gold", "7108 13 00", "3%"],
        ["Gold jewellery (all types)", "7113", "3% + 5% on making charges"],
        ["Gold coins (investment grade)", "7108", "3%"],
        ["Gold medallions", "7113", "3%"],
        ["Gold-plated base metal", "7109 00 00", "3%"],
        ["Digital gold (purchase value + storage + trustee fee)", "\u2014", "3%"],
        ["Second-hand gold (margin scheme, see below)", "7113", "3% on margin only"],
        ["Cut and polished diamonds", "7102", "<strong>0.25%</strong> (separate, unchanged)"]
      ] },
      { type: "h2", text: "How to Calculate GST on a Gold Jewellery Purchase" },
      { type: "h3", text: "Method 1 \u2014 Separate Invoice (Recommended by CBIC)" },
      { type: "p", text: "Most transparent method: gold value and making charges are invoiced separately." },
      { type: "p", text: "<strong>Example:</strong>" },
      { type: "ul", items: [
        "Gold chain \u2014 gold value: \u20B91,00,000",
        "Making charges: \u20B910,000"
      ] },
      { type: "table", headers: ["Component", "Amount", "GST Rate", "GST Amount"], rows: [
        ["Gold value", "\u20B91,00,000", "3%", "\u20B93,000"],
        ["Making charges", "\u20B910,000", "5%", "\u20B9500"],
        ["<strong>Total</strong>", "\u20B91,10,000", "\u2014", "<strong>\u20B93,500</strong>"],
        ["<strong>Final price</strong>", "", "", "<strong>\u20B91,13,500</strong>"]
      ] },
      { type: "highlight", html: 'Use <a href="https://gstcalculator.me">gstcalculator.me</a> to instantly verify the GST on any gold purchase \u2014 enter the gold value at 3% and making charges at 5% separately for a precise breakdown.' },
      { type: "h3", text: "Method 2 \u2014 Composite Invoice (Single Amount)" },
      { type: "p", text: "Sometimes, jewellers issue a single invoice without separating gold and making charges. In that case, the entire transaction is treated as a composite supply, and 3% GST is applied on the total value." },
      { type: "p", text: "<strong>Example:</strong>" },
      { type: "ul", items: [
        "Total invoice: \u20B91,10,000 (gold + making combined)",
        "GST: 3% \xD7 \u20B91,10,000 = \u20B93,300",
        "Final price: \u20B91,13,300"
      ] },
      { type: "p", text: "Both methods are legal, but <strong>Method 1 is recommended</strong> \u2014 it shows you exactly what you're paying for each component." },
      { type: "h2", text: "GST on Different Forms of Gold Investment" },
      { type: "image", src: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&q=75&auto=format&fit=crop", alt: "Gold bars and coins representing different forms of gold investment" },
      { type: "table", headers: ["Investment Type", "GST Applicable?", "Rate", "Notes"], rows: [
        ["Physical gold (bars, coins)", "Yes", "3%", "No making charges"],
        ["Physical jewellery", "Yes", "3% + 5% making", "Calculated as above"],
        ["Digital gold (fintech apps)", "Yes", "3%", "Digital gold attracts 3% GST, while Gold ETFs, Sovereign Gold Bonds, and gold mutual funds are not taxed on the gold itself, only on related service fees at 18%."],
        ["Gold ETFs", "No (on gold)", "18% on fund management fees", "No GST on the gold value itself"],
        ["Sovereign Gold Bonds (SGBs)", "No", "\u2014", "Completely exempt"],
        ["Gold Mutual Funds", "No (on gold)", "18% on management fees", ""],
        ["Hallmarking fee", "Yes", "18%", "The small hallmarking fee, usually between Rs. 200 and Rs. 500, is treated as a service and attracts 18% GST."]
      ] },
      { type: "h2", text: "GST on Gold Imports" },
      { type: "p", text: "Importing gold into India involves multiple layers of tax:" },
      { type: "table", headers: ["Duty/Tax", "Rate", "Notes"], rows: [
        ["Basic Customs Duty (BCD)", "5%", "Reduced from 12.5% in Budget 2024-25"],
        ["Agriculture Infrastructure Development Cess (AIDC)", "1%", "Applied on assessable value"],
        ["IGST (on gold import)", "3%", "Applied on value + BCD + AIDC"],
        ["<strong>Total effective tax on import</strong>", "<strong>~9%</strong>", "Down from ~15% previously"]
      ] },
      { type: "highlight", html: "The government lowered the total import duty on gold from around 15% to 6%, which includes 5% Basic Customs Duty and 1% Agriculture Infrastructure and Development Cess. When we include GST on top of this, the total effective tax burden on imported gold now stands at about 9%, compared to nearly 18% in previous years." },
      { type: "p", text: "<strong>GST on gold exports:</strong> Gold supplied for export purposes is <strong>zero-rated</strong> \u2014 no GST, and exporters can claim ITC on inputs used." },
      { type: "h2", text: "ITC Rules for Jewellers and Gold Businesses" },
      { type: "h3", text: "What Jewellers CAN Claim as ITC" },
      { type: "p", text: "Jewellers and gold merchants are eligible to claim Input Tax Credit (ITC) on the GST paid for raw materials used in their business, such as gold, as well as for job work charges incurred. Additionally, if a gold merchant pays tax on a reverse charge basis for supplies received from an unregistered job worker, they can still claim ITC on the tax paid." },
      { type: "p", text: "Specifically, ITC is available on:" },
      { type: "ul", items: [
        "Raw gold purchases from registered suppliers",
        "Job work charges (from registered artisans)",
        "RCM GST paid on purchases from unregistered artisans (5% under RCM)",
        "Business inputs \u2014 packaging, machinery, store fixtures"
      ] },
      { type: "h3", text: "What Jewellers CANNOT Claim as ITC" },
      { type: "p", text: "ITC cannot be applied to the GST paid on the making charges associated with crafting gold jewellery." },
      { type: "p", text: "Additionally:" },
      { type: "ul", items: [
        "ITC is not allowed on gold coins given as promotional gifts or sales incentives.",
        "Buyers purchasing gold for <strong>personal use</strong> cannot claim ITC under any circumstances."
      ] },
      { type: "h3", text: "Special ITC for Exporters" },
      { type: "p", text: "Registered jewellers can claim a 2% ITC on the 5% GST charged on making charges for gold jewellery. However, this benefit applies only to exporters and not to domestic buyers." },
      { type: "h2", text: "GST on Second-Hand Gold: The Margin Scheme" },
      { type: "p", text: "This is the area most guides get wrong. When a jeweller buys old gold from an <strong>unregistered individual</strong> (e.g., a housewife selling her old necklace), special rules apply:" },
      { type: "h3", text: "The Margin Scheme (Rule 32(5) of CGST Rules)" },
      { type: "ul", items: [
        "GST is payable <strong>only on the profit margin</strong> \u2014 the difference between selling price and purchase price",
        "If selling price &lt; purchase price \u2192 <strong>no GST</strong>",
        "ITC <strong>cannot</strong> be claimed under the margin scheme"
      ] },
      { type: "example", title: "Example", lines: [
        "Jeweller buys old gold necklace from unregistered individual for \u20B950,000",
        "Jeweller sells it (as-is) to another customer for \u20B958,000",
        "Margin = \u20B958,000 \u2212 \u20B950,000 = \u20B98,000",
        "GST = 3% \xD7 \u20B98,000 = <strong>\u20B9240</strong> (not 3% of \u20B958,000 = \u20B91,740)"
      ] },
      { type: "h3", text: "Gold Exchange (Old for New)" },
      { type: "p", text: "No, GST is not applicable when you exchange old gold jewelry for new ones. Such transactions are considered as a supply of goods and are not subject to GST on the old gold value. The buyer pays GST only on the new jewellery's value (net of the exchange credit)." },
      { type: "h2", text: "E-Way Bill for Gold Transport" },
      { type: "p", text: "For gold movements worth Rs. 2 lakh or more within a state, an e-way bill is required. For interstate movement, the regular \u20B950,000 threshold applies \u2014 but since gold is high-value, most movements will trigger the requirement." },
      { type: "p", text: 'Previously, gold was exempt from e-way bill requirements. This exemption was removed in September 2022, and all gold transporters must now comply. See our <a href="/blog/e-way-bill-gst-india-2025">E-Way Bill Guide</a> for generation steps.' },
      { type: "h2", text: "GST Compliance for Jewellers: Checklist" },
      { type: "p", text: "Running a jewellery business? Your GST obligations:" },
      { type: "checklist", items: [
        { mark: "\u2705", html: "<strong>Register for GST</strong> if turnover &gt; \u20B940 lakh (goods threshold)" },
        { mark: "\u2705", html: "<strong>Issue detailed invoices</strong> showing gold value and making charges separately" },
        { mark: "\u2705", html: "<strong>Collect and remit 3% GST</strong> on gold value, 5% on making charges" },
        { mark: "\u2705", html: "<strong>Pay RCM</strong> at 5% on making charges from unregistered artisans" },
        { mark: "\u2705", html: "<strong>File GSTR-1</strong> by 11th (monthly) or 13th (quarterly) \u2014 report all gold sales" },
        { mark: "\u2705", html: "<strong>File GSTR-3B</strong> and pay net GST after ITC offset" },
        { mark: "\u2705", html: "<strong>Generate e-way bill</strong> for gold shipments above \u20B92 lakh (intrastate) or \u20B950,000 (interstate)" },
        { mark: "\u2705", html: "<strong>Comply with BIS hallmarking</strong> norms (mandatory for 14K, 18K, 22K gold jewellery)" }
      ] },
      { type: "h2", text: "Frequently Asked Questions" },
      { type: "h3", text: "Q: Does GST rate differ for 18K, 22K, and 24K gold?" },
      { type: "p", text: "No, the GST rate remains the same at 3% for all purities of gold, including 18K, 22K, and 24K." },
      { type: "h3", text: "Q: Is GST applicable when I sell my old gold?" },
      { type: "p", text: "If you're an unregistered individual, no GST is payable on your sale. GST applies only when a registered dealer sells." },
      { type: "h3", text: "Q: Is there GST on gold during festivals like Dhanteras?" },
      { type: "p", text: "Yes \u2014 GST applies uniformly regardless of when you buy. There are no festival exemptions." },
      { type: "h3", text: "Q: Can I claim GST on gold purchased as a business asset?" },
      { type: "p", text: "Yes, if you're a registered business purchasing gold for business purposes (e.g., as collateral, for awards), you can claim ITC on the 3% GST paid." },
      { type: "h3", text: "Q: What is the customs duty on gold jewellery import from foreign countries?" },
      { type: "p", text: "In the Union Budget 2025, the customs tariff on jewelry and parts thereof (HSN code 7113) was reduced from 25% to 20%, effective from February 2, 2025." },
      { type: "h2", text: "External References" },
      { type: "divider" },
      { type: "sourceLink", href: "https://www.cbic.gov.in", label: "CBIC GST Rate Notification on Gold \u2014 official rate classification" },
      { type: "sourceLink", href: "https://bis.gov.in", label: "Bureau of Indian Standards \u2014 Gold Hallmarking \u2014 mandatory hallmarking rules" },
      { type: "sourceLink", href: "https://www.gold.org/goldhub/research/gold-demand-trends", label: "World Gold Council India \u2014 India gold demand data" },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "For buyers, the GST math on gold is straightforward:" },
      { type: "ul", items: [
        "<strong>3% on the gold value</strong> (verify this is applied correctly on your invoice)",
        "<strong>5% on making charges</strong> (ask for a separate line item)",
        "<strong>No GST on old gold exchange</strong> \u2014 the exchange value is deducted before GST applies"
      ] },
      { type: "p", text: 'Always insist on a detailed invoice from your jeweller showing both components separately. Use <a href="https://gstcalculator.me">gstcalculator.me</a> to verify the GST breakdown before making any significant gold purchase.' },
      { type: "p", text: "For jewellers, the ITC chain \u2014 from raw gold purchases to job work to retail sale \u2014 is where tax efficiency lies. Maintain proper records of all RCM payments and ensure you're filing GSTR-1 and GSTR-3B accurately every period." },
      { type: "p", text: 'Related: <a href="/blog/new-gst-rate-slab-list-2025-26">New GST Rate Slab List 2025\u201326</a> \xB7 <a href="/blog/hsn-code-list-india-2025">HSN Code List India 2025</a> \xB7 <a href="/blog/e-way-bill-gst-india-2025">E-Way Bill GST India 2025</a> \xB7 <a href="/blog/input-tax-credit-gst">Input Tax Credit Under GST</a>' },
      { type: "cta", title: "Verify the GST split on your gold invoice", text: "Enter the gold value at 3% and making charges at 5% \u2014 get the exact CGST/SGST breakdown instantly." }
    ]
  },
  {
    slug: "gst-on-health-insurance-india-2025",
    title: "GST on Health Insurance India 2025: Zero Tax on Individual Policies \u2014 Complete Guide",
    description: "GST on individual health and life insurance premiums reduced to 0% from September 22, 2025. What's exempt, what isn't, how group insurance is affected, savings calculation, and what existing policyholders must do.",
    category: "Sector-Specific GST",
    readTime: "10 min",
    date: "2025-11-02",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=75&auto=format&fit=crop", alt: "Doctor and patient consultation representing health insurance concept" },
      { type: "lead", text: "In a landmark move that directly benefits hundreds of millions of Indians, the GST on individual health and life insurance premiums was reduced to zero \u2014 effective September 22, 2025." },
      { type: "p", text: "For years, an 18% GST on insurance premiums had been a point of public frustration. A family paying \u20B935,000 per year for health insurance was effectively paying over \u20B95,300 in GST alone \u2014 on top of an already high premium driven by rising medical costs. That burden is now gone." },
      { type: "p", text: "This is one of the most consequential consumer benefits to emerge from the 56th GST Council meeting, and it affects anyone who pays for health or life insurance in India." },
      { type: "highlight", html: '<strong>Official Notification:</strong> The GST exemption for individual life and health insurance is vide Notification No. 16/2025 Central Tax (Rate) dated 17.09.2025, effective from 22.09.2025. Source: <a href="https://financialservices.gov.in/beta/en/exemption-on-gst" target="_blank" rel="noopener noreferrer">Department of Financial Services, Ministry of Finance</a>' },
      { type: "h2", text: "What Changed: The Before and After" },
      { type: "table", headers: ["Policy Type", "GST Before Sep 22, 2025", "GST From Sep 22, 2025"], rows: [
        ["Individual health insurance (all plans)", "18%", "<strong>0% (Nil)</strong>"],
        ["Family floater health insurance", "18%", "<strong>0% (Nil)</strong>"],
        ["Senior citizen health insurance", "18% (some 5%)", "<strong>0% (Nil)</strong>"],
        ["Individual term life insurance", "18%", "<strong>0% (Nil)</strong>"],
        ["ULIPs (Unit Linked Insurance Plans)", "18%", "<strong>0% (Nil)</strong>"],
        ["Endowment policies", "18%", "<strong>0% (Nil)</strong>"],
        ["Annuity / pension plans (individual)", "18%", "<strong>0% (Nil)</strong>"],
        ["Reinsurance of individual policies", "18%", "<strong>0% (Nil)</strong>"],
        ["<strong>Group health insurance (employer)</strong>", "18%", "<strong>18% (unchanged)</strong>"],
        ["<strong>Group term life insurance</strong>", "18%", "<strong>18% (unchanged)</strong>"],
        ["<strong>Group credit life policies</strong>", "18%", "<strong>18% (unchanged)</strong>"]
      ] },
      { type: "p", text: "The exemption is explicitly for all <strong>individual</strong> life and health insurance policies, where the insured is not a group. All individual health insurance policies (including family floater plans) are covered." },
      { type: "h2", text: "How Much Will You Save?" },
      { type: "p", text: "The savings are immediate and significant. Consider these examples:" },
      { type: "h3", text: "Example 1 \u2014 Individual Health Insurance (Family Floater)" },
      { type: "table", headers: ["", "Before Sep 22, 2025", "After Sep 22, 2025"], rows: [
        ["Base premium (family of 4)", "\u20B942,000", "\u20B942,000"],
        ["GST (18% / 0%)", "\u20B97,560", "<strong>\u20B90</strong>"],
        ["<strong>Total annual premium</strong>", "<strong>\u20B949,560</strong>", "<strong>\u20B942,000</strong>"],
        ["<strong>Annual saving</strong>", "\u2014", "<strong>\u20B97,560</strong>"]
      ] },
      { type: "h3", text: "Example 2 \u2014 Term Life Insurance" },
      { type: "table", headers: ["", "Before Sep 22, 2025", "After Sep 22, 2025"], rows: [
        ["Annual premium (\u20B91 Crore cover, 35-year-old male)", "\u20B912,000", "\u20B912,000"],
        ["GST (18% / 0%)", "\u20B92,160", "<strong>\u20B90</strong>"],
        ["<strong>Total annual premium</strong>", "<strong>\u20B914,160</strong>", "<strong>\u20B912,000</strong>"],
        ["<strong>Annual saving</strong>", "\u2014", "<strong>\u20B92,160</strong>"]
      ] },
      { type: "h3", text: "Example 3 \u2014 ULIP" },
      { type: "table", headers: ["", "Before Sep 22, 2025", "After Sep 22, 2025"], rows: [
        ["Monthly premium", "\u20B910,000", "\u20B910,000"],
        ["GST (18% / 0%)", "\u20B91,800", "<strong>\u20B90</strong>"],
        ["<strong>Annual saving</strong>", "\u2014", "<strong>\u20B921,600</strong>"],
        ["<strong>20-year saving (compound effect)</strong>", "\u2014", "<strong>\u20B91,15,941+</strong>"]
      ] },
      { type: "highlight", html: `Calculate the GST on any insurance-related fee (e.g., group policy, corporate rider) using <a href="https://gstcalculator.me">gstcalculator.me</a> to understand exactly what you're paying.` },
      { type: "h2", text: "What Policies Are Covered: Detailed Breakdown" },
      { type: "h3", text: "Individual Health Insurance (All Exempt)" },
      { type: "p", text: "The exemption covers all individual health insurance policies including:" },
      { type: "ul", items: [
        "Basic individual health plans",
        "Family floater plans (where one policy covers the entire family)",
        "Senior citizen health insurance",
        "Critical illness riders and standalone plans",
        "Personal accident cover sold as part of a health policy",
        "Top-up and super top-up individual plans"
      ] },
      { type: "highlight", html: "In case of individual health insurance policy with additional features like travel cover and personal accident cover sold as a single product, the entire product sold for a single price, would be exempted from the GST ambit." },
      { type: "h3", text: "Individual Life Insurance (All Exempt)" },
      { type: "p", text: "All individual life insurance policies are exempt, including:" },
      { type: "ul", items: [
        "Term insurance plans",
        "Endowment plans (traditional savings + insurance)",
        "Money-back policies",
        "ULIPs (Unit Linked Insurance Plans)",
        "Whole life plans",
        "Annuity and pension plans (individual)"
      ] },
      { type: "h3", text: "What's NOT Exempt" },
      { type: "table", headers: ["Policy Type", "GST Rate"], rows: [
        ["Group health insurance (employer-provided)", "18%"],
        ["Group term life insurance (corporate)", "18%"],
        ["Group credit life (loan-linked group policies)", "18%"],
        ["Corporate wellness programs", "5% (reduced from 18%)"],
        ["Health insurance consumables (strips, syringes)", "Applicable goods rate"]
      ] },
      { type: "h2", text: "How the Effective Date Works \u2014 Important for Policyholders" },
      { type: "p", text: "GST exemption is determined by when <strong>two out of three events</strong> occur:" },
      { type: "p", text: "The three events are: (a) supply of service, (b) issue of invoice, and (c) payment being received." },
      { type: "p", text: "When two out of three events fall on or after September 22, 2025, the new rate (0%) applies. If two events out of the three fall before September 22, 2025, the old 18% rate applies." },
      { type: "h3", text: "Practical scenarios:" },
      { type: "table", headers: ["Scenario", "GST Applicable?"], rows: [
        ["Policy renewed after September 22, 2025", "<strong>0% \u2014 fully exempt</strong>"],
        ["New policy purchased after September 22, 2025", "<strong>0% \u2014 fully exempt</strong>"],
        ["Premium due September 21, received September 22, 2025", "<strong>0% \u2014 exempt</strong> (payment is on/after Sep 22)"],
        ["Premium due September 21, received September 21, 2025", "<strong>18% \u2014 old rate applies</strong>"],
        ["Multi-year policy, instalment paid after September 22, 2025", "<strong>0% \u2014 each instalment assessed separately</strong>"],
        ["3-year advance premium paid before September 22, 2025", "<strong>18% \u2014 no refund</strong>"]
      ] },
      { type: "highlight", html: "GST rate will be applicable as on date of instalment premium payment. If instalment premium is paid before September 22, 2025, 18% GST rate will be applicable, and if instalment premium is paid on or after September 22, 2025, such premium collected will be exempt from GST." },
      { type: "h2", text: "What Existing Policyholders Must Do" },
      { type: "image", src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=75&auto=format&fit=crop", alt: "Person reviewing insurance policy documents on phone and laptop" },
      { type: "h3", text: "Step 1 \u2014 Check Your Next Renewal Date" },
      { type: "p", text: "Your premium will be GST-free from your next renewal after September 22, 2025. If your policy renews annually on October 1, your October 2025 premium will already be GST-free." },
      { type: "h3", text: "Step 2 \u2014 Demand Revised Quotes" },
      { type: "p", text: "Contact your insurer or broker and ask for a revised premium quote reflecting the GST exemption. Some insurers updated their systems immediately; others may take a few billing cycles." },
      { type: "h3", text: "Step 3 \u2014 Verify Your Invoice" },
      { type: "p", text: "When your renewal invoice arrives, it should show:" },
      { type: "ul", items: [
        "Base premium: \u20B9XX,XXX",
        "GST: <strong>\u20B90 (Nil)</strong>",
        "Total payable: \u20B9XX,XXX (same as base premium)"
      ] },
      { type: "p", text: "If your insurer still charges 18% GST on an individual policy with a premium payment date on or after September 22, 2025, they are incorrect \u2014 raise a dispute." },
      { type: "h3", text: "Step 4 \u2014 No Refund for Past GST Paid" },
      { type: "p", text: "GST paid on advance premiums before September 22, 2025, will not be refunded. The exemption applies only to premiums paid on or after that date." },
      { type: "h2", text: "Impact on Group Health Insurance (Employers)" },
      { type: "p", text: "The exemption announced by the 56th GST Council does not cover group insurance premiums paid by companies. The employer-sponsored group health insurance or a group life policy will continue to be taxed at 18% GST rate." },
      { type: "h3", text: "What This Means for HR Teams" },
      { type: "ul", items: [
        "<strong>Company-paid group health insurance:</strong> No change \u2014 18% GST continues",
        "<strong>Employee-paid voluntary top-ups under group plan:</strong> 18% GST (group policy)",
        "<strong>Employee buying individual policy directly:</strong> 0% GST (individual policy)"
      ] },
      { type: "p", text: "There's now a cost parity argument: if an employee's parents are insured under the company's group plan at 18% GST, they might find a retail individual policy cheaper for parental cover. HR teams should communicate this clearly." },
      { type: "highlight", html: "While the GST in taking individual Top-up will be exempted, effective discount in them will be near 5-8% only as insurers will lose on ITC from other operations. Buying top-up in a group policy ensures that you have coverage from 1st day rather than having a waiting period." },
      { type: "h2", text: "Will Base Premiums Increase Due to ITC Loss?" },
      { type: "p", text: "A valid concern: insurers previously claimed ITC on their business inputs (technology, office, legal services). With individual insurance now exempt (nil-rated), the ITC chain is broken \u2014 insurers cannot claim ITC on inputs used for exempt supplies." },
      { type: "p", text: "Some insurers may raise base premiums by 3\u20135% to offset input tax credit losses, but competitive market dynamics are likely to keep increases minimal." },
      { type: "p", text: "In practice, the 18% savings to policyholders far outweighs any marginal base premium increase that might occur. The net effect is strongly positive for consumers." },
      { type: "h2", text: "Tax Deduction Under Income Tax (Section 80D) \u2014 What Changes?" },
      { type: "p", text: "Nothing changes for Section 80D deductions. You can still claim:" },
      { type: "ul", items: [
        "Up to \u20B925,000 deduction on health insurance premiums (self, spouse, children)",
        "Up to \u20B950,000 for senior citizen parents",
        "Up to \u20B975,000 total (if both you and parents are covered)"
      ] },
      { type: "p", text: "Since GST is now zero on individual policies, your total premium is lower \u2014 meaning you may need to buy a higher coverage amount to maximise your 80D deduction. Alternatively, redirect the GST savings into a higher sum insured." },
      { type: "h2", text: "Frequently Asked Questions" },
      { type: "h3", text: "Q: Is my ULIP exempt from GST?" },
      { type: "p", text: "Yes. ULIP policies will no longer attract 18% GST, saving policyholders thousands of rupees annually." },
      { type: "h3", text: "Q: I pay premium via EMI. Which months are exempt?" },
      { type: "p", text: "GST rate will be applicable as on date of instalment premium payment. Any instalment paid on or after September 22, 2025 is exempt." },
      { type: "h3", text: "Q: My policy was reinstated. Is GST applicable?" },
      { type: "p", text: "The premiums paid for the re-instated policy issued to the policyholder on or after 22.09.2025 will be exempt from payment of GST." },
      { type: "h3", text: "Q: What about overseas travel insurance (individual)?" },
      { type: "p", text: "If it is an individual policy and fulfils conditions to qualify as export of services under GST law, it can be treated as export; else the services will be treated as exempt." },
      { type: "h3", text: "Q: Does the exemption apply to reinsurance?" },
      { type: "p", text: "Yes. Reinsurance of both individual life and health insurance services is also completely exempt from GST." },
      { type: "h2", text: "External References" },
      { type: "divider" },
      { type: "sourceLink", href: "https://financialservices.gov.in/beta/en/exemption-on-gst", label: "Department of Financial Services Official FAQ on GST Exemption" },
      { type: "sourceLink", href: "https://www.cbic.gov.in", label: "CBIC Notification No. 16/2025 Central Tax (Rate) dated 17.09.2025" },
      { type: "sourceLink", href: "https://www.irdai.gov.in", label: "IRDAI Insurance for All by 2047 Vision" },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "The zero GST on individual health and life insurance is one of the most tangible financial benefits to come out of GST 2.0 for ordinary Indians. The savings are real, immediate, and recurring \u2014 every year, every renewal." },
      { type: "p", text: "<strong>Your action list:</strong>" },
      { type: "checklist", items: [
        { mark: "\u2705", html: "Confirm your insurer has applied 0% GST to your next renewal" },
        { mark: "\u2705", html: "Buy individual top-up plans directly for better pricing than group plan top-ups" },
        { mark: "\u2705", html: "If you've been delaying getting insured due to cost \u2014 now is the time" },
        { mark: "\u2705", html: "Employers: communicate to employees that individual policies now have a cost advantage for self-purchased coverage" }
      ] },
      { type: "p", text: 'Related: <a href="/blog/gst-2-0-reforms-india-2025">GST 2.0 Reforms India 2025</a> \xB7 <a href="/blog/new-gst-rate-slab-list-2025-26">New GST Rate Slab List 2025\u201326</a> \xB7 <a href="/blog/gst-for-freelancers-india">GST for Freelancers India</a> \xB7 <a href="/blog/what-is-gst-india">What Is GST India</a>' },
      { type: "cta", title: "Check GST on every other line item", text: "Premiums may be Nil now \u2014 but riders and group plans aren't. Verify exact GST in seconds." }
    ]
  },
  {
    slug: "gst-on-restaurants-food-india-2025",
    title: "GST on Restaurants & Food India 2025: Rates for Dine-In, Takeaway, Zomato & Swiggy",
    description: "Complete guide to GST on restaurant food in India 2025 \u2014 5% vs 18% dine-in rates, ITC rules, how Zomato and Swiggy collect GST, delivery charge taxation, cloud kitchens, and GSTR-3B reporting.",
    category: "Sector-Specific GST",
    readTime: "11 min",
    date: "2025-11-03",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=75&auto=format&fit=crop", alt: "Restaurant interior with food being served to customers" },
      { type: "lead", text: "Whether you're a restaurant owner wondering which GST rate applies to your business, or a customer confused about why your Swiggy bill shows a GST line, this guide covers everything about food and restaurant taxation in India." },
      { type: "p", text: "GST on food and restaurant services may seem straightforward \u2014 but the rules differ based on where you eat, whether the restaurant has air conditioning, whether you're ordering through a delivery platform, and whether you're at a hotel restaurant. Understanding these distinctions matters both for compliance and for consumer awareness." },
      { type: "h2", text: "The Master Rule: Most Restaurants Pay 5% GST (Without ITC)" },
      { type: "p", text: "The default GST rate for restaurant services in India is <strong>5%, with no Input Tax Credit</strong>. This applies to:" },
      { type: "ul", items: [
        "All standalone restaurants (whether AC or non-AC \u2014 this distinction was removed in 2018)",
        "Takeaway orders directly from any restaurant",
        "Food courts in malls",
        "Cloud kitchens / delivery-only kitchens",
        "Cafes and quick service restaurants (QSRs)"
      ] },
      { type: "highlight", html: "<strong>Post GST 2.0 Update:</strong> Under the GST rate rationalisation effective after September 22, 2025, the 12% GST slab has largely been removed, with many items moving to 5% or 18%. Most restaurants continue to charge 5% GST without Input Tax Credit (ITC), while outdoor catering and certain hotel restaurants charge 18% GST with ITC." },
      { type: "p", text: 'The "no ITC" clause is critical for restaurant operators: <strong>if you charge 5% GST, you cannot claim ITC on any of your inputs</strong> \u2014 ingredients, packaging materials, rent, utilities, kitchen equipment. This significantly impacts profitability for restaurants with high input costs.' },
      { type: "h2", text: "Full GST Rate Structure for Food Services" },
      { type: "table", headers: ["Service Type", "GST Rate", "ITC Available?"], rows: [
        ["Regular restaurant (standalone, AC or non-AC)", "<strong>5%</strong>", "\u274C No"],
        ["Takeaway from any restaurant", "<strong>5%</strong>", "\u274C No"],
        ["Food delivery via Zomato/Swiggy", "<strong>5%</strong>", "\u274C No"],
        ["Restaurant in hotel (room tariff \u2264 \u20B97,500/night)", "<strong>5%</strong>", "\u274C No"],
        ["Restaurant in hotel (room tariff &gt; \u20B97,500/night)", "<strong>18%</strong>", "\u2705 Yes"],
        ["Outdoor catering (any type)", "<strong>18%</strong>", "\u2705 Yes"],
        ["5-star hotel restaurant", "<strong>18%</strong>", "\u2705 Yes"],
        ["Club restaurant (members only)", "<strong>18%</strong>", "\u2705 Yes"],
        ["Airline food (economy class)", "<strong>5%</strong>", "\u274C No"],
        ["Airline food (business class)", "<strong>18%</strong>", "\u2705 Yes"],
        ["Delivery fee charged by Zomato/Swiggy", "<strong>18%</strong>", "\u274C No"]
      ] },
      { type: "h2", text: "Zomato and Swiggy: How GST Works on Food Delivery" },
      { type: "image", src: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&q=75&auto=format&fit=crop", alt: "Delivery person on bike representing food delivery services in India" },
      { type: "p", text: "This is where many consumers and even restaurant owners get confused. Since January 1, 2022, the GST framework for online food delivery platforms changed fundamentally." },
      { type: "h3", text: "The TCS Shift: Platforms Pay, Not Restaurants" },
      { type: "p", text: "Under Notification No. 17/2021, food delivery e-commerce operators (ECOs) like Swiggy and Zomato are now liable to collect and remit GST on behalf of the restaurants for orders placed through their platforms." },
      { type: "p", text: "<strong>What this means:</strong>" },
      { type: "ul", items: [
        "When you order food on Zomato or Swiggy, the platform <strong>collects 5% GST</strong> on the food value and remits it directly to the government",
        "The restaurant does <strong>not</strong> separately charge GST on delivery orders through platforms",
        "Your invoice from Zomato/Swiggy shows the 5% GST \u2014 paid on your behalf to the government"
      ] },
      { type: "highlight", html: "Food delivery through platforms like Zomato and Swiggy is taxed at 5% GST, which the platform collects and remits. Restaurants must still account for these transactions in their GST returns and ensure proper reconciliation." },
      { type: "h3", text: "Delivery Charges: Separately Taxed at 18%" },
      { type: "p", text: "Starting September 22, 2025, <strong>delivery charges</strong> \u2014 the platform fee collected by Zomato and Swiggy from customers \u2014 now attract <strong>18% GST</strong>." },
      { type: "p", text: "This closes a previous loophole where platforms classified delivery fees as pass-through costs exempt from GST. The ruling leads to estimated additional costs of about Rs 2 per order for Zomato and Rs 2.6 per Swiggy order." },
      { type: "p", text: "<strong>Your Zomato/Swiggy bill now looks like this:</strong>" },
      { type: "table", headers: ["Component", "GST Rate", "GST on \u20B9300 food order"], rows: [
        ["Food value", "5%", "\u20B915"],
        ["Platform/delivery fee (e.g., \u20B925)", "18%", "\u20B94.50"],
        ["<strong>Total GST on your order</strong>", "", "<strong>\u20B919.50</strong>"]
      ] },
      { type: "h2", text: "For Restaurant Owners: GST Compliance Obligations" },
      { type: "h3", text: "Registration Requirement" },
      { type: "p", text: "GST registration is mandatory if your restaurant's annual turnover exceeds Rs 20 lakh (Rs 10 lakh for special category states like those in the North-East). If you sell through Zomato or Swiggy, <strong>registration is mandatory regardless of turnover</strong> \u2014 online marketplace sellers have no turnover exemption." },
      { type: "h3", text: "What to Include in GSTR-1" },
      { type: "p", text: "Restaurant owners must report:" },
      { type: "ul", items: [
        "All direct (dine-in, takeaway) sales invoices",
        "<strong>Exclude</strong> Zomato/Swiggy orders \u2014 the platform reports these in their own GSTR-8"
      ] },
      { type: "highlight", html: "<strong>Critical mistake many restaurants make:</strong> Including Swiggy/Zomato orders in GSTR-3B even after the platform takes responsibility. Double Reporting leads to reconciliation mismatches and GST notices." },
      { type: "h3", text: "GSTR-3B Reporting for Restaurants" },
      { type: "ul", items: [
        "Report only <strong>direct sales</strong> in Table 3 (outward supplies)",
        "Do <strong>not</strong> include aggregator-collected sales (platform handles their own GSTR-8)",
        "ITC in Table 4: Cannot claim ITC if on 5% scheme",
        "Verify GSTR-2B: Available ITC from eligible vendor invoices only"
      ] },
      { type: "h3", text: "ITC on Platform Commission" },
      { type: "p", text: "Here's one area restaurants CAN claim ITC: <strong>the GST charged by Zomato/Swiggy on their commission</strong>. The commission invoice from the platform shows 18% GST. This GST is an eligible ITC input service claim for the restaurant \u2014 even if they're on the 5% no-ITC scheme for food supply." },
      { type: "highlight", html: "Smart accounting can help optimise your ITC while remaining within compliance boundaries." },
      { type: "h2", text: "The Composition Scheme for Restaurants" },
      { type: "p", text: "Small restaurants with annual turnover up to Rs 1.5 crore can opt for the <strong>Composition Scheme</strong>:" },
      { type: "table", headers: ["Feature", "Composition Scheme"], rows: [
        ["GST rate", "5% on turnover (2.5% CGST + 2.5% SGST)"],
        ["GST on invoice", "Cannot charge separately \u2014 included in price"],
        ["ITC", "Cannot claim"],
        ["Inter-state supply", "Not allowed"],
        ["Return filing", "CMP-08 quarterly (simpler)"],
        ["Annual return", "GSTR-4"],
        ["Online marketplace sales", "<strong>Not allowed</strong> \u2014 Composition dealers cannot sell on Zomato/Swiggy"]
      ] },
      { type: "p", text: "The Composition Scheme suits very small, purely local restaurants. If you want to list on Zomato or Flipkart, you must opt out and register as a regular taxpayer." },
      { type: "h2", text: "Cloud Kitchens: Special Compliance Considerations" },
      { type: "p", text: "Cloud kitchens (delivery-only kitchens) operate almost entirely through aggregators like Zomato and Swiggy. Their GST compliance is therefore simpler in some ways:" },
      { type: "p", text: "<strong>Since nearly 100% of their sales are through platforms:</strong>" },
      { type: "ul", items: [
        "They no longer need to pay GST on those orders (platform handles it)",
        "Their main GST responsibility lies in recording commission expenses and reconciling ITC",
        "Their GSTR-3B filings involve fewer outward supply entries but more focus on inward supply (commission bills from platforms)"
      ] },
      { type: "p", text: "<strong>Key obligations for cloud kitchens:</strong>" },
      { type: "ul", items: [
        "File GSTR-1 monthly/quarterly (even if most sales are platform-mediated)",
        "Report commission invoices from platforms in GSTR-2B",
        "Claim ITC on packaging, operational supplies",
        "Reconcile monthly settlement reports from Zomato/Swiggy against GSTR-2B"
      ] },
      { type: "h2", text: "GST on Different Food Scenarios: Quick Reference" },
      { type: "table", headers: ["Scenario", "GST Rate"], rows: [
        ["Eating at a dhaba (unregistered)", "No GST"],
        ["Eating at a standalone AC restaurant", "5%"],
        ["Eating at a 5-star hotel restaurant", "18%"],
        ["Ordering room service in a hotel (room rate &gt; \u20B97,500)", "18%"],
        ["Ordering room service in a budget hotel", "5%"],
        ["Outdoor catering for wedding/event", "18%"],
        ["Buying packed biscuits from restaurant counter", "5% (as food product, not restaurant service)"],
        ["Zomato/Swiggy food order", "5% (on food) + 18% (on delivery fee)"],
        ["Packaged chips (branded)", "5% (post GST 2.0)"],
        ["Aerated drinks with caffeine (cola, energy drink)", "<strong>40%</strong> (post GST 2.0)"]
      ] },
      { type: "highlight", html: 'Use <a href="https://gstcalculator.me">gstcalculator.me</a> to quickly compute the GST on any food service bill \u2014 enter the food value and select 5% or 18% depending on restaurant type.' },
      { type: "h2", text: "Service Charge vs GST: An Important Distinction" },
      { type: "p", text: "Service charge is <strong>NOT a tax</strong> \u2014 it is a discretionary fee charged by restaurants. GST is a government-mandated tax. Many consumers confuse the two." },
      { type: "ul", items: [
        "<strong>Service charge:</strong> Optional; goes to the restaurant (often distributed among staff). The Ministry of Consumer Affairs has clarified it is not mandatory \u2014 you can refuse to pay.",
        "<strong>GST:</strong> Mandatory; remitted to the government. You cannot refuse."
      ] },
      { type: "p", text: "From a GST perspective, service charge is included in the taxable value of the restaurant service \u2014 meaning 5% or 18% GST is computed on the food bill + service charge combined." },
      { type: "h2", text: "Common GST Mistakes by Restaurant Owners" },
      { type: "steps", items: [
        "<strong>Including aggregator sales in their own GSTR-3B</strong> \u2014 leads to double-counting; platform already reports via GSTR-8",
        "<strong>Not reconciling platform settlement reports monthly</strong> \u2014 mismatches accumulate and create audit problems",
        "<strong>Claiming ITC on food ingredients</strong> \u2014 not allowed on 5% scheme; common error in early restaurant registrations",
        "<strong>Not registering even when selling on Zomato/Swiggy</strong> \u2014 mandatory regardless of turnover",
        "<strong>Choosing Composition Scheme and then listing on aggregators</strong> \u2014 violates composition scheme rules",
        "<strong>Not accounting for service charge in GST calculation</strong> \u2014 service charge is taxable along with food bill"
      ] },
      { type: "h2", text: "External References" },
      { type: "divider" },
      { type: "sourceLink", href: "https://www.cbic.gov.in", label: "CBIC Notification 17/2021 \u2014 ECO TCS Rules \u2014 platform GST collection mandate" },
      { type: "sourceLink", href: "https://www.gst.gov.in", label: "gst.gov.in \u2014 Restaurant Services GST Classification \u2014 official rate circulars" },
      { type: "sourceLink", href: "https://www.fssai.gov.in", label: "FSSAI Food Business Operator Registration \u2014 mandatory alongside GST for food businesses" },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "GST on restaurant food is fundamentally simple \u2014 <strong>5% for most restaurants, 18% for premium/catering</strong> \u2014 but the aggregator framework, delivery fee taxation, and compliance reporting create significant complexity for restaurant operators." },
      { type: "p", text: "<strong>For restaurant owners:</strong>" },
      { type: "ul", items: [
        "Apply 5% GST on direct sales (dine-in, takeaway)",
        "Don't double-report aggregator sales in your returns",
        "Claim ITC on platform commissions even on 5% scheme",
        "Register regardless of turnover if you're on Zomato/Swiggy"
      ] },
      { type: "p", text: "<strong>For consumers:</strong>" },
      { type: "ul", items: [
        "Expect 5% GST on food, 18% on delivery charges when ordering online",
        "Service charge is separate and discretionary \u2014 GST is mandatory"
      ] },
      { type: "p", text: 'Related: <a href="/blog/gst-2-0-reforms-india-2025">GST 2.0 Reforms India 2025</a> \xB7 <a href="/blog/gst-for-amazon-flipkart-sellers">GST for Amazon &amp; Flipkart Sellers</a> \xB7 <a href="/blog/gst-on-ecommerce-india">GST on E-commerce India</a> \xB7 <a href="/blog/how-to-file-gstr-3b">How to File GSTR-3B</a>' },
      { type: "cta", title: "Check GST on any restaurant bill", text: "Enter the food value and pick 5% or 18% to see CGST/SGST split \u2014 handy for both diners and owners." }
    ]
  },
  {
    slug: "gst-on-cars-bikes-india-2025",
    title: "GST on Cars & Bikes India 2025: New Rates After GST 2.0, HSN Codes & Savings Calculator",
    description: "Updated GST rates on cars and bikes after September 22, 2025 GST 2.0 reforms \u2014 18% on small cars and bikes under 350cc, 40% on luxury vehicles and premium bikes, 5% on EVs. With savings examples.",
    category: "Sector-Specific GST",
    readTime: "12 min",
    date: "2025-11-04",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=75&auto=format&fit=crop", alt: "Car showroom with various vehicles representing automobile GST rates in India" },
      { type: "lead", text: "The September 22, 2025 GST 2.0 reforms delivered one of the most significant automotive tax overhauls India has seen. For the first time, the complex system of GST plus compensation cess \u2014 which made calculating the true tax on a vehicle genuinely difficult \u2014 has been replaced with a clean, single-rate structure." },
      { type: "p", text: "The result: small cars and bikes below 350cc are <strong>significantly cheaper</strong>. Luxury vehicles and premium bikes above 350cc are <strong>more expensive</strong>. And EVs stay at the industry-friendly <strong>5% rate</strong> to keep India's green mobility push alive." },
      { type: "p", text: "Here's the complete picture." },
      { type: "h2", text: "The Old vs New Vehicle GST Structure" },
      { type: "h3", text: "The Old System (Before September 22, 2025)" },
      { type: "p", text: "The previous system was notoriously complex: GST rate (28%) <strong>plus</strong> a separate compensation cess (ranging from 1% to 22% depending on vehicle type). The combined effective tax rate on some vehicles exceeded 50%." },
      { type: "ul", items: [
        "Small petrol car: 28% GST + 1% cess = ~29% effective",
        "SUV (petrol, &gt;4m, &gt;1500cc): 28% GST + 22% cess = ~50% effective",
        "Bikes &lt;350cc: 28% GST + 0% cess = 28%",
        "Bikes &gt;350cc: 28% GST + 3% cess = ~31%"
      ] },
      { type: "h3", text: "The New System (From September 22, 2025)" },
      { type: "p", text: "Three clean rates \u2014 no separate cess:" },
      { type: "table", headers: ["Rate", "Vehicles Covered"], rows: [
        ["<strong>5%</strong>", "Electric vehicles (all), fuel-cell vehicles, vehicles for disabled persons"],
        ["<strong>18%</strong>", "Small cars (\u22644m, petrol \u22641200cc or diesel \u22641500cc), bikes \u2264350cc, commercial vehicles, three-wheelers, ambulances, tractors, buses"],
        ["<strong>40%</strong>", "Luxury cars (&gt;4m, petrol &gt;1200cc or diesel &gt;1500cc), bikes &gt;350cc, premium SUVs &gt;2500cc"]
      ] },
      { type: "highlight", html: "The September 22, 2025 GST 2.0 reforms mark a historic shift in automotive taxation, eliminating the complex cess system and moving to a clean, simplified structure. Small cars and two-wheelers become significantly more affordable, supporting mass mobility, while luxury vehicles face higher taxes to promote responsible consumption." },
      { type: "h2", text: "Cars: New GST Rates with Examples" },
      { type: "h3", text: "Small / Entry-Level Cars \u2192 18% (Was 28% + cess)" },
      { type: "table", headers: ["Model Type", "Engine", "Old Effective Rate", "New Rate", "Saving on \u20B97 Lakh Car"], rows: [
        ["Hatchback (petrol)", "\u22641200cc", "~29%", "18%", "~\u20B977,000"],
        ["Small diesel car", "\u22641500cc, \u22644m", "~30%", "18%", "~\u20B984,000"],
        ["Small CNG car", "\u22644m", "~29%", "18%", "~\u20B977,000"]
      ] },
      { type: "p", text: "<strong>Models that benefit:</strong> Maruti Alto K10, Swift Dzire, Fronx, Baleno, Hyundai Grand i10, Tata Punch, Tata Nexon (small diesel), Honda Amaze, and thousands of hatchbacks that form the backbone of India's passenger car market." },
      { type: "formula", title: "GST Calculation Example \u2014 Maruti Swift (\u20B98 Lakh ex-showroom)", code: "GST at 18%:  \u20B98,00,000 \xD7 18% = \u20B91,44,000\nOld GST+cess: \u20B98,00,000 \xD7 29% = \u20B92,32,000\nSaving:       \u20B988,000" },
      { type: "h3", text: "Mid-Size / Larger Cars \u2192 40% (Was 28% + cess)" },
      { type: "table", headers: ["Engine Type", "Old Effective Rate", "New Rate"], rows: [
        ["Petrol &gt;1200cc, &gt;4m length", "28% + 17% cess = ~45%", "40%"],
        ["Diesel &gt;1500cc, &gt;4m length", "28% + 20% cess = ~48%", "40%"],
        ["Hybrid vehicles", "28% + cess", "<strong>18%</strong> (reclassified)"]
      ] },
      { type: "p", text: "<strong>Models affected:</strong> Toyota Innova Crysta, Mahindra Thar, Toyota Fortuner, Mahindra XUV700, Hyundai Creta (larger variants), Kia Seltos (larger engine)." },
      { type: "p", text: "For luxury cars and SUVs with the largest engines, the new 40% single rate actually represents a <strong>reduction</strong> from the old 28%+22% cess = ~50% effective rate." },
      { type: "h3", text: "Luxury Cars \u2192 40%" },
      { type: "p", text: "Imported luxury cars, large SUVs, and high-end sedans that previously faced up to 50% effective rate now face a flat 40%. This is a simplification but still expensive:" },
      { type: "formula", title: "Luxury SUV at new 40% rate", code: "Luxury SUV ex-showroom: \u20B91 Crore\nGST at 40%: \u20B940,00,000\nTotal: \u20B91.4 Crore (just on GST)" },
      { type: "h3", text: "Electric Vehicles \u2192 5% (Unchanged)" },
      { type: "p", text: "EVs continue at the lowest GST rate in the automobile sector:" },
      { type: "table", headers: ["EV Type", "GST Rate"], rows: [
        ["Electric cars (all)", "5%"],
        ["Electric scooters", "5%"],
        ["Electric motorcycles", "5%"],
        ["Electric three-wheelers", "5%"],
        ["Electric buses", "5%"]
      ] },
      { type: "formula", title: "EV example \u2014 Tata Nexon EV (\u20B915 Lakh)", code: "GST at 5%: \u20B975,000\nTotal: \u20B915,75,000" },
      { type: "p", text: "Compared to a similar petrol car at 18% GST on \u20B912 lakh: \u20B92,16,000 in GST. The EV buyer pays \u20B975,000 vs \u20B92,16,000 \u2014 saving \u20B91,41,000 in GST alone." },
      { type: "h2", text: "Bikes and Two-Wheelers: New GST Rates" },
      { type: "image", src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=75&auto=format&fit=crop", alt: "Motorcycles lined up at a dealership representing new GST rates on bikes" },
      { type: "h3", text: "Bikes Under 350cc \u2192 18% (Was 28%)" },
      { type: "p", text: "This is the biggest win for Indian two-wheeler buyers. Nearly 98% of motorcycles sold in India have engines below 350cc, meaning the majority of the market is now at 18% \u2014 down from 28%." },
      { type: "table", headers: ["Engine", "Old Rate", "New Rate", "Saving on \u20B91 Lakh Bike"], rows: [
        ["100cc (commuter bike)", "28%", "18%", "\u20B910,000"],
        ["150cc (sport commuter)", "28%", "18%", "\u20B910,000"],
        ["250cc (mid-segment)", "28%", "18%", "\u20B910,000"],
        ["350cc exactly", "28%", "18%", "\u20B910,000"]
      ] },
      { type: "p", text: "<strong>HSN Code for bikes:</strong> 8711 (motorcycles, mopeds, scooters \u2014 all engine capacities)" },
      { type: "p", text: "<strong>Models that benefit:</strong> Hero Splendor, Bajaj Pulsar (all below 400cc), Honda Activa, TVS Jupiter, Yamaha FZS, Royal Enfield Meteor 350, and virtually every mass-market bike in India." },
      { type: "highlight", html: "Bikes are the primary mode of transport in rural and semi-urban India; cheaper bikes will directly benefit farmers, small traders, and daily wage earners." },
      { type: "formula", title: "GST Calculation Example \u2014 Honda Activa 6G (\u20B980,000)", code: "New GST at 18%: \u20B980,000 \xD7 18% = \u20B914,400\nOld GST at 28%: \u20B980,000 \xD7 28% = \u20B922,400\nSaving: \u20B98,000" },
      { type: "highlight", html: 'Use <a href="https://gstcalculator.me">gstcalculator.me</a> to compute the exact GST and on-road price impact for any bike at the new 18% rate.' },
      { type: "h3", text: "Bikes Above 350cc \u2192 40% (Was 28% + 3% cess = ~31%)" },
      { type: "p", text: "Premium motorcycles with engine capacity above 350cc moved into the new 40% luxury slab:" },
      { type: "table", headers: ["Engine", "Old Rate", "New Rate", "Impact on \u20B93 Lakh Bike"], rows: [
        ["400cc (Royal Enfield Classic 350 is just below)", "28% + 3% cess = 31%", "40%", "\u20B927,000 more expensive"],
        ["650cc", "~31%", "40%", "More expensive"],
        ["1000cc+ (superbikes)", "~31%", "40%", "More expensive"]
      ] },
      { type: "p", text: "<strong>Models affected:</strong> Royal Enfield Himalayan 450, KTM 390 Duke, Kawasaki Ninja 400, BMW G310, Triumph Speed 400 (barely above 350cc at 398.15cc), Harley-Davidson X440 (440cc)." },
      { type: "h3", text: "Electric Bikes \u2192 5% (Unchanged and Preferred)" },
      { type: "table", headers: ["Electric Vehicle", "HSN", "GST Rate"], rows: [
        ["Electric scooters (Ola, Ather, TVS iQube)", "8703", "5%"],
        ["Electric motorcycles", "8711", "5%"],
        ["Electric bicycles", "8712", "5%"]
      ] },
      { type: "h2", text: "Commercial Vehicles \u2192 18% (Was 28%)" },
      { type: "table", headers: ["Vehicle Type", "Old Rate", "New Rate"], rows: [
        ["Goods transport trucks", "28%", "18%"],
        ["Mini-trucks / pick-ups", "28%", "18%"],
        ["Three-wheelers (auto-rickshaws)", "28%", "18%"],
        ["Tractors (&lt;1800cc)", "28%", "18%"],
        ["Buses (&gt;10 seater)", "28%", "18%"],
        ["Ambulances", "28%", "18%"]
      ] },
      { type: "p", text: "This is significant for logistics and agriculture. A \u20B925 lakh commercial truck at 18% GST saves \u20B92.5 lakh compared to 28%." },
      { type: "h2", text: "Auto Parts \u2192 18%" },
      { type: "p", text: "The majority of the components used for the manufacture of motor cars and motor bikes have also been reduced to 18%. This simplifies supply chain management for the entire automotive ecosystem." },
      { type: "table", headers: ["Part Category", "HSN", "Old Rate", "New Rate"], rows: [
        ["Engines and parts", "8407/8408", "28%", "18%"],
        ["Gearboxes", "8708", "28%", "18%"],
        ["Brakes", "8708", "28%", "18%"],
        ["Tyres (new)", "4011", "28%", "18%"],
        ["Bike spare parts", "8714", "28%", "18%"],
        ["Batteries (non-EV)", "8507", "18%", "18%"],
        ["EV batteries", "8507", "5%", "5%"]
      ] },
      { type: "h2", text: "ITC on Vehicle Purchases: Who Can Claim?" },
      { type: "p", text: "Under GST Section 17(5), ITC on motor vehicles is generally <strong>blocked</strong> for personal use. However:" },
      { type: "p", text: "<strong>ITC CAN be claimed if the vehicle is:</strong>" },
      { type: "ul", items: [
        "Used for <strong>transporting passengers commercially</strong> (taxi, auto-rickshaw, bus)",
        "Used for <strong>transporting goods</strong> (goods carrier vehicles)",
        "Used for <strong>driver training</strong>",
        "A <strong>goods transport vehicle</strong> purchased for commercial resale/leasing",
        "An <strong>EV</strong> purchased for delivery business"
      ] },
      { type: "p", text: "<strong>ITC CANNOT be claimed if:</strong>" },
      { type: "ul", items: [
        "The vehicle is for personal use",
        "The vehicle is given to an employee for personal and office use"
      ] },
      { type: "h2", text: "How to Calculate Vehicle GST" },
      { type: "formula", title: "Formula for intra-state purchase", code: "CGST = Ex-showroom Price \xD7 (GST Rate/2) / 100\nSGST = Ex-showroom Price \xD7 (GST Rate/2) / 100\nTotal GST = CGST + SGST\nOn-road price = Ex-showroom + GST + Registration + Insurance + Others" },
      { type: "formula", title: "Example \u2014 Honda Amaze (\u20B99.5 Lakh, diesel, <4m, so 18% GST)", code: "CGST (9%):  \u20B99,50,000 \xD7 9% = \u20B985,500\nSGST (9%):  \u20B99,50,000 \xD7 9% = \u20B985,500\nTotal GST:  \u20B91,71,000\nOn-road price (approximate, before reg/insurance): \u20B911,21,000" },
      { type: "highlight", html: 'Instantly compute the exact GST on any car or bike purchase at the new 2025 rates using <a href="https://gstcalculator.me">gstcalculator.me</a>.' },
      { type: "h2", text: "Frequently Asked Questions" },
      { type: "h3", text: "Q: Will car prices actually drop after GST 2.0?" },
      { type: "p", text: "Many manufacturers have already adjusted ex-showroom prices for select models after the September 2025 reforms; actual consumer benefit depends on company pricing decisions and dealer margins. Compact sedans and popular hatchbacks are expected to rise in demand." },
      { type: "h3", text: "Q: Is compensation cess fully abolished?" },
      { type: "p", text: "The compensation cess is being phased out by March 2026. During this transition period, some cess components may still appear on certain vehicles. The new GST rate structure absorbs the cess into the final rate for most vehicles." },
      { type: "h3", text: "Q: Does 40% GST apply to the Royal Enfield Classic 350?" },
      { type: "p", text: "No \u2014 the Royal Enfield Classic 350 has an engine capacity of exactly 346cc, which is below the 350cc threshold. It falls in the 18% slab. The Royal Enfield Meteor 350 (349cc) also falls under 18%." },
      { type: "h3", text: "Q: What about used car sales?" },
      { type: "p", text: "Used cars sold by <strong>registered dealers</strong> attract GST on the <strong>margin</strong> (selling price minus purchase price) under the margin scheme. Individuals selling their personal car to another individual \u2014 no GST." },
      { type: "h2", text: "External References" },
      { type: "divider" },
      { type: "sourceLink", href: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2164587", label: "PIB Press Release on GST 2.0 Heavy Industry Impact \u2014 official automotive sector breakdown" },
      { type: "sourceLink", href: "https://www.cbic.gov.in", label: "CBIC HSN Chapter 87 \u2014 Vehicle Classifications \u2014 official vehicle GST codes" },
      { type: "sourceLink", href: "https://www.siam.in", label: "SIAM (Society of Indian Automobile Manufacturers) \u2014 industry impact data" },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "GST 2.0 has fundamentally reshaped vehicle taxation in India:" },
      { type: "table", headers: ["Winner", "Loser"], rows: [
        ["Small car buyers (28% \u2192 18%)", "Luxury car buyers (50% \u2192 40%, but still high)"],
        ["Commuter bike buyers &lt;350cc (28% \u2192 18%)", "Premium bike buyers &gt;350cc (31% \u2192 40%)"],
        ["EV buyers (5% unchanged \u2014 lowest rate)", "\u2014"],
        ["Commercial vehicle operators (28% \u2192 18%)", "\u2014"],
        ["Tractor/agriculture sector (28% \u2192 18%)", "\u2014"]
      ] },
      { type: "p", text: 'For most Indian vehicle buyers, this is unambiguously good news. Before finalising your purchase, use <a href="https://gstcalculator.me">gstcalculator.me</a> to compute your exact GST liability at the new rates.' },
      { type: "p", text: 'Related: <a href="/blog/gst-2-0-reforms-india-2025">GST 2.0 Reforms India 2025</a> \xB7 <a href="/blog/new-gst-rate-slab-list-2025-26">New GST Rate Slab List 2025\u201326</a> \xB7 <a href="/blog/hsn-code-list-india-2025">HSN Code List India 2025</a> \xB7 <a href="/blog/e-way-bill-gst-india-2025">E-Way Bill GST India 2025</a>' },
      { type: "cta", title: "Compute on-road GST in seconds", text: "Enter the ex-showroom price and pick 5%, 18% or 40% \u2014 instant CGST/SGST/IGST split for any car or bike." }
    ]
  },
  {
    slug: "invoice-management-system-ims-gst-guide",
    title: "Invoice Management System (IMS) Under GST: Complete Guide to Accept, Reject & Manage Invoices (2025)",
    description: "Complete guide to the GST Invoice Management System (IMS) \u2014 what it is, how to accept/reject/pend invoices, how it affects GSTR-2B and ITC, the deemed acceptance rule, and October 2025 updates.",
    category: "GST Tools & Technology",
    readTime: "12 min",
    date: "2025-11-05",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=75&auto=format&fit=crop", alt: "Digital invoice management system on laptop screen with financial data" },
      { type: "lead", text: "If you've logged into the GST portal recently and noticed a new dashboard under Services \u2192 Returns \u2192 Invoice Management System, you're looking at one of the most significant additions to India's GST infrastructure since the system launched in 2017." },
      { type: "p", text: "The <strong>Invoice Management System (IMS)</strong>, launched October 14, 2024 and substantially updated through 2025, allows buyer-taxpayers to individually accept, reject, or keep pending every invoice filed by their suppliers \u2014 before those invoices feed into GSTR-2B and affect ITC claims." },
      { type: "p", text: "This fundamentally changes how ITC reconciliation works. Before IMS, buyers had no say in what appeared in their GSTR-2B \u2014 every invoice a supplier filed just landed there. Now, buyers can actively manage what ITC they claim and flag discrepancies before they become compliance problems." },
      { type: "highlight", html: '<strong>Official source:</strong> <a href="https://tutorial.gst.gov.in/downloads/news/revised_advisory_on_ims.pdf" target="_blank" rel="noopener noreferrer">GSTN IMS Advisory Portal</a> \xB7 <a href="https://www.gstn.org.in" target="_blank" rel="noopener noreferrer">GSTN Official IMS Manual</a>' },
      { type: "h2", text: "What Is the Invoice Management System (IMS)?" },
      { type: "p", text: "The Invoice Management System is a new feature within the GST portal that allows recipient taxpayers to accept, reject, or keep pending invoices when saved or filed by their supplier taxpayers." },
      { type: "p", text: "Think of it as an inbox for your inbound GST invoices. Every time a supplier files or saves an invoice in their GSTR-1, IFF, or GSTR-1A, it appears in your IMS dashboard immediately. You then decide what to do with it before it becomes part of your GSTR-2B." },
      { type: "p", text: "<strong>The problem IMS solves:</strong> Before IMS, ITC mismatches between a buyer's books and their GSTR-2B were only discovered after the fact \u2014 often when a notice arrived. IMS lets you catch mismatches before they hit your returns." },
      { type: "h2", text: "How IMS Fits Into the GST Return Flow" },
      { type: "p", text: "Here's where IMS sits in the monthly filing cycle:" },
      { type: "formula", title: "GST return cycle with IMS", code: "Supplier files GSTR-1 / IFF / GSTR-1A\n            \u2193\nInvoice appears in Recipient's IMS Dashboard\n            \u2193\nRecipient takes action: Accept / Reject / Pending / No Action\n            \u2193\nGSTR-2B generated on 14th of month (includes accepted + no-action invoices)\n            \u2193\nAccepted ITC auto-populates into GSTR-3B Table 4\n            \u2193\nRecipient reviews, makes adjustments, pays tax, files GSTR-3B" },
      { type: "h2", text: "The Four Actions You Can Take on Each Invoice" },
      { type: "table", headers: ["Action", "What Happens", "When to Use"], rows: [
        ["<strong>Accept</strong>", "Invoice joins GSTR-2B as eligible ITC", "Invoice matches your records; you want to claim ITC"],
        ["<strong>Reject</strong>", "Invoice excluded from GSTR-2B; supplier's liability affected", "Invoice is wrong, duplicate, or fraudulent"],
        ["<strong>Pending</strong>", "Invoice held for one period; not in current GSTR-2B", "Invoice is for a future period or needs verification"],
        ["<strong>No Action</strong>", "Treated as <strong>Accepted</strong> \u2014 deemed acceptance applies", "Default when you don't act before GSTR-3B filing"]
      ] },
      { type: "h3", text: "The Deemed Acceptance Rule \u2014 Critical to Understand" },
      { type: "p", text: "This is the most important operational rule in IMS:" },
      { type: "highlight", html: `<strong>If a recipient doesn't take any action on an invoice in IMS before filing their GSTR-3B, the invoice is automatically considered "deemed accepted" and included in their GSTR-2B for claiming ITC.</strong>` },
      { type: "p", text: "This means: <strong>doing nothing = accepting everything.</strong> If you never log into IMS, all your supplier invoices are automatically accepted and your GSTR-2B populates as before. IMS participation is not compulsory \u2014 but active use maximises accuracy." },
      { type: "h2", text: "How to Use IMS: Step-by-Step Guide" },
      { type: "image", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=75&auto=format&fit=crop", alt: "GST portal on laptop with person reviewing invoices" },
      { type: "h3", text: "Step 1 \u2014 Access IMS Dashboard" },
      { type: "p", text: "Login to gst.gov.in \u2192 navigate to <strong>Services \u2192 Returns \u2192 Invoice Management System (IMS)</strong>" },
      { type: "p", text: "You'll see the IMS dashboard with tabs:" },
      { type: "ul", items: [
        "<strong>Supplier Dashboard</strong> \u2014 your outward supply invoices (what your buyers see)",
        "<strong>Recipient Dashboard</strong> \u2014 inward supply invoices from your suppliers"
      ] },
      { type: "h3", text: "Step 2 \u2014 View Inbound Invoices" },
      { type: "p", text: "In the Recipient Dashboard, invoices appear categorised as:" },
      { type: "ul", items: [
        "<strong>No action taken</strong> (default state for all new invoices)",
        "<strong>Accepted</strong> (you've explicitly accepted)",
        "<strong>Rejected</strong> (you've rejected)",
        "<strong>Pending</strong> (you've deferred the decision)"
      ] },
      { type: "p", text: "You can filter by GSTIN, invoice date, invoice number, or action taken." },
      { type: "h3", text: "Step 3 \u2014 Take Action on Individual or Bulk Invoices" },
      { type: "p", text: "<strong>For individual invoices:</strong> Click on the invoice row and select Accept, Reject, or Pending." },
      { type: "p", text: "<strong>For bulk actions:</strong> Select up to 500 invoices using checkboxes and apply the action in one click. For more than 500 invoices, download as Excel, process offline using the GSTN Excel tool, and re-upload." },
      { type: "h3", text: "Step 4 \u2014 Save Your Actions" },
      { type: "p", text: "Click Save after selecting actions. Your choices are recorded on the portal. Suppliers can see what action you've taken on their invoices." },
      { type: "h3", text: "Step 5 \u2014 Recompute GSTR-2B (If Actions Taken After 14th)" },
      { type: "p", text: "GSTR-2B is auto-generated on the <strong>14th of each month</strong>. If you take any IMS action after the 14th:" },
      { type: "ul", items: [
        'Your GSTR-2B must be <strong>manually recomputed</strong> using the "Compute GSTR-2B" button',
        "The recomputed GSTR-2B reflects your updated IMS actions",
        "You cannot generate a new GSTR-2B until you've filed GSTR-3B for the previous period"
      ] },
      { type: "highlight", html: "<strong>You must recompute GSTR-2B after any IMS action taken after the 14th.</strong> Failing to do so means your GSTR-3B ITC claim won't reflect your IMS choices." },
      { type: "h3", text: "Step 6 \u2014 File GSTR-3B" },
      { type: "p", text: "After GSTR-2B reflects your accepted ITC, proceed to file GSTR-3B. Once GSTR-3B is filed, <strong>no further IMS action can be taken for that period</strong>." },
      { type: "h2", text: "What Happens When You Reject an Invoice" },
      { type: "p", text: "Rejection has cascading consequences for both parties:" },
      { type: "h3", text: "Impact on the Recipient (You)" },
      { type: "ul", items: [
        "The invoice is excluded from your GSTR-2B \u2014 no ITC claimed",
        "You can recover ITC later if the supplier re-reports the invoice and you re-accept it"
      ] },
      { type: "h3", text: "Impact on the Supplier" },
      { type: "ul", items: [
        "The supplier can see you've rejected their invoice in their IMS Supplier Dashboard",
        "Their GST liability in GSTR-3B is affected \u2014 rejecting an invoice changes their auto-populated liability",
        "They should investigate why you rejected and either amend via GSTR-1A or confirm the rejection is correct"
      ] },
      { type: "h3", text: "If You Accidentally Reject a Valid Invoice" },
      { type: "steps", items: [
        "Ask your supplier to re-report the same document (unchanged values) in GSTR-1A",
        "The document reappears in your IMS for the next tax period",
        "Accept it in the new period",
        "Full ITC becomes available in that period's GSTR-2B",
        "<strong>Good news:</strong> The supplier's liability won't increase if the same values are refurnished (only delta changes trigger additional liability)"
      ] },
      { type: "h2", text: "The Pending Option: When and How to Use It" },
      { type: "p", text: 'Marking an invoice "Pending" holds it for one period without affecting your current GSTR-2B.' },
      { type: "h3", text: "When to Use Pending" },
      { type: "ul", items: [
        "The invoice is for a future delivery (goods not yet received)",
        "You're waiting for the physical invoice to verify amounts",
        "There's a dispute under investigation but you don't want to reject permanently",
        "The invoice should be claimed in the next period"
      ] },
      { type: "h3", text: "Limits on Pending" },
      { type: "ul", items: [
        "Specified records can be kept pending for <strong>one tax period</strong> (one month for monthly filers, one quarter for QRMP filers)",
        "After this period, you must either Accept or Reject",
        "Section 16(4) of the CGST Act sets the outer time limit for ITC claims \u2014 don't keep invoices pending beyond that"
      ] },
      { type: "h3", text: "What Cannot Be Marked Pending" },
      { type: "p", text: "Some document types cannot be Pending \u2014 they must be Accepted or Rejected:" },
      { type: "ul", items: [
        "Original Credit Notes",
        "Upward amendments of Credit Notes",
        "Certain downward amendments of invoices/debit notes where original was accepted and GSTR-3B already filed"
      ] },
      { type: "h2", text: "October 2025 Updates: What's New in IMS" },
      { type: "p", text: "The GSTN has progressively enhanced IMS. Key updates effective October 2025:" },
      { type: "h3", text: "Import of Goods in IMS" },
      { type: "p", text: 'Effective October 2025 tax period, a new section for <strong>"Import of Goods"</strong> has been introduced in IMS. Bills of Entry (BoE) filed by the taxpayer for import of goods (including import from SEZ) are now available in IMS for action. This is particularly important for businesses with significant import activity.' },
      { type: "h3", text: "Partial ITC Reversal on Acceptance" },
      { type: "p", text: "A new facility lets taxpayers declare the <strong>exact ITC availed</strong> and reverse only that amount \u2014 partially or fully. If ITC was never claimed, no reversal is required. This prevents over-reversal in situations where only a portion of an invoice's ITC was utilised." },
      { type: "h3", text: "Remarks Feature" },
      { type: "p", text: "Taxpayers can save <strong>optional remarks when rejecting or keeping records pending</strong>. These remarks appear in GSTR-2B and the supplier's dashboard \u2014 improving communication and reconciliation between trading partners." },
      { type: "h3", text: "GSTR-3B Table 3 Hard-Locked" },
      { type: "p", text: "From July 2025, outward supply values in GSTR-3B Table 3 are auto-filled from GSTR-1 and locked \u2014 cannot be manually edited. This interacts with IMS because any corrections to supplier-side data now flow through GSTR-1A \u2192 IMS \u2192 GSTR-2B." },
      { type: "h2", text: "IMS for QRMP Filers (Quarterly Return, Monthly Payment)" },
      { type: "p", text: "QRMP filers have different IMS timelines:" },
      { type: "ul", items: [
        "Invoices from suppliers flow into IMS in real-time (monthly)",
        "<strong>GSTR-2B for QRMP filers is generated quarterly</strong> (not monthly)",
        "IFF-filed invoices (months 1 and 2 of the quarter) appear in IMS and feed quarterly GSTR-2B",
        "The pending period for QRMP filers = one quarter (not one month)"
      ] },
      { type: "h2", text: "Common IMS Mistakes to Avoid" },
      { type: "steps", items: [
        "<strong>Rejecting invoices without informing the supplier</strong> \u2014 use the new Remarks feature to explain your rejection; the supplier needs to know to amend or accept the correction",
        "<strong>Not recomputing GSTR-2B after post-14th IMS actions</strong> \u2014 your GSTR-3B ITC will be wrong",
        "<strong>Accepting all invoices by default without verification</strong> \u2014 while deemed acceptance protects you operationally, reviewing invoices prevents ITC overclaiming",
        "<strong>Keeping invoices pending beyond allowed time limits</strong> \u2014 they'll lapse and you'll lose the ITC window",
        "<strong>Not acting on imported goods BoEs</strong> \u2014 October 2025 brought these into IMS; ignoring them creates import ITC mismatches",
        "<strong>Claiming ITC on ineligible invoices even after accepting in IMS</strong> \u2014 IMS acceptance doesn't override Section 17(5) blocked credits; ineligible invoices accepted in IMS must still be reversed in GSTR-3B Table 4B"
      ] },
      { type: "h2", text: "IMS and the ITC Reconciliation Workflow" },
      { type: "p", text: "IMS replaces much of the manual GSTR-2A reconciliation businesses previously did. The new workflow:" },
      { type: "table", headers: ["Old Workflow", "New IMS Workflow"], rows: [
        ["Download GSTR-2A manually", "IMS shows supplier invoices in real-time"],
        ["Manually reconcile with purchase ledger", "Accept/reject directly in IMS dashboard"],
        ["Errors discovered only after GSTR-2B generation", "Errors caught before GSTR-2B locks in"],
        ["No communication channel to supplier", "Rejection visible to supplier in real-time"],
        ["Full ITC or nothing per invoice", "Partial ITC reversal now possible"]
      ] },
      { type: "p", text: "For accountants and finance teams managing large invoice volumes, the Excel bulk download and offline tool significantly speeds up the reconciliation process." },
      { type: "h2", text: "Key IMS Dates Each Month (For Monthly Filers)" },
      { type: "table", headers: ["Date", "Action"], rows: [
        ["1st\u201311th", "Suppliers file GSTR-1; invoices appear in your IMS"],
        ["By 14th", "Review IMS; take accept/reject/pending actions"],
        ["14th", "GSTR-2B auto-generated based on IMS actions (or deemed acceptance)"],
        ["14th\u201320th", "Review GSTR-2B; if actions taken after 14th, recompute GSTR-2B"],
        ["By 20th", "File GSTR-3B; no more IMS actions possible for this period"]
      ] },
      { type: "h2", text: "External References" },
      { type: "divider" },
      { type: "sourceLink", href: "https://tutorial.gst.gov.in/downloads/news/revised_advisory_on_ims.pdf", label: "GSTN Official IMS Advisory" },
      { type: "sourceLink", href: "https://www.gstn.org.in", label: "GSTN IMS June 2025 Update \u2014 Wrongly Rejected Documents" },
      { type: "sourceLink", href: "https://cleartax.in/s/invoice-management-system-ims-under-gst", label: "ClearTax IMS Guide" },
      { type: "sourceLink", href: "https://www.gst.gov.in", label: "gst.gov.in IMS Portal Access" },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "IMS is the most significant change to the ITC ecosystem since GSTR-2B was introduced. It gives buyers genuine control over what ITC they claim \u2014 and creates a communication channel with suppliers that didn't previously exist." },
      { type: "p", text: "<strong>Your IMS action plan:</strong>" },
      { type: "checklist", items: [
        { mark: "\u2705", html: "Login to IMS every month between the 1st and 14th to review inbound invoices" },
        { mark: "\u2705", html: "Set up a reconciliation workflow to match IMS invoices against your purchase ledger" },
        { mark: "\u2705", html: "Use Pending for invoices that need verification; don't reject unnecessarily" },
        { mark: "\u2705", html: "After any action taken post-14th, recompute GSTR-2B before filing GSTR-3B" },
        { mark: "\u2705", html: "If you accidentally reject a valid invoice, work with your supplier to re-report via GSTR-1A" },
        { mark: "\u2705", html: "Check the Import of Goods section (October 2025 addition) if you're an importer" }
      ] },
      { type: "p", text: 'Use <a href="https://gstcalculator.me">gstcalculator.me</a> to verify the GST amounts on individual invoices \u2014 especially useful when reconciling IMS entries against your internal purchase records.' },
      { type: "p", text: 'Related: <a href="/blog/input-tax-credit-gst">Input Tax Credit Under GST</a> \xB7 <a href="/blog/how-to-file-gstr-3b">How to File GSTR-3B</a> \xB7 <a href="/blog/how-to-file-gstr-1">How to File GSTR-1</a> \xB7 <a href="/blog/gstin-format-verification-guide">GSTIN Format &amp; Verification Guide</a>' },
      { type: "cta", title: "Reconcile invoices with confidence", text: "Spot-check the GST on any IMS line item \u2014 quick CGST/SGST/IGST split for accept/reject decisions." }
    ]
  },
  {
    slug: "gst-on-imports-exports-india-2025",
    title: "GST on Imports & Exports India 2025: IGST, Customs Duty, ITC on Imports & Zero-Rating",
    description: "Complete guide to GST on imports and exports in India \u2014 how IGST applies on imports, customs duty calculation, ITC on imports, zero-rating for exports, LUT filing, and refund process for exporters.",
    category: "GST Compliance",
    readTime: "12 min",
    date: "2025-11-06",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=75&auto=format&fit=crop", alt: "Cargo containers at a port representing India's import-export trade" },
      { type: "lead", text: "If your business buys from foreign suppliers or sells to international customers, the intersection of GST and customs law is where you operate daily. Yet this is an area where even experienced accountants sometimes get the IGST-on-import calculation wrong, or miss the LUT filing that would have saved them significant cash flow on export transactions." },
      { type: "p", text: "This guide covers the full framework \u2014 how IGST applies on imports, how it interacts with customs duty, how exporters can claim refunds or export without paying GST at all, and what's changed in 2025." },
      { type: "h2", text: "GST on Imports: The Core Principle" },
      { type: "p", text: "India treats imports as <strong>inter-state supplies</strong>. This means <strong>IGST</strong> (Integrated GST) applies on imports \u2014 not CGST/SGST. The IGST on imports is collected by the <strong>Customs department</strong> at the time of clearance, not the GST department." },
      { type: "p", text: "<strong>Key rule:</strong> IGST on imports = applicable GST rate of the imported goods (same rate as domestic supply of that product)" },
      { type: "h2", text: "How the Total Tax on an Import Is Calculated" },
      { type: "p", text: "The full import tax stack:" },
      { type: "table", headers: ["Component", "Applied On", "Typical Rate"], rows: [
        ["Basic Customs Duty (BCD)", "Assessable value (CIF value + landing charges)", "Varies by product (0\u2013150%)"],
        ["Social Welfare Surcharge (SWS)", "10% of BCD", "10% of BCD"],
        ["Agriculture Infrastructure Development Cess (AIDC)", "On specific goods", "Varies"],
        ["IGST", "Assessable value + BCD + SWS + AIDC", "Same as domestic GST rate"],
        ["GST Compensation Cess", "On specified sin/luxury goods", "Varies (being phased out)"]
      ] },
      { type: "p", text: "<strong>Example: Importing a laptop (HSN 8471, 18% IGST)</strong>" },
      { type: "table", headers: ["Component", "Calculation", "Amount"], rows: [
        ["CIF value (USD 1,000)", "\u20B983,000 (assumed rate)", "\u20B983,000"],
        ["Landing charges (1%)", "1% \xD7 \u20B983,000", "\u20B9830"],
        ["Assessable value", "", "\u20B983,830"],
        ["BCD (20% on laptops)", "20% \xD7 \u20B983,830", "\u20B916,766"],
        ["SWS (10% of BCD)", "10% \xD7 \u20B916,766", "\u20B91,677"],
        ["Taxable value for IGST", "\u20B983,830 + \u20B916,766 + \u20B91,677", "\u20B91,02,273"],
        ["<strong>IGST (18%)</strong>", "18% \xD7 \u20B91,02,273", "<strong>\u20B918,409</strong>"],
        ["<strong>Total import duty paid</strong>", "BCD + SWS + IGST", "<strong>\u20B936,852</strong>"]
      ] },
      { type: "highlight", html: 'Use <a href="https://gstcalculator.me">gstcalculator.me</a> to calculate the IGST component on any import \u2014 enter the post-customs taxable value and select the applicable IGST rate.' },
      { type: "h2", text: "ITC on IGST Paid During Import" },
      { type: "p", text: "This is where India's import-GST framework becomes powerful for businesses:" },
      { type: "p", text: "<strong>The IGST paid on imports is available as ITC</strong> \u2014 provided:" },
      { type: "steps", items: [
        "The import is for business purposes (not personal)",
        "The goods/services are used for taxable supplies",
        "The goods are not specifically blocked under Section 17(5)",
        "The Bill of Entry (BoE) is filed correctly and appears in GSTR-2B"
      ] },
      { type: "h3", text: "How Import ITC Flows" },
      { type: "p", text: "From October 2025, Bills of Entry for imports appear directly in the <strong>Invoice Management System (IMS)</strong> dashboard. Recipients can accept or reject individual BoEs \u2014 just like domestic supplier invoices." },
      { type: "ul", items: [
        "Accept the BoE in IMS \u2192 IGST paid on import appears in GSTR-2B as available ITC",
        "ITC then offsets your domestic IGST, CGST, or SGST liability in GSTR-3B"
      ] },
      { type: "p", text: "<strong>IGST ITC utilisation order (from imports):</strong>" },
      { type: "steps", items: [
        "First against IGST liability",
        "Then against CGST liability",
        "Then against SGST liability"
      ] },
      { type: "p", text: "This is one of the most powerful aspects of India's GST framework \u2014 a \u20B918,000 IGST payment on an imported laptop becomes \u20B918,000 of ITC that directly reduces your output tax liability." },
      { type: "h2", text: "Import of Services: Reverse Charge Mechanism" },
      { type: "p", text: "When you <strong>import services</strong> from a foreign supplier (e.g., software subscription from a US company, consulting from a Singapore firm), special rules apply:" },
      { type: "ul", items: [
        "<strong>No GST is charged by the foreign supplier</strong> (they're outside India's tax net)",
        "<strong>You, the Indian recipient, must self-assess and pay IGST</strong> under Reverse Charge Mechanism (RCM)",
        "The IGST rate is the same as the domestic rate for that service category"
      ] },
      { type: "p", text: "<strong>Common examples:</strong>" },
      { type: "table", headers: ["Service", "IGST Rate Under RCM"], rows: [
        ["Software / SaaS subscription", "18%"],
        ["Legal/consulting services", "18%"],
        ["Advertising/marketing services", "18%"],
        ["Cloud computing services", "18%"],
        ["Royalties on IP", "18%"]
      ] },
      { type: "p", text: "<strong>RCM ITC on imported services:</strong> The IGST you self-assess and pay under RCM is available as ITC in the same tax period \u2014 effectively making it a cash-neutral transaction if you have taxable output. You pay the RCM and claim it back simultaneously in GSTR-3B." },
      { type: "h2", text: "GST on Exports: The Zero-Rating Framework" },
      { type: "image", src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=75&auto=format&fit=crop", alt: "Ship loading cargo at a port for export" },
      { type: "p", text: "Exports are treated as <strong>zero-rated supplies</strong> under Section 16 of the IGST Act. This means:" },
      { type: "ul", items: [
        "GST rate on exports = <strong>0%</strong>",
        "But unlike exempt supplies, exporters can <strong>claim full ITC on inputs</strong> used for exported goods/services"
      ] },
      { type: "p", text: "This is a critical distinction: exempt supplies have no GST and no ITC; zero-rated supplies have no GST but <strong>full ITC is available and refundable</strong>." },
      { type: "h3", text: "Two Ways to Export Under GST" },
      { type: "p", text: "<strong>Option 1: Export Under Bond / Letter of Undertaking (LUT) \u2014 No IGST Payment</strong>" },
      { type: "p", text: "The most popular and cash-flow-friendly option. With a valid LUT:" },
      { type: "ul", items: [
        "Export goods/services without paying any IGST",
        "Claim refund of ITC accumulated on inputs used for exports"
      ] },
      { type: "p", text: "<strong>Option 2: Pay IGST and Claim Refund</strong>" },
      { type: "ul", items: [
        "Pay IGST on exports at the applicable rate",
        "Claim a refund of the IGST paid from the GST department",
        "Less preferred (ties up working capital), but sometimes simpler for occasional exporters"
      ] },
      { type: "h2", text: "Letter of Undertaking (LUT): How to File and Use" },
      { type: "h3", text: "Who Must File LUT?" },
      { type: "p", text: "Any exporter who wants to export without paying IGST must file a <strong>LUT (Form RFD-11)</strong> at the start of each financial year." },
      { type: "p", text: "<strong>Who can file LUT:</strong>" },
      { type: "ul", items: [
        "Regular GST-registered taxpayers who export goods or services",
        "Not applicable to exporters who have been convicted of tax evasion of \u20B92.5 lakh or more in a given year"
      ] },
      { type: "h3", text: "How to File LUT (Annual Filing)" },
      { type: "steps", items: [
        "Login to gst.gov.in",
        "Navigate to <em>Services \u2192 Refunds \u2192 Furnish Letter of Undertaking (LUT)</em>",
        "Select the financial year",
        "Fill in undertaking details and authorised signatory",
        "Submit \u2014 LUT is valid for the entire financial year",
        "No documents need to be physically submitted; it's fully online"
      ] },
      { type: "p", text: "<strong>LUT must be filed before the first export of the year.</strong> Exporting without a valid LUT means you must pay IGST upfront and then claim a refund \u2014 a cash flow disadvantage." },
      { type: "h2", text: "GST Refund for Exporters: Two Types" },
      { type: "h3", text: "Type 1 \u2014 Refund of IGST Paid on Exports" },
      { type: "p", text: "If you paid IGST on exports (no LUT):" },
      { type: "steps", items: [
        "The shipping bill filed at customs serves as the refund application",
        "The system automatically processes the refund based on GSTR-1 and shipping bill data",
        "Refund is credited to your bank account \u2014 typically within 60 days"
      ] },
      { type: "h3", text: "Type 2 \u2014 Refund of Accumulated ITC (Under LUT)" },
      { type: "p", text: "If you exported under LUT (zero IGST paid):" },
      { type: "steps", items: [
        "File <strong>Form RFD-01</strong> on the GST portal",
        "Claim refund of ITC accumulated on inputs used for zero-rated supplies",
        "The refund is calculated as: (Turnover of zero-rated supply \xF7 Total turnover) \xD7 Net ITC"
      ] },
      { type: "p", text: "<strong>Timeline:</strong> Refunds are to be processed within 60 days of complete application. If delayed, the government pays 6% p.a. interest." },
      { type: "h2", text: "Export of Services: Special Conditions" },
      { type: "p", text: "Exporting services qualifies for zero-rating only if <strong>all five conditions</strong> are met:" },
      { type: "steps", items: [
        "The supplier is located in India",
        "The recipient is located outside India",
        "The place of supply is outside India",
        "Payment is received in foreign currency (convertible foreign exchange or INR from a non-resident account)",
        "The supplier and recipient are not merely establishments of the same entity"
      ] },
      { type: "p", text: "<strong>Common pitfall:</strong> Software companies billing foreign group companies in INR often fail condition 4 \u2014 the export may not qualify for zero-rating unless foreign exchange is actually received." },
      { type: "h2", text: "SEZ Supplies: Treated Like Exports" },
      { type: "p", text: "Supplies to <strong>Special Economic Zones (SEZ)</strong> units and developers are also treated as zero-rated supplies:" },
      { type: "ul", items: [
        "No GST charged on SEZ supplies (or IGST charged and refunded)",
        "ITC on inputs fully available",
        "Same LUT mechanism applies \u2014 file LUT to supply to SEZ without paying IGST"
      ] },
      { type: "p", text: "SEZ buyers also have their own GST registration and cannot claim ITC on domestic purchases \u2014 they can only claim refund of IGST paid on imports or supplies received from DTA (Domestic Tariff Area)." },
      { type: "h2", text: "High Sea Sales: When GST Doesn't Apply" },
      { type: "p", text: "High Sea Sales \u2014 sales of imported goods while the vessel is still at sea, before customs clearance \u2014 are <strong>outside the scope of GST</strong>. Only the final importer who clears customs pays IGST. The intervening high-sea sale is not taxed under GST." },
      { type: "p", text: "However, high-sea sales must follow strict documentation: the sale agreement and endorsement of the Bill of Lading must occur before customs clearance." },
      { type: "h2", text: "Common Import-Export GST Mistakes" },
      { type: "steps", items: [
        "<strong>Not filing LUT at the start of the financial year</strong> \u2014 forces you to pay IGST upfront and wait for refund",
        "<strong>Not claiming ITC on IGST paid at customs</strong> \u2014 many businesses miss this, paying out of cash unnecessarily",
        "<strong>Importing services without paying RCM</strong> \u2014 a common compliance gap; the department tracks outward remittances",
        "<strong>Not matching shipping bills with GSTR-1</strong> \u2014 export refunds require shipping bill data to match GSTR-1 Table 6 entries exactly",
        "<strong>Treating all export receipts in INR as non-qualifying</strong> \u2014 some INR receipts from specific accounts qualify; verify with your bank",
        "<strong>Not accepting import BoEs in IMS</strong> \u2014 since October 2025, BoEs appear in IMS; failure to accept delays ITC flow into GSTR-2B"
      ] },
      { type: "h2", text: "Key Portals and Resources" },
      { type: "table", headers: ["Resource", "URL"], rows: [
        ["ICEGATE (customs clearance)", '<a href="https://www.icegate.gov.in" target="_blank" rel="noopener noreferrer">icegate.gov.in</a>'],
        ["DGFT (export-import policy)", '<a href="https://www.dgft.gov.in" target="_blank" rel="noopener noreferrer">dgft.gov.in</a>'],
        ["GST portal (LUT filing, refunds)", '<a href="https://www.gst.gov.in" target="_blank" rel="noopener noreferrer">gst.gov.in</a>'],
        ["CBIC customs duty search", '<a href="https://www.cbic.gov.in" target="_blank" rel="noopener noreferrer">cbic.gov.in</a>'],
        ["Foreign Trade Policy 2023", '<a href="https://www.dgft.gov.in" target="_blank" rel="noopener noreferrer">dgft.gov.in</a>']
      ] },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "GST on imports and exports is built around a straightforward principle: collect IGST on imports (recoverable as ITC), and zero-rate exports (with full ITC refund). The complexity lies in the details \u2014 RCM on imported services, LUT filing, refund mechanics, and now the IMS integration for import BoEs." },
      { type: "p", text: "<strong>Your import-export GST checklist:</strong>" },
      { type: "checklist", items: [
        { mark: "\u2705", html: "File LUT at the start of every financial year before first export" },
        { mark: "\u2705", html: "Claim IGST paid on all imports as ITC in GSTR-3B" },
        { mark: "\u2705", html: "Self-assess and pay RCM on all imported services" },
        { mark: "\u2705", html: "Accept import BoEs in IMS (October 2025 requirement)" },
        { mark: "\u2705", html: "File shipping bills at customs matching your GSTR-1 Table 6 data" },
        { mark: "\u2705", html: "Track accumulated ITC and file RFD-01 refund applications regularly" }
      ] },
      { type: "p", text: 'Use <a href="https://gstcalculator.me">gstcalculator.me</a> to compute the IGST component on any import transaction \u2014 essential for accurate BoE assessment and ITC planning.' },
      { type: "p", text: 'Related: <a href="/blog/gstin-format-verification-guide">GSTIN Format &amp; Verification Guide</a> \xB7 <a href="/blog/e-invoicing-gst-india-2025">E-Invoicing Under GST India 2025</a> \xB7 <a href="/blog/input-tax-credit-gst">Input Tax Credit Under GST</a> \xB7 <a href="/blog/invoice-management-system-ims-gst-guide">Invoice Management System (IMS) Guide</a>' },
      { type: "cta", title: "Compute IGST on any import", text: "Enter the post-customs taxable value and pick the IGST rate \u2014 instant tax & ITC numbers for your BoE." }
    ]
  },
  // New blog posts - added 2026-05-12
  {
    slug: "how-to-file-gstr-1",
    title: "How to File GSTR-1 Online: Complete Step-by-Step Guide (2025\u201326)",
    description: "Complete guide to filing GSTR-1 on the GST portal \u2014 due dates, who must file, step-by-step process, common mistakes, and 2025 rule changes. Updated for FY 2025-26.",
    category: "GST Returns Filing",
    readTime: "12 min",
    date: "2025-05-05",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=75&auto=format&fit=crop", alt: "Tax filing documents and calculator on a desk" },
      { type: "lead", text: "If you're a GST-registered business in India, GSTR-1 is the return you'll deal with most frequently. Every sale you make, every invoice you raise, every credit note you issue \u2014 all of it gets reported here. Yet despite how central it is to GST compliance, a surprising number of businesses file it incorrectly, miss due dates, or don't fully understand how their GSTR-1 directly affects their buyers' ability to claim Input Tax Credit (ITC)." },
      { type: "p", text: "This guide covers everything: what GSTR-1 is, who files it, the exact due dates for FY 2025\u201326, a step-by-step portal walkthrough, and the critical 2025 rule changes you cannot afford to miss." },
      { type: "highlight", html: "<strong>\u26A1 Critical 2025 Update:</strong> From July 2025, <strong>Table 3 of GSTR-3B is hard-locked</strong> \u2014 it auto-fills directly from your GSTR-1 data and cannot be edited. Any error in GSTR-1 flows straight into your tax payment return. Getting GSTR-1 right has never been more important." },
      { type: "h2", text: "What Is GSTR-1 and Why Does It Matter?" },
      { type: "p", text: "GSTR-1 is a <strong>monthly or quarterly return</strong> that every GST-registered supplier must file to report all outward supplies \u2014 meaning all sales and services provided during that period. It includes:" },
      { type: "ul", items: ["Invoices issued to GST-registered buyers (B2B)", "Sales to unregistered buyers (B2C)", "Credit notes and debit notes", "Exports and supplies to SEZ units", "Advance receipts"] },
      { type: "p", text: "Why does accuracy matter so much? Because the moment you file your GSTR-1, it <strong>auto-populates your buyers' GSTR-2B</strong> \u2014 the document they use to claim Input Tax Credit. An error in your GSTR-1 doesn't just affect you. It blocks your customers from claiming what they're owed, damaging your business relationships and your reputation as a vendor." },
      { type: "image", src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=75&auto=format&fit=crop", alt: "Accountant reviewing GST invoices and spreadsheets" },
      { type: "h2", text: "Who Must File GSTR-1?" },
      { type: "h3", text: "Who Is Required to File" },
      { type: "p", text: "All regular GST-registered taxpayers must file GSTR-1, including:" },
      { type: "ul", items: ["Regular taxpayers (monthly or quarterly depending on turnover)", "SEZ units and SEZ developers", "Casual taxable persons", "E-commerce operators collecting TCS under Section 52"] },
      { type: "h3", text: "Who Is Exempt from GSTR-1" },
      { type: "p", text: "The following categories do <strong>not</strong> file GSTR-1 and instead file their own specific returns:" },
      { type: "table", headers: ["Category", "Files Instead"], rows: [["Composition scheme taxpayers", "CMP-08 (quarterly)"], ["Input Service Distributors (ISD)", "GSTR-6"], ["Non-resident taxable persons (NRTP)", "GSTR-5"], ["TDS deductors (Govt. entities)", "GSTR-7"], ["TCS collectors (e-commerce operators)", "GSTR-8"], ["OIDAR service providers", "GSTR-5A"]] },
      { type: "highlight", html: "<strong>\u{1F4CB} Important:</strong> GSTR-1 must be filed even if there are <strong>zero transactions</strong> in the period. A nil return is mandatory \u2014 skipping it attracts late fees and blocks your next period's GSTR-3B." },
      { type: "h2", text: "GSTR-1 Due Dates for FY 2025\u201326" },
      { type: "p", text: "Your filing frequency depends on your annual aggregate turnover (AATO) in the previous financial year." },
      { type: "table", headers: ["Filer Type", "Turnover", "Due Date"], rows: [["Monthly filer", "Above \u20B95 Crore", "<strong>11th</strong> of following month"], ["QRMP quarterly filer", "Up to \u20B95 Crore", "<strong>13th</strong> of month after quarter end"], ["IFF (optional monthly upload)", "QRMP filers only", "<strong>13th</strong> of months 1 & 2"]] },
      { type: "h3", text: "QRMP Quarter End Dates" },
      { type: "p", text: "For quarterly filers, GSTR-1 is due by the 13th of: <strong>July</strong> (Q1), <strong>October</strong> (Q2), <strong>January</strong> (Q3), and <strong>April</strong> (Q4)." },
      { type: "h3", text: "What Is IFF?" },
      { type: "p", text: "The <strong>Invoice Furnishing Facility</strong> allows QRMP-scheme taxpayers to optionally upload B2B invoice details for months 1 and 2 of each quarter \u2014 so their buyers don't have to wait until the quarterly GSTR-1 to claim ITC. It's optional, but practically essential if you have large B2B clients who need monthly ITC." },
      { type: "highlight", html: '<strong>\u{1F4A1} Pro Tip:</strong> Use <a href="https://gstcalculator.me">gstcalculator.me</a> to verify the exact GST amounts on each invoice before filing \u2014 a mismatch between your invoice and portal data is the #1 source of GSTR-1 errors.' },
      { type: "h2", text: "What You Need Before Filing GSTR-1" },
      { type: "ul", items: ["<strong>Active GSTIN</strong> and valid login credentials for gst.gov.in", "<strong>All sales invoices</strong> for the period \u2014 B2B (with buyer GSTIN) and B2C", "<strong>Credit notes and debit notes</strong> issued during the period", "<strong>HSN codes</strong> for all goods/services (6-digit for B2B if turnover > \u20B95 Cr)", "<strong>Export details</strong> \u2014 shipping bill numbers and port codes if applicable", "<strong>DSC or EVC</strong> for signing and filing"] },
      { type: "h2", text: "Step-by-Step: How to File GSTR-1 Online" },
      { type: "image", src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=75&auto=format&fit=crop", alt: "Person filing taxes online on a laptop" },
      { type: "p", text: "Follow these steps on the official GST portal at <strong>gst.gov.in</strong>:" },
      { type: "h3", text: "Step 1 \u2014 Login to gst.gov.in" },
      { type: "p", text: "Enter your GSTIN/username and password. On the homepage, you can see the return filing status for your last five tax periods at a glance." },
      { type: "h3", text: "Step 2 \u2014 Navigate to Returns Dashboard" },
      { type: "p", text: "Go to <em>Services \u2192 Returns \u2192 Returns Dashboard</em>. Select the Financial Year and the return period (month or quarter) from the dropdown, then click Search." },
      { type: "h3", text: "Step 3 \u2014 Open GSTR-1 and Select Prepare Online" },
      { type: "p", text: "Click on the GSTR-1 tile. You'll see two options: <strong>Prepare Online</strong> (enter data directly on portal) or <strong>Prepare Offline</strong> (upload JSON). For most businesses, Prepare Online is easiest." },
      { type: "h3", text: "Step 4 \u2014 Fill the Invoice Tables" },
      { type: "p", text: "Enter data across the relevant tables:" },
      { type: "ul", items: ["<strong>Table 4</strong> \u2014 B2B invoices (with buyer GSTIN)", "<strong>Table 5</strong> \u2014 Large B2C invoices (>\u20B91 lakh, inter-state)", "<strong>Table 6</strong> \u2014 Exports", "<strong>Table 7</strong> \u2014 B2C summary (all remaining B2C)", "<strong>Table 9/10/11</strong> \u2014 Amendments from previous periods"] },
      { type: "h3", text: "Step 5 \u2014 Fill Table 12 \u2014 HSN Summary (B2B and B2C Separately)" },
      { type: "p", text: "This is the most changed table in 2025. Table 12 is now split into two tabs: one for B2B supplies and one for B2C. <strong>You cannot combine them</strong> \u2014 doing so will cause your return to be rejected. Select HSN codes from the dropdown (manual entry removed from February 2025)." },
      { type: "h3", text: "Step 6 \u2014 Fill Table 13 \u2014 Document Summary (Mandatory from May 2025)" },
      { type: "p", text: "Report your invoice series \u2014 including invoices issued, credit notes, debit notes, and their serial number ranges. This table is now mandatory; leaving it blank will block submission." },
      { type: "h3", text: "Step 7 \u2014 Preview and Generate Summary" },
      { type: "p", text: `Click "Preview" to download the draft GSTR-1 PDF. Review every figure \u2014 once submitted, GSTR-1 cannot be revised. Corrections can only be made in the next period's amendment tables.` },
      { type: "h3", text: "Step 8 \u2014 File with DSC or EVC" },
      { type: "p", text: "Check the declaration box, select the authorised signatory, and file using your <strong>Digital Signature Certificate (DSC)</strong> or <strong>Electronic Verification Code (EVC)</strong> \u2014 an OTP sent to your registered mobile. Save the ARN (Acknowledgement Reference Number) for your records." },
      { type: "h2", text: "2025\u201326 Rule Changes You Must Know" },
      { type: "table", headers: ["Change", "Effective From", "Impact"], rows: [["Table 12 bifurcated: B2B & B2C separate tabs", "April 2025", "Return rejected if merged"], ["Table 13 (document summary) mandatory", "May 2025", "Blocks filing if blank"], ["HSN codes via dropdown only \u2014 no manual entry", "February 2025", "Use portal HSN search"], ["GSTR-3B Table 3 hard-locked from GSTR-1 data", "July 2025", "Cannot fix in GSTR-3B"], ["3-year lock: old returns cannot be filed", "July 2025", "Missed periods lost forever"]] },
      { type: "warn", html: "<strong>\u{1F6A8} Critical:</strong> From <strong>July 2025</strong>, GSTR-3B's outward supply figures (Table 3) are automatically locked to whatever you filed in GSTR-1. If you make an error in GSTR-1, you <strong>cannot correct it in GSTR-3B</strong>. The only fix is to file a GSTR-1A amendment <em>before</em> submitting GSTR-3B." },
      { type: "image", src: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=75&auto=format&fit=crop", alt: "Businessman reviewing financial compliance documents carefully" },
      { type: "h2", text: "Common Mistakes to Avoid" },
      { type: "ul", items: ["<strong>Merging B2B and B2C in Table 12</strong> \u2014 The portal will reject the return from April 2025. Each type needs its own row.", "<strong>Wrong or missing HSN codes</strong> \u2014 Incorrect HSN codes attract penalties under Section 122 of the CGST Act and can block your buyers' ITC claims.", "<strong>Skipping nil GSTR-1</strong> \u2014 Even with zero sales, you must file a nil return or face late fees and blocked GSTR-3B filing.", "<strong>Filing GSTR-3B before GSTR-1</strong> \u2014 Since July 2025, GSTR-1 data locks into GSTR-3B automatically. Always file GSTR-1 first.", "<strong>Not using IFF under QRMP</strong> \u2014 If you have large B2B buyers, failing to upload invoices via IFF monthly delays their ITC, straining business relationships."] },
      { type: "h2", text: "Late Fees for Missing the GSTR-1 Deadline" },
      { type: "p", text: "Missing the GSTR-1 due date triggers automatic late fees from Day 1:" },
      { type: "table", headers: ["Annual Turnover", "Max Late Fee (with liability)", "Max Late Fee (nil return)"], rows: [["Up to \u20B91.5 Crore", "\u20B92,000", "\u20B9500"], ["\u20B91.5 Crore \u2013 \u20B95 Crore", "\u20B95,000", "\u20B9500"], ["Above \u20B95 Crore", "\u20B910,000", "\u20B91,000"]] },
      { type: "p", text: "The per-day rate is <strong>\u20B950/day</strong> (\u20B925 CGST + \u20B925 SGST) for returns with tax liability, and <strong>\u20B920/day</strong> for nil returns \u2014 capped at the amounts above." },
      { type: "p", text: "Late GSTR-1 also has a domino effect: <strong>your buyers cannot claim ITC</strong> on your invoices until you file, and <strong>you cannot file your own GSTR-3B</strong> for subsequent periods if GSTR-1 is pending." },
      { type: "h2", text: "GSTR-1 vs GSTR-3B \u2014 What's the Difference?" },
      { type: "table", headers: ["Feature", "GSTR-1", "GSTR-3B"], rows: [["Purpose", "Report all outward supplies (sales)", "Summary return \u2014 pay net GST"], ["Detail level", "Invoice-by-invoice", "Consolidated totals only"], ["Due date (monthly)", "11th of next month", "20th of next month"], ["Can be revised?", "No \u2014 amend in next period", "No"], ["Feeds into", "Buyer's GSTR-2B (their ITC)", "Tax payment ledger"], ["File order", "<strong>File first</strong>", "File after GSTR-1"]] },
      { type: "p", text: "Think of it this way: <strong>GSTR-1 is the ledger of what you sold. GSTR-3B is the cheque you write to the government.</strong> Both are required, and the sequence matters \u2014 always GSTR-1 first." },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "GSTR-1 filing is the foundation of your GST compliance. The key actions for FY 2025\u201326:" },
      { type: "checklist", items: [{ mark: "\u2705", html: "Split Table 12 into B2B and B2C (non-negotiable from April 2025)" }, { mark: "\u2705", html: "Fill Table 13 document summary every period (mandatory from May 2025)" }, { mark: "\u2705", html: "File GSTR-1 <em>before</em> GSTR-3B \u2014 Table 3 is now hard-locked" }, { mark: "\u2705", html: "Never miss a period \u2014 the 3-year lock makes old returns permanently unfixable" }] },
      { type: "p", text: `Set a recurring calendar reminder for the <strong>11th</strong> (or <strong>13th</strong> if you're on QRMP) every month. Use our <a href="https://gstcalculator.me">GST Calculator</a> to verify amounts before filing. And if you have complex transactions \u2014 exports, SEZ supplies, RCM purchases \u2014 consider GST filing software or a chartered accountant to avoid costly errors.` },
      { type: "p", text: 'Related: <a href="/blog/input-tax-credit-gst">Input Tax Credit Under GST</a> \xB7 <a href="/blog/cgst-sgst-igst-difference">CGST vs SGST vs IGST</a> \xB7 <a href="/blog/gst-invoice-format-india">GST Invoice Format</a>' }
    ]
  },
  {
    slug: "how-to-file-gstr-3b",
    title: "How to File GSTR-3B: Step-by-Step Guide with Due Dates (2025\u201326)",
    description: "Learn how to file GSTR-3B on the GST portal \u2014 due dates for monthly & QRMP filers, step-by-step process, ITC rules, and critical 2025 changes to locked auto-population.",
    category: "GST Returns Filing",
    readTime: "11 min",
    date: "2025-05-05",
    body: [
      { type: "image", src: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&q=75&auto=format&fit=crop", alt: "Person working on financial documents with a calculator" },
      { type: "lead", text: "GSTR-3B is the monthly or quarterly summary return where you declare your total sales, claim Input Tax Credit, and pay the net GST owed to the government. Unlike GSTR-1, it doesn't require invoice-level detail \u2014 but it does require you to get every consolidated number exactly right, because once filed, it <strong>cannot be revised</strong>." },
      { type: "p", text: "This guide walks you through what GSTR-3B is, who must file it, due dates for FY 2025\u201326, and a complete step-by-step filing walkthrough \u2014 including the landmark 2025 change that makes GSTR-1 accuracy more critical than ever." },
      { type: "highlight", html: "<strong>\u26A1 2025 Game Changer:</strong> From <strong>July 2025</strong>, Table 3 of GSTR-3B (outward supply liability) is <strong>auto-filled from GSTR-1 and locked</strong>. You can no longer manually edit your sales figures in GSTR-3B. Get GSTR-1 right first \u2014 always." },
      { type: "h2", text: "What Is GSTR-3B?" },
      { type: "p", text: "GSTR-3B is a <strong>consolidated summary return</strong> filed by all regular GST taxpayers. It reports:" },
      { type: "ul", items: ["Total value of outward supplies (sales) \u2014 now auto-populated from GSTR-1", "Eligible Input Tax Credit claimed", "Reverse Charge Mechanism (RCM) liability", "Net tax payable and payment details"] },
      { type: "p", text: "Unlike GSTR-1 which is a ledger of individual invoices, GSTR-3B deals only in totals. It is the return through which you actually <strong>pay your GST liability</strong> for the period." },
      { type: "h2", text: "Who Must File GSTR-3B?" },
      { type: "p", text: "<strong>Must file GSTR-3B:</strong>" },
      { type: "ul", items: ["All regular registered taxpayers", "SEZ units and SEZ developers", "Casual taxable persons"] },
      { type: "p", text: "<strong>Exempt from GSTR-3B:</strong>" },
      { type: "ul", items: ["Composition scheme taxpayers (file CMP-08 instead)", "Input Service Distributors", "Non-resident taxable persons", "TDS deductors and TCS collectors"] },
      { type: "h2", text: "GSTR-3B Due Dates for FY 2025\u201326" },
      { type: "image", src: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=75&auto=format&fit=crop", alt: "Calendar and deadline concept for tax filing" },
      { type: "h3", text: "Monthly Filers (Turnover > \u20B95 Crore)" },
      { type: "p", text: "Due on the <strong>20th of the following month</strong> for all states." },
      { type: "h3", text: "QRMP Quarterly Filers (Turnover \u2264 \u20B95 Crore)" },
      { type: "p", text: "Due dates vary by state group:" },
      { type: "table", headers: ["State Group", "Due Date"], rows: [["Group 1 (15 states/UTs incl. Maharashtra, Karnataka, Tamil Nadu, Gujarat)", "<strong>22nd</strong> of month after quarter"], ["Group 2 (remaining states/UTs incl. Delhi, UP, West Bengal, Rajasthan)", "<strong>24th</strong> of month after quarter"]] },
      { type: "h3", text: "PMT-06 \u2014 Monthly Tax Payment Under QRMP" },
      { type: "p", text: "Even though QRMP filers submit GSTR-3B quarterly, they must pay tax monthly via <strong>PMT-06 challan</strong> \u2014 due the <strong>25th of each month</strong> for months 1 and 2 of the quarter." },
      { type: "h2", text: "The 2025 Change That Changes Everything: GSTR-3B Is Now Partially Locked" },
      { type: "p", text: "This is the single most important update for FY 2025\u201326 \u2014 and most guides either miss it or bury it." },
      { type: "p", text: "<strong>What changed:</strong>" },
      { type: "ul", items: ["From <strong>July 2025</strong>: Table 3 (outward supply liability \u2014 your total GST on sales) is <strong>auto-populated from GSTR-1/1A/IFF and cannot be manually edited</strong> in GSTR-3B.", "From <strong>November 2025</strong>: Table 3.2 (inter-state supplies to unregistered persons, composition dealers, and UIN holders) is also locked."] },
      { type: "p", text: "<strong>What this means in practice:</strong>" },
      { type: "steps", items: ["If you made an error in GSTR-1, you <strong>cannot correct the sales figure in GSTR-3B</strong>.", "You must file a <strong>GSTR-1A amendment</strong> before submitting GSTR-3B for that period.", "The filing sequence is now non-negotiable: <strong>GSTR-1 first, verify the auto-populated figures, then file GSTR-3B.</strong>"] },
      { type: "warn", html: "<strong>\u{1F6A8} Do Not Skip This:</strong> If your GSTR-1 shows \u20B910 lakh in taxable sales but the actual figure was \u20B912 lakh, you will underpay tax in GSTR-3B automatically. The correction path is GSTR-1A, not GSTR-3B." },
      { type: "h2", text: "What to Prepare Before Filing GSTR-3B" },
      { type: "ul", items: ["<strong>GSTR-1 filed and submitted</strong> for the same period (mandatory first step)", "<strong>GSTR-2B downloaded</strong> \u2014 your auto-drafted ITC statement from supplier filings", "<strong>RCM liability details</strong> \u2014 purchases from unregistered dealers, specified services", "<strong>Cash ledger balance</strong> \u2014 verify if you have enough credit to offset liability", "<strong>Interest calculation</strong> \u2014 if paying after due date, compute 18% p.a. interest"] },
      { type: "highlight", html: '<strong>\u{1F4A1} Pro Tip:</strong> Use <a href="https://gstcalculator.me">gstcalculator.me</a> to quickly verify your CGST, SGST, and IGST breakdown before entering consolidated figures.' },
      { type: "h2", text: "Step-by-Step: How to File GSTR-3B Online" },
      { type: "image", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=75&auto=format&fit=crop", alt: "Step by step guide concept with laptop and documents" },
      { type: "h3", text: "Step 1 \u2014 Login and Go to Returns Dashboard" },
      { type: "p", text: "Login to gst.gov.in, navigate to <em>Services \u2192 Returns \u2192 Returns Dashboard</em>, select your Financial Year and return period, then click Search." },
      { type: "h3", text: "Step 2 \u2014 Click on GSTR-3B Tile \u2192 Prepare Online" },
      { type: "p", text: 'Select "Prepare Online" to fill the return directly on the portal.' },
      { type: "h3", text: "Step 3 \u2014 Answer the Questionnaire" },
      { type: "p", text: 'The portal first asks: "Do you have any supplies, inward supplies attracting reverse charge, or any taxes to pay?" If all figures are nil, you can select <strong>Yes to nil return</strong> here and skip directly to filing \u2014 a major time-saver.' },
      { type: "h3", text: "Step 4 \u2014 Review Auto-Populated Table 3 (Outward Supplies \u2014 Now Locked)" },
      { type: "p", text: "From July 2025, you'll see Table 3 is pre-filled and grayed out. <strong>Do not try to edit it.</strong> Verify the figures match your GSTR-1. If there's a discrepancy, stop \u2014 file GSTR-1A to amend GSTR-1 first, then return to GSTR-3B." },
      { type: "h3", text: "Step 5 \u2014 Fill Table 4 \u2014 Eligible ITC from GSTR-2B" },
      { type: "p", text: "Enter ITC available from GSTR-2B in four sub-sections:" },
      { type: "ul", items: ["<strong>4A(1)</strong> \u2014 Import of goods", "<strong>4A(2)</strong> \u2014 Import of services", "<strong>4A(3)</strong> \u2014 Inward supplies attracting reverse charge (other than 1 & 2)", "<strong>4A(5)</strong> \u2014 All other ITC (from your suppliers' GSTR-1)"] },
      { type: "p", text: "Also fill Table 4B \u2014 ITC that must be reversed (used for personal purposes, blocked credits under Section 17(5), etc.)" },
      { type: "h3", text: "Step 6 \u2014 Fill Table 5 \u2014 Exempt, Nil, Non-GST Inward Supplies" },
      { type: "p", text: "If you've received any purchases that are exempt from GST, nil-rated, or non-GST goods/services, report the consolidated value here." },
      { type: "h3", text: "Step 7 \u2014 Fill Interest and Late Fees (If Applicable)" },
      { type: "p", text: "If filing after the due date, compute and enter:" },
      { type: "ul", items: ["<strong>Interest:</strong> 18% p.a. on net tax liability from due date to payment date", "<strong>Late fee:</strong> As applicable per turnover slab"] },
      { type: "h3", text: "Step 8 \u2014 Save and Preview Draft" },
      { type: "p", text: 'Click "Save GSTR-3B" \u2014 this saves but does not submit. Download the preview PDF and verify all numbers one final time.' },
      { type: "h3", text: "Step 9 \u2014 Offset Tax Liability and Pay" },
      { type: "p", text: 'Click "Proceed to Payment." The portal shows your total tax liability and available ITC credit. Offset ITC against liability in the correct order:' },
      { type: "steps", items: ["<strong>IGST credit</strong> used first against IGST liability, then CGST, then SGST", "<strong>CGST credit</strong> against CGST only", "<strong>SGST credit</strong> against SGST only", "Remaining liability paid via cash ledger"] },
      { type: "h3", text: "Step 10 \u2014 File with DSC or EVC, Save ARN" },
      { type: "p", text: "After payment, check the declaration, select the authorised signatory, and file using DSC or EVC. Save the <strong>ARN</strong> (Acknowledgement Reference Number) \u2014 this is your proof of filing." },
      { type: "h2", text: "How to File a Nil GSTR-3B" },
      { type: "p", text: "If you had zero outward supplies, zero ITC claims, and zero tax to pay for the period:" },
      { type: "steps", items: ['Select "Yes" to nil return in the questionnaire (Step 3 above), OR', "File via <strong>SMS</strong> \u2014 send `NIL 3B [GSTIN] [Tax Period in MMYYYY]` to <strong>14409</strong> from your registered mobile. You'll receive an OTP; reply with `[GSTIN] [OTP]` to complete filing."] },
      { type: "p", text: "SMS nil filing is available for both monthly and quarterly filers." },
      { type: "h2", text: "ITC Rules in GSTR-3B \u2014 What You Can and Cannot Claim" },
      { type: "h3", text: "Eligible ITC (Table 4A)" },
      { type: "p", text: "You can claim ITC on:" },
      { type: "ul", items: ["Purchases used exclusively for taxable business purposes", "Capital goods used in the course of business", "Input services used for business"] },
      { type: "h3", text: "Ineligible ITC \u2014 Must Be Reversed (Table 4B)" },
      { type: "p", text: "You <strong>cannot</strong> claim ITC on:" },
      { type: "ul", items: ["Motor vehicles (with limited exceptions)", "Food, beverages, outdoor catering", "Health services and club memberships", "Personal use purchases", "Construction of immovable property"] },
      { type: "warn", html: "<strong>\u26A0\uFE0F Warning:</strong> Claiming ineligible ITC is a common GST audit trigger. The department can demand recovery of wrongly claimed ITC along with 18% interest and penalties up to 100% of the ITC amount." },
      { type: "h3", text: "ITC Utilisation Order" },
      { type: "table", headers: ["Use ITC of", "Against IGST", "Against CGST", "Against SGST/UTGST"], rows: [["IGST", "\u2705 First", "\u2705 After IGST exhausted", "\u2705 After IGST exhausted"], ["CGST", "\u274C", "\u2705", "\u274C"], ["SGST/UTGST", "\u274C", "\u274C", "\u2705"]] },
      { type: "h2", text: "Late Fee and Interest for GSTR-3B" },
      { type: "table", headers: ["", "Returns with Tax Liability", "Nil Returns"], rows: [["Per day late fee", "\u20B950 (\u20B925 CGST + \u20B925 SGST)", "\u20B920 (\u20B910 + \u20B910)"], ["Maximum (turnover \u2264 \u20B91.5 Cr)", "\u20B92,000", "\u20B9500"], ["Maximum (\u20B91.5 Cr \u2013 \u20B95 Cr)", "\u20B95,000", "\u20B9500"], ["Maximum (> \u20B95 Cr)", "\u20B910,000", "\u20B91,000"]] },
      { type: "p", text: "<strong>Interest on unpaid tax:</strong> 18% per annum from the due date to the actual date of payment, computed on the net tax liability after ITC offset." },
      { type: "h2", text: "Common Errors to Avoid" },
      { type: "ul", items: ["<strong>Not reconciling GSTR-2B before claiming ITC</strong> \u2014 Claiming ITC not reflected in GSTR-2B leads to notices and demands.", "<strong>Trying to edit locked Table 3</strong> \u2014 From July 2025, this is not possible. Fix errors via GSTR-1A instead.", "<strong>Missing PMT-06 payment under QRMP</strong> \u2014 Tax must be paid monthly even though the return is quarterly. Missing the 25th deadline attracts interest.", "<strong>Filing in wrong period</strong> \u2014 GSTR-3B cannot be transferred between periods once filed.", "<strong>Ignoring IGST utilisation order</strong> \u2014 Using CGST credit against SGST (or vice versa) is not permitted."] },
      { type: "image", src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=75&auto=format&fit=crop", alt: "Tax compliance checklist being reviewed" },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "GSTR-3B is where your GST compliance becomes real \u2014 it's the return that settles your tax account with the government. With the July 2025 locking of Table 3, the GSTR-1 \u2192 GSTR-3B sequence is now automated and enforced by the portal itself." },
      { type: "p", text: "Your FY 2025\u201326 checklist every period:" },
      { type: "steps", items: ["Reconcile invoices \u2192 File GSTR-1 by the 11th (or 13th for QRMP)", "Download GSTR-2B \u2192 Verify eligible ITC", "Review auto-populated Table 3 \u2192 File GSTR-1A if any correction needed", "File GSTR-3B by the 20th (or 22nd/24th for QRMP)", "Pay any remaining liability via cash ledger"] },
      { type: "p", text: 'Use our <a href="https://gstcalculator.me">GST Calculator</a> to verify your tax breakdowns before filing.' },
      { type: "p", text: 'Related: <a href="/blog/how-to-file-gstr-1">How to File GSTR-1</a> \xB7 <a href="/blog/input-tax-credit-gst">Input Tax Credit Under GST</a> \xB7 <a href="/blog/reverse-charge-mechanism-gst">Reverse Charge Mechanism</a>' }
    ]
  }
];
var getPost = (slug) => POSTS.find((p) => p.slug === slug);

// src/pages/Blog.tsx
import { jsx as jsx12, jsxs as jsxs9 } from "react/jsx-runtime";
var Blog = () => {
  useEffect6(() => {
    clearJsonLdScripts();
    setPageSeo({
      title: "GST Blog \u2014 Guides, Rates & Compliance Tips | GST Calculator",
      description: "Practical GST guides for Indian businesses: how to calculate GST, slabs explained, CGST vs SGST vs IGST, and GST for freelancers.",
      path: "/blog",
      keywords: "GST blog India, GST guides, GST rate slabs, CGST SGST IGST explained, GST for freelancers"
    });
    setBreadcrumbListSchema([
      { position: 1, name: "Home", item: "https://gstcalculator.me/" },
      { position: 2, name: "Blog", item: "https://gstcalculator.me/blog" }
    ]);
  }, []);
  return /* @__PURE__ */ jsxs9("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx12(SiteHeader_default, { active: "blog" }),
    /* @__PURE__ */ jsxs9("header", { className: "bg-primary-dark px-6 sm:px-8 pb-8 text-primary-foreground", children: [
      /* @__PURE__ */ jsxs9(Link3, { to: "/", className: "inline-flex items-center gap-1.5 text-primary-mid text-xs hover:text-primary-foreground mb-3", children: [
        /* @__PURE__ */ jsx12(ArrowLeft, { className: "h-3.5 w-3.5" }),
        " Back to calculator"
      ] }),
      /* @__PURE__ */ jsx12("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight", children: "GST Blog" }),
      /* @__PURE__ */ jsx12("p", { className: "text-primary-mid text-sm mt-1", children: "Guides, rate references and compliance tips for Indian businesses" })
    ] }),
    /* @__PURE__ */ jsx12("main", { className: "max-w-4xl mx-auto px-6 sm:px-8 py-8 grid gap-4", children: POSTS.map((p) => /* @__PURE__ */ jsxs9(
      Link3,
      {
        to: `/blog/${p.slug}`,
        className: "block bg-card rounded-2xl border border-border p-5 hover:border-primary-mid hover:shadow-md transition-all group",
        children: [
          /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2 text-[0.7rem] text-muted-foreground mb-2", children: [
            /* @__PURE__ */ jsx12("span", { className: "bg-primary-light text-primary-dark px-2 py-0.5 rounded-full font-semibold", children: p.category }),
            /* @__PURE__ */ jsxs9("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx12(Calendar, { className: "h-3 w-3" }),
              new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            ] }),
            /* @__PURE__ */ jsxs9("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx12(Clock, { className: "h-3 w-3" }),
              p.readTime
            ] })
          ] }),
          /* @__PURE__ */ jsx12("h2", { className: "text-lg font-bold text-foreground group-hover:text-primary-dark transition-colors", children: p.title }),
          /* @__PURE__ */ jsx12("p", { className: "text-sm text-muted-foreground mt-1.5 leading-relaxed", children: p.description })
        ]
      },
      p.slug
    )) }),
    /* @__PURE__ */ jsx12(SiteFooter_default, {})
  ] });
};
var Blog_default = Blog;

// src/pages/BlogPost.tsx
import { useEffect as useEffect7 } from "react";
import { Link as Link4, useParams } from "react-router-dom";
import { ArrowLeft as ArrowLeft2, Home } from "lucide-react";
import { jsx as jsx13, jsxs as jsxs10 } from "react/jsx-runtime";
var renderBlock = (b, i) => {
  switch (b.type) {
    case "lead":
      return /* @__PURE__ */ jsx13(
        "p",
        {
          className: "text-base sm:text-lg text-primary-dark italic border-l-[3px] border-primary-mid bg-primary-light/40 rounded-r-lg px-4 py-3 leading-relaxed",
          children: b.text
        },
        i
      );
    case "p":
      return /* @__PURE__ */ jsx13(
        "p",
        {
          className: "text-[15px] text-foreground leading-relaxed [&_a]:text-primary-dark [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary-mid",
          dangerouslySetInnerHTML: { __html: b.text }
        },
        i
      );
    case "h2":
      return /* @__PURE__ */ jsx13(
        "h2",
        {
          className: "text-xl sm:text-2xl font-bold text-foreground mt-8 pt-4 border-t border-border",
          children: b.text
        },
        i
      );
    case "h3":
      return /* @__PURE__ */ jsx13("h3", { className: "text-base sm:text-lg font-bold text-primary-dark mt-5", children: b.text }, i);
    case "stat":
      return /* @__PURE__ */ jsxs10(
        "div",
        {
          className: "bg-card border-l-4 border-primary-mid rounded-r-xl px-5 py-4 shadow-sm",
          children: [
            /* @__PURE__ */ jsx13("div", { className: "text-3xl font-bold text-primary-dark font-serif", children: b.num }),
            /* @__PURE__ */ jsx13("div", { className: "text-xs text-muted-foreground mt-1", children: b.label })
          ]
        },
        i
      );
    case "statGrid":
      return /* @__PURE__ */ jsx13("div", { className: "grid grid-cols-2 gap-3", children: b.items.map((it, j) => /* @__PURE__ */ jsxs10(
        "div",
        {
          className: "bg-card border border-border rounded-xl p-4 text-center",
          children: [
            /* @__PURE__ */ jsx13("div", { className: "text-lg font-bold text-primary-dark", children: it.n }),
            /* @__PURE__ */ jsx13("div", { className: "text-[11px] text-muted-foreground uppercase tracking-wider mt-1 leading-snug", children: it.l })
          ]
        },
        j
      )) }, i);
    case "slabGrid":
      return /* @__PURE__ */ jsx13("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5", children: b.items.map((it, j) => /* @__PURE__ */ jsxs10(
        "div",
        {
          className: "bg-card border border-border rounded-lg p-3 text-center",
          children: [
            /* @__PURE__ */ jsx13("div", { className: "text-xl font-bold text-primary-dark", children: it.r }),
            /* @__PURE__ */ jsx13("div", { className: "text-[10px] text-muted-foreground uppercase tracking-wide mt-1 leading-snug", children: it.l })
          ]
        },
        j
      )) }, i);
    case "formula":
      return /* @__PURE__ */ jsxs10("div", { className: "bg-card border border-border rounded-xl p-5", children: [
        /* @__PURE__ */ jsx13("div", { className: "text-sm font-bold text-foreground mb-2", children: b.title }),
        /* @__PURE__ */ jsx13("pre", { className: "text-[13px] text-muted-foreground bg-primary-light/40 rounded-md p-3 whitespace-pre-wrap font-mono leading-relaxed", children: b.code })
      ] }, i);
    case "highlight":
      return /* @__PURE__ */ jsx13(
        "div",
        {
          className: "bg-primary-light/60 border-l-[3px] border-primary-mid rounded-r-lg px-5 py-4 text-sm text-primary-dark leading-relaxed",
          dangerouslySetInnerHTML: { __html: b.html }
        },
        i
      );
    case "warn":
      return /* @__PURE__ */ jsx13(
        "div",
        {
          className: "bg-yellow-50 border-l-[3px] border-yellow-500 rounded-r-lg px-5 py-4 text-sm text-yellow-900 leading-relaxed",
          dangerouslySetInnerHTML: { __html: b.html }
        },
        i
      );
    case "checklist":
      return /* @__PURE__ */ jsx13("div", { className: "flex flex-col gap-2.5", children: b.items.map((it, j) => /* @__PURE__ */ jsxs10(
        "div",
        {
          className: "flex gap-3 items-start bg-card border border-border rounded-xl px-4 py-3",
          children: [
            /* @__PURE__ */ jsx13("span", { className: "text-primary-dark font-bold text-sm flex-shrink-0 mt-0.5 min-w-[1rem]", children: it.mark ?? "\u2022" }),
            /* @__PURE__ */ jsx13(
              "p",
              {
                className: "text-[15px] text-foreground leading-relaxed flex-1 [&_a]:text-primary-dark [&_a]:underline",
                dangerouslySetInnerHTML: { __html: it.html }
              }
            )
          ]
        },
        j
      )) }, i);
    case "invoiceFields":
      return /* @__PURE__ */ jsx13("div", { className: "flex flex-col", children: b.items.map((it, j) => /* @__PURE__ */ jsxs10(
        "div",
        {
          className: "flex gap-3 items-start py-3 border-b border-border last:border-b-0",
          children: [
            /* @__PURE__ */ jsx13("div", { className: "bg-primary-dark text-primary-foreground text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", children: j + 1 }),
            /* @__PURE__ */ jsxs10("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx13("div", { className: "text-sm font-bold text-foreground mb-1", children: it.title }),
              /* @__PURE__ */ jsx13("p", { className: "text-[14px] text-muted-foreground leading-relaxed", children: it.text })
            ] })
          ]
        },
        j
      )) }, i);
    case "example":
      return /* @__PURE__ */ jsxs10("div", { className: "bg-card border border-border rounded-xl p-5", children: [
        /* @__PURE__ */ jsx13("div", { className: "text-[11px] font-bold text-primary-dark uppercase tracking-wider mb-2", children: b.title }),
        /* @__PURE__ */ jsx13("div", { className: "space-y-1.5", children: b.lines.map((l, j) => /* @__PURE__ */ jsx13(
          "p",
          {
            className: "text-sm text-foreground leading-relaxed",
            dangerouslySetInnerHTML: { __html: l }
          },
          j
        )) })
      ] }, i);
    case "quote":
      return /* @__PURE__ */ jsx13(
        "blockquote",
        {
          className: "border-l-[3px] border-primary-mid pl-4 py-2 italic text-primary-dark bg-primary-light/30 rounded-r-md",
          children: b.text
        },
        i
      );
    case "steps":
      return /* @__PURE__ */ jsx13("div", { className: "space-y-3", children: b.items.map((s, j) => /* @__PURE__ */ jsxs10("div", { className: "flex gap-3 items-start", children: [
        /* @__PURE__ */ jsx13("div", { className: "bg-primary-dark text-primary-foreground text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", children: j + 1 }),
        /* @__PURE__ */ jsx13("p", { className: "text-[15px] text-foreground leading-relaxed flex-1", dangerouslySetInnerHTML: { __html: s } })
      ] }, j)) }, i);
    case "cta":
      return /* @__PURE__ */ jsxs10(
        "div",
        {
          className: "bg-primary-dark rounded-2xl p-6 sm:p-8 text-center my-4",
          children: [
            /* @__PURE__ */ jsx13("h3", { className: "text-lg sm:text-xl font-bold text-primary-foreground mb-2", children: b.title }),
            /* @__PURE__ */ jsx13("p", { className: "text-sm text-primary-mid mb-5", children: b.text }),
            /* @__PURE__ */ jsx13(
              Link4,
              {
                to: "/",
                className: "inline-block bg-primary-foreground text-primary-dark font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity",
                children: "Open GST Calculator \u2192"
              }
            )
          ]
        },
        i
      );
    case "image":
      return /* @__PURE__ */ jsx13(
        "img",
        {
          src: b.src,
          alt: b.alt,
          loading: "lazy",
          className: "w-full rounded-xl border border-border my-2"
        },
        i
      );
    case "table":
      return /* @__PURE__ */ jsx13("div", { className: "overflow-x-auto rounded-xl border border-border", children: /* @__PURE__ */ jsxs10("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx13("thead", { className: "bg-primary-light/40", children: /* @__PURE__ */ jsx13("tr", { children: b.headers.map((h, j) => /* @__PURE__ */ jsx13("th", { className: "text-left font-bold text-primary-dark px-3 py-2 border-b border-border", children: h }, j)) }) }),
        /* @__PURE__ */ jsx13("tbody", { children: b.rows.map((row, r) => /* @__PURE__ */ jsx13("tr", { className: "odd:bg-card even:bg-background", children: row.map((cell, c) => /* @__PURE__ */ jsx13(
          "td",
          {
            className: "px-3 py-2 border-b border-border last:border-b-0 text-foreground align-top",
            dangerouslySetInnerHTML: { __html: cell }
          },
          c
        )) }, r)) })
      ] }) }, i);
    case "ul":
      return /* @__PURE__ */ jsx13("ul", { className: "list-disc pl-5 space-y-1.5 text-[15px] text-foreground leading-relaxed marker:text-primary-mid", children: b.items.map((it, j) => /* @__PURE__ */ jsx13("li", { dangerouslySetInnerHTML: { __html: it } }, j)) }, i);
    case "divider":
      return /* @__PURE__ */ jsx13("hr", { className: "border-t border-border my-2" }, i);
    case "sourceLink":
      return /* @__PURE__ */ jsx13("p", { className: "text-xs", children: /* @__PURE__ */ jsx13(
        "a",
        {
          href: b.href,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-primary-dark underline underline-offset-2 hover:text-primary-mid",
          children: b.label ?? "Source"
        }
      ) }, i);
  }
};
var BlogPost = () => {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : void 0;
  useEffect7(() => {
    if (post) {
      clearJsonLdScripts();
      setPageSeo({
        title: `${post.title} | GST Calculator`,
        description: post.description,
        path: `/blog/${post.slug}`,
        type: "article"
      });
      setArticleSchema({
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date
      });
      setBreadcrumbListSchema([
        { position: 1, name: "Home", item: "https://gstcalculator.me/" },
        { position: 2, name: "Blog", item: "https://gstcalculator.me/blog" },
        { position: 3, name: post.title, item: `https://gstcalculator.me/blog/${post.slug}` }
      ]);
    }
  }, [post]);
  if (!post) {
    return /* @__PURE__ */ jsx13("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxs10("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx13("p", { className: "text-muted-foreground mb-3", children: "Post not found." }),
      /* @__PURE__ */ jsx13(Link4, { to: "/blog", className: "text-primary-dark underline", children: "Back to blog" })
    ] }) });
  }
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 4);
  return /* @__PURE__ */ jsxs10("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx13(SiteHeader_default, { active: "blog" }),
    /* @__PURE__ */ jsxs10("main", { className: "max-w-3xl mx-auto px-6 sm:px-8 py-8", children: [
      /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-4 text-xs mb-4", children: [
        /* @__PURE__ */ jsxs10(
          Link4,
          {
            to: "/blog",
            className: "inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground",
            children: [
              /* @__PURE__ */ jsx13(ArrowLeft2, { className: "h-3.5 w-3.5" }),
              " All posts"
            ]
          }
        ),
        /* @__PURE__ */ jsxs10(
          Link4,
          {
            to: "/",
            className: "inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground",
            children: [
              /* @__PURE__ */ jsx13(Home, { className: "h-3.5 w-3.5" }),
              " Home"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs10("article", { className: "bg-card rounded-2xl border border-border p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-2 text-[0.7rem] text-muted-foreground mb-3", children: [
          /* @__PURE__ */ jsx13("span", { className: "bg-primary-light text-primary-dark px-2 py-0.5 rounded-full font-semibold", children: post.category }),
          /* @__PURE__ */ jsx13("span", { children: new Date(post.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }) }),
          /* @__PURE__ */ jsxs10("span", { children: [
            "\xB7 ",
            post.readTime,
            " read"
          ] })
        ] }),
        /* @__PURE__ */ jsx13("h1", { className: "text-2xl sm:text-3xl font-bold tracking-tight mb-5 text-foreground", children: post.title }),
        /* @__PURE__ */ jsx13("div", { className: "space-y-4", children: post.body.map(renderBlock) }),
        /* @__PURE__ */ jsxs10("div", { className: "bg-background border border-border rounded-2xl p-5 mt-10", children: [
          /* @__PURE__ */ jsx13("h3", { className: "text-sm font-bold text-foreground mb-3", children: "More from GST Calculator" }),
          /* @__PURE__ */ jsx13("div", { className: "flex flex-col gap-2.5", children: related.map((r) => /* @__PURE__ */ jsxs10(
            Link4,
            {
              to: `/blog/${r.slug}`,
              className: "flex gap-2.5 items-start group",
              children: [
                /* @__PURE__ */ jsx13("span", { className: "text-[10px] bg-primary-light text-primary-dark px-2 py-0.5 rounded-full font-semibold border border-primary-mid/30 flex-shrink-0 mt-0.5", children: r.category }),
                /* @__PURE__ */ jsx13("span", { className: "text-sm text-foreground group-hover:text-primary-dark transition-colors leading-snug", children: r.title })
              ]
            },
            r.slug
          )) })
        ] }),
        /* @__PURE__ */ jsxs10("div", { className: "flex items-center gap-4 text-sm mt-6", children: [
          /* @__PURE__ */ jsxs10(Link4, { to: "/blog", className: "text-primary-dark hover:underline inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx13(ArrowLeft2, { className: "h-3.5 w-3.5" }),
            " All articles"
          ] }),
          /* @__PURE__ */ jsxs10(Link4, { to: "/", className: "text-primary-dark hover:underline inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx13(Home, { className: "h-3.5 w-3.5" }),
            " Back to calculator"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx13(SiteFooter_default, {})
  ] });
};
var BlogPost_default = BlogPost;

// src/pages/Privacy.tsx
import { useEffect as useEffect8 } from "react";
import { Link as Link5 } from "react-router-dom";
import { ArrowLeft as ArrowLeft3 } from "lucide-react";
import { jsx as jsx14, jsxs as jsxs11 } from "react/jsx-runtime";
var Privacy = () => {
  useEffect8(() => {
    setPageSeo({
      title: "Privacy Policy | GST Calculator",
      description: "How GST Calculator handles your data: localStorage usage, no server-side logging of financial inputs, AdSense & Analytics cookies, and how to clear stored preferences.",
      path: "/privacy",
      keywords: "GST Calculator privacy policy, gstcalculator.me privacy, localStorage GST calculator, AdSense cookies, Google Analytics"
    });
  }, []);
  const lastUpdated = "April 2025";
  return /* @__PURE__ */ jsxs11("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx14(SiteHeader_default, { active: "privacy" }),
    /* @__PURE__ */ jsxs11("header", { className: "bg-primary-dark px-6 sm:px-8 pb-8 text-primary-foreground", children: [
      /* @__PURE__ */ jsxs11(Link5, { to: "/", className: "inline-flex items-center gap-1.5 text-primary-mid text-xs hover:text-primary-foreground mb-3", children: [
        /* @__PURE__ */ jsx14(ArrowLeft3, { className: "h-3.5 w-3.5" }),
        " Back to calculator"
      ] }),
      /* @__PURE__ */ jsx14("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight", children: "Privacy Policy" }),
      /* @__PURE__ */ jsxs11("p", { className: "text-primary-mid text-sm mt-1", children: [
        "Last updated: ",
        lastUpdated
      ] })
    ] }),
    /* @__PURE__ */ jsx14("main", { className: "max-w-3xl mx-auto px-6 sm:px-8 py-8", children: /* @__PURE__ */ jsxs11("article", { className: "bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-foreground", children: [
      /* @__PURE__ */ jsx14("section", { children: /* @__PURE__ */ jsxs11("p", { className: "text-muted-foreground", children: [
        "GST Calculator (",
        /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "gstcalculator.me" }),
        ") is a free, browser-based tool. We've built it to be useful without being invasive \u2014 this page explains exactly what happens to your data when you use the site."
      ] }) }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "1. No accounts, no personal data collection" }),
        /* @__PURE__ */ jsx14("p", { className: "text-muted-foreground", children: "You do not need to create an account, log in, or provide any personal information to use GST Calculator. We do not collect names, email addresses, phone numbers, GSTIN, PAN, or any other personally identifiable information." })
      ] }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "2. Your financial inputs stay on your device" }),
        /* @__PURE__ */ jsxs11("p", { className: "text-muted-foreground", children: [
          "The amounts you enter into the calculator, the GST slab you choose, the inclusive/exclusive mode, and the intra-/inter-state toggle are processed ",
          /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "entirely in your browser" }),
          ". These values are ",
          /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "never transmitted to our servers" }),
          " and are ",
          /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "never logged or stored server-side" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "3. localStorage \u2014 what we store on your device" }),
        /* @__PURE__ */ jsxs11("p", { className: "text-muted-foreground mb-2", children: [
          "To make the calculator more useful on repeat visits, we save a small amount of data in your browser's ",
          /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "localStorage" }),
          ". This data lives on your device only and is never sent to us."
        ] }),
        /* @__PURE__ */ jsxs11("ul", { className: "list-disc pl-5 text-muted-foreground space-y-1", children: [
          /* @__PURE__ */ jsx14("li", { children: "Your last entered amount, selected slab, mode and transaction type \u2014 so you can resume where you left off." }),
          /* @__PURE__ */ jsx14("li", { children: "A visit counter and calculation count \u2014 used to decide which contextual tip to show." }),
          /* @__PURE__ */ jsx14("li", { children: "Dismissal flags for tips you've already closed, so we don't nag you." })
        ] }),
        /* @__PURE__ */ jsx14("p", { className: "text-muted-foreground mt-2", children: "localStorage data is not a cookie, is not shared across sites, and is not accessible to any third party." })
      ] }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "4. Google AdSense" }),
        /* @__PURE__ */ jsxs11("p", { className: "text-muted-foreground", children: [
          "We display ads served by Google AdSense to keep this tool free. Google and its partners use cookies and similar technologies to serve ads based on your prior visits to this site and other sites on the internet. Google's use of advertising cookies enables it and its partners to serve ads to you. You can opt out of personalised advertising by visiting",
          " ",
          /* @__PURE__ */ jsx14("a", { href: "https://www.google.com/settings/ads", target: "_blank", rel: "noopener noreferrer", className: "text-primary-dark underline", children: "Google Ads Settings" }),
          " ",
          "or",
          " ",
          /* @__PURE__ */ jsx14("a", { href: "https://www.aboutads.info", target: "_blank", rel: "noopener noreferrer", className: "text-primary-dark underline", children: "aboutads.info" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "5. Google Analytics" }),
        /* @__PURE__ */ jsxs11("p", { className: "text-muted-foreground", children: [
          "We use Google Analytics to understand aggregate traffic patterns \u2014 pages visited, country, device type, referral source. Google Analytics sets cookies on your device to do this. We do ",
          /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "not" }),
          " send any of your calculator inputs or outputs to Analytics. You can opt out using the",
          " ",
          /* @__PURE__ */ jsx14("a", { href: "https://tools.google.com/dlpage/gaoptout", target: "_blank", rel: "noopener noreferrer", className: "text-primary-dark underline", children: "Google Analytics opt-out browser add-on" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "6. Clearing your stored preferences" }),
        /* @__PURE__ */ jsx14("p", { className: "text-muted-foreground mb-2", children: "You can wipe everything we've stored on your device at any time, with no impact on the site's functionality:" }),
        /* @__PURE__ */ jsxs11("ul", { className: "list-disc pl-5 text-muted-foreground space-y-1", children: [
          /* @__PURE__ */ jsxs11("li", { children: [
            /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "Chrome / Edge:" }),
            ' Settings \u2192 Privacy and security \u2192 Clear browsing data \u2192 tick "Cookies and other site data" for gstcalculator.me.'
          ] }),
          /* @__PURE__ */ jsxs11("li", { children: [
            /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "Firefox:" }),
            " Settings \u2192 Privacy & Security \u2192 Cookies and Site Data \u2192 Manage Data \u2192 search gstcalculator.me \u2192 Remove."
          ] }),
          /* @__PURE__ */ jsxs11("li", { children: [
            /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "Safari:" }),
            " Settings \u2192 Privacy \u2192 Manage Website Data \u2192 search gstcalculator.me \u2192 Remove."
          ] }),
          /* @__PURE__ */ jsxs11("li", { children: [
            "Or open DevTools (F12) \u2192 Application \u2192 Local Storage \u2192 right-click ",
            /* @__PURE__ */ jsx14("code", { className: "bg-muted px-1 rounded", children: "gstcalculator.me" }),
            " \u2192 Clear."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "7. Children's privacy" }),
        /* @__PURE__ */ jsx14("p", { className: "text-muted-foreground", children: "GST Calculator is not directed to children under 13 and we do not knowingly collect any information from them." })
      ] }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "8. Changes to this policy" }),
        /* @__PURE__ */ jsx14("p", { className: "text-muted-foreground", children: `If we update this policy we'll change the "Last updated" date at the top. Material changes will be highlighted on the homepage for at least a week.` })
      ] }),
      /* @__PURE__ */ jsxs11("section", { children: [
        /* @__PURE__ */ jsx14("h2", { className: "text-lg font-bold mb-2", children: "9. Contact" }),
        /* @__PURE__ */ jsxs11("p", { className: "text-muted-foreground", children: [
          "Questions about this policy? Reach out via the contact details on",
          " ",
          /* @__PURE__ */ jsx14("strong", { className: "text-foreground", children: "gstcalculator.me" }),
          "."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx14(SiteFooter_default, {})
  ] });
};
var Privacy_default = Privacy;

// src/App.tsx
import { jsx as jsx15, jsxs as jsxs12 } from "react/jsx-runtime";
var queryClient = new QueryClient();
var AppRoutes = () => /* @__PURE__ */ jsxs12(Routes, { children: [
  /* @__PURE__ */ jsx15(Route, { path: "/", element: /* @__PURE__ */ jsx15(Index_default, {}) }),
  /* @__PURE__ */ jsx15(Route, { path: "/blog", element: /* @__PURE__ */ jsx15(Blog_default, {}) }),
  /* @__PURE__ */ jsx15(Route, { path: "/blog/:slug", element: /* @__PURE__ */ jsx15(BlogPost_default, {}) }),
  /* @__PURE__ */ jsx15(Route, { path: "/privacy", element: /* @__PURE__ */ jsx15(Privacy_default, {}) }),
  /* @__PURE__ */ jsx15(Route, { path: "*", element: /* @__PURE__ */ jsx15(NotFound_default, {}) })
] });
var App = ({ location } = {}) => /* @__PURE__ */ jsx15(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs12(TooltipProvider, { children: [
  /* @__PURE__ */ jsx15(Toaster2, {}),
  /* @__PURE__ */ jsx15(Toaster, {}),
  location ? /* @__PURE__ */ jsx15(StaticRouter, { location, children: /* @__PURE__ */ jsx15(AppRoutes, {}) }) : /* @__PURE__ */ jsx15(BrowserRouter, { children: /* @__PURE__ */ jsx15(AppRoutes, {}) })
] }) });
var App_default = App;

// src/entry-server.tsx
import { jsx as jsx16 } from "react/jsx-runtime";
var render = (url) => {
  return renderToString(/* @__PURE__ */ jsx16(App_default, { location: url }));
};
export {
  render
};
