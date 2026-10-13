import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { setPageSeo, setFAQPageSchema, setWebApplicationSchema, clearJsonLdScripts } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  CAPS,
  NIL_CAP,
  PER_DAY,
  daysBetween,
  interest,
  lateFee,
  monthlyDueDate,
  type ReturnType,
  type TurnoverSlab,
} from "@/lib/late-fee";

const TITLE = "GST Late Fee Calculator for GSTR-3B and GSTR-1 (with Interest)";
const DESCRIPTION =
  "Work out the GST late fee for a late GSTR-3B or GSTR-1: ₹50/day (₹20 for nil), capped by turnover, split into CGST and SGST, plus 18% interest on tax paid late.";

const FAQ = [
  {
    question: "What is the late fee for GSTR-3B and GSTR-1?",
    answer:
      "₹50 per day (₹25 CGST + ₹25 SGST), or ₹20 per day (₹10 + ₹10) for a nil return. The total is capped by your aggregate turnover in the previous financial year: ₹2,000 up to ₹1.5 crore, ₹5,000 from ₹1.5 crore to ₹5 crore, and ₹10,000 above ₹5 crore. Nil returns are capped at ₹500 whatever the turnover.",
  },
  {
    question: "Is interest charged on top of the late fee?",
    answer:
      "Yes, if tax was paid late. Interest is 18% a year on the tax paid in cash after the due date, for each day of delay. A nil return has no tax, so no interest.",
  },
  {
    question: "How are the days counted?",
    answer:
      "From the day after the due date up to the day you file. Filing on the due date itself attracts no late fee.",
  },
  {
    question: "Is there a late fee on IGST?",
    answer:
      "The late fee is charged under CGST and SGST (or UTGST) in equal halves; there is no separate IGST late fee on these returns.",
  },
];

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const today = () => new Date().toISOString().slice(0, 10);
const lastMonth = () => {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
};

const SLAB_LABEL: Record<TurnoverSlab, string> = {
  "upto1.5": "Up to ₹1.5 crore",
  "1.5to5": "₹1.5 crore to ₹5 crore",
  above5: "Above ₹5 crore",
};

