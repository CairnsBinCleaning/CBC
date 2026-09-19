import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* AVIF first (about half the size of JPEG), WebP fallback. */
  images: { formats: ["image/avif", "image/webp"] },

  /* The address finder reads its Cairns address list from disk at runtime.
     Tell the bundler to ship that file with the route. */
  outputFileTracingIncludes: {
    "/api/address": ["./data/cairns-addresses.txt"],
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
