import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const SLABS = [0, 5, 12, 18, 28] as const;
type Slab = (typeof SLABS)[number];
type Mode = "excl" | "incl";
type TxType = "intra" | "inter";

const STORAGE_KEY = "gst-calc-state-v1";

interface State {
  amount: string;
  slab: Slab;
  mode: Mode;
  type: TxType;
}

const DEFAULT_STATE: State = {
  amount: "10000",
  slab: 18,
  mode: "excl",
  type: "intra",
};

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      amount: typeof parsed.amount === "string" ? parsed.amount : DEFAULT_STATE.amount,
      slab: SLABS.includes(parsed.slab) ? parsed.slab : DEFAULT_STATE.slab,
      mode: parsed.mode === "incl" ? "incl" : "excl",
      type: parsed.type === "inter" ? "inter" : "intra",
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function GSTCalculator() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const { base, gstAmt, total } = useMemo(() => {
    const raw = parseFloat(state.amount) || 0;
    const rate = state.slab / 100;
    let base: number, gstAmt: number;
    if (state.mode === "excl") {
      base = raw;
      gstAmt = base * rate;
    } else {
      gstAmt = (raw * rate) / (1 + rate);
      base = raw - gstAmt;
    }
    return { base, gstAmt, total: base + gstAmt };
  }, [state]);

  const half = state.slab / 2;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-primary text-primary-foreground text-sm font-semibold">
        Enter Amount & GST Details
      </div>
      <div className="p-5 space-y-5">
        {/* Amount */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={state.amount}
              onChange={(e) => setState((s) => ({ ...s, amount: e.target.value }))}
              className="w-full pl-8 pr-3 py-3 border-[1.5px] border-border rounded-lg text-base font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 bg-card text-foreground"
            />
          </div>
        </div>

        {/* Slabs */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Select GST Slab
          </label>
          <div className="grid grid-cols-5 gap-2">
            {SLABS.map((s) => (
              <button
                key={s}
                onClick={() => setState((st) => ({ ...st, slab: s }))}
                className={cn(
                  "py-2.5 rounded-lg border-[1.5px] text-sm font-semibold transition-all",
                  state.slab === s
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <SegmentedToggle
          label="Calculation Mode"
          value={state.mode}
          onChange={(m) => setState((s) => ({ ...s, mode: m }))}
          options={[
            { value: "excl", label: "Add GST (Exclusive)" },
            { value: "incl", label: "Remove GST (Inclusive)" },
          ]}
        />

        {/* Type */}
        <SegmentedToggle
          label="Transaction Type"
          value={state.type}
          onChange={(t) => setState((s) => ({ ...s, type: t }))}
          options={[
            { value: "intra", label: "Intra-state (CGST+SGST)" },
            { value: "inter", label: "Inter-state (IGST)" },
          ]}
        />

        {/* Result inline summary */}
        <div className="rounded-xl bg-primary-light p-5 text-center">
          <div className="text-[0.7rem] font-semibold text-primary-dark uppercase tracking-wider">
            Total Amount Payable
          </div>
          <div className="text-4xl font-bold text-primary-dark mt-1 tabular-nums">{fmt(total)}</div>
          <div className="text-xs text-primary-dark/80 mt-1">
            Includes {state.slab}% GST on {fmt(base)}
          </div>
        </div>

        <div className="space-y-1.5">
          <BreakdownRow className="bg-br-base" label="Base Amount" value={fmt(base)} />
          {state.type === "intra" ? (
            <>
              <BreakdownRow className="bg-br-cgst" label="CGST" pct={`${half}%`} value={fmt(gstAmt / 2)} />
              <BreakdownRow className="bg-br-sgst" label="SGST" pct={`${half}%`} value={fmt(gstAmt / 2)} />
            </>
          ) : (
            <BreakdownRow className="bg-br-igst" label="IGST" pct={`${state.slab}%`} value={fmt(gstAmt)} />
          )}
          <div className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-primary-dark text-primary-foreground font-bold text-sm">
            <span>Total Payable</span>
            <span className="tabular-nums">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  pct,
  value,
  className,
}: {
  label: string;
  pct?: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between items-center px-3.5 py-2.5 rounded-lg text-sm", className)}>
      <span className="font-medium text-foreground">
        {label}
        {pct && <span className="text-[0.7rem] opacity-70 ml-1">({pct})</span>}
      </span>
      <span className="font-bold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

function SegmentedToggle<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
        {label}
      </label>
      <div className="flex bg-muted rounded-lg p-1 gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all",
              value === o.value
                ? "bg-card text-primary shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
