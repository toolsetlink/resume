import type { Metadata } from 'next'
import { LandingHeader } from '@/components/home/LandingHeader'
import { Footer } from '@/components/home/Footer'
import { CaseLibrary } from './CaseLibrary'

const SITE_URL = 'https://resume.toolsetlink.com'

export const metadata: Metadata = {
  title: '简历案例库',
  description: '按职位、行业和工作经验浏览真实中文简历案例，查看完整简历内容、写作重点，并一键创建自己的版本。',
  alternates: { canonical: `${SITE_URL}/cases` },
  openGraph: {
    title: '简历案例库 | 自由简历',
    description: '浏览真实中文简历案例与写作解析，找到适合自己的简历结构。',
    url: `${SITE_URL}/cases`,
  },
}

export default function CasesPage() {
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--bg-base))]">
      <LandingHeader showAnchorLinks={false} />
      <main>
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] text-[hsl(var(--text-primary))]">
                找到适合你的简历写法
              </h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-[hsl(var(--text-secondary))]">
                浏览真实职位案例，先看结构和表达，再复制成自己的简历继续修改。
              </p>
            </div>
          </div>
        </section>
        <CaseLibrary />
      </main>
      <Footer />
    </div>
  )
}
