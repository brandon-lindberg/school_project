import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete even if there are ESLint errors
    // ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if there are TypeScript errors
    // ignoreBuildErrors: true,
  },
  images: {
    domains: ['media.istockphoto.com'],
  },
  /* Other Next.js config options can go here */
};

export default nextConfig;
