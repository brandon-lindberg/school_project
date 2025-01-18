declare module 'next-pwa' {
  import { NextConfig } from 'next';
  function withPWA(config: {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
  }): (nextConfig: NextConfig) => NextConfig;
  export = withPWA;
}
