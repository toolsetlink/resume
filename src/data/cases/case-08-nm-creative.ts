import type { ResumeCase } from '@/shared/types/case'
import { blankResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case08: ResumeCase = buildCase(
  {
    id: 'nm-creative',
    title: '媒体行业新媒体运营简历',
    description: '2 年新媒体运营经验，覆盖账号定位、内容生产、投放测试与直播转化',
    templateId: 'creative',
    industry: '媒体',
    position: '新媒体运营',
    experienceLevel: '1-3年',
    style: '创意活泼',
  },
  {
    title: '新媒体运营简历',
    basic: {
      ...blankResumeState.basic,
      name: '何嘉琪',
      title: '新媒体运营',
      email: 'hejiaqi@example.com',
      phone: '13800138008',
      location: '长沙市',
      employementStatus: '在职',
    },
    education: [{ id: 'edu1', school: '某本科院校', major: '网络与新媒体', degree: '本科', startDate: '2018-09', endDate: '2022-06', visible: true }],
    experience: [
      {
        id: 'e1',
        company: '某消费品牌公司',
        position: '新媒体运营',
        date: '2023.03 - 2026.06',
        visible: true,
        details:
          '<ul><li>负责品牌小红书与抖音账号，完成选题规划、脚本撰写、拍摄协同、发布运营和周度复盘</li><li>按人群、内容主题和首屏表达拆分测试，持续优化完播率、互动率和进店成本</li><li>协同电商与直播团队承接内容流量，建立内容表现到商品点击、加购和成交的跟踪表</li></ul>',
      },
      {
        id: 'e2',
        company: '某内容机构',
        position: '内容运营实习生',
        date: '2022.07 - 2023.02',
        visible: true,
        details:
          '<ul><li>参与公众号和视频号日常选题、素材整理与数据复盘</li><li>协助品牌直播完成脚本校对、商品信息核查和场后数据整理</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '小红书品牌账号冷启动',
        role: '账号运营',
        date: '2023.04 - 2023.12',
        visible: true,
        description:
          '<ul><li>通过竞品评论与站内搜索词梳理用户关注点，确定测评、场景教程和真实问答三类内容支柱</li><li>建立选题评分、封面模板和发布复盘 SOP，连续 24 周保持稳定更新</li><li>账号 8 个月积累 3.6 万目标粉丝，品牌词站内搜索量提升 58%，内容引导进店成本下降 27%</li></ul>',
      },
      {
        id: 'p2',
        name: '新品直播内容策划',
        role: '内容运营',
        date: '2024.04 - 2024.06',
        visible: true,
        description:
          '<ul><li>依据历史直播停留和成交数据调整讲品顺序，设计痛点演示、使用场景和异议处理脚本</li><li>将高互动短视频作为直播预热素材，并根据场中数据及时调整福利节奏</li><li>三场直播平均停留时长提升 19%，新品成交转化率较品牌日常场提升 2.3 个百分点</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>平台运营：小红书、抖音、视频号</li><li>内容制作：选题策划、脚本撰写、拍摄协同、剪映、Photoshop</li><li>数据复盘：完播率、互动率、进店成本、直播停留与转化分析</li></ul>',
    selfEvaluationContent:
      '<ul><li>2 年消费品牌新媒体运营经验，能够独立完成选题、生产协同、发布和复盘</li><li>不只关注曝光数据，习惯追踪内容到进店、加购和成交的完整链路</li></ul>',
  },
  {
    overview: [
      '这份案例没有用“网感好、做过爆款”作为结论，而是展示账号定位、内容测试和商业承接的方法，让成果更可信也更便于面试展开。',
      '数据按平台指标和业务指标分层表达，既能证明内容能力，也能证明运营者理解转化目标。',
    ],
    projectSelection: '新媒体简历优先选择一个长期账号项目和一个营销节点项目。写清内容假设、测试维度、迭代依据与转化结果，避免只报总曝光或粉丝数。',
  },
)
