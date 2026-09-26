export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path === "/" || path.endsWith("/") || path.split("/").pop()?.includes(".")) {
    let response: Response;
    try {
      response = await context.next();
    } catch (err) {
      return new Response(`DEBUG next() threw: ${String(err)}`, {
        status: 404,
        headers: { "content-type": "text/plain", "x-debug-404": "next-threw", "x-debug-mw": "ran" },
      });
    }

    const debugHeaders = new Headers(response.headers);
    debugHeaders.set("x-debug-mw", "ran");
    debugHeaders.set("x-debug-status-seen", String(response.status));

    if (response.status === 404) {
      try {
        const notFoundAsset = await context.env.ASSETS.fetch(new URL("/404/index.html", url.origin));
        debugHeaders.set("x-debug-asset-status", String(notFoundAsset.status));
        if (!notFoundAsset.ok) {
          return new Response(`DEBUG asset fetch not ok: ${notFoundAsset.status}`, {
            status: 404,
            headers: debugHeaders,
          });
        }
        const body = await notFoundAsset.text();
        debugHeaders.set("content-type", "text/html; charset=utf-8");
        debugHeaders.set("x-debug-404", "served");
        return new Response(body, { status: 404, headers: debugHeaders });
      } catch (err) {
        return new Response(`DEBUG asset fetch threw: ${String(err)}`, {
          status: 404,
          headers: debugHeaders,
        });
      }
    }

    return new Response(response.body, { status: response.status, headers: debugHeaders });
  }

  url.pathname = path + "/";
  const redirect = Response.redirect(url.toString(), 301);
  const rHeaders = new Headers(redirect.headers);
  rHeaders.set("x-debug-mw", "ran-redirect-branch");
  return new Response(redirect.body, { status: redirect.status, headers: rHeaders });
};
