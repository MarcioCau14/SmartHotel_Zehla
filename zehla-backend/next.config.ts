import type { NextConfig } from "next";

// workaround: processo de build via scripts/build.mjs para contornar
// bug do Next.js 16.x com output:standalone + Edge middleware que nao
// gera middleware.js/middleware.js.nft.json (ENOENT na finalizacao)
const nextConfig: NextConfig = {
  output: 'standalone',
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
};

export default nextConfig;


