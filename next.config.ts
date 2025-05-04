import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['react-markdown'],
  },
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/aiChat' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/aiChat' : '',
  trailingSlash: true,
};

export default nextConfig;
