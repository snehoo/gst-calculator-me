import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server.js";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Privacy from "./pages/Privacy.tsx";

// ─────────────────────────────────────────────────────────────────
// TrailingSlashRedirect
// Client-side safety net — redirects /blog/slug → /blog/slug/
// Works alongside public/_redirects for full coverage.
// Only runs in the browser (not during SSR prerender).
// ─────────────────────────────────────────────────────────────────
function TrailingSlashRedirect() {
  const location = useLocation();
  const { pathname, search, hash } = location;

  if (
    pathname !== "/" &&
    !pathname.endsWith("/") &&
    !/\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return <Navigate to={pathname + "/" + search + hash} replace />;
  }

  return null;
}

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/" element={<Blog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="/blog/:slug/" element={<BlogPost />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/privacy/" element={<Privacy />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

interface AppProps {
  /** When provided, render with StaticRouter (SSR). Otherwise use BrowserRouter (client). */
  location?: string;
}

const App = ({ location }: AppProps = {}) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {location ? (
        // SSR prerender — StaticRouter, no TrailingSlashRedirect needed
        <StaticRouter location={location}>
          <AppRoutes />
        </StaticRouter>
      ) : (
        // Client — BrowserRouter with trailing slash enforcer
        <BrowserRouter>
          <TrailingSlashRedirect />
          <AppRoutes />
        </BrowserRouter>
      )}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
