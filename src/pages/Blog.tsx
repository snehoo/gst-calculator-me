import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { POSTS } from "@/lib/blog-posts";

const Blog = () => {
  useEffect(() => {
    document.title = "GST Blog — Guides, Rates & Compliance Tips | GST Calculator";
    const meta =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute(
      "content",
      "Practical GST guides for Indian businesses: how to calculate GST, slabs explained, CGST vs SGST vs IGST, and GST for freelancers.",
    );
    if (!meta.parentNode) document.head.appendChild(meta);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary-dark px-6 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="text-primary-foreground font-bold tracking-tight hover:opacity-90">
          GST<span className="text-primary-mid"> Calculator</span>
        </Link>
        <div className="flex items-center gap-5 text-xs">
          <Link to="/blog" className="text-primary-foreground transition-colors">Blog</Link>
          <Link to="/privacy" className="text-primary-mid hover:text-primary-foreground transition-colors">Privacy</Link>
        </div>
      </nav>

      <header className="bg-primary-dark px-6 sm:px-8 pb-8 text-primary-foreground">
        <Link to="/" className="inline-flex items-center gap-1.5 text-primary-mid text-xs hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to calculator
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">GST Blog</h1>
        <p className="text-primary-mid text-sm mt-1">
          Guides, rate references and compliance tips for Indian businesses
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-8 grid gap-4">
        {POSTS.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${p.slug}`}
            className="block bg-card rounded-2xl border border-border p-5 hover:border-primary-mid hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground mb-2">
              <span className="bg-primary-light text-primary-dark px-2 py-0.5 rounded-full font-semibold">
                {p.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {p.readTime}
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground group-hover:text-primary-dark transition-colors">
              {p.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{p.description}</p>
          </Link>
        ))}
      </main>

      <footer className="border-t border-border mt-4">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} GST Calculator · gstcalculator.me</div>
          <div className="flex gap-5">
            <Link to="/" className="hover:text-foreground transition-colors">Calculator</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
