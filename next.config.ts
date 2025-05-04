import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
  trailingSlash: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? '/aiChat' : '',
};

export default nextConfig;
