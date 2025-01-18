const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  eslint: {
    // Allow production builds to complete even if there are ESLint errors
    // ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if there are TypeScript errors
    // ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
    ],
  },
  experimental: {
    turbo: {
      rules: {
        // Configure any specific rules for Turbopack here
      }
    }
  }
};

module.exports = withPWA(nextConfig);
