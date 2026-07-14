import type { ResumeCase } from '@/shared/types/case'
import { initialResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case01: ResumeCase = buildCase(
  {
    id: 'fe-professional',
    title: '互联网前端开发简历',
    description: '3-5 年中高级前端经验,完整负责过大型中后台系统',
    templateId: 'professional',
    industry: '互联网',
    position: '前端开发',
    experienceLevel: '3-5年',
    style: '简约专业',
  },
  {
    title: '高级前端工程师简历',
    basic: {
      ...initialResumeState.basic,
      name: '陈逸飞',
      title: '高级前端工程师',
      email: 'chenyifei@example.com',
      phone: '13800138001',
      location: '上海市浦东新区',
      employementStatus: '在职',
    },
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: '高级前端工程师',
        date: '2021.07 - 至今',
        visible: true,
        details:
          '<ul><li>负责公司 B 端中后台产品前端架构设计与核心模块开发</li><li>基于 React 18 + TypeScript 重构核心工作流,首屏加载从 4.2s 降至 1.6s</li><li>推动组件库沉淀 30+ 通用组件,业务复用率达 70%</li></ul>',
      },
      {
        id: 'e2',
        company: '某电商平台',
        position: '前端工程师',
        date: '2019.03 - 2021.06',
        visible: true,
        details:
          '<ul><li>参与营销活动平台搭建,支撑公司双十一等大促活动</li><li>封装可视化搭建方案,使运营同学可独立配置活动页</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '企业级 B 端中后台',
        role: '前端负责人',
        date: '2022.03 - 2024.08',
        visible: true,
        description:
          '<ul><li>基于 React 18 + Vite + Ant Design 5 搭建,覆盖订单/库存/财务等 8 大模块</li><li>设计微前端架构,接入 4 个独立业务子应用,部署效率提升 60%</li></ul>',
      },
      {
        id: 'p2',
        name: '营销活动可视化搭建',
        role: '前端核心开发',
        date: '2020.06 - 2021.06',
        visible: true,
        description:
          '<ul><li>基于 schema-driven 思路实现拖拽式活动页编辑器</li><li>落地 12 套活动模板,运营零代码上线活动 50+</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>前端框架:React、Vue,熟悉 Next.js、Nuxt</li><li>开发语言:TypeScript、JavaScript(ES6+)</li><li>UI 样式:Tailwind CSS、Ant Design、Sass</li><li>工程化:Vite、Webpack、ESLint、pnpm Monorepo</li></ul>',
    selfEvaluationContent:
      '<ul><li>5 年前端经验,熟悉现代前端工程体系与组件化思维</li><li>具备从 0 到 1 搭建中后台系统的能力,关注性能与可维护性</li><li>良好的跨团队协作与推动能力,乐于在团队内做技术分享</li></ul>',
  },
)