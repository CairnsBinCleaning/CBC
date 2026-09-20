import { crumbs } from "../lib/breadcrumbs";

/* Drops BreadcrumbList schema into a page. Invisible; for search engines. */
export default function Crumbs({ trail }: { trail: [string, string][] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs(trail)).replace(/</g, "\\u003c") }}
    />
  );
}
