import type { Metadata } from 'next'

// 应用页面（dashboard）：不索引、follow 也关闭，搜索引擎和爬虫都不应收录
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
