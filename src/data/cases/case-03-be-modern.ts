import type { ResumeCase } from '@/shared/types/case'
import { initialResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case03: ResumeCase = buildCase(
  {
    id: 'be-modern',
    title: '互联网后端工程师简历',
    description: '5-10 年后端架构经验,熟悉高并发分布式系统设计',
    templateId: 'modern',
    industry: '互联网',
    position: '后端开发',
    experienceLevel: '5-10年',
    style: '现代极简',
  },
  {
    title: '后端技术专家简历',
    basic: {
      ...initialResumeState.basic,
      name: '林俊宇',
      title: '后端技术专家',
      email: 'linjunyu@example.com',
      phone: '13800138003',
      location: '杭州市西湖区',
      employementStatus: '在职',
    },
    experience: [
      {
        id: 'e1',
        company: '某头部电商公司',
        position: '后端技术专家',
        date: '2020.04 - 至今',
        visible: true,
        details:
          '<ul><li>负责交易核心链路架构,支撑双十一百万级 QPS</li><li>主导库存系统重构,RT 从 80ms 降至 18ms,提升 4 倍</li><li>推动团队服务网格化改造,基础设施统一化</li></ul>',
      },
      {
        id: 'e2',
        company: '某互联网金融公司',
        position: '高级后端工程师',
        date: '2016.08 - 2020.03',
        visible: true,
        details:
          '<ul><li>负责账务系统设计,日均处理交易 800w 笔</li><li>引入 DDD 与 CQRS 架构,系统可维护性显著提升</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '交易核心链路重构',
        role: '技术负责人',
        date: '2021.06 - 2023.05',
        visible: true,
        description:
          '<ul><li>基于 Go + DDD 重构交易下单链路,服务拆分至 14 个微服务</li><li>落地分布式事务方案,数据一致性达到 99.999%</li></ul>',
      },
      {
        id: 'p2',
        name: '统一库存中心',
        role: '架构师',
        date: '2020.10 - 2022.03',
        visible: true,
        description:
          '<ul><li>设计多仓多渠道统一库存中心,支撑预售/团购/秒杀等复杂业务</li><li>引入 Redis + 分库分表,大促期间零事故</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>语言:Go(主力)、Java、Python</li><li>存储:MySQL、Redis、Elasticsearch、ClickHouse</li><li>中间件:Kafka、RocketMQ、gRPC、Istio</li><li>架构:微服务、DDD、CQRS、分布式事务</li></ul>',
    selfEvaluationContent:
      '<ul><li>8 年后端开发经验,3 年团队管理经验,擅长复杂业务架构设计</li><li>追求系统稳定性与可维护性的平衡,关注团队工程文化建设</li><li>乐于在技术社区分享,写过 3 个 star 过千的开源项目</li></ul>',
  },
)
