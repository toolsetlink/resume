import type { Metadata } from 'next'
import { LandingHeader } from '@/components/home/LandingHeader'
import { Footer } from '@/components/home/Footer'
import { RESUME_CASES } from '@/data/cases'
import { CaseLibrary } from './CaseLibrary'

const SITE_URL = 'https://resume.toolsetlink.com'

export const metadata: Metadata = {
  title: '简历案例库',
  description: '按职位、行业和工作经验浏览中文简历参考案例，查看完整简历内容、写作重点，并一键创建自己的版本。',
  keywords: ['简历案例', '简历范文', '中文简历模板', '简历写作指南', '在线简历制作'],
  alternates: { canonical: `${SITE_URL}/cases` },
  robots: { index: true, follow: true },
  openGraph: {
    title: '简历案例库 | 自由简历',
    description: '浏览中文简历参考案例与写作解析，找到适合自己的简历结构。',
    url: `${SITE_URL}/cases`,
    locale: 'zh_CN',
  },
  twitter: {
    title: '简历案例库 | 自由简历',
    description: '浏览按岗位与经验分类的中文简历案例、完整内容和写作解析。',
  },
}

export default function CasesPage() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '中文简历案例库',
    numberOfItems: RESUME_CASES.length,
    itemListElement: RESUME_CASES.map(({ meta }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: meta.title,
      url: `${SITE_URL}/cases/${meta.id}`,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '简历案例', item: `${SITE_URL}/cases` },
    ],
  }

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--bg-base))]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <LandingHeader showAnchorLinks={false} />
      <main>
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] text-[hsl(var(--text-primary))]">
                找到适合你的简历写法
              </h1>
              <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-[hsl(var(--text-secondary))]">
                浏览岗位参考案例，先看结构和表达，再复制成自己的简历继续修改。
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
