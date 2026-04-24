import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { setPageSeo } from "@/lib/seo";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const Privacy = () => {
  useEffect(() => {
    setPageSeo({
      title: "Privacy Policy | GST Calculator",
      description:
        "How GST Calculator handles your data: localStorage usage, no server-side logging of financial inputs, AdSense & Analytics cookies, and how to clear stored preferences.",
      path: "/privacy",
      keywords: "GST Calculator privacy policy, gstcalculator.me privacy, localStorage GST calculator, AdSense cookies, Google Analytics",
    });
  }, []);

  const lastUpdated = "April 2025";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="privacy" />

      <header className="bg-primary-dark px-6 sm:px-8 pb-8 text-primary-foreground">
        <Link to="/" className="inline-flex items-center gap-1.5 text-primary-mid text-xs hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to calculator
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-primary-mid text-sm mt-1">Last updated: {lastUpdated}</p>
      </header>

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-8">
        <article className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <p className="text-muted-foreground">
              GST Calculator (<strong className="text-foreground">gstcalculator.me</strong>) is a free,
              browser-based tool. We&apos;ve built it to be useful without being invasive — this page
              explains exactly what happens to your data when you use the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">1. No accounts, no personal data collection</h2>
            <p className="text-muted-foreground">
              You do not need to create an account, log in, or provide any personal information to
              use GST Calculator. We do not collect names, email addresses, phone numbers, GSTIN, PAN,
              or any other personally identifiable information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. Your financial inputs stay on your device</h2>
            <p className="text-muted-foreground">
              The amounts you enter into the calculator, the GST slab you choose, the inclusive/exclusive
              mode, and the intra-/inter-state toggle are processed <strong className="text-foreground">entirely
              in your browser</strong>. These values are <strong className="text-foreground">never transmitted to
              our servers</strong> and are <strong className="text-foreground">never logged or stored server-side</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. localStorage — what we store on your device</h2>
            <p className="text-muted-foreground mb-2">
              To make the calculator more useful on repeat visits, we save a small amount of data
              in your browser&apos;s <strong className="text-foreground">localStorage</strong>. This data
              lives on your device only and is never sent to us.
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Your last entered amount, selected slab, mode and transaction type — so you can resume where you left off.</li>
              <li>A visit counter and calculation count — used to decide which contextual tip to show.</li>
              <li>Dismissal flags for tips you&apos;ve already closed, so we don&apos;t nag you.</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              localStorage data is not a cookie, is not shared across sites, and is not accessible to
              any third party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Google AdSense</h2>
            <p className="text-muted-foreground">
              We display ads served by Google AdSense to keep this tool free. Google and its partners
              use cookies and similar technologies to serve ads based on your prior visits to this site
              and other sites on the internet. Google&apos;s use of advertising cookies enables it and its
              partners to serve ads to you. You can opt out of personalised advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary-dark underline">
                Google Ads Settings
              </a>{" "}
              or{" "}
              <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary-dark underline">
                aboutads.info
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Google Analytics</h2>
            <p className="text-muted-foreground">
              We use Google Analytics to understand aggregate traffic patterns — pages visited, country,
              device type, referral source. Google Analytics sets cookies on your device to do this.
              We do <strong className="text-foreground">not</strong> send any of your calculator inputs or
              outputs to Analytics. You can opt out using the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary-dark underline">
                Google Analytics opt-out browser add-on
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Clearing your stored preferences</h2>
            <p className="text-muted-foreground mb-2">
              You can wipe everything we&apos;ve stored on your device at any time, with no impact on
              the site&apos;s functionality:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Chrome / Edge:</strong> Settings → Privacy and security → Clear browsing data → tick &quot;Cookies and other site data&quot; for gstcalculator.me.</li>
              <li><strong className="text-foreground">Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data → Manage Data → search gstcalculator.me → Remove.</li>
              <li><strong className="text-foreground">Safari:</strong> Settings → Privacy → Manage Website Data → search gstcalculator.me → Remove.</li>
              <li>Or open DevTools (F12) → Application → Local Storage → right-click <code className="bg-muted px-1 rounded">gstcalculator.me</code> → Clear.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. Children&apos;s privacy</h2>
            <p className="text-muted-foreground">
              GST Calculator is not directed to children under 13 and we do not knowingly collect any
              information from them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">8. Changes to this policy</h2>
            <p className="text-muted-foreground">
              If we update this policy we&apos;ll change the &quot;Last updated&quot; date at the top.
              Material changes will be highlighted on the homepage for at least a week.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">9. Contact</h2>
            <p className="text-muted-foreground">
              Questions about this policy? Reach out via the contact details on{" "}
              <strong className="text-foreground">gstcalculator.me</strong>.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Privacy;
