const SITE_URL = "https://gstcalculator.me";

const upsertNamedMeta = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};

const upsertPropertyMeta = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  type?: "website" | "article";
}

const injectJsonLd = (schema: Record<string, unknown>) => {
  const script = document.createElement("script");
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

export const clearJsonLdScripts = () => {
  document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
};

export const setPageSeo = ({ title, description, path, keywords, type = "website" }: PageSeoInput) => {
  // Add trailing slash for blog posts, but not for root or privacy
  let normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
  if (normalizedPath.startsWith("/blog")) {
    normalizedPath = `${normalizedPath}/`;
  }
  const url = `${SITE_URL}${normalizedPath}`;

  document.title = title;
  upsertNamedMeta("description", description);

  if (keywords) {
    upsertNamedMeta("keywords", keywords);
  }

  upsertCanonical(url);
  upsertPropertyMeta("og:title", title);
  upsertPropertyMeta("og:description", description);
  upsertPropertyMeta("og:url", url);
  upsertPropertyMeta("og:type", type);
  upsertNamedMeta("twitter:title", title);
  upsertNamedMeta("twitter:description", description);
};

interface WebApplicationSchema {
  name: string;
  description: string;
}

export const setWebApplicationSchema = ({ name, description }: WebApplicationSchema) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: SITE_URL + "/",
    description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: "en-IN",
    offers: {
      "@type": "Offer",
      price: "0",
      "priceCurrency": "INR",
    },
  };
  injectJsonLd(schema);
};

interface FAQItem {
  question: string;
  answer: string;
}

export const setFAQPageSchema = (items: FAQItem[]) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  injectJsonLd(schema);
};

interface BreadcrumbItem {
  position: number;
  name: string;
  item: string;
}

export const setBreadcrumbListSchema = (items: BreadcrumbItem[]) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      item: item.item,
    })),
  };
  injectJsonLd(schema);
};

interface ArticleSchema {
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}

export const setArticleSchema = ({
  headline,
  description,
  datePublished,
  dateModified,
  author,
}: ArticleSchema) => {
  // Add trailing slash for blog posts to stay consistent with canonical
  const pathname = window.location.pathname;
  let normalizedPathname = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  if (normalizedPathname.startsWith("/blog")) {
    normalizedPathname = `${normalizedPathname}/`;
  }
  const url = `${SITE_URL}${normalizedPathname}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    datePublished,
    dateModified,
    inLanguage: "en-IN",
    author: {
      "@type": "Organization",
      name: author ?? "GST Calculator Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "GST Calculator",
      url: SITE_URL,
    },
  };
  injectJsonLd(schema);
};
