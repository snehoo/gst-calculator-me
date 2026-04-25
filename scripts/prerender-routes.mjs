import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const distDir = path.resolve("dist");
const rootHtmlPath = path.join(distDir, "index.html");
const siteUrl = "https://gstcalculator.me";

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

const renderBlogLinks = () => `
  <nav class="static-blog-nav" aria-label="GST blog articles">
    <a href="/">GST Calculator</a>
    <a href="/blog">GST Blog</a>
    ${POSTS.map((post) => `<a href="/blog/${post.slug}">${escapeHtml(post.title)}</a>`).join("\n    ")}
    <a href="/privacy">Privacy</a>
  </nav>`;

const renderStaticShell = (inner) => `
  <div class="seo-static-page">
    <header class="seo-static-header">
      <p><a href="/">GST Calculator</a></p>
      ${renderBlogLinks()}
    </header>
    ${inner}
  </div>`;

const renderHomeContent = () =>
  renderStaticShell(`
    <main>
      <h1>GST Calculator</h1>
      <p>Instant GST computation for all Indian tax slabs with CGST, SGST and IGST breakdowns.</p>
      <section aria-labelledby="gst-slabs-heading">
        <h2 id="gst-slabs-heading">GST Slab Reference Guide</h2>
        <ul>
          <li><strong>0%:</strong> Essential food grains, milk, vegetables, fruits, books and newspapers.</li>
          <li><strong>5%:</strong> Packaged foods, sugar, tea, coffee, edible oil and transport services.</li>
          <li><strong>12%:</strong> Apparel above ₹1000, processed food, mobile phones and computers.</li>
          <li><strong>18%:</strong> Electronics, IT services, telecom, restaurants and most financial services.</li>
          <li><strong>28%:</strong> Luxury cars, tobacco, cement, pan masala and premium goods.</li>
        </ul>
      </section>
      <section aria-labelledby="gst-guides-heading">
        <h2 id="gst-guides-heading">GST Guides</h2>
        ${POSTS.map(
          (post) => `<article>
            <h3><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></h3>
            <p>${escapeHtml(post.description)}</p>
          </article>`,
        ).join("\n        ")}
      </section>
    </main>`);

const renderBlogIndexContent = () =>
  renderStaticShell(`
    <main>
      <h1>GST Blog</h1>
      <p>Guides, rate references and compliance tips for Indian businesses.</p>
      ${POSTS.map(
        (post) => `<article>
          <p>${escapeHtml(post.category)} · ${escapeHtml(post.readTime)}</p>
          <h2><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></h2>
          <p>${escapeHtml(post.description)}</p>
        </article>`,
      ).join("\n      ")}
    </main>`);

const renderBlock = (block) => {
  switch (block.type) {
    case "lead":
    case "p":
      return `<p>${block.type === "p" ? block.text : escapeHtml(block.text)}</p>`;
    case "h2":
      return `<h2>${escapeHtml(block.text)}</h2>`;
    case "h3":
      return `<h3>${escapeHtml(block.text)}</h3>`;
    case "stat":
      return `<aside><strong>${escapeHtml(block.num)}</strong><p>${escapeHtml(block.label)}</p></aside>`;
    case "statGrid":
      return `<ul>${block.items.map((item) => `<li><strong>${escapeHtml(item.n)}</strong> — ${escapeHtml(item.l)}</li>`).join("")}</ul>`;
    case "slabGrid":
      return `<ul>${block.items.map((item) => `<li><strong>${escapeHtml(item.r)}</strong> — ${escapeHtml(item.l)}</li>`).join("")}</ul>`;
    case "formula":
      return `<section><h3>${escapeHtml(block.title)}</h3><pre>${escapeHtml(block.code)}</pre></section>`;
    case "highlight":
      return `<aside>${block.html}</aside>`;
    case "example":
      return `<section><h3>${escapeHtml(block.title)}</h3>${block.lines.map((line) => `<p>${line}</p>`).join("")}</section>`;
    case "quote":
      return `<blockquote>${escapeHtml(block.text)}</blockquote>`;
    case "steps":
      return `<ol>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
    case "cta":
      return `<aside><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.text)}</p><p><a href="/">Open GST Calculator</a></p></aside>`;
    default:
      return "";
  }
};

const renderPostContent = (post) =>
  renderStaticShell(`
    <main>
      <p><a href="/blog">All blog posts</a> · <a href="/">Home</a></p>
      <article>
        <p>${escapeHtml(post.category)} · ${escapeHtml(post.readTime)}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p>${escapeHtml(post.description)}</p>
        ${post.body.map(renderBlock).join("\n        ")}
      </article>
      <aside>
        <h2>More from GST Calculator</h2>
        <ul>
          ${POSTS.filter((item) => item.slug !== post.slug)
            .map((item) => `<li><a href="/blog/${item.slug}">${escapeHtml(item.title)}</a></li>`)
            .join("\n          ")}
        </ul>
      </aside>
    </main>`);

const renderPrivacyContent = () =>
  renderStaticShell(`
    <main>
      <h1>Privacy Policy</h1>
      <p>GST Calculator keeps calculator inputs local in your browser and uses basic cookies or storage only for site functionality, analytics, and advertising where enabled.</p>
    </main>`);

const getStaticContent = (route) => {
  if (route.path === "/") return renderHomeContent();
  if (route.path === "/blog") return renderBlogIndexContent();
  if (route.path === "/privacy") return renderPrivacyContent();
  if (route.post) return renderPostContent(route.post);
  return "";
};

const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) return html;
  return html.replace(pattern, replacement);
};

const applySeo = (html, route) => {
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
  nextHtml = nextHtml.replace("<!--SEO_STATIC_CONTENT-->", getStaticContent(route));

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
      publisher: { "@type": "Organization", name: "GST Calculator", logo: { "@type": "ImageObject", url: `${siteUrl}/apple-touch-icon.png` } },
      articleBody: route.post.body.map((block) => stripHtml(block.text || block.html || block.code || block.title || "")).filter(Boolean).join(" "),
    };
    nextHtml = nextHtml.replace("</head>", `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>\n  </head>`);
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
