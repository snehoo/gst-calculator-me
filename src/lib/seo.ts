/**
 * seo.ts — canonical, meta, and JSON-LD helpers for gstcalculator.me
 *
 * Key fix: canonical tag is always written/updated BEFORE any other meta so
 * that when vite-plugin-prerender snapshots the DOM, the correct URL is present.
 */

const BASE_URL = "https://gstcalculator.me";

// ─── Helpers ────────────────────────────────────────────────────────────────

function setMeta(selector: string, attr: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    // Set the identifying attribute (name or property) from the selector
    const match = selector.match(/\[([^\]]+)="([^"]+)"\]/);
    if (match) el.setAttribute(match[1], match[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setLink(rel: string, href: string) {
  // Remove any existing tags with this rel first to avoid duplicates
  document
    .querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`)
    .forEach((el) => el.remove());

  const el = document.createElement("link");
  el.setAttribute("rel", rel);
  el.setAttribute("href", href);
  document.head.appendChild(el);
}

function injectJsonLd(id: string, data: object) {
  let el = document.querySelector<HTMLScriptElement>(`script[data-ld="${id}"]`);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-ld", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface PageSeoOptions {
  title: string;
  description: string;
  /** Path starting with /, e.g. "/blog/how-to-calculate-gst" — NO trailing slash */
  path: string;
  keywords?: string;
  type?: "website" | "article";
}

export function setPageSeo({
  title,
  description,
  path,
  keywords,
  type = "website",
}: PageSeoOptions) {
  // Normalise: strip trailing slash (except root "/")
  const normPath = path.length > 1 ? path.replace(/\/$/, "") : path;
  const canonical = `${BASE_URL}${normPath}`;

  // 1. Title
  document.title = title;

  // 2. Canonical — must be set first and must be the exact URL in the sitemap
  setLink("canonical", canonical);

  // 3. Standard meta
  setMeta('meta[name="description"]', "content", description);
  if (keywords) {
    setMeta('meta[name="keywords"]', "content", keywords);
  }

  // 4. Open Graph
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[property="og:url"]', "content", canonical);
  setMeta('meta[property="og:type"]', "content", type);
  setMeta('meta[property="og:site_name"]', "content", "GST Calculator India");

  // 5. Twitter / X card
  setMeta('meta[name="twitter:card"]', "content", "summary");
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", description);
}

// ─── Schema helpers ──────────────────────────────────────────────────────────

export function clearJsonLdScripts() {
  document
    .querySelectorAll('script[type="application/ld+json"][data-ld]')
    .forEach((el) => el.remove());
}

export function setWebApplicationSchema({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  injectJsonLd("webapp", {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: BASE_URL,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  });
}

export function setArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
}) {
  injectJsonLd("article", {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified,
    publisher: {
      "@type": "Organization",
      name: "GST Calculator India",
      url: BASE_URL,
    },
  });
}

export function setBreadcrumbListSchema(
  items: { position: number; name: string; item: string }[],
) {
  injectJsonLd("breadcrumb", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ position, name, item }) => ({
      "@type": "ListItem",
      position,
      name,
      item,
    })),
  });
}

export function setFAQPageSchema(
  faqs: { question: string; answer: string }[],
) {
  injectJsonLd("faq", {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  });
}
