import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["wagmi", "viem", "@tanstack/react-query"],
  },
  devIndicators: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@pasanaku/sdk": path.join(__dirname, "../sdk/src/index.ts"),
    };
    return config;
  },
};

export default nextConfig;
