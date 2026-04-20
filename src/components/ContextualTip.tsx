import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tip } from "@/lib/tips-engine";

const TONE: Record<Tip["tone"], string> = {
  info: "bg-br-igst border-l-4 border-primary text-foreground",
  warning: "bg-warning-light border-l-4 border-warning-border text-warning-text",
  danger: "bg-destructive/10 border-l-4 border-destructive text-foreground",
  success: "bg-br-sgst border-l-4 border-success text-foreground",
  muted: "bg-muted border-l-4 border-border text-muted-foreground",
};

interface Props {
  tip: Tip;
  onDismiss?: (tip: Tip) => void;
  compact?: boolean;
  className?: string;
}

export function ContextualTip({ tip, onDismiss, compact, className }: Props) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-lg flex items-start gap-2.5 animate-fade-in",
        compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-[13px] leading-relaxed",
        TONE[tip.tone],
        className,
      )}
    >
      <span className="text-base leading-none mt-0.5" aria-hidden>
        {tip.icon}
      </span>
      <span className="flex-1" dangerouslySetInnerHTML={{ __html: tip.body }} />
      {tip.dismissDays && onDismiss && (
        <button
          onClick={() => onDismiss(tip)}
          className="opacity-60 hover:opacity-100 transition-opacity -mr-1 mt-0.5"
          aria-label="Dismiss tip"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
