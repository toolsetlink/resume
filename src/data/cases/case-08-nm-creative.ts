import type { ResumeCase } from '@/shared/types/case'
import { initialResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case08: ResumeCase = buildCase(
  {
    id: 'nm-creative',
    title: '媒体行业新媒体运营简历',
    description: '1-3 年小红书/抖音运营经验,擅长内容策划与投放',
    templateId: 'creative',
    industry: '媒体',
    position: '新媒体运营',
    experienceLevel: '1-3年',
    style: '创意活泼',
  },
  {
    title: '新媒体运营简历',
    basic: {
      ...initialResumeState.basic,
      name: '何嘉琪',
      title: '新媒体运营',
      email: 'hejiaqi@example.com',
      phone: '13800138008',
      location: '长沙市岳麓区',
      employementStatus: '在职',
    },
    experience: [
      {
        id: 'e1',
        company: '某 MCN 机构',
        position: '新媒体运营',
        date: '2022.05 - 至今',
        visible: true,
        details:
          '<ul><li>负责小红书/抖音双平台账号矩阵,合计粉丝 80w+</li><li>主导 5 个爆款笔记,单篇最高曝光 800w</li><li>独立完成选题策划/脚本撰写/拍摄剪辑全流程</li></ul>',
      },
      {
        id: 'e2',
        company: '某品牌公司',
        position: '内容运营实习生',
        date: '2021.07 - 2022.04',
        visible: true,
        details:
          '<ul><li>协助品牌公众号/视频号日常内容产出</li><li>参与 3 场品牌直播活动策划</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '小红书账号从 0 起盘',
        role: '主运营',
        date: '2022.06 - 2023.03',
        visible: true,
        description:
          '<ul><li>9 个月内从 0 涨粉至 25w,垂直领域 TOP 100</li><li>建立选题库 + 内容 SOP,周更 5 篇,爆款率 12%</li></ul>',
      },
      {
        id: 'p2',
        name: '618 直播带货活动',
        role: '内容策划',
        date: '2023.05 - 2023.06',
        visible: true,
        description:
          '<ul><li>策划 3 场品牌专场直播,撰写脚本 12 篇</li><li>累计观看 60w,GMV 突破 280w</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>平台:小红书、抖音、视频号、B 站运营</li><li>工具:剪映、Premiere、PS、Canva、蝉妈妈</li><li>能力:文案撰写、脚本策划、拍摄剪辑、投流优化</li><li>加分项:基础直播控场,可独立完成小型专场</li></ul>',
    selfEvaluationContent:
      '<ul><li>2 年新媒体运营经验,熟悉主流平台规则与流量逻辑</li><li>网感好,擅长抓住热点并转化为内容</li><li>执行力强,可独立完成从策划到复盘的全流程</li></ul>',
  },
)
