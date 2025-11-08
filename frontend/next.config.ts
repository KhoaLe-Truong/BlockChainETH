import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Cho phép dev qua IP LAN này
    allowedDevOrigins: ['192.168.187.155'],
  },
};

export default nextConfig;
