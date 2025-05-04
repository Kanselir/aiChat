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
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/aiChat',
  trailingSlash: true,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '/aiChat',
};

export default nextConfig;
