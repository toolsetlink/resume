import type { ResumeCase } from '@/shared/types/case'
import { blankResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case05: ResumeCase = buildCase(
  {
    id: 'ops-elegant',
    title: '互联网运营经理简历',
    description: '6 年用户运营经验，覆盖会员分层、生命周期触达与社群体系建设',
    templateId: 'elegant',
    industry: '互联网',
    position: '运营经理',
    experienceLevel: '5-10年',
    style: '优雅经典',
  },
  {
    title: '运营经理简历',
    basic: {
      ...blankResumeState.basic,
      name: '黄梓琪',
      title: '运营经理',
      email: 'huangziqi@example.com',
      phone: '13800138005',
      location: '广州市',
      employementStatus: '在职',
    },
    education: [{ id: 'edu1', school: '某本科院校', major: '电子商务', degree: '本科', startDate: '2013-09', endDate: '2017-06', visible: true }],
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: '运营经理',
        date: '2021.03 - 2026.06',
        visible: true,
        details:
          '<ul><li>负责用户生命周期运营，围绕新客激活、首购转化、复购和流失召回设计分层策略</li><li>搭建会员标签、触达规则和活动复盘机制，联动产品与数据团队持续迭代权益和任务体系</li><li>带领 4 人运营小组管理需求排期、渠道物料和周度数据复盘</li></ul>',
      },
      {
        id: 'e2',
        company: '某在线教育平台',
        position: '用户运营',
        date: '2017.07 - 2021.02',
        visible: true,
        details:
          '<ul><li>负责课程用户社群和班级服务，建立入群、开课、督学和结课回访 SOP</li><li>根据学习行为和用户反馈调整触达内容，支持课程续费与口碑转介绍</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '会员生命周期运营升级',
        role: '项目负责人',
        date: '2023.04 - 2023.11',
        visible: true,
        description:
          '<ul><li>按购买频次、客单和最近活跃时间划分用户层级，识别新客首购后 30 天为复购关键窗口</li><li>重构入会、成长和沉默召回任务，协同产品完成规则配置与埋点验收</li><li>上线三个月后会员复购率提升 7.4%，沉默用户召回成本下降 18%</li></ul>',
      },
      {
        id: 'p2',
        name: '核心用户社群体系',
        role: '运营负责人',
        date: '2021.08 - 2022.03',
        visible: true,
        description:
          '<ul><li>梳理社群定位、准入规则、内容栏目和异常处理流程，统一一线运营执行标准</li><li>通过用户共创、主题答疑和会员日活动提升有效互动，沉淀 16 份可复用 SOP</li><li>核心社群月均活跃用户占比由 21% 提升至 34%，高意向反馈同步进入产品需求池</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>运营能力：用户分层、生命周期运营、社群运营、活动复盘</li><li>数据工具：Excel、SQL 基础、神策、企业微信</li><li>项目协作：需求拆解、活动排期、埋点验收、SOP 建设</li></ul>',
    selfEvaluationContent:
      '<ul><li>6 年用户运营经验，能够基于用户行为制定分层策略并推动产品能力落地</li><li>重视过程指标和复盘，擅长把有效动作沉淀为团队可执行的 SOP</li></ul>',
  },
  {
    overview: [
      '运营简历最容易写成活动清单。这份案例以用户生命周期为主线，把分层策略、触达机制、产品协作和结果串成完整闭环。',
      '管理经验只写团队规模和管理动作，核心篇幅仍用于证明候选人能直接解决业务问题。',
    ],
    projectSelection: '优先选择能体现长期机制建设的项目，而不只是一次活动。说明用户分层依据、运营动作、协作资源和复盘指标，结果要能对应前面的策略。',
  },
)
