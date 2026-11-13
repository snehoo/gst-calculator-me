// Single source for the homepage FAQ. Index.tsx renders it and builds the
// FAQPage JSON-LD from it; scripts/prerender-routes.mjs reads the same array,
// so the structured data always matches the visible text.
// Keep this file free of imports: the prerender script transpiles it alone.

export interface HomeFaq {
  question: string;
  /** Plain-text answer, used in JSON-LD. */
  answer: string;
  /** Optional HTML version of the same answer for the page (links only). */
  html?: string;
}

export const HOME_FAQ: HomeFaq[] = [
  {
    question: "Is this GST calculator free?",
    answer:
      "Yes — completely free with no login, no account, and no usage limits. It runs entirely in your browser; amounts you enter are never sent to a server.",
  },
  {
    question: "How do I calculate 18% GST on an amount?",
    answer:
      "Multiply the amount by 0.18. On ₹1,00,000 that is ₹18,000 GST, making the total ₹1,18,000 — shown instantly above with the CGST/SGST or IGST split.",
  },
  {
    question: "How do I remove GST from a price (reverse GST)?",
    answer:
      "Switch the calculator to inclusive mode. It applies the formula Base = Total × 100 ÷ (100 + rate) — e.g. ₹1,18,000 inclusive of 18% GST has a base of ₹1,00,000 and ₹18,000 tax.",
  },
  {
    question: "Which GST rate should I use?",
    answer:
      "After GST 2.0 (September 22, 2025, per the 56th GST Council): essentials are 0–5%; most services and electronics fall under 18%; luxury and sin goods (tobacco, aerated drinks, high-end SUVs) are 40%. The 12% and 28% slabs are abolished. See the GST rate slabs guide.",
    html:
      'After GST 2.0 (September 22, 2025, per the 56th GST Council): essentials are 0–5%; most services and electronics fall under 18%; luxury and sin goods (tobacco, aerated drinks, high-end SUVs) are 40%. The 12% and 28% slabs are abolished. See the <a href="/blog/gst-rate-slabs-india/" class="text-primary-dark underline">GST rate slabs guide</a>.',
  },
  {
    question: "When do CGST/SGST apply instead of IGST?",
    answer:
      "If the supplier and place of supply are in the same state, GST splits into equal CGST and SGST halves. If they are in different states, the full rate applies as IGST.",
  },
];
