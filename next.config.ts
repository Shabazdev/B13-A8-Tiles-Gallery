import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module — keep it external from the bundler
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
