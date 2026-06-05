import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/account/login",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/seller/login",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
