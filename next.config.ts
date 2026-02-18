import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-5ad5f7c802a843e0a594defda4055bb9.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // ✅ add this
      {
        protocol: "https",
        hostname: "api-gpsf.datacolabx.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;