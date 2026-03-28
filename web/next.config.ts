import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** En carpetas sincronizadas (p. ej. OneDrive) el caché en disco de Webpack a veces falla (ENOENT .pack.gz). */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
