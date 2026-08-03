import type { ResumeCase } from '@/shared/types/case'
import { blankResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case07: ResumeCase = buildCase(
  {
    id: 'ui-creative',
    title: '设计行业 UI 设计师简历',
    description: '3 年 UI 设计经验，覆盖 C 端产品改版、设计系统与交付走查',
    templateId: 'creative',
    industry: '设计',
    position: 'UI 设计师',
    experienceLevel: '1-3年',
    style: '创意活泼',
  },
  {
    title: 'UI 设计师简历',
    basic: {
      ...blankResumeState.basic,
      name: '苏雅婷',
      title: 'UI 设计师',
      email: 'suyating@example.com',
      phone: '13800138007',
      location: '成都市',
      employementStatus: '在职',
    },
    education: [{ id: 'edu1', school: '某本科院校', major: '视觉传达设计', degree: '本科', startDate: '2018-09', endDate: '2022-06', visible: true }],
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: 'UI 设计师',
        date: '2022.07 - 2026.06',
        visible: true,
        details:
          '<ul><li>负责生活服务 App 的产品视觉与交互设计，参与需求梳理、方案评审、标注交付和上线走查</li><li>基于核心任务梳理页面信息层级，持续迭代首页、搜索、订单和会员模块</li><li>与前端共同维护基础组件和设计变量，减少相似页面的重复设计与实现偏差</li></ul>',
      },
      {
        id: 'e2',
        company: '某数字设计公司',
        position: 'UI 设计实习生',
        date: '2021.07 - 2022.06',
        visible: true,
        details:
          '<ul><li>参与企业官网和移动端活动页面设计，按品牌规范完成界面、图标与运营物料</li><li>整理常用页面模板和交付清单，配合开发完成多尺寸适配验收</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '生活服务 App 首页改版',
        role: 'UI 设计师',
        date: '2023.04 - 2023.10',
        visible: true,
        description:
          '<ul><li>结合用户访谈、热力图和搜索数据，重新划分服务入口、推荐内容与活动资源位</li><li>输出两套高保真方案并完成可用性走查，协同产品确定分阶段上线范围</li><li>新版上线后核心服务入口点击率提升 14%，首页跳失率下降 8%</li></ul>',
      },
      {
        id: 'p2',
        name: '移动端设计系统建设',
        role: '核心设计师',
        date: '2023.08 - 2024.02',
        visible: true,
        description:
          '<ul><li>盘点 6 个业务模块的按钮、表单、弹窗和反馈状态，合并重复样式并补齐缺失状态</li><li>在 Figma 建立组件、变量和使用说明，与前端逐项对齐命名和交互规则</li><li>沉淀 48 个基础组件，常规需求的设计交付周期缩短约 25%</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>设计工具：Figma、Sketch、Photoshop、Illustrator</li><li>专业能力：界面设计、交互原型、设计系统、响应式适配</li><li>交付协作：需求评审、设计标注、组件对齐、上线走查</li></ul>',
    selfEvaluationContent:
      '<ul><li>3 年 UI 设计经验，能够从业务目标和用户任务出发完成方案到落地的完整协作</li><li>关注一致性、可用性与开发成本，习惯通过数据和用户反馈验证改版效果</li></ul>',
  },
  {
    overview: [
      'UI 设计简历不能只强调审美和软件熟练度。这份案例把用户依据、设计决策、交付协作和上线结果写进同一条叙事。',
      '作品集链接应在用户使用案例后自行补充；案例本身不放虚构网址，避免招聘者点击到不存在的项目。',
    ],
    projectSelection: '选择一个业务改版和一个系统化建设项目：前者证明问题分析与结果，后者证明规范和协作能力。项目描述应与作品集页面一一对应。',
  },
)
