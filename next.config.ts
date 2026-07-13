import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // 部署到 nginx 静态目录需要 export
  output: 'export',
  images: { unoptimized: true },
  turbopack: {
    root: __dirname,
  },
}

export default withNextIntl(nextConfig)
