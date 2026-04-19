import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/members',
        destination: '/',
        permanent: true,
      },
      {
        source: '/songs',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/performances',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
