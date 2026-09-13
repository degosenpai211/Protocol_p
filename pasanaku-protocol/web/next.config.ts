import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname, ".."),
  experimental: {
    optimizePackageImports: ["wagmi", "viem", "@tanstack/react-query", "lucide-react"],
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
