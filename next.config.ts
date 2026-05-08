import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins: configuración local dev-only, no afecta producción
  allowedDevOrigins: ['192.168.3.82'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
