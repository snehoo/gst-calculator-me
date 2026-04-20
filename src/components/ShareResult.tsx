import { useState } from "react";
import { Check, Copy, Mail, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  base: number;
  gstAmt: number;
  total: number;
  slab: number;
  type: "intra" | "inter";
}

const SITE = "gstcalculator.me";

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function buildMessage({ base, gstAmt, total, slab, type }: Props) {
  const taxLabel = type === "inter" ? `IGST ${slab}%` : `GST ${slab}%`;
  return [
    `*GST Calculation*`,
    `Base: ${fmt(base)}`,
    `${taxLabel}: ${fmt(gstAmt)}`,
    `Total: ${fmt(total)}`,
    ``,
    `Calculated at ${SITE}`,
  ].join("\n");
}

export function ShareResult(props: Props) {
  const [copied, setCopied] = useState(false);
  const msg = buildMessage(props);
  const isLarge = props.base > 100_000;

  const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  const mailto = `mailto:?subject=${encodeURIComponent(
    "GST Calculation",
  )}&body=${encodeURIComponent(msg)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wider">
          📲 Share this calculation
        </div>
        <button
          onClick={copy}
          className={cn(
            "text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors",
            copied
              ? "border-success text-success bg-success/10"
              : "border-border text-muted-foreground hover:text-foreground hover:border-primary",
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="bg-muted rounded-md p-2.5 text-[11.5px] leading-relaxed text-foreground whitespace-pre-wrap font-sans">
        {msg}
      </pre>

      <div className="flex flex-wrap gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-success text-success-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share on WhatsApp
        </a>
        {isLarge && (
          <a
            href={mailto}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Email to my CA
          </a>
        )}
      </div>
    </div>
  );
}
