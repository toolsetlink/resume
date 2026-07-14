import type { ResumeCase } from '@/shared/types/case'
import { initialResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case06: ResumeCase = buildCase(
  {
    id: 'mkt-elegant',
    title: '互联网市场总监简历',
    description: '10 年以上市场经验,统筹品牌/增长/公共关系',
    templateId: 'elegant',
    industry: '互联网',
    position: '市场总监',
    experienceLevel: '10年以上',
    style: '优雅经典',
  },
  {
    title: '市场总监简历',
    basic: {
      ...initialResumeState.basic,
      name: '吴启明',
      title: '市场总监',
      email: 'wuqiming@example.com',
      phone: '13800138006',
      location: '北京市海淀区',
      employementStatus: '在职',
    },
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: '市场总监',
        date: '2018.05 - 至今',
        visible: true,
        details:
          '<ul><li>统筹品牌/增长/公关 3 个团队共 24 人,年度预算 8000w</li><li>主导品牌升级项目,公司品牌认知度从 38% 提升至 67%</li><li>操盘 2 次现象级营销事件,合计曝光 5 亿+</li></ul>',
      },
      {
        id: 'e2',
        company: '某快消集团',
        position: '市场经理',
        date: '2013.07 - 2018.04',
        visible: true,
        details:
          '<ul><li>负责数字营销,主导多个百万级投放项目</li><li>获公司年度最佳经理人奖项</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '品牌全面焕新',
        role: '总负责人',
        date: '2021.03 - 2022.08',
        visible: true,
        description:
          '<ul><li>主导 Logo/Slogan/视觉系统全案升级,联动 4A 公司协作</li><li>新品牌发布后社交声量同比 +340%,媒体主动报道 80+ 篇</li></ul>',
      },
      {
        id: 'p2',
        name: '现象级营销事件',
        role: '总指挥',
        date: '2023.09 - 2023.12',
        visible: true,
        description:
          '<ul><li>策划并执行品牌年度大事件,落地 5 城线下活动</li><li>微博话题阅读量破 4 亿,品牌搜索指数提升 480%</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>战略:品牌定位、市场策略、年度预算规划、危机公关</li><li>执行:4A 公司管理、媒介投放、内容营销、PR 传播</li><li>团队:24 人团队管理,3 年内培养出 4 位骨干晋升</li><li>资源:深耕媒体/4A/KOL 圈,核心人脉 200+</li></ul>',
    selfEvaluationContent:
      '<ul><li>12 年品牌市场经验,横跨快消与互联网两大行业</li><li>具备从策略到执行的全链路把控能力,带过大团队</li><li>擅长将商业目标转化为品牌叙事,创造现象级传播</li></ul>',
  },
)
