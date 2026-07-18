import { ArrowRight, FileSearch, MessageCircle, Target } from 'lucide-react'
import { WECHAT_ID } from '@/shared/config/contact'

const SERVICES = [
  {
    icon: FileSearch,
    title: '简历诊断与修改',
    description: '从目标岗位出发，找出内容缺口，调整经历顺序和成果表达。',
  },
  {
    icon: Target,
    title: '面试准备',
    description: '围绕岗位要求梳理项目、常见追问和更有说服力的回答。',
  },
  {
    icon: MessageCircle,
    title: '求职陪跑',
    description: '一起制定投递节奏，复盘反馈，持续调整下一步求职策略。',
  },
]

export function CareerCoachingSection() {
  return (
    <section id="career-coaching" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 rounded-[12px] border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:p-14">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] text-[hsl(var(--text-primary))]">
              简历之外，也可以一起准备求职
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[hsl(var(--text-secondary))]">
              如果你不确定简历怎么改、面试怎么准备，或想有人陪你推进整个求职过程，可以直接联系我。
            </p>

            {WECHAT_ID ? (
              <div className="mt-8">
                <p className="text-[13px] text-[hsl(var(--text-secondary))]">微信号：<strong className="text-[hsl(var(--text-primary))]">{WECHAT_ID}</strong></p>
                <a
                  href="weixin://"
                  className="mt-3 inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-[hsl(var(--brand))] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-hover))] active:translate-y-px"
                >
                  打开微信添加
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="mt-8 inline-flex rounded-[8px] bg-[hsl(var(--bg-subtle))] px-4 py-3 text-[13px] text-[hsl(var(--text-secondary))]">
                微信联系方式待补充
              </div>
            )}
          </div>

          <div className="divide-y divide-[hsl(var(--border-default))]">
            {SERVICES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 py-6 first:pt-0 last:pb-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[hsl(var(--brand-light))] text-[hsl(var(--brand))]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--text-primary))]">{title}</h3>
                  <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--text-secondary))]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
