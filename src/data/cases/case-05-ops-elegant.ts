import type { ResumeCase } from '@/shared/types/case'
import { initialResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case05: ResumeCase = buildCase(
  {
    id: 'ops-elegant',
    title: '互联网运营经理简历',
    description: '5-10 年互联网运营经验,擅长用户与内容运营',
    templateId: 'elegant',
    industry: '互联网',
    position: '运营经理',
    experienceLevel: '5-10年',
    style: '优雅经典',
  },
  {
    title: '运营经理简历',
    basic: {
      ...initialResumeState.basic,
      name: '黄梓琪',
      title: '运营经理',
      email: 'huangziqi@example.com',
      phone: '13800138005',
      location: '广州市天河区',
      employementStatus: '在职',
    },
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: '运营经理',
        date: '2019.08 - 至今',
        visible: true,
        details:
          '<ul><li>负责用户运营与社群运营,管理 12 个核心社群 5w+ 用户</li><li>主导会员体系升级,付费会员转化率提升 22%</li><li>带领 6 人小团队,连续 4 个季度完成 OKR</li></ul>',
      },
      {
        id: 'e2',
        company: '某内容平台',
        position: '高级运营',
        date: '2016.07 - 2019.07',
        visible: true,
        details:
          '<ul><li>负责垂类内容运营,半年内将品类阅读量提升 3 倍</li><li>策划多场千万级曝光品牌活动</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '会员体系重构',
        role: '项目负责人',
        date: '2022.05 - 2023.08',
        visible: true,
        description:
          '<ul><li>从 0 设计分层会员权益体系,落地 4 个等级 + 12 项权益</li><li>联动产品/设计/法务/财务,3 个月内完整上线,付费转化 +22%</li></ul>',
      },
      {
        id: 'p2',
        name: '私域社群矩阵',
        role: '运营负责人',
        date: '2020.03 - 2021.12',
        visible: true,
        description:
          '<ul><li>搭建 12 个核心用户社群,沉淀 SOP 文档 30+ 份</li><li>社群活跃度稳定在 35%,行业平均水平 18%</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>运营能力:用户运营、社群运营、活动运营、内容运营</li><li>工具:神策、GrowingIO、飞书、企业微信、小红书蒲公英</li><li>技能:数据分析、文案撰写、项目管理、团队管理</li><li>加分项:基础 PS / 剪映,可独立完成活动物料</li></ul>',
    selfEvaluationContent:
      '<ul><li>7 年互联网运营经验,带过 6 人小团队,目标导向且结果可量化</li><li>擅长从用户视角思考问题,平衡数据指标与用户体验</li><li>乐于总结方法论,运营 SOP 沉淀 50+ 份,在团队内广泛复用</li></ul>',
  },
)
