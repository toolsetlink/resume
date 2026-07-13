import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 部署到 nginx 静态目录需要 export
  output: 'export',
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
