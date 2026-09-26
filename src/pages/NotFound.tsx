import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calculator, BookOpen } from "lucide-react";
import { setPageSeo, setNoIndex, clearJsonLdScripts } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    clearJsonLdScripts();
    setPageSeo({
      title: "Page Not Found (404) | GST Calculator",
      description: "This page doesn't exist. Use the free GST calculator or browse the blog for GST guides, rates, and compliance tips.",
      path: location.pathname,
    });
    setNoIndex();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 text-[0.7rem] font-semibold tracking-widest text-muted-foreground uppercase mb-6">
            <span>Error 404</span>
            <span className="text-border">·</span>
            <span>Page Not Found</span>
          </div>

          <div className="bg-primary-dark text-primary-foreground rounded-2xl p-8 shadow-lg">
            <div className="text-6xl sm:text-7xl font-bold text-destructive tracking-tight">
              −100%
            </div>
            <p className="mt-3 text-sm text-primary-mid leading-relaxed">
              Pages that don't exist get 100% fewer visits than the rest of the site.
            </p>

            <div className="mt-6 pt-4 border-t border-primary-mid/20 flex items-center justify-between text-[0.7rem] text-primary-mid">
              <span>Confirmed 404</span>
              <span>this URL vs. every real one</span>
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground leading-relaxed">
            This page doesn't exist, or it's moved. Everything else on the site is exactly where you left it.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Calculator className="h-4 w-4" />
                Open the GST Calculator
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/blog">
                <BookOpen className="h-4 w-4" />
                Browse the blog
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default NotFound;
