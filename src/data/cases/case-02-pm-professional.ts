import type { ResumeCase } from '@/shared/types/case'
import { blankResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case02: ResumeCase = buildCase(
  {
    id: 'pm-professional',
    title: '互联网产品经理简历',
    description: '4 年 B 端产品经验，覆盖需求分析、方案设计、版本交付与数据复盘',
    templateId: 'professional',
    industry: '互联网',
    position: '产品经理',
    experienceLevel: '3-5年',
    style: '简约专业',
  },
  {
    title: 'B 端产品经理简历',
    basic: {
      ...blankResumeState.basic,
      name: '王梓涵',
      title: '产品经理',
      email: 'wangzihan@example.com',
      phone: '13800138002',
      location: '北京市',
      employementStatus: '离职 · 一个月内到岗',
    },
    education: [
      {
        id: 'edu1',
        school: '某本科院校',
        major: '信息管理与信息系统',
        degree: '本科',
        startDate: '2017-09',
        endDate: '2021-06',
        visible: true,
      },
    ],
    experience: [
      {
        id: 'e1',
        company: '某互联网公司',
        position: '产品经理',
        date: '2023.03 - 2026.06',
        visible: true,
        details:
          '<ul><li>负责企业客户运营平台的线索、商机和数据看板模块，完成用户访谈、流程梳理、PRD 与上线复盘</li><li>针对销售重复录入问题，统一客户字段与跟进流程，使核心信息完整率由 72% 提升至 93%</li><li>按季度管理需求池，协同设计、研发、测试和实施团队交付 10 个版本，建立灰度发布与问题回收机制</li></ul>',
      },
      {
        id: 'e2',
        company: '某企业服务公司',
        position: '产品助理',
        date: '2021.07 - 2023.02',
        visible: true,
        details:
          '<ul><li>参与客服工单产品迭代，跟进需求收集、原型设计、验收测试和帮助文档更新</li><li>整理高频咨询与流失原因，推动新增批量处理和超时提醒功能，减少一线客服的重复操作</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '销售线索协同平台升级',
        role: '产品负责人',
        date: '2024.02 - 2024.10',
        visible: true,
        description:
          '<ul><li>访谈销售、运营和管理者 18 人，梳理线索分配、重复客户和跟进超时 3 类核心问题</li><li>设计查重合并、自动分配和待办提醒方案，配合研发拆分两期上线</li><li>上线后销售日均手工整理时间减少约 40 分钟，线索首次跟进及时率提升 16%</li></ul>',
      },
      {
        id: 'p2',
        name: '经营数据看板',
        role: '产品经理',
        date: '2023.06 - 2023.12',
        visible: true,
        description:
          '<ul><li>与业务负责人统一新增客户、转化率和回款额等指标口径，输出指标字典和数据权限方案</li><li>完成管理驾驶舱及团队明细页设计，支持按组织、时间和渠道下钻分析</li><li>上线后替代 4 份人工周报，管理层例会的数据准备时间由半天缩短至 1 小时</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>产品设计：Axure、Figma、流程图、PRD、需求优先级管理</li><li>数据分析：SQL 基础、Excel、漏斗分析、指标口径设计</li><li>项目协作：需求评审、迭代排期、验收测试、上线复盘</li></ul>',
    selfEvaluationContent:
      '<ul><li>4 年企业服务产品经验，能够把一线业务问题转化为可交付的产品方案</li><li>重视指标口径、上线验收和效果复盘，不把产品工作停留在原型与文档阶段</li></ul>',
  },
  {
    overview: [
      '这份案例没有把“写 PRD、画原型”当成核心卖点，而是围绕销售协同场景说明产品经理如何发现问题、定义规则并推动交付。',
      '工作经历概括长期职责，项目经历再展开用户调研、方案拆分和上线结果，能够减少内容重复，也方便面试时继续追问。',
    ],
    projectSelection: 'B 端产品项目优先选择业务链路完整、协作角色较多且结果可验证的案例。每个项目说明服务对象、关键矛盾、本人决策和上线变化，不必堆叠功能清单。',
  },
)
