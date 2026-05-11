import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import GSTCalculator from "@/components/GSTCalculator";
import { ContextualTip } from "@/components/ContextualTip";
import { getRandomTip } from "@/lib/gst-tips";
import { useSessionStats } from "@/hooks/useSessionStats";
import { buildContext, pickTip } from "@/lib/tips-engine";
import { setPageSeo } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const SLAB_REF = [
  { pct: "0%", title: "Nil Rate", desc: "Essential food grains, milk, vegetables, fruits, eggs, salt, books, newspapers, sindoor, bangles" },
  { pct: "5%", title: "Essential Rate", desc: "Packaged foods, sugar, tea, coffee, edible oil, transport services, small restaurants (turnover <1.5 Cr)" },
  { pct: "12%", title: "Standard Rate I", desc: "Apparel above ₹1000, computers, processed food, mobile phones, business class air travel" },
  { pct: "18%", title: "Standard Rate II (Most common)", desc: "AC restaurants, electronics, most financial services, IT services, telecom" },
  { pct: "28%", title: "Luxury Rate", desc: "Luxury cars, tobacco, cement, pan masala, high-end personal care, AC hotels above ₹7500/night" },
];

const Index = () => {
  const [tip, setTip] = useState<string>("");
  const { stats, dismiss } = useSessionStats();

  useEffect(() => {
    setTip(getRandomTip());
  }, []);

  useEffect(() => {
    setPageSeo({
      title: "GST Calculator India 2025 — All Slabs, CGST/SGST/IGST",
      description:
        "Free GST calculator for India 2025. Instantly compute GST for all slabs (5%, 12%, 18%, 28%) with CGST, SGST & IGST breakdown.",
      path: "/",
      keywords:
        "GST calculator India, CGST SGST calculator, IGST calculator, reverse GST calculator, GST inclusive exclusive calculator",
    });
  }, []);

  // Page-level tips depend only on date + visit count.
  const pageCtx = useMemo(
    () => buildContext({ slab: 0, amount: 0, type: "intra", stats }),
    [stats],
  );
  const topTip = pickTip("topBanner", pageCtx);
  const sidebarTip = pickTip("sidebar", pageCtx);

  return (
    <div className="min-h-screen bg-background">
      {/* Date-aware compliance banner — at most one tip. */}
      {topTip && (
        <div className="bg-warning-light text-warning-text border-b border-warning-border/40 px-6 sm:px-8 py-2 flex items-center gap-2.5 text-xs animate-slide-down">
          <span aria-hidden>{topTip.icon}</span>
          <span className="flex-1" dangerouslySetInnerHTML={{ __html: topTip.body }} />
          {topTip.dismissDays && (
            <button
              onClick={() => dismiss(topTip.id, topTip.dismissDays)}
              className="opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Nav */}
      <SiteHeader showUpdatedLabel hideWordmark />

      {/* Hero */}
      <header className="bg-primary-dark px-6 sm:px-8 pb-8 text-primary-foreground">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">GST Calculator</h1>
        <p className="text-primary-mid text-sm mt-1">
          Instant GST computation for all slabs — with CGST, SGST & IGST breakdown
        </p>
      </header>

      {/* Main column */}
      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-6 flex flex-col gap-5">
        <GSTCalculator />

        {sidebarTip ? (
          <ContextualTip tip={sidebarTip} onDismiss={(t) => dismiss(t.id, t.dismissDays)} />
        ) : (
          <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground block mb-1">💡 Quick Tip</strong>
            {tip}
          </div>
        )}
      </main>

      {/* Reference */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 pb-10 flex flex-col gap-5">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-3.5 bg-warning text-warning-foreground text-sm font-semibold">
            📋 GST Slab Reference Guide
          </div>
          <div className="px-4 py-2">
            {SLAB_REF.map((s, i) => (
              <div
                key={s.pct}
                className={`flex gap-3 py-2.5 ${i < SLAB_REF.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="min-w-[42px] text-base font-bold text-primary-dark">{s.pct}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block text-[0.78rem] mb-0.5">{s.title}</strong>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-3.5 bg-primary-dark text-primary-foreground text-sm font-semibold">
            ⚠️ GST Registration Thresholds
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-light rounded-lg p-3 text-center">
                <div className="text-[0.65rem] font-semibold text-primary-dark uppercase mb-1">Goods</div>
                <div className="text-2xl font-bold text-primary-dark">₹40L</div>
                <div className="text-xs text-primary-dark/70">Annual turnover</div>
              </div>
              <div className="bg-accent rounded-lg p-3 text-center">
                <div className="text-[0.65rem] font-semibold text-success uppercase mb-1">Services</div>
                <div className="text-2xl font-bold text-success">₹20L</div>
                <div className="text-xs text-success/80">Annual turnover</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                <strong className="text-foreground">Composition Scheme:</strong> Businesses up to ₹1.5 Cr (goods) /
                ₹75L (services) can opt for simplified quarterly filing at lower flat rates.
              </p>
              <p>
                <strong className="text-foreground">E-invoicing mandatory</strong> for turnover above ₹5 Cr from FY
                2023-24.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