const LateFeeCalculator = () => {
  useEffect(() => {
    clearJsonLdScripts();
    setPageSeo({
      title: TITLE,
      description: DESCRIPTION,
      path: "/gst-late-fee-calculator",
      keywords: "GST late fee calculator, GSTR-3B late fee, GSTR-1 late fee, GST interest calculator, late fee for nil return",
    });
    setWebApplicationSchema({ name: "GST Late Fee Calculator", description: DESCRIPTION });
    setFAQPageSchema(FAQ);
  }, []);

  const [type, setType] = useState<ReturnType>("GSTR-3B");
  const [period, setPeriod] = useState(lastMonth());
  const [due, setDue] = useState(monthlyDueDate("GSTR-3B", lastMonth()));
  const [filed, setFiled] = useState(today());
  const [nil, setNil] = useState(false);
  const [slab, setSlab] = useState<TurnoverSlab>("upto1.5");
  const [tax, setTax] = useState("");

  // Keep the due date in step with return type and period (still editable).
  useEffect(() => {
    setDue(monthlyDueDate(type, period));
  }, [type, period]);

  const days = daysBetween(due, filed);
  const fee = lateFee(days, nil, slab);
  const taxAmount = Number(tax.replace(/[^0-9.]/g, "")) || 0;
  const showInterest = type === "GSTR-3B" && !nil;
  const int = showInterest ? interest(taxAmount, days) : 0;

  const tracked = useRef("");
  useEffect(() => {
    const key = `${type}|${nil}|${slab}|${days > 0}`;
    if (days <= 0 || key === tracked.current) return;
    const t = setTimeout(() => {
      tracked.current = key;
      const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
      g?.("event", "gst_late_fee_calc", { return_type: type, nil, turnover: slab, capped: fee.capped });
    }, 1500);
    return () => clearTimeout(t);
  }, [type, nil, slab, days, fee.capped]);

  const field = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
  const label = "block text-xs font-semibold text-muted-foreground mb-1";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="home" />

      <header className="bg-primary-dark px-6 sm:px-8 pb-8 text-primary-foreground">
        <Link to="/" className="inline-flex items-center gap-1.5 text-primary-mid text-xs hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> GST calculator
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">GST late fee calculator</h1>
        <p className="text-primary-mid text-sm mt-2 max-w-2xl">
          For a late GSTR-3B or GSTR-1. Enter the dates and your turnover; you get the late fee split into CGST and
          SGST, plus 18% interest if tax was paid late.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="lf-type">Return</label>
              <select id="lf-type" className={field} value={type} onChange={(e) => setType(e.target.value as ReturnType)}>
                <option value="GSTR-3B">GSTR-3B</option>
                <option value="GSTR-1">GSTR-1</option>
              </select>
            </div>
            <div>
              <label className={label} htmlFor="lf-period">Tax period (month)</label>
              <input id="lf-period" type="month" className={field} value={period} onChange={(e) => setPeriod(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="lf-due">Due date</label>
              <input id="lf-due" type="date" className={field} value={due} onChange={(e) => setDue(e.target.value)} />
              <p className="text-[11px] text-muted-foreground mt-1">
                Filled in for monthly filers ({type === "GSTR-1" ? "11th" : "20th"} of next month). QRMP filers and
                extended deadlines: change it.
              </p>
            </div>
            <div>
              <label className={label} htmlFor="lf-filed">Date filed (or planned)</label>
              <input id="lf-filed" type="date" className={field} value={filed} onChange={(e) => setFiled(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="lf-slab">Turnover in the previous financial year</label>
              <select id="lf-slab" className={field} value={slab} onChange={(e) => setSlab(e.target.value as TurnoverSlab)}>
                {(Object.keys(SLAB_LABEL) as TurnoverSlab[]).map((s) => (
                  <option key={s} value={s}>{SLAB_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={nil} onChange={(e) => setNil(e.target.checked)} className="h-4 w-4" />
                Nil return (no sales, no tax)
              </label>
            </div>
            {showInterest && (
              <div className="sm:col-span-2">
                <label className={label} htmlFor="lf-tax">Tax paid in cash after the due date (optional, for interest)</label>
                <input id="lf-tax" inputMode="decimal" placeholder="e.g. 100000" className={field} value={tax} onChange={(e) => setTax(e.target.value)} />
              </div>
            )}
          </div>

          <div className="rounded-xl bg-primary-light/30 border border-border p-5" aria-live="polite">
            {days <= 0 ? (
              <p className="text-sm font-semibold">Filed on or before the due date: no late fee.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-base">
                  <strong>{days} day{days === 1 ? "" : "s"} late.</strong> Late fee:{" "}
                  <strong className="text-lg">{inr(fee.total)}</strong>{" "}
                  <span className="text-muted-foreground">({inr(fee.cgst)} CGST + {inr(fee.sgst)} SGST)</span>
                </p>
                <p className="text-muted-foreground">
                  {inr(fee.perDay)}/day, capped at {inr(fee.cap)}
                  {fee.capped ? " — the cap has been reached, so filing later won't add more late fee." : `. The cap is reached on day ${fee.capDay}.`}
                </p>
                {showInterest && taxAmount > 0 && (
                  <p>
                    Interest at 18% a year on {inr(taxAmount)} for {days} days: <strong>{inr(int)}</strong>.{" "}
                    Total: <strong>{inr(fee.total + int)}</strong>.
                  </p>
                )}
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            An estimate based on the CGST Act (sections 47 and 50) and the late fee caps in Notifications 19/2021 and
            20/2021–Central Tax. The GST portal computes the final amount when you file; check with your CA for anything
            unusual.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-xl font-bold">GST late fee rates and caps</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-primary-light/40">
                <tr>
                  <th className="text-left px-3 py-2">Return</th>
                  <th className="text-left px-3 py-2">Per day</th>
                  <th className="text-left px-3 py-2">Maximum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Nil return (any turnover)</td>
                  <td className="px-3 py-2">₹{PER_DAY.nil} (₹10 CGST + ₹10 SGST)</td>
                  <td className="px-3 py-2">₹{NIL_CAP}</td>
                </tr>
                {(Object.keys(CAPS) as TurnoverSlab[]).map((s) => (
                  <tr key={s} className="border-t border-border">
                    <td className="px-3 py-2">With tax, turnover {SLAB_LABEL[s].toLowerCase()}</td>
                    <td className="px-3 py-2">₹{PER_DAY.normal} (₹25 CGST + ₹25 SGST)</td>
                    <td className="px-3 py-2">{inr(CAPS[s])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            The same rates and caps apply to GSTR-3B and GSTR-1. On GSTR-3B, tax paid after the due date also attracts
            interest at 18% a year on the cash portion. For penalties beyond late fees, see the{" "}
            <Link to="/blog/gst-late-fee-penalty-guide/" className="underline">GST late fee and penalty guide</Link>.
          </p>

          <h2 className="text-xl font-bold pt-4">Questions</h2>
          {FAQ.map((f) => (
            <div key={f.question}>
              <p className="font-semibold">{f.question}</p>
              <p className="text-muted-foreground">{f.answer}</p>
            </div>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default LateFeeCalculator;
