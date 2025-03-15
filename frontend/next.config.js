/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Get the current environment
    const isDev = process.env.NODE_ENV === "development";

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            // In development, allow both localhost and Clerk domains
            value: isDev ? "http://localhost:3000" : "https://clerk.clerk.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "*",
          },
          {
            // Add Vary header to ensure browsers handle CORS correctly
            key: "Vary",
            value: "Origin",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "https://premium-molly-12.clerk.accounts.dev/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
