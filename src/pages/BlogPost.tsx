import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { getPost, POSTS, type Block } from "@/lib/blog-posts";
import { setPageSeo, setArticleSchema, setBreadcrumbListSchema, clearJsonLdScripts } from "@/lib/seo";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const renderBlock = (b: Block, i: number) => {
  switch (b.type) {
    case "lead":
      return (
        <p
          key={i}
          className="text-base sm:text-lg text-primary-dark italic border-l-[3px] border-primary-mid bg-primary-light/40 rounded-r-lg px-4 py-3 leading-relaxed"
        >
          {b.text}
        </p>
      );
    case "p":
      return (
        <p
          key={i}
          className="text-[15px] text-foreground leading-relaxed [&_a]:text-primary-dark [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary-mid"
          dangerouslySetInnerHTML={{ __html: b.text }}
        />
      );
    case "h2":
      return (
        <h2
          key={i}
          className="text-xl sm:text-2xl font-bold text-foreground mt-8 pt-4 border-t border-border"
        >
          {b.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="text-base sm:text-lg font-bold text-primary-dark mt-5">
          {b.text}
        </h3>
      );
    case "stat":
      return (
        <div
          key={i}
          className="bg-card border-l-4 border-primary-mid rounded-r-xl px-5 py-4 shadow-sm"
        >
          <div className="text-3xl font-bold text-primary-dark font-serif">{b.num}</div>
          <div className="text-xs text-muted-foreground mt-1">{b.label}</div>
        </div>
      );
    case "statGrid":
      return (
        <div key={i} className="grid grid-cols-2 gap-3">
          {b.items.map((it, j) => (
            <div
              key={j}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="text-lg font-bold text-primary-dark">{it.n}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1 leading-snug">
                {it.l}
              </div>
            </div>
          ))}
        </div>
      );
    case "slabGrid":
      return (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {b.items.map((it, j) => (
            <div
              key={j}
              className="bg-card border border-border rounded-lg p-3 text-center"
            >
              <div className="text-xl font-bold text-primary-dark">{it.r}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1 leading-snug">
                {it.l}
              </div>
            </div>
          ))}
        </div>
      );
    case "formula":
      return (
        <div key={i} className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm font-bold text-foreground mb-2">{b.title}</div>
          <pre className="text-[13px] text-muted-foreground bg-primary-light/40 rounded-md p-3 whitespace-pre-wrap font-mono leading-relaxed">
            {b.code}
          </pre>
        </div>
      );
    case "highlight":
      return (
        <div
          key={i}
          className="bg-primary-light/60 border-l-[3px] border-primary-mid rounded-r-lg px-5 py-4 text-sm text-primary-dark leading-relaxed"
          dangerouslySetInnerHTML={{ __html: b.html }}
        />
      );
    case "warn":
      return (
        <div
          key={i}
          className="bg-yellow-50 border-l-[3px] border-yellow-500 rounded-r-lg px-5 py-4 text-sm text-yellow-900 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: b.html }}
        />
      );
    case "checklist":
      return (
        <div key={i} className="flex flex-col gap-2.5">
          {b.items.map((it, j) => (
            <div
              key={j}
              className="flex gap-3 items-start bg-card border border-border rounded-xl px-4 py-3"
            >
              <span className="text-primary-dark font-bold text-sm flex-shrink-0 mt-0.5 min-w-[1rem]">
                {it.mark ?? "•"}
              </span>
              <p
                className="text-[15px] text-foreground leading-relaxed flex-1 [&_a]:text-primary-dark [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: it.html }}
              />
            </div>
          ))}
        </div>
      );
    case "invoiceFields":
      return (
        <div key={i} className="flex flex-col">
          {b.items.map((it, j) => (
            <div
              key={j}
              className="flex gap-3 items-start py-3 border-b border-border last:border-b-0"
            >
              <div className="bg-primary-dark text-primary-foreground text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {j + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-foreground mb-1">{it.title}</div>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case "example":
      return (
        <div key={i} className="bg-card border border-border rounded-xl p-5">
          <div className="text-[11px] font-bold text-primary-dark uppercase tracking-wider mb-2">
            {b.title}
          </div>
          <div className="space-y-1.5">
            {b.lines.map((l, j) => (
              <p
                key={j}
                className="text-sm text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: l }}
              />
            ))}
          </div>
        </div>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="border-l-[3px] border-primary-mid pl-4 py-2 italic text-primary-dark bg-primary-light/30 rounded-r-md"
        >
          {b.text}
        </blockquote>
      );
    case "steps":
      return (
        <div key={i} className="space-y-3">
          {b.items.map((s, j) => (
            <div key={j} className="flex gap-3 items-start">
              <div className="bg-primary-dark text-primary-foreground text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {j + 1}
              </div>
              <p className="text-[15px] text-foreground leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: s }} />
            </div>
          ))}
        </div>
      );
    case "cta":
      return (
        <div
          key={i}
          className="bg-primary-dark rounded-2xl p-6 sm:p-8 text-center my-4"
        >
          <h3 className="text-lg sm:text-xl font-bold text-primary-foreground mb-2">
            {b.title}
          </h3>
          <p className="text-sm text-primary-mid mb-5">{b.text}</p>
          <Link
            to="/"
            className="inline-block bg-primary-foreground text-primary-dark font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Open GST Calculator →
          </Link>
        </div>
      );
    case "image":
      return (
        <img
          key={i}
          src={b.src}
          alt={b.alt}
          loading="lazy"
          className="w-full rounded-xl border border-border my-2"
        />
      );
    case "table":
      return (
        <div key={i} className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-primary-light/40">
              <tr>
                {b.headers.map((h, j) => (
                  <th key={j} className="text-left font-bold text-primary-dark px-3 py-2 border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, r) => (
                <tr key={r} className="odd:bg-card even:bg-background">
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className="px-3 py-2 border-b border-border last:border-b-0 text-foreground align-top"
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "ul":
      return (
        <ul key={i} className="list-disc pl-5 space-y-1.5 text-[15px] text-foreground leading-relaxed marker:text-primary-mid">
          {b.items.map((it, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </ul>
      );
    case "divider":
      return <hr key={i} className="border-t border-border my-2" />;
    case "sourceLink":
      return (
        <p key={i} className="text-xs">
          <a
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-dark underline underline-offset-2 hover:text-primary-mid"
          >
            {b.label ?? "Source"}
          </a>
        </p>
      );
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;

  useEffect(() => {
    if (post) {
      clearJsonLdScripts();

      setPageSeo({
        title: `${post.title} | GST Calculator`,
        description: post.description,
        path: `/blog/${post.slug}`,
        type: "article",
      });

      setArticleSchema({
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
      });

      setBreadcrumbListSchema([
        { position: 1, name: "Home", item: "https://gstcalculator.me/" },
        { position: 2, name: "Blog", item: "https://gstcalculator.me/blog" },
        { position: 3, name: post.title, item: `https://gstcalculator.me/blog/${post.slug}` },
      ]);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">Post not found.</p>
          <Link to="/blog" className="text-primary-dark underline">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="blog" />

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-8">
        <div className="flex items-center gap-4 text-xs mb-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All posts
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </div>

        <article className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground mb-3">
            <span className="bg-primary-light text-primary-dark px-2 py-0.5 rounded-full font-semibold">
              {post.category}
            </span>
            <span>
              {new Date(post.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>· {post.readTime} read</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-5 text-foreground">
            {post.title}
          </h1>
          <div className="space-y-4">{post.body.map(renderBlock)}</div>

          {/* Related posts */}
          <div className="bg-background border border-border rounded-2xl p-5 mt-10">
            <h3 className="text-sm font-bold text-foreground mb-3">More from GST Calculator</h3>
            <div className="flex flex-col gap-2.5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="flex gap-2.5 items-start group"
                >
                  <span className="text-[10px] bg-primary-light text-primary-dark px-2 py-0.5 rounded-full font-semibold border border-primary-mid/30 flex-shrink-0 mt-0.5">
                    {r.category}
                  </span>
                  <span className="text-sm text-foreground group-hover:text-primary-dark transition-colors leading-snug">
                    {r.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm mt-6">
            <Link to="/blog" className="text-primary-dark hover:underline inline-flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> All articles
            </Link>
            <Link to="/" className="text-primary-dark hover:underline inline-flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" /> Back to calculator
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogPost;
