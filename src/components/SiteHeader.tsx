import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { POSTS } from "@/lib/blog-posts";

type ActiveSection = "home" | "blog" | "privacy";

interface SiteHeaderProps {
  active?: ActiveSection;
  showUpdatedLabel?: boolean;
  hideWordmark?: boolean;
}

const SiteHeader = ({ active = "home", showUpdatedLabel = false, hideWordmark = false }: SiteHeaderProps) => {
  const [isBlogOpen, setIsBlogOpen] = useState(false);

  const navLinkClass = (section: Exclude<ActiveSection, "home">) =>
    section === active
      ? "text-primary-foreground"
      : "text-primary-mid hover:text-primary-foreground transition-colors";

  return (
    <nav className={`bg-primary-dark px-6 sm:px-8 py-3.5 flex items-center relative z-20 ${hideWordmark ? "justify-end" : "justify-between"}`}>
      {!hideWordmark && (
        <Link to="/" className="text-primary-foreground font-bold tracking-tight hover:opacity-90">
          GST<span className="text-primary-mid"> Calculator</span>
        </Link>
      )}

      <div className="flex items-center gap-5 text-xs relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsBlogOpen((open) => !open)}
            aria-expanded={isBlogOpen}
            aria-controls="blog-submenu"
            className={`inline-flex items-center gap-1.5 ${navLinkClass("blog")}`}
          >
            Blog
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isBlogOpen ? "rotate-180" : ""}`} />
          </button>

          <div
            id="blog-submenu"
            className={`absolute right-0 top-full mt-3 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-border bg-card shadow-lg transition-all ${
              isBlogOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
            }`}
          >
            <div className="p-2">
              <Link
                to="/blog"
                onClick={() => setIsBlogOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                All blog posts
              </Link>
            </div>
            <div className="border-t border-border px-2 py-2">
              {POSTS.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  onClick={() => setIsBlogOpen(false)}
                  className="block rounded-lg px-3 py-2 hover:bg-muted transition-colors"
                >
                  <div className="text-sm font-medium text-foreground leading-snug">{post.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{post.category}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link to="/privacy" className={navLinkClass("privacy")}>
          Privacy
        </Link>

        {showUpdatedLabel && <span className="text-primary-mid hidden sm:inline">Updated for 2025</span>}
      </div>
    </nav>
  );
};

export default SiteHeader;