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

export const setPageSeo = ({ title, description, path, keywords, type = "website" }: PageSeoInput) => {
  const url = new URL(path, SITE_URL).toString();

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