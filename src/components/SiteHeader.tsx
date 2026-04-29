import { Link } from "react-router-dom";

type ActiveSection = "home" | "blog" | "privacy";

interface SiteHeaderProps {
  active?: ActiveSection;
  showUpdatedLabel?: boolean;
  hideWordmark?: boolean;
}

const SiteHeader = ({ active = "home", showUpdatedLabel = false, hideWordmark = false }: SiteHeaderProps) => {
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

      <div className="flex items-center gap-5 text-xs">
        <Link to="/blog" className={navLinkClass("blog")}>
          Blog
        </Link>

        <Link to="/privacy" className={navLinkClass("privacy")}>
          Privacy
        </Link>

        {showUpdatedLabel && <span className="text-primary-mid hidden sm:inline">Updated for 2025</span>}
      </div>
    </nav>
  );
};

export default SiteHeader;
