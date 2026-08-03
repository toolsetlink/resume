import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/home/LandingHeader'
import { Footer } from '@/components/home/Footer'
import { MiniTemplatePreview } from '@/components/workbench/MiniTemplatePreview'
import { RESUME_CASES, getResumeCase } from '@/data/cases'
import { CaseUseButton } from './CaseUseButton'

const SITE_URL = 'https://resume.toolsetlink.com'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return RESUME_CASES.map(({ meta }) => ({ slug: meta.id }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const caseData = getResumeCase(slug)

  if (!caseData) return {}

  const title = `${caseData.meta.title}案例与写作指南`
  const description = `${caseData.meta.description}。查看完整简历结构、工作经历写法和可直接复用的中文简历模板。`
  const url = `${SITE_URL}/cases/${slug}`

  return {
    title,
    description,
    keywords: [
      `${caseData.meta.position}简历`,
      `${caseData.meta.position}简历案例`,
      `${caseData.meta.experienceLevel}${caseData.meta.position}简历`,
      '中文简历模板',
    ],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | 自由简历`,
      description,
      url,
      type: 'article',
      locale: 'zh_CN',
    },
    twitter: { title: `${title} | 自由简历`, description },
  }
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const caseData = getResumeCase(slug)

  if (!caseData) notFound()

  const { meta, resumeData } = caseData
  const guideOverview = caseData.guide?.overview ?? [
    `这份案例把与${meta.position}直接相关的职责、项目和结果放在前面，方便招聘者快速判断岗位匹配度。`,
    '写自己的版本时，保留结构即可。公司名称、业务背景、成果数据和技能关键词都应替换为真实内容。',
  ]
  const relatedCases = RESUME_CASES
    .filter(({ meta: relatedMeta }) => relatedMeta.id !== meta.id)
    .sort((a, b) => Number(b.meta.industry === meta.industry) - Number(a.meta.industry === meta.industry))
    .slice(0, 3)

  const faq = [
    {
      question: `这份${meta.position}简历适合什么经验阶段？`,
      answer: `案例按${meta.experienceLevel}经验设计，适合作为同阶段求职者的结构和表达参考。`,
    },
    {
      question: '可以直接复制这份简历吗？',
      answer: '可以先复制到编辑器，但必须把公司、项目、数据和技能替换成自己的真实经历。',
    },
    {
      question: '怎样让案例更匹配目标岗位？',
      answer: `对照目标岗位描述，优先保留与${meta.position}直接相关的经历、成果和关键词。`,
    },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${meta.title}案例与写作指南`,
    description: meta.description,
    mainEntityOfPage: `${SITE_URL}/cases/${meta.id}`,
    isPartOf: { '@type': 'CollectionPage', name: '简历案例库', url: `${SITE_URL}/cases` },
    about: [meta.industry, meta.position, meta.experienceLevel],
    inLanguage: 'zh-CN',
    author: { '@type': 'Organization', name: '自由简历' },
    publisher: { '@type': 'Organization', name: '自由简历', url: SITE_URL },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '简历案例', item: `${SITE_URL}/cases` },
      { '@type': 'ListItem', position: 3, name: meta.title, item: `${SITE_URL}/cases/${meta.id}` },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--bg-base))]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <LandingHeader showAnchorLinks={false} />

      <main className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="面包屑" className="flex flex-wrap items-center gap-1 text-[13px] text-[hsl(var(--text-secondary))]">
            <Link href="/" className="hover:text-[hsl(var(--brand))]">首页</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/cases" className="hover:text-[hsl(var(--brand))]">简历案例</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[hsl(var(--text-primary))]">{meta.position}</span>
          </nav>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.78fr)] lg:gap-14">
            <article className="min-w-0">
              <header>
                <div className="flex flex-wrap gap-2 text-[12px] font-medium text-[hsl(var(--brand))]">
                  <span>{meta.industry}</span>
                  <span>{meta.position}</span>
                  <span>{meta.experienceLevel}</span>
                </div>
                <h1 className="mt-4 text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] text-[hsl(var(--text-primary))]">
                  {meta.title}案例与写作指南
                </h1>
                <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-[hsl(var(--text-secondary))]">
                  {meta.description}。下面展示完整简历，并拆解适合复用的内容结构。
                </p>
                <p className="mt-3 text-[13px] text-[hsl(var(--text-tertiary))]">
                  案例内容已做脱敏或示例化处理，仅供结构与表达参考。
                </p>
                <div className="mt-7">
                  <CaseUseButton caseData={caseData} />
                </div>
              </header>

              <section className="mt-14">
                <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">这份案例怎么写</h2>
                <div className="mt-5 space-y-4 text-[15px] leading-7 text-[hsl(var(--text-secondary))]">
                  {guideOverview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              {resumeData.experience.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">工作经历写法</h2>
                  <div className="mt-5 space-y-6">
                    {resumeData.experience.map((experience) => (
                      <div key={experience.id} className="rounded-[12px] border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] p-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                          <h3 className="font-semibold text-[hsl(var(--text-primary))]">{experience.position}</h3>
                          <span className="text-[12px] text-[hsl(var(--text-tertiary))]">{experience.date}</span>
                        </div>
                        <p className="mt-1 text-[13px] text-[hsl(var(--text-secondary))]">{experience.company}</p>
                        <div className="case-rich-text mt-4" dangerouslySetInnerHTML={{ __html: experience.details }} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {resumeData.projects.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">项目经历怎么取舍</h2>
                  <p className="mt-5 text-[15px] leading-7 text-[hsl(var(--text-secondary))]">
                    {caseData.guide?.projectSelection ?? '优先选择能证明岗位能力的项目，说明自己负责的部分、采用的方法和最终结果。项目数量不需要多，相关性更重要。'}
                  </p>
                  <div className="mt-5 space-y-6">
                    {resumeData.projects.map((project) => (
                      <div key={project.id} className="rounded-[12px] border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] p-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                          <h3 className="font-semibold text-[hsl(var(--text-primary))]">{project.name}</h3>
                          <span className="text-[12px] text-[hsl(var(--text-tertiary))]">{project.date}</span>
                        </div>
                        <p className="mt-1 text-[13px] text-[hsl(var(--text-secondary))]">{project.role}</p>
                        <div className="case-rich-text mt-4" dangerouslySetInnerHTML={{ __html: project.description }} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-12">
                <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">常见问题</h2>
                <div className="mt-5 space-y-4">
                  {faq.map((item) => (
                    <div key={item.question} className="rounded-[12px] bg-[hsl(var(--bg-card))] p-5">
                      <h3 className="font-semibold text-[hsl(var(--text-primary))]">{item.question}</h3>
                      <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--text-secondary))]">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </article>

            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[12px] border border-[hsl(var(--border-default))] bg-white shadow-md">
                <MiniTemplatePreview
                  templateId={meta.templateId}
                  sampleData={resumeData}
                  cropRatio={1}
                />
              </div>
              <p className="mt-3 text-center text-[12px] text-[hsl(var(--text-tertiary))]">完整简历预览</p>
            </aside>
          </div>

          <section className="mt-20 border-t border-[hsl(var(--border-default))] pt-12">
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">相关案例</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {relatedCases.map(({ meta: relatedMeta }) => (
                <Link
                  key={relatedMeta.id}
                  href={`/cases/${relatedMeta.id}`}
                  className="rounded-[12px] border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] p-5 transition-colors hover:border-[hsl(var(--brand))]"
                >
                  <span className="text-[12px] text-[hsl(var(--text-tertiary))]">{relatedMeta.position}</span>
                  <h3 className="mt-1 font-semibold text-[hsl(var(--text-primary))]">{relatedMeta.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
