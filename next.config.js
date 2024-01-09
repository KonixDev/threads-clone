/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
    experimental: {
      serverComponentsExternalPackages: ["mongoose"],
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "img.clerk.com",
        },
        {
          protocol: "https",
          hostname: "images.clerk.dev",
        },
        {
          protocol: "https",
          hostname: "uploadthing.com",
        },
        {
          protocol: "https",
          hostname: "placehold.co",
        },
        {
          protocol: "https",
          hostname: "utfs.io",
        }
      ],
    },
  };
  
  module.exports = nextConfig;