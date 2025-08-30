/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chat-app-media-aryan.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
