import type { ResumeCase } from '@/shared/types/case'
import { initialResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case02: ResumeCase = buildCase(
  {
    id: 'pm-professional',
    title: '互联网产品经理简历',
    description: '3-5 年互联网产品经验,完整负责过 C 端用户增长产品',
    templateId: 'professional',
    industry: '互联网',
    position: '产品经理',
    experienceLevel: '3-5年',
    style: '简约专业',
  },
  {
    title: '高级产品经理简历',
    basic: {
      ...initialResumeState.basic,
      name: '王梓涵',
      title: '高级产品经理',
      email: 'wangzihan@example.com',
      phone: '13800138002',
      location: '北京市朝阳区',
      employementStatus: '在职',
    },
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: '高级产品经理',
        date: '2021.06 - 至今',
        visible: true,
        details:
          '<ul><li>负责用户增长方向产品,DAU 从 80w 提升至 230w</li><li>主导邀请激励体系重构,新用户次留提升 18%</li><li>跨研发/设计/运营 5 个团队协作,推动 12 个版本迭代</li></ul>',
      },
      {
        id: 'e2',
        company: '某 SaaS 公司',
        position: '产品经理',
        date: '2019.07 - 2021.05',
        visible: true,
        details:
          '<ul><li>从 0 到 1 搭建数据分析产品 MVP,服务 200+ 付费客户</li><li>独立完成竞品调研与 PRD 撰写,推动研发高效落地</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '用户增长激励体系',
        role: '产品负责人',
        date: '2022.04 - 2023.12',
        visible: true,
        description:
          '<ul><li>重构老化的邀请体系,新增阶梯式奖励 + 任务裂变机制</li><li>上线后获客成本下降 24%,新用户 7 日留存提升 12%</li></ul>',
      },
      {
        id: 'p2',
        name: '内容社区冷启动',
        role: '产品负责人',
        date: '2020.09 - 2021.05',
        visible: true,
        description:
          '<ul><li>搭建 UGC 内容社区 MVP,设计发布/审核/分发三大模块</li><li>3 个月内月活创作者达 1.2 万,日均 UGC 产出 8000+</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>产品工具:Axure、Figma、墨刀、Notion、飞书</li><li>数据工具:SQL、神策、友盟、Google Analytics</li><li>方法论:用户调研、竞品分析、A/B 测试、OKR</li><li>加分项:熟悉 React 基本原理,能与前端顺畅沟通</li></ul>',
    selfEvaluationContent:
      '<ul><li>5 年互联网产品经验,横跨 C 端增长与 SaaS 工具两大方向</li><li>擅长从数据中找问题,用最小可行方案验证假设</li><li>具备跨团队沟通与项目推动能力,乐于与一线用户交流</li></ul>',
  },
)