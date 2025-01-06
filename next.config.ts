import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  /* Other Next.js config options can go here */
};

export default nextConfig;
