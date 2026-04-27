process.env.NODE_ENV = "production";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";
import ts from "typescript";

const distDir = path.resolve("dist");
const rootHtmlPath = path.join(distDir, "index.html");
const siteUrl = "https://gstcalculator.me";

// ---------- 1. Load blog posts data (TS) ----------
const loadPosts = async () => {
  const source = await fs.readFile(path.resolve("src/lib/blog-posts.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2020,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
  const { POSTS } = await import(dataUrl);
  return POSTS;
};

const POSTS = await loadPosts();

// ---------- 2. Bundle the SSR entry with esbuild ----------
const ssrOutFile = path.resolve(".ssr/entry-server.mjs");
await fs.mkdir(path.dirname(ssrOutFile), { recursive: true });

await esbuild.build({
  entryPoints: [path.resolve("src/entry-server.tsx")],
  outfile: ssrOutFile,
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  target: "node18",
  packages: "external",
  loader: { ".css": "empty", ".svg": "dataurl", ".png": "dataurl", ".jpg": "dataurl" },
  alias: { "@": path.resolve("src") },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

// ---------- 3. Install minimal browser globals so module-init code doesn't crash ----------
const memoryStorage = () => {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
};

if (typeof globalThis.window === "undefined") globalThis.window = globalThis;
if (typeof globalThis.localStorage === "undefined") globalThis.localStorage = memoryStorage();
if (typeof globalThis.sessionStorage === "undefined") globalThis.sessionStorage = memoryStorage();
if (typeof globalThis.document === "undefined") {
  const makeEl = () => ({
    style: {},
    setAttribute: () => {},
    appendChild: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  globalThis.document = {
    title: "",
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    createElement: () => makeEl(),
    createElementNS: () => makeEl(),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    documentElement: { lang: "en", style: {} },
  };
}
if (typeof globalThis.navigator === "undefined") globalThis.navigator = { userAgent: "node" };
globalThis.window.matchMedia = globalThis.window.matchMedia || (() => ({
  matches: false,
  media: "",
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}));

// ---------- 4. Import the bundled SSR render() ----------
const { render } = await import(pathToFileURL(ssrOutFile).href);

// ---------- 5. Routes & meta ----------
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
  ...POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    title: `${post.title} | GST Calculator`,
    description: post.description,
    type: "article",
    post,
  })),
];

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (value) =>
  String(value)
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) return html;
  return html.replace(pattern, replacement);
};

const applySeo = (html, route, bodyHtml) => {
  const canonical = `${siteUrl}${route.path === "/" ? "/" : route.path}`;
  let nextHtml = html;

  nextHtml = replaceTag(nextHtml, /<title>.*?<\/title>/s, `<title>${escapeHtml(route.title)}</title>`);
  nextHtml = replaceTag(nextHtml, /<meta name="description"\s+content="[^"]*">/, `<meta name="description" content="${escapeHtml(route.description)}">`);
  nextHtml = replaceTag(nextHtml, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`);
  nextHtml = replaceTag(nextHtml, /<meta property="og:url"\s+content="[^"]*">/, `<meta property="og:url" content="${canonical}">`);
  nextHtml = replaceTag(nextHtml, /<meta property="og:title"\s+content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(route.title)}">`);
  nextHtml = replaceTag(nextHtml, /<meta property="og:description"\s+content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(route.description)}">`);
  nextHtml = replaceTag(nextHtml, /<meta property="og:type"\s+content="[^"]*">/, `<meta property="og:type" content="${route.type}">`);
  nextHtml = replaceTag(nextHtml, /<meta name="twitter:title"\s+content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(route.title)}">`);
  nextHtml = replaceTag(nextHtml, /<meta name="twitter:description"\s+content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(route.description)}">`);

  // Inject the SSR-rendered HTML into the #root container
  nextHtml = nextHtml.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${bodyHtml}</div>`,
  );

  if (route.keywords) {
    nextHtml = replaceTag(nextHtml, /<meta name="keywords"\s+content="[^"]*">/, `<meta name="keywords" content="${escapeHtml(route.keywords)}">`);
  }

  if (route.type === "article" && route.post) {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: route.post.title,
      description: route.post.description,
      datePublished: route.post.date,
      dateModified: route.post.date,
      inLanguage: "en-IN",
      mainEntityOfPage: canonical,
      author: { "@type": "Organization", name: "GST Calculator" },
      publisher: {
        "@type": "Organization",
        name: "GST Calculator",
        logo: { "@type": "ImageObject", url: `${siteUrl}/apple-touch-icon.png` },
      },
      articleBody: route.post.body
        .map((block) => stripHtml(block.text || block.html || block.code || block.title || ""))
        .filter(Boolean)
        .join(" "),
    };
    nextHtml = nextHtml.replace(
      "</head>",
      `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>\n  </head>`,
    );
  }

  return nextHtml;
};

const writeRouteHtml = async (route, template) => {
  let bodyHtml = "";
  try {
    bodyHtml = render(route.path);
  } catch (err) {
    console.error(`[prerender] SSR render failed for ${route.path}:`, err);
    throw err;
  }

  const routeHtml = applySeo(template, route, bodyHtml);

  if (route.path === "/") {
    await fs.writeFile(rootHtmlPath, routeHtml, "utf8");
    return;
  }

  const targetDir = path.join(distDir, route.path.replace(/^\//, ""));
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, "index.html"), routeHtml, "utf8");
};

const rootHtml = await fs.readFile(rootHtmlPath, "utf8");

// Run sequentially so SSR errors are easy to attribute.
for (const route of routes) {
  await writeRouteHtml(route, rootHtml);
  console.log(`[prerender] ${route.path}`);
}

console.log(`[prerender] done — ${routes.length} routes`);
