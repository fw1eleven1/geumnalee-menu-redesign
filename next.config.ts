import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Docker 빌드에서만 standalone 출력 사용 (기존 next start 배포에는 영향 없음)
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.geumnalee.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
};

export default nextConfig;
