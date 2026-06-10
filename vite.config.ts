import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// All 42 routes from sitemap — pre-rendered to static HTML at build time
const ALL_ROUTES = [
  "/",
  "/blog",
  "/privacy",
  "/blog/how-to-calculate-gst",
  "/blog/what-is-gst-india",
  "/blog/gst-rate-slabs-india",
  "/blog/cgst-sgst-igst-difference",
  "/blog/gst-for-freelancers-india",
  "/blog/input-tax-credit-gst",
  "/blog/gst-invoice-format-india",
  "/blog/reverse-charge-mechanism-gst",
  "/blog/gst-composition-scheme",
  "/blog/gst-on-ecommerce-india",
  "/blog/gst-impact-indian-economy-statistics",
  "/blog/gst-rates-structure-statistics",
  "/blog/gst-business-compliance-statistics",
  "/blog/gst-vs-vat-global-comparison-statistics",
  "/blog/gst-impact-consumer-prices-statistics",
  "/blog/zoho-vs-tally-gst-calculator",
  "/blog/cleartax-vs-zoho-gst-calculator",
  "/blog/tally-vs-cleartax-gst-calculator",
  "/blog/gstcalculator-net-vs-gstcalculator-app",
  "/blog/cleartax-vs-taxadda-gst-calculator",
  "/blog/gst-2-0-reforms-india-2025",
  "/blog/new-gst-rate-slab-list-2025-26",
  "/blog/e-invoicing-gst-india-2025",
  "/blog/e-way-bill-gst-india-2025",
  "/blog/gstin-format-verification-guide",
  "/blog/gst-on-gold-jewellery-india-2025",
  "/blog/gst-on-health-insurance-india-2025",
  "/blog/gst-on-restaurants-food-india-2025",
  "/blog/gst-on-cars-bikes-india-2025",
  "/blog/invoice-management-system-ims-gst-guide",
  "/blog/gst-on-imports-exports-india-2025",
  "/blog/how-to-file-gstr-1",
  "/blog/how-to-file-gstr-3b",
  "/blog/gstr-1-vs-gstr-3b-difference",
  "/blog/gst-return-due-dates-2025",
  "/blog/gst-registration-process-india",
  "/blog/hsn-code-list-india-2025",
  "/blog/gst-late-fee-penalty-guide",
  "/blog/gst-on-real-estate-india",
  "/blog/gst-for-amazon-flipkart-sellers",
  "/blog/cleartax-subscription-cancelled-gst",
  "/blog/cleartax-vs-zoho-vs-vakilsearch-gst",
  "/blog/free-gst-calculator-no-login-india",
  "/blog/gst-calculator-for-accountants-india",
  "/blog/is-zoho-gst-calculator-free",
  "/blog/zoho-gst-calculator-not-working",
  "/blog/best-gst-tool-freelancers-india",
  "/blog/cleartax-gstr-3b-filing-issues",
  "/blog/gst-taxadda-calculator-alternative",
  "/blog/zoho-books-gst-calculator-login-required",
  "/blog/zoho-gst-calculator-alternative",
];

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    // Only run prerender in production builds
    mode === "production" &&
      (() => {
        // Dynamically require so dev builds don't need the package installed
        // Run: npm install --save-dev vite-plugin-prerender
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Prerender = require("vite-plugin-prerender");
        const PuppeteerRenderer = require("vite-plugin-prerender/src/lib/renderer-puppeteer");
        return Prerender({
          staticDir: path.join(__dirname, "dist"),
          routes: ALL_ROUTES,
          renderer: new PuppeteerRenderer({
            // Wait for the React tree to be painted before snapshotting
            renderAfterDocumentEvent: "render-event",
            headless: true,
          }),
        });
      })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
