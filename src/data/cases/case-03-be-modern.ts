import type { ResumeCase } from '@/shared/types/case'
import { blankResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case03: ResumeCase = buildCase(
  {
    id: 'be-modern',
    title: '互联网后端工程师简历',
    description: '6 年 Java 后端经验，覆盖交易系统、稳定性治理与服务性能优化',
    templateId: 'modern',
    industry: '互联网',
    position: '后端开发',
    experienceLevel: '5-10年',
    style: '现代极简',
  },
  {
    title: '高级后端开发工程师简历',
    basic: {
      ...blankResumeState.basic,
      name: '林俊宇',
      title: '高级后端开发工程师',
      email: 'linjunyu@example.com',
      phone: '13800138003',
      location: '杭州市',
      employementStatus: '在职',
    },
    education: [
      {
        id: 'edu1',
        school: '某本科院校',
        major: '计算机科学与技术',
        degree: '本科',
        startDate: '2014-09',
        endDate: '2018-06',
        visible: true,
      },
    ],
    experience: [
      {
        id: 'e1',
        company: '某零售科技公司',
        position: '高级后端开发工程师',
        date: '2021.04 - 2026.06',
        visible: true,
        details:
          '<ul><li>负责订单、履约和售后服务研发，参与需求评审、技术方案设计、编码上线与故障复盘</li><li>治理慢查询、重复调用和缓存热点，将订单查询接口 P95 响应时间由 420ms 降至 160ms</li><li>完善接口监控、业务告警和发布检查项，推动核心服务季度可用性稳定在 99.95% 以上</li></ul>',
      },
      {
        id: 'e2',
        company: '某软件服务公司',
        position: 'Java 开发工程师',
        date: '2018.07 - 2021.03',
        visible: true,
        details:
          '<ul><li>参与企业结算平台开发，负责对账、账单和开票模块的接口与定时任务</li><li>梳理异常补偿流程并补充幂等校验，降低重复结算和人工核对风险</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '订单履约链路稳定性治理',
        role: '技术负责人',
        date: '2023.03 - 2024.01',
        visible: true,
        description:
          '<ul><li>梳理下单到出库链路的超时与重试问题，使用消息队列解耦非核心步骤，并为关键操作增加幂等控制</li><li>建立订单状态校验与异常补偿任务，配合压测修复连接池和线程池配置问题</li><li>改造后高峰期订单失败率由 0.8% 降至 0.12%，未再出现批量重复扣减</li></ul>',
      },
      {
        id: 'p2',
        name: '售后服务性能优化',
        role: '核心开发',
        date: '2022.05 - 2022.11',
        visible: true,
        description:
          '<ul><li>通过链路追踪定位聚合查询中的 N+1 调用和缺失索引，合并远程请求并优化 SQL</li><li>为高频只读数据增加分级缓存与主动失效机制，补充缓存击穿保护</li><li>核心列表接口 P95 响应时间降低 62%，数据库峰值连接数下降 35%</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>Java：Spring Boot、Spring Cloud、MyBatis，熟悉 JVM 与并发基础</li><li>数据与中间件：MySQL、Redis、Elasticsearch、Kafka、RocketMQ</li><li>工程能力：接口设计、性能排查、链路监控、灰度发布、故障复盘</li></ul>',
    selfEvaluationContent:
      '<ul><li>6 年 Java 后端开发经验，熟悉交易类系统的接口、数据一致性与稳定性问题</li><li>习惯用监控、日志和压测数据定位问题，能够独立完成方案设计到上线复盘</li></ul>',
  },
  {
    overview: [
      '这份案例把“高并发、微服务”等宽泛标签换成具体链路、故障类型和优化前后指标，让技术深度有证据承接。',
      '技能区只列正文中能够被项目证明的技术，避免出现一长串工具却无法在面试中解释使用场景。',
    ],
    projectSelection: '后端简历优先保留一个稳定性项目和一个性能项目，分别展示系统性治理与问题定位能力。描述时交代瓶颈、技术取舍、本人负责范围和可观测结果。',
  },
)
