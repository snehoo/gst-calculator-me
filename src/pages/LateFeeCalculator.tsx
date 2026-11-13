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
import { LATE_FEE_FAQ } from "@/lib/late-fee-faq";

// Official sources (verified 2026-10-17: both PDFs load from gstcouncil.gov.in; the cbic.gov.in copy returns 500).
const SOURCES = {
  n19: "https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-19-central-tax-english-2021.pdf",
  n20: "https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-20-central-tax-english-2021.pdf",
  act: "https://cbic-gst.gov.in/gst-acts.html",
  // GST portal manual for GSTR-3B (checked 2026-11-13): late fee is system computed in tile 5.1 and paid from the cash ledger only.
  manual3b: "https://tutorial.gst.gov.in/userguide/returns/Create_and_Submit_GSTR3B.htm",
  // CGST Act s.128, power to waive penalty or fee (checked 2026-11-13).
  s128: "https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/acts/2017_CGST_act/active/chapter19/section128_v1.00.html",
};

const TITLE = "GST Late Fee Calculator for GSTR-3B & GSTR-1, with Interest";
const DESCRIPTION =
  "Work out the GST late fee for a late GSTR-3B or GSTR-1: ₹50/day (₹20 for nil), capped by turnover, split into CGST and SGST, plus 18% interest on tax paid late.";

const FAQ = LATE_FEE_FAQ;

// Worked examples: every figure is computed from src/lib/late-fee.ts, the same code the calculator runs.
const EX_NIL = lateFee(12, true, "upto1.5");
const EX_3B = lateFee(30, false, "upto1.5");
const EX_3B_TAX = 40000;
const EX_3B_INT = interest(EX_3B_TAX, 30);
const EX_G1 = lateFee(150, false, "1.5to5");

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
            An estimate based on the{" "}
            <a href={SOURCES.act} target="_blank" rel="noopener noreferrer" className="underline">CGST Act</a> (sections 47
            and 50) and the late fee caps in{" "}
            <a href={SOURCES.n19} target="_blank" rel="noopener noreferrer" className="underline">Notification 19/2021</a>{" "}
            (GSTR-3B) and{" "}
            <a href={SOURCES.n20} target="_blank" rel="noopener noreferrer" className="underline">Notification 20/2021</a>{" "}
            (GSTR-1), Central Tax. Those notifications state the caps per tax (₹250, ₹1,000 and ₹2,500 of CGST, with the
            same again under SGST); the table below shows the combined totals. The GST portal computes the final amount
            when you file; check with your CA for anything unusual.
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
            The same rates and caps apply to GSTR-3B and GSTR-1 (
            <a href={SOURCES.n19} target="_blank" rel="noopener noreferrer" className="underline">Notification 19/2021</a>,{" "}
            <a href={SOURCES.n20} target="_blank" rel="noopener noreferrer" className="underline">Notification 20/2021</a>).
            Above ₹5 crore turnover the notifications set no lower cap, so the CGST Act's own maximum applies. On GSTR-3B,
            tax paid after the due date also attracts interest at 18% a year on the cash portion (
            <a href={SOURCES.act} target="_blank" rel="noopener noreferrer" className="underline">CGST Act, section 50</a>). For penalties beyond late fees, see the{" "}
            <Link to="/blog/gst-late-fee-penalty-guide/" className="underline">GST late fee and penalty guide</Link>.
          </p>

          <h2 className="text-xl font-bold pt-4">Worked examples</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Nil GSTR-3B filed 12 days late:</strong> 12 × ₹{PER_DAY.nil} = <strong>{inr(EX_NIL.total)}</strong>{" "}
              ({inr(EX_NIL.cgst)} CGST + {inr(EX_NIL.sgst)} SGST). No interest, because a nil return has no tax.
            </li>
            <li>
              <strong>GSTR-3B, turnover ₹80 lakh, filed 30 days late, {inr(EX_3B_TAX)} of tax paid late:</strong> late fee
              30 × ₹{PER_DAY.normal} = {inr(EX_3B.total)} (under the {inr(EX_3B.cap)} cap), plus interest of {inr(EX_3B_TAX)} ×
              18% × 30/365 = {inr(EX_3B_INT)}. Total <strong>{inr(EX_3B.total + EX_3B_INT)}</strong>.
            </li>
            <li>
              <strong>GSTR-1, turnover ₹3 crore, filed 150 days late:</strong> 150 × ₹{PER_DAY.normal} = {inr(150 * PER_DAY.normal)},
              capped at <strong>{inr(EX_G1.total)}</strong>. GSTR-1 carries no interest, because no tax is paid with it.
            </li>
          </ul>

          <h2 className="text-xl font-bold pt-4">How to pay the late fee on GSTR-3B</h2>
          <p>
            You don't work it out on the portal yourself. Per the{" "}
            <a href={SOURCES.manual3b} target="_blank" rel="noopener noreferrer" className="underline">GST portal's GSTR-3B manual</a>,
            the late fee is computed by the system from the number of days after the due date and shown in the
            "5.1 Interest and Late fee for previous tax period" tile. It can be paid only from the balance in your
            electronic cash ledger: input tax credit can't be used for late fee or interest. Add cash to the ledger if
            the balance is short, pay through "Proceed to payment", then file the return.
          </p>

          <h2 className="text-xl font-bold pt-4">Questions</h2>
          {FAQ.map((f) => (
            <div key={f.question}>
              <p className="font-semibold">{f.question}</p>
              <p className="text-muted-foreground">{f.answer}</p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Waiver power:{" "}
            <a href={SOURCES.s128} target="_blank" rel="noopener noreferrer" className="underline">CGST Act, section 128</a>. Current caps:{" "}
            <a href={SOURCES.n19} target="_blank" rel="noopener noreferrer" className="underline">Notification 19/2021</a>.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default LateFeeCalculator;
