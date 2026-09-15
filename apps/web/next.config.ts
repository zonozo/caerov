import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@caerov/shared'],
};

export default nextConfig;
