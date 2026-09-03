export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Pass through: root, already-trailing-slash, and file paths (have a dot in the last segment)
  if (path === "/" || path.endsWith("/") || path.split("/").pop()?.includes(".")) {
    return context.next();
  }

  // Enforce trailing slash — 301 so Google consolidates to the canonical URL
  url.pathname = path + "/";
  return Response.redirect(url.toString(), 301);
};
