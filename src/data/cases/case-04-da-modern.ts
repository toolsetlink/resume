import type { ResumeCase } from '@/shared/types/case'
import { initialResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case04: ResumeCase = buildCase(
  {
    id: 'da-modern',
    title: '互联网数据分析师简历',
    description: '1-3 年数据分析经验,擅长用数据驱动业务增长',
    templateId: 'modern',
    industry: '互联网',
    position: '数据分析',
    experienceLevel: '1-3年',
    style: '现代极简',
  },
  {
    title: '数据分析师简历',
    basic: {
      ...initialResumeState.basic,
      name: '赵雪',
      title: '数据分析师',
      email: 'zhaoxue@example.com',
      phone: '13800138004',
      location: '深圳市南山区',
      employementStatus: '在职',
    },
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: '数据分析师',
        date: '2022.07 - 至今',
        visible: true,
        details:
          '<ul><li>负责增长方向的数据分析,周/月报输出 20+ 份</li><li>主导 A/B 测试平台搭建,支撑 50+ 实验高效落地</li><li>通过漏斗分析定位关键流失节点,优化后转化提升 15%</li></ul>',
      },
      {
        id: 'e2',
        company: '某电商平台',
        position: '数据分析实习生',
        date: '2021.03 - 2022.06',
        visible: true,
        details:
          '<ul><li>协助搭建用户画像体系,输出 8 类人群标签</li><li>独立完成大促复盘报告,获得业务方好评</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '新用户留存优化',
        role: '分析师',
        date: '2023.04 - 2023.10',
        visible: true,
        description:
          '<ul><li>基于漏斗 + 同期群分析定位新用户首日流失节点</li><li>与产品协作上线引导优化方案,新用户 7 日留存提升 9%</li></ul>',
      },
      {
        id: 'p2',
        name: '商品推荐效果评估',
        role: '分析师',
        date: '2022.09 - 2023.03',
        visible: true,
        description:
          '<ul><li>设计推荐系统 AB 实验,分析不同策略下 CTR/CVR 差异</li><li>输出 5 份分析报告,推动算法团队完成 2 次模型迭代</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>SQL:Hive SQL、MySQL(扎实,日常处理百万级数据)</li><li>工具:Python(pandas/numpy/scikit-learn)、Tableau、神策</li><li>方法论:漏斗分析、同期群、A/B 测试、归因分析</li><li>统计:假设检验、回归分析基础扎实</li></ul>',
    selfEvaluationContent:
      '<ul><li>2 年互联网数据分析经验,C 端增长 + 电商场景为主</li><li>业务理解深入,能用数据语言与产品/算法同学顺畅协作</li><li>主动学习统计与机器学习,持续提升分析深度</li></ul>',
  },
)
