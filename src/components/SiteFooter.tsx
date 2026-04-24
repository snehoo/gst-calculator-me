import { Link } from "react-router-dom";

const SiteFooter = () => (
  <footer className="border-t border-border mt-4">
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">
        Calculator
      </Link>
      <Link to="/blog" className="hover:text-foreground transition-colors">
        Blog
      </Link>
      <Link to="/privacy" className="hover:text-foreground transition-colors">
        Privacy Policy
      </Link>
    </div>
  </footer>
);

export default SiteFooter;