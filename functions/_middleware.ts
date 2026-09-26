export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Pass through: root, already-trailing-slash, and file paths (have a dot in the last segment)
  if (path === "/" || path.endsWith("/") || path.split("/").pop()?.includes(".")) {
    let response: Response;
    try {
      response = await context.next();
    } catch (err) {
      return new Response(`DEBUG next() threw: ${String(err)}`, {
        status: 404,
        headers: { "content-type": "text/plain", "x-debug-404": "next-threw" },
      });
    }

    if (response.status === 404) {
      try {
        const notFoundAsset = await context.env.ASSETS.fetch(new URL("/404/index.html", url.origin));
        if (!notFoundAsset.ok) {
          return new Response(`DEBUG asset fetch not ok: ${notFoundAsset.status}`, {
            status: 404,
            headers: { "content-type": "text/plain", "x-debug-404": "asset-not-ok" },
          });
        }
        const body = await notFoundAsset.text();
        return new Response(body, {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8", "x-debug-404": "served" },
        });
      } catch (err) {
        return new Response(`DEBUG asset fetch threw: ${String(err)}`, {
          status: 404,
          headers: { "content-type": "text/plain", "x-debug-404": "asset-threw" },
        });
      }
    }

    return response;
  }

  // Enforce trailing slash — 301 so Google consolidates to the canonical URL
  url.pathname = path + "/";
  return Response.redirect(url.toString(), 301);
};
