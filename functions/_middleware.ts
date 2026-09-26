export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Pass through: root, already-trailing-slash, and file paths (have a dot in the last segment)
  if (path === "/" || path.endsWith("/") || path.split("/").pop()?.includes(".")) {
    const response = await context.next();

    // Nothing matched (no static asset, no _redirects rule) — serve the real
    // prerendered 404 page instead of the platform's bare empty fallback.
    // (_redirects can't do this: Cloudflare Pages only accepts 200/301/302/
    // 303/307/308 as a rule's status, so a 404 rewrite there is silently
    // dropped. This is the documented way to do it from a Function instead —
    // ask context.next()'s result whether it 404'd, and if so, fetch the
    // static 404 page's own bytes via the ASSETS binding and re-wrap them in
    // a fresh 404 response.)
    if (response.status === 404) {
      const notFoundAsset = await context.env.ASSETS.fetch(new URL("/404/index.html", url.origin));
      return new Response(notFoundAsset.body, { status: 404, headers: notFoundAsset.headers });
    }

    return response;
  }

  // Enforce trailing slash — 301 so Google consolidates to the canonical URL
  url.pathname = path + "/";
  return Response.redirect(url.toString(), 301);
};
