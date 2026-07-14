import type { ResumeCase } from '@/shared/types/case'
import { initialResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case07: ResumeCase = buildCase(
  {
    id: 'ui-creative',
    title: '设计行业 UI 设计师简历',
    description: '1-3 年 UI 设计经验,擅长 C 端产品视觉与交互',
    templateId: 'creative',
    industry: '设计',
    position: 'UI 设计师',
    experienceLevel: '1-3年',
    style: '创意活泼',
  },
  {
    title: 'UI 设计师简历',
    basic: {
      ...initialResumeState.basic,
      name: '苏雅婷',
      title: 'UI 设计师',
      email: 'suyating@example.com',
      phone: '13800138007',
      location: '成都市锦江区',
      employementStatus: '在职',
    },
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: 'UI 设计师',
        date: '2022.06 - 至今',
        visible: true,
        details:
          '<ul><li>负责 C 端产品视觉与交互设计,主导 8 个核心页面改版</li><li>建立团队设计规范,组件库沉淀 60+ 组件</li><li>参与产品需求评审,推动设计走查落地</li></ul>',
      },
      {
        id: 'e2',
        company: '某设计工作室',
        position: '视觉设计师',
        date: '2021.03 - 2022.05',
        visible: true,
        details:
          '<ul><li>服务 6 个品牌客户,涵盖电商/教育/餐饮多场景</li><li>主导品牌 VI 与运营物料设计</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: 'C 端首页焕新',
        role: '主设计师',
        date: '2023.04 - 2023.10',
        visible: true,
        description:
          '<ul><li>主导首页信息架构与视觉升级,新用户点击率 +25%</li><li>设计 4 套营销活动皮肤,运营可灵活配置</li></ul>',
      },
      {
        id: 'p2',
        name: '品牌 VI 重塑',
        role: '视觉主创',
        date: '2021.08 - 2022.02',
        visible: true,
        description:
          '<ul><li>为初创品牌从 0 设计完整 VI 体系:Logo/字体/色彩/物料</li><li>设计方案被客户采纳为长期主视觉</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>设计工具:Figma、Sketch、Photoshop、Illustrator、Principle</li><li>能力:视觉设计、交互设计、品牌设计、动效设计</li><li>加分项:基础 C4D / Blender,能完成简单三维场景</li><li>协作:与产品/研发顺畅协作,完整走查落地</li></ul>',
    selfEvaluationContent:
      '<ul><li>3 年 UI 设计经验,审美扎实,手绘与软件能力均衡</li><li>关注设计趋势,乐于在 Behance/Dribbble 输出作品</li><li>良好沟通能力,习惯以数据和用户反馈驱动设计决策</li></ul>',
  },
)
