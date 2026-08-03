import type { ResumeCase } from '@/shared/types/case'
import { blankResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case04: ResumeCase = buildCase(
  {
    id: 'da-modern',
    title: '互联网数据分析师简历',
    description: '2 年电商数据分析经验，覆盖指标体系、专题分析与经营看板建设',
    templateId: 'modern',
    industry: '互联网',
    position: '数据分析',
    experienceLevel: '1-3年',
    style: '现代极简',
  },
  {
    title: '数据分析师简历',
    basic: {
      ...blankResumeState.basic,
      name: '赵雪',
      title: '数据分析师',
      email: 'zhaoxue@example.com',
      phone: '13800138004',
      location: '深圳市',
      employementStatus: '离职 · 随时到岗',
    },
    education: [
      {
        id: 'edu1',
        school: '某本科院校',
        major: '统计学',
        degree: '本科',
        startDate: '2018-09',
        endDate: '2022-06',
        visible: true,
      },
    ],
    experience: [
      {
        id: 'e1',
        company: '某零售电商公司',
        position: '数据分析师',
        date: '2023.06 - 2026.06',
        visible: true,
        details:
          '<ul><li>负责商品、流量和用户经营分析，维护核心指标口径并输出周报、月报和专题复盘</li><li>使用 SQL 搭建渠道转化与商品效率数据集，减少多部门重复取数和指标不一致问题</li><li>围绕新客首购、活动转化和复购开展专项分析，向产品与运营提供可执行的分群建议</li></ul>',
      },
      {
        id: 'e2',
        company: '某生活服务平台',
        position: '数据分析实习生',
        date: '2022.07 - 2023.05',
        visible: true,
        details:
          '<ul><li>协助完成活动数据提取、异常核查和日报更新，支持运营跟踪渠道与城市表现</li><li>用 Python 清洗问卷和订单数据，形成用户反馈标签并输出分析结论</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '新客首购转化分析',
        role: '数据分析师',
        date: '2024.03 - 2024.06',
        visible: true,
        description:
          '<ul><li>拆解注册、领券、加购和支付漏斗，并按渠道、品类与首访页面定位主要流失环节</li><li>发现部分渠道优惠券门槛与主推商品价格带不匹配，推动运营调整券包和落地页商品组合</li><li>两轮调整后目标渠道首购转化率提升 8.6%，结论沉淀为渠道周度监控看板</li></ul>',
      },
      {
        id: 'p2',
        name: '商品经营分析看板',
        role: '数据分析师',
        date: '2023.08 - 2023.12',
        visible: true,
        description:
          '<ul><li>与商品运营统一销售额、动销率、售罄率和库存周转等指标口径，梳理维度与刷新频率</li><li>使用 SQL 与 BI 工具搭建品类—品牌—单品三级下钻看板，并配置异常波动提醒</li><li>替代原有 6 份手工报表，周度经营复盘准备时间从 3 小时缩短至 40 分钟</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>数据处理：SQL、MySQL、Hive、Python（pandas）</li><li>分析与呈现：Excel、Tableau、Power BI、漏斗分析、同期群分析</li><li>业务能力：指标口径梳理、经营分析、活动复盘、异常归因</li></ul>',
    selfEvaluationContent:
      '<ul><li>2 年电商与生活服务数据分析经验，能够从业务问题出发完成取数、分析和结果沟通</li><li>重视指标口径和结论落地，习惯同步分析限制并持续跟踪策略效果</li></ul>',
  },
  {
    overview: [
      '这份案例用“负责什么业务、如何分析、推动了什么变化”代替“擅长数据驱动增长”，让招聘者能迅速判断业务理解和落地能力。',
      '项目描述保留分析路径和关键口径，结果既有业务指标，也有报表提效，适合 1—3 年经验候选人展示完整工作闭环。',
    ],
    projectSelection: '数据分析项目应覆盖一个业务增长问题和一个数据建设问题。不要只写使用 SQL、Python，而要说明分析对象、拆解维度、发现的问题以及结论如何被业务采用。',
  },
)
