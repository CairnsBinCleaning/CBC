import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* The address finder reads its Cairns address list from disk at runtime.
     Tell the bundler to ship that file with the route. */
  outputFileTracingIncludes: {
    "/api/address": ["./data/cairns-addresses.txt"],
  },
};

export default nextConfig;
