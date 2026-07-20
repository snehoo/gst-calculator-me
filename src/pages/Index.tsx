import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import GSTCalculator from "@/components/GSTCalculator";
import { ContextualTip } from "@/components/ContextualTip";
import { getRandomTip } from "@/lib/gst-tips";
import { useSessionStats } from "@/hooks/useSessionStats";
import { buildContext, pickTip } from "@/lib/tips-engine";
import { setPageSeo, setWebApplicationSchema, setFAQPageSchema, clearJsonLdScripts } from "@/lib/seo";
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
    clearJsonLdScripts();

    setPageSeo({
      title: "GST Calculator India — Free Online CGST, SGST & IGST Calculator (No Login)",
      description:
        "Free online GST calculator for India. Instantly add or remove GST for all slabs (5%, 12%, 18%, 28%) with CGST, SGST & IGST breakdown. No login, no ads in your way.",
      path: "/",
      keywords:
        "GST calculator India, CGST SGST calculator, IGST calculator, reverse GST calculator, GST inclusive exclusive calculator",
    });

    setWebApplicationSchema({
      name: "GST Calculator India",
      description:
        "Free GST calculator for India 2025. Instantly compute GST for all slabs (5%, 12%, 18%, 28%) with CGST, SGST & IGST breakdown.",
    });

    setFAQPageSchema([
      {
        question: "What is the GST registration threshold for goods?",
        answer:
          "Businesses with an annual turnover of ₹40 lakh or more need to register for GST. Goods suppliers above this threshold must register.",
      },
      {
        question: "What is the GST registration threshold for services?",
        answer:
          "Service providers with an annual turnover of ₹20 lakh or more need to register for GST. This is lower than the goods threshold.",
      },
      {
        question: "What is the GST Composition Scheme?",
        answer:
          "Businesses with turnover up to ₹1.5 Cr (goods) or ₹75 lakh (services) can opt for the simplified Composition Scheme and pay flat GST rates with quarterly filing instead of monthly, reducing compliance burden.",
      },
      {
        question: "Who needs to file e-invoicing?",
        answer:
          "E-invoicing is mandatory for businesses with turnover above ₹5 Cr from FY 2023-24. It integrates directly with the GST portal for better tracking and reduced fraud.",
      },
      {
        question: "What are the main GST slabs in India?",
        answer:
          "India has 5 main GST slabs: 0% (nil rate on essentials), 5% (essential goods/services), 12% (standard rate I), 18% (standard rate II - most common), and 28% (luxury goods). Different products fall into different slabs based on their nature.",
      },
    ]);
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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">GST Calculator India — Free Online CGST, SGST &amp; IGST Calculator</h1>
        <p className="text-primary-mid text-sm mt-1">
          Instant GST computation for all slabs (5%, 12%, 18%, 28%) — add or remove GST, no login needed
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

      {/* SEO content — crawlable explainer below the tool */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 pb-12 flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">What Is This GST Calculator?</h2>
          <p className="mb-3">
            This is a free online GST calculator for India that instantly computes Goods and Services Tax for any
            amount at any slab — 0%, 5%, 12%, 18%, or 28%. It works both ways: <strong className="text-foreground">add GST</strong> to
            a base price (GST-exclusive) or <strong className="text-foreground">remove GST</strong> from a total (GST-inclusive, also
            called reverse GST calculation). Every result shows the CGST and SGST split for intra-state transactions
            or the single IGST amount for inter-state transactions — exactly as they must appear on a GST invoice.
          </p>
          <p>
            Unlike calculators from Zoho, ClearTax, or TaxAdda, this tool requires no login, no signup, and has no
            paid upsell. It is built for CAs, accountants, freelancers, and e-commerce sellers who need quick,
            accurate GST arithmetic dozens of times a day.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">How to Calculate GST — The Formulas</h2>
          <p className="mb-3">
            <strong className="text-foreground">Adding GST (exclusive):</strong> GST Amount = (Original Cost × GST Rate) ÷ 100.
            Example: 18% GST on ₹1,000 = ₹180, so the total payable is ₹1,180.
          </p>
          <p className="mb-3">
            <strong className="text-foreground">Removing GST (inclusive / reverse):</strong> GST Amount = Total Price − [Total
            Price × 100 ÷ (100 + GST Rate)]. Example: from a GST-inclusive price of ₹1,180 at 18%, the GST portion is
            ₹180 and the base price is ₹1,000.
          </p>
          <p>
            For intra-state sales the GST splits equally: 18% becomes 9% CGST + 9% SGST (₹90 + ₹90 in the example
            above). For inter-state sales the full 18% applies as IGST (₹180). Read the full guide on{" "}
            <a href="/blog/how-to-calculate-gst" className="text-primary-dark underline">how to calculate GST in India</a>{" "}
            or the explainer on{" "}
            <a href="/blog/cgst-sgst-igst-difference" className="text-primary-dark underline">CGST vs SGST vs IGST</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">GST Calculator — Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Is this GST calculator free?</h3>
              <p>Yes — completely free with no login, no account, and no usage limits. It runs entirely in your browser; amounts you enter are never sent to a server.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">How do I calculate 18% GST on an amount?</h3>
              <p>Multiply the amount by 0.18. On ₹1,00,000 that is ₹18,000 GST, making the total ₹1,18,000 — shown instantly above with the CGST/SGST or IGST split.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">How do I remove GST from a price (reverse GST)?</h3>
              <p>Switch the calculator to inclusive mode. It applies the formula Base = Total × 100 ÷ (100 + rate) — e.g. ₹1,18,000 inclusive of 18% GST has a base of ₹1,00,000 and ₹18,000 tax.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Which GST rate should I use?</h3>
              <p>Most services and electronics fall under 18%; essentials are 0–5%; luxury and sin goods are 28%. See the slab reference above or the detailed <a href="/blog/gst-rate-slabs-india" className="text-primary-dark underline">GST rate slabs guide</a>.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">When do CGST/SGST apply instead of IGST?</h3>
              <p>If the supplier and place of supply are in the same state, GST splits into equal CGST and SGST halves. If they are in different states, the full rate applies as IGST.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">Popular GST Guides</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><a href="/blog/input-tax-credit-gst" className="text-primary-dark underline">Input Tax Credit (ITC) in GST — meaning, formula and example</a></li>
            <li><a href="/blog/how-to-file-gstr-1" className="text-primary-dark underline">How to file GSTR-1 online, step by step</a></li>
            <li><a href="/blog/new-gst-rate-slab-list-2025-26" className="text-primary-dark underline">New GST rate slab list 2025–26 after GST 2.0</a></li>
            <li><a href="/blog/gst-on-restaurants-food-india-2025" className="text-primary-dark underline">GST on restaurants and food — dine-in, Zomato &amp; Swiggy</a></li>
            <li><a href="/blog/gst-composition-scheme" className="text-primary-dark underline">GST Composition Scheme — who qualifies and how it works</a></li>
            <li><a href="/blog/zoho-gst-calculator-alternative" className="text-primary-dark underline">Zoho GST calculator vs GSTCalculator.me</a></li>
          </ul>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
