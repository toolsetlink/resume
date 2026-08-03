import type { ResumeCase } from '@/shared/types/case'
import { blankResumeState } from '@/shared/config/initialResumeData'
import { buildCase } from './helpers'

export const case01: ResumeCase = buildCase(
  {
    id: 'fe-professional',
    title: '互联网前端开发简历',
    description: '3 年前端开发经验，覆盖供应链 ERP、跨端应用与微前端工程化',
    templateId: 'professional',
    industry: '互联网',
    position: '前端开发',
    experienceLevel: '3-5年',
    style: '简约专业',
  },
  {
    title: '前端开发工程师简历',
    basic: {
      ...blankResumeState.basic,
      name: '林知夏',
      title: '前端开发工程师',
      email: 'linzhixia@example.com',
      phone: '13800138001',
      location: '深圳市',
      employementStatus: '离职 · 随时到岗',
    },
    education: [
      {
        id: 'edu1',
        school: '某本科院校',
        major: '软件工程',
        degree: '本科',
        startDate: '2019-09',
        endDate: '2023-06',
        visible: true,
      },
    ],
    experience: [
      {
        id: 'e1',
        company: '某跨境供应链企业',
        position: '前端开发工程师',
        date: '2023.05 - 2026.07',
        visible: true,
        details:
          '<ul><li>负责跨境供应链 ERP、电商 SaaS、企业 OA 与数据大屏等产品线的前端研发</li><li>主导 ERP 微前端改造，将系统拆分为 1 个主应用与 13 个业务子应用，支持业务线独立开发和发版</li><li>使用 Node.js 编写批处理与报表导出脚本，解决物流单号处理等重复性工作</li></ul>',
      },
      {
        id: 'e2',
        company: '某信息技术公司',
        position: '全栈开发实习生',
        date: '2022.08 - 2023.05',
        visible: true,
        details:
          '<ul><li>参与海外娱乐预订产品从 0 到 1 开发，覆盖移动端、Node.js 服务与后台管理系统</li><li>参与多端适配、集成测试及客户联合验收，支持产品按期上线</li></ul>',
      },
    ],
    projects: [
      {
        id: 'p1',
        name: '跨境供应链 ERP 管理平台',
        role: '前端开发工程师',
        date: '2024.06 - 2026.06',
        visible: true,
        description:
          '<ul><li>基于 qiankun 与 Yarn Workspaces 完成微前端拆分，处理样式隔离、跨应用通信与路由分发</li><li>针对万级运单列表与长表单引入虚拟滚动和懒加载，并沉淀 20+ 个业务组件</li><li>落地菜单/按钮级 RBAC、SaaS 多租户隔离及 SSO 单点登录</li></ul>',
      },
      {
        id: 'p2',
        name: '企业移动 OA',
        role: '前端开发工程师',
        date: '2025.06 - 2026.06',
        visible: true,
        description:
          '<ul><li>使用 Vue 3、TypeScript 与 uni-app 开发即时通讯、项目管理和移动工作台</li><li>通过 WebView 与 Cookie 注入打通 OA、ERP 登录态，一套代码覆盖 Android、iOS 与 H5</li></ul>',
      },
      {
        id: 'p3',
        name: '跨境电商 SaaS 平台',
        role: '前端开发工程师',
        date: '2025.06 - 2026.06',
        visible: true,
        description:
          '<ul><li>负责商品、购物车、结算与订单等核心交易流程，使用 Pinia 管理跨店铺购物车状态</li><li>支持多品牌、多租户和中英西三语切换，配合 Vite 完成多环境构建发布</li></ul>',
      },
    ],
    skillContent:
      '<ul><li>前端基础：JavaScript（ES6+）、TypeScript、HTML、CSS</li><li>框架生态：Vue 2/3、React、Pinia、Vuex、Vue Router</li><li>工程与跨端：qiankun、Monorepo、Vite、Webpack、uni-app、React Native</li><li>提效工具：使用 GitHub Copilot、Cursor 辅助代码补全和存量代码走读，提交前坚持人工 review</li></ul>',
    globalSettings: {
      ...blankResumeState.globalSettings,
      baseFontSize: 14,
      paragraphSpacing: 8,
      lineHeight: 1.45,
      sectionSpacing: 8,
      headerSize: 17,
      subheaderSize: 15,
    },
  },
  {
    overview: [
      '这份案例先用“供应链业务 + 微前端 + 跨端”建立岗位定位，再展开工作经历，避免只罗列 Vue、React 等技术名词。',
      '工作经历负责说明职责边界，项目经历只保留最能证明架构治理、复杂业务和多端交付能力的 3 个项目，避免同一成果重复出现。',
    ],
    projectSelection: '原始经历包含多个项目，这里优先保留 ERP、企业 OA 和电商 SaaS：三者分别证明工程架构、跨端集成与交易业务能力。成果数字只保留来源中可核验的应用数量、列表规模和组件数量。',
  },
)
