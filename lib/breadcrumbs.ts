/* BreadcrumbList schema: tells Google where a page sits in the site, which
   it can show in search results as "Cairns Bin Cleaning › Commercial ›
   Car parks" instead of a bare URL. Home is always first. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cairnsbincleaning.com.au";

export function crumbs(trail: [name: string, path: string][]) {
  const all: [string, string][] = [["Home", "/"], ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${siteUrl}${path === "/" ? "" : path}`,
    })),
  };
}
