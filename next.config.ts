import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* AVIF first (about half the size of JPEG), WebP fallback. */
  images: { formats: ["image/avif", "image/webp"] },

  /* The address finder reads its Cairns address list from disk at runtime.
     Tell the bundler to ship that file with the route. */
  outputFileTracingIncludes: {
    "/api/address": ["./data/cairns-addresses.txt"],
  },

  /* Old site (zacsbinandpressurecleaning.com.au) pages that don't exist
     here under the same name. Once the old domain points at Vercel it
     301s to this site path-for-path, and these catch the leftovers so no
     old Google result lands on a 404. */
  async redirects() {
    return [
      { source: "/contact", destination: "/about", permanent: true },
      { source: "/services", destination: "/prices", permanent: true },
      { source: "/driveway-cleaning", destination: "/pressure-cleaning", permanent: true },
      { source: "/commercial-pressure-cleaning", destination: "/commercial", permanent: true },
    ];
  },

  /* Security headers on every page. HSTS now covers subdomains too (the
     www/bare domain setup is settled). Not submitted to the browser
     preload list on purpose — that's very hard to undo. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
