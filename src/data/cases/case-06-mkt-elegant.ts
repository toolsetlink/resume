import type { ResumeCase } from '@/shared/types/case'
import { blankResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case06: ResumeCase = buildCase(
  {
    id: 'mkt-elegant',
    title: '互联网市场总监简历',
    description: '10 年品牌市场经验，覆盖品牌定位、整合传播、渠道投放与团队管理',
    templateId: 'elegant',
    industry: '互联网',
    position: '市场总监',
    experienceLevel: '10年以上',
    style: '优雅经典',
  },
  {
    title: '市场总监简历',
    basic: {
      ...blankResumeState.basic,
      name: '吴启明',
      title: '市场总监',
      email: 'wuqiming@example.com',
      phone: '13800138006',
      location: '北京市',
      employementStatus: '在职',
    },
    education: [{ id: 'edu1', school: '某本科院校', major: '广告学', degree: '本科', startDate: '2009-09', endDate: '2013-06', visible: true }],
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: '市场总监',
        date: '2018.05 - 至今',
        visible: true,
        details:
          '<ul><li>负责年度品牌策略、整合传播与媒介投放，管理品牌、公关和内容三个职能小组</li><li>建立从品牌指标到业务线索的月度复盘机制，按渠道评估触达质量并动态调整预算</li><li>主导品牌定位升级与重点产品上市传播，协同销售、产品及外部代理商统一市场信息</li></ul>',
      },
      {
        id: 'e2',
        company: '某快消集团',
        position: '市场经理',
        date: '2013.07 - 2018.04',
        visible: true,
        details:
          '<ul><li>负责核心品类的年度营销计划、内容策略和电商渠道推广</li><li>统筹代理商比稿、媒介排期和项目复盘，逐步承担跨品类预算管理</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '品牌定位与视觉体系升级',
        role: '总负责人',
        date: '2021.03 - 2022.08',
        visible: true,
        description:
          '<ul><li>基于客户访谈、销售反馈和竞品研究，重新定义目标人群、核心价值与沟通语气</li><li>推动官网、销售资料、活动展陈和媒体内容统一更新，并建立品牌资产使用规范</li><li>升级后半年内品牌词自然搜索量提升 46%，重点行业活动获取的有效线索同比提升 31%</li></ul>',
      },
      {
        id: 'p2',
        name: '年度产品上市整合传播',
        role: '市场负责人',
        date: '2023.09 - 2023.12',
        visible: true,
        description:
          '<ul><li>围绕新品上市制定内容、媒体、行业活动和客户案例四条传播线，明确各阶段目标与预算</li><li>联动 5 个重点城市开展闭门交流和线上直播，统一线索收集、标记与销售跟进规则</li><li>项目期内获得 1,200 余条有效线索，线索转商机率较上一年度同类活动提升 9 个百分点</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>市场策略：品牌定位、年度规划、产品上市、整合营销</li><li>传播执行：内容营销、媒体关系、行业活动、媒介投放</li><li>经营管理：预算分配、代理商管理、线索归因、团队培养</li></ul>',
    selfEvaluationContent:
      '<ul><li>10 年以上品牌市场经验，经历快消与企业服务业务，能够兼顾长期品牌建设和阶段性获客目标</li><li>具备策略制定、预算管理、跨部门协同和复盘优化的完整经验</li></ul>',
  },
  {
    overview: [
      '资深市场岗位需要同时证明战略判断与经营结果。这份案例先交代管理范围，再用品牌升级和产品上市两个项目承接关键能力。',
      '传播曝光不作为唯一结果，而是继续写到有效线索和商机转化，让成果与业务目标建立联系。',
    ],
    projectSelection: '市场负责人应选择一个长期品牌项目和一个阶段性战役，分别说明洞察、资源配置、跨团队推进与结果。避免只列媒体名单或使用“现象级”等难以验证的评价。',
  },
)
