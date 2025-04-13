/** @type {import('next').NextConfig} */
const nextConfig = {
//   reactStrictMode: true,
  images: {
    domains: ["localhost"],
  },
  experimental: {
    serverActions: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8080/uploads/:path*",
      },
    ];
  },
};
export default nextConfig;
