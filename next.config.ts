import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // add any other hostnames you actually use
    ],
  },
  // Optional: pin the workspace root to silence the Turbopack warning
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig