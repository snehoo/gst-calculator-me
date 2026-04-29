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
    setPageSeo({
      title: "GST Calculator India 2025 \u2014 All Slabs, CGST/SGST/IGST",
      description: "Free GST calculator for India 2025. Instantly compute GST for all slabs (5%, 12%, 18%, 28%) with CGST, SGST & IGST breakdown.",
      path: "/",
      keywords: "GST calculator India, CGST SGST calculator, IGST calculator, reverse GST calculator, GST inclusive exclusive calculator"
    });
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
    /* @__PURE__ */ jsxs7("main", { className: "max-w-6xl mx-auto px-6 sm:px-8 py-6 grid lg:grid-cols-[1fr_300px] gap-5 items-start", children: [
      /* @__PURE__ */ jsx10(GSTCalculator, {}),
      /* @__PURE__ */ jsxs7("aside", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxs7("div", { className: "bg-gradient-to-br from-primary-light to-accent border-[1.5px] border-primary-mid rounded-xl p-4", children: [
          /* @__PURE__ */ jsx10("h3", { className: "text-sm font-bold text-primary-dark mb-2.5", children: "\u{1F4CA} File GST Returns" }),
          /* @__PURE__ */ jsx10("div", { className: "space-y-1.5", children: [
            { name: "Zoho Books", tag: "\u20B92,999/yr" },
            { name: "ClearTax GST", tag: "Free tier" },
            { name: "Tally Prime", tag: "Most popular" },
            { name: "Vyapar App", tag: "Mobile" }
          ].map((i) => /* @__PURE__ */ jsxs7(
            "div",
            {
              className: "flex items-center justify-between px-2.5 py-2 bg-card rounded-md border border-primary-light",
              children: [
                /* @__PURE__ */ jsx10("span", { className: "text-sm font-semibold text-primary-dark", children: i.name }),
                /* @__PURE__ */ jsx10("span", { className: "text-[0.65rem] bg-primary-light text-primary-dark px-2 py-0.5 rounded-full", children: i.tag })
              ]
            },
            i.name
          )) })
        ] }),
        sidebarTip ? /* @__PURE__ */ jsx10(ContextualTip, { tip: sidebarTip, onDismiss: (t) => dismiss(t.id, t.dismissDays) }) : /* @__PURE__ */ jsxs7("div", { className: "bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground leading-relaxed", children: [
          /* @__PURE__ */ jsx10("strong", { className: "text-foreground block mb-1", children: "\u{1F4A1} Quick Tip" }),
          tip
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs7("section", { className: "max-w-6xl mx-auto px-6 sm:px-8 pb-10 grid md:grid-cols-2 gap-5", children: [
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
  }
];
var getPost = (slug) => POSTS.find((p) => p.slug === slug);

// src/pages/Blog.tsx
import { jsx as jsx12, jsxs as jsxs9 } from "react/jsx-runtime";
var Blog = () => {
  useEffect6(() => {
    setPageSeo({
      title: "GST Blog \u2014 Guides, Rates & Compliance Tips | GST Calculator",
      description: "Practical GST guides for Indian businesses: how to calculate GST, slabs explained, CGST vs SGST vs IGST, and GST for freelancers.",
      path: "/blog",
      keywords: "GST blog India, GST guides, GST rate slabs, CGST SGST IGST explained, GST for freelancers"
    });
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
        /* @__PURE__ */ jsx13("p", { className: "text-[15px] text-foreground leading-relaxed flex-1", children: s })
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
  }
};
var BlogPost = () => {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : void 0;
  useEffect7(() => {
    if (post) {
      setPageSeo({
        title: `${post.title} | GST Calculator`,
        description: post.description,
        path: `/blog/${post.slug}`,
        type: "article"
      });
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
