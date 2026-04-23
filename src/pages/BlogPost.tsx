import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const POSTS: Record<string, { title: string; date: string; body: string[] }> = {
  "gst-slabs-explained": {
    title: "GST Slabs Explained: 0%, 5%, 12%, 18% & 28%",
    date: "2025-03-12",
    body: [
      "India's GST system uses five primary slabs. Knowing which slab applies to your product or service is the first step to filing correctly.",
      "0% (Nil): essentials like fresh vegetables, milk, eggs, books and educational services.",
      "5%: packaged food, transport, small restaurants, life-saving drugs.",
      "12% / 18%: the bulk of goods and most services. 18% is the most common slab.",
      "28%: luxury items, tobacco, large vehicles and select sin goods.",
    ],
  },
  "cgst-sgst-igst-difference": {
    title: "CGST vs SGST vs IGST — The Difference, In Plain English",
    date: "2025-02-28",
    body: [
      "Every GST transaction in India is either intra-state or inter-state. The split changes based on that.",
      "Intra-state (buyer and seller in the same state): GST is split equally into CGST (Central) and SGST (State).",
      "Inter-state (different states): the entire GST is charged as IGST and later distributed by the centre.",
      "Use the toggle on the calculator to see the breakdown change in real time.",
    ],
  },
  "gstr-3b-filing-guide": {
    title: "GSTR-3B Filing Guide: Deadlines, Late Fees & Common Mistakes",
    date: "2025-02-14",
    body: [
      "GSTR-3B is the monthly summary return every regular taxpayer must file by the 20th of the following month.",
      "Late filing attracts ₹50/day (₹20/day for nil returns) plus 18% interest on tax due.",
      "Most common mistakes: mismatched ITC vs GSTR-2B, missed RCM entries, and wrong place-of-supply.",
    ],
  },
  "gst-registration-threshold": {
    title: "Do You Need to Register for GST?",
    date: "2025-01-30",
    body: [
      "Goods suppliers must register once turnover crosses ₹40 lakh in a financial year (₹20L for special category states).",
      "Service providers must register at ₹20 lakh (₹10L for special category states).",
      "Inter-state suppliers and e-commerce sellers must register from day one regardless of turnover.",
    ],
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? POSTS[slug] : undefined;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | GST Calculator`;
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">Post not found.</p>
          <Link to="/blog" className="text-primary-dark underline">Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary-dark px-6 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="text-primary-foreground font-bold tracking-tight hover:opacity-90">
          GST<span className="text-primary-mid"> Calculator</span>
        </Link>
        <div className="flex items-center gap-5 text-xs">
          <Link to="/blog" className="text-primary-foreground">Blog</Link>
          <Link to="/privacy" className="text-primary-mid hover:text-primary-foreground transition-colors">Privacy</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-8">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> All posts
        </Link>
        <article className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <p className="text-xs text-muted-foreground mb-2">
            {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{post.title}</h1>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            {post.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPost;
