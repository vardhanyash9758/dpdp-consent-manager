/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Cloudflare Pages, we need to use standalone output
  output: 'standalone',
  
  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // Empty turbopack config to silence warnings
  turbopack: {},
  
  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig