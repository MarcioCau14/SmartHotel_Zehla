import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  optimizeFonts: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },

};

export default nextConfig;


