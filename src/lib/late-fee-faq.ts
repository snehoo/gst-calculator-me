// Single source for the late fee calculator FAQ. LateFeeCalculator.tsx renders it
// and scripts/prerender-routes.mjs builds the static FAQPage JSON-LD from it, so
// the structured data always matches the visible text.
// Keep this file free of imports: the prerender script transpiles it alone.

export const LATE_FEE_FAQ = [
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
  {
    question: "Can the GST late fee be waived?",
    answer:
      "Only by a government notification. Section 128 of the CGST Act lets the Government waive or reduce late fees for a class of taxpayers, on the GST Council's recommendation; Notification 19/2021 is one example, and it is where today's lower caps come from. Otherwise the GST portal adds the late fee automatically when a return is filed late.",
  },
];
