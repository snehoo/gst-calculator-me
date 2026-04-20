export const QUICK_TIPS = [
  "CGST + SGST = IGST. Use IGST for inter-state B2B transactions and exports (zero-rated).",
  "Composition Scheme lets small businesses (up to ₹1.5 Cr) file quarterly at flat lower rates.",
  "E-invoicing is mandatory for businesses with turnover above ₹5 Cr from FY 2023-24.",
  "Input Tax Credit (ITC) lets you offset GST paid on purchases against GST collected on sales.",
  "GST returns (GSTR-1, GSTR-3B) must be filed monthly — late fees apply per day of delay.",
  "Reverse Charge: in some cases, the buyer pays GST directly to govt instead of the seller.",
  "HSN codes are mandatory on invoices — 4 digits for turnover up to ₹5 Cr, 6 digits above.",
  "Exports are zero-rated under GST — you can claim refund of input taxes paid.",
  "GST registration is mandatory above ₹40L turnover for goods, ₹20L for services.",
  "B2B invoices above ₹50,000 require an e-way bill for movement of goods.",
];

export function getRandomTip() {
  return QUICK_TIPS[Math.floor(Math.random() * QUICK_TIPS.length)];
}
