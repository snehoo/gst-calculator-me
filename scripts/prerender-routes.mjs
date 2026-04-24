import fs from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const rootHtmlPath = path.join(distDir, "index.html");

const routes = [
  {
    path: "/",
    title: "GST Calculator India 2025 — All Slabs, CGST/SGST/IGST",
    description:
      "Free GST calculator for India 2025. Instantly compute GST for all slabs (5%, 12%, 18%, 28%) with CGST, SGST & IGST breakdown.",
    keywords:
      "GST calculator India, CGST SGST calculator, IGST calculator, reverse GST calculator, GST inclusive exclusive calculator",
    type: "website",
  },
  {
    path: "/blog",
    title: "GST Blog — Guides, Rates & Compliance Tips | GST Calculator",
    description:
      "Practical GST guides for Indian businesses: how to calculate GST, slabs explained, CGST vs SGST vs IGST, and GST for freelancers.",
    keywords:
      "GST blog India, GST guides, GST rate slabs, CGST SGST IGST explained, GST for freelancers",
    type: "website",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | GST Calculator",
    description:
      "How GST Calculator handles your data: localStorage usage, no server-side logging of financial inputs, AdSense & Analytics cookies, and how to clear stored preferences.",
    keywords:
      "GST Calculator privacy policy, gstcalculator.me privacy, localStorage GST calculator, AdSense cookies, Google Analytics",
    type: "website",
  },
  {
    path: "/blog/how-to-calculate-gst",
    title: "How to Calculate GST in India — Formula, Examples and Shortcuts | GST Calculator",
    description:
      "Learn how to calculate GST in India using simple formulas — GST-exclusive, GST-inclusive, and reverse GST — with worked examples for every tax slab.",
    type: "article",
  },
  {
    path: "/blog/what-is-gst-india",
    title: "What Is GST? A Plain-English Guide for Indian Businesses | GST Calculator",
    description:
      "What is GST? A clear, jargon-free explanation of India's Goods and Services Tax — how it works, why it replaced VAT, and what it means for businesses.",
    type: "article",
  },
  {
    path: "/blog/gst-rate-slabs-india",
    title: "GST Rate Slabs in India 2024 — Which Rate Applies to You? | GST Calculator",
    description:
      "Complete guide to GST rate slabs in India — 0%, 5%, 12%, 18%, 28% — with product examples, HSN codes, and how to find the right rate.",
    type: "article",
  },
  {
    path: "/blog/cgst-sgst-igst-difference",
    title: "CGST vs SGST vs IGST — What’s the Difference? | GST Calculator",
    description:
      "Understand the difference between CGST, SGST and IGST with practical invoice examples for intra-state and inter-state GST transactions.",
    type: "article",
  },
  {
    path: "/blog/gst-for-freelancers-india",
    title: "GST for Freelancers in India — Do You Need to Register? | GST Calculator",
    description:
      "A practical GST guide for freelancers in India — thresholds, registration rules, 18% tax on services, invoices, and compliance basics.",
    type: "article",
  },
];

const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) return html;
  return html.replace(pattern, replacement);
};

const applySeo = (html, route) => {
  const canonical = `https://gstcalculator.me${route.path === "/" ? "/" : route.path}`;
  let nextHtml = html;

  nextHtml = replaceTag(nextHtml, /<title>.*?<\/title>/s, `<title>${route.title}</title>`);
  nextHtml = replaceTag(nextHtml, /<meta name="description"\s+content="[^"]*">/, `<meta name="description" content="${route.description}">`);
  nextHtml = replaceTag(nextHtml, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`);
  nextHtml = replaceTag(nextHtml, /<meta property="og:url"\s+content="[^"]*">/, `<meta property="og:url" content="${canonical}">`);
  nextHtml = replaceTag(nextHtml, /<meta property="og:title"\s+content="[^"]*">/, `<meta property="og:title" content="${route.title}">`);
  nextHtml = replaceTag(nextHtml, /<meta property="og:description"\s+content="[^"]*">/, `<meta property="og:description" content="${route.description}">`);
  nextHtml = replaceTag(nextHtml, /<meta property="og:type"\s+content="[^"]*">/, `<meta property="og:type" content="${route.type}">`);
  nextHtml = replaceTag(nextHtml, /<meta name="twitter:title"\s+content="[^"]*">/, `<meta name="twitter:title" content="${route.title}">`);
  nextHtml = replaceTag(nextHtml, /<meta name="twitter:description"\s+content="[^"]*">/, `<meta name="twitter:description" content="${route.description}">`);

  if (route.keywords) {
    nextHtml = replaceTag(nextHtml, /<meta name="keywords"\s+content="[^"]*">/, `<meta name="keywords" content="${route.keywords}">`);
  }

  return nextHtml;
};

const writeRouteHtml = async (route, template) => {
  const routeHtml = applySeo(template, route);

  if (route.path === "/") {
    await fs.writeFile(rootHtmlPath, routeHtml, "utf8");
    return;
  }

  const targetDir = path.join(distDir, route.path.replace(/^\//, ""));
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, "index.html"), routeHtml, "utf8");
};

const rootHtml = await fs.readFile(rootHtmlPath, "utf8");
await Promise.all(routes.map((route) => writeRouteHtml(route, rootHtml)));