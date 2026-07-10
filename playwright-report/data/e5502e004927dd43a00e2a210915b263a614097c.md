# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual/templates.spec.ts >> 落地页视觉回归 >> 中文落地页视觉一致
- Location: tests/e2e/visual/templates.spec.ts:80:3

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  Expected an image 1280px by 2742px, received 1280px by 4954px. 867308 pixels (ratio 0.14 of all image pixels) are different.

  Snapshot: landing.png

Call log:
  - Expect "toHaveScreenshot(landing.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 2742px, received 1280px by 4954px. 867308 pixels (ratio 0.14 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 1280px by 2742px, received 1280px by 4954px. 867308 pixels (ratio 0.14 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "自由简历" [ref=e7] [cursor=pointer]:
          - /url: /
          - img [ref=e9]
          - generic [ref=e12]: 自由简历
        - navigation [ref=e13]:
          - link "我的简历列表" [ref=e14] [cursor=pointer]:
            - /url: /dashboard
          - link "功能" [ref=e15] [cursor=pointer]:
            - /url: "#features"
          - link "模板" [ref=e16] [cursor=pointer]:
            - /url: "#templates"
          - link "FAQ" [ref=e17] [cursor=pointer]:
            - /url: "#faq"
        - generic [ref=e18]:
          - button [ref=e19] [cursor=pointer]:
            - img [ref=e21]
          - button [ref=e25] [cursor=pointer]:
            - img [ref=e27]
          - button [ref=e29] [cursor=pointer]:
            - img [ref=e31]
    - main [ref=e32]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - img [ref=e41]
            - text: 隐私优先 · 数据本地存储
          - heading "打造专业简历，轻松拿到 Offer" [level=1] [ref=e44]
          - paragraph [ref=e45]: 自由简历是一款免费、隐私优先的在线简历编辑器。多模板选择、AI 智能润色、语法检查、PDF 导出，一站式助力你的求职之路。
          - generic [ref=e46]:
            - button "立即创建" [ref=e47] [cursor=pointer]:
              - generic [ref=e48]:
                - img [ref=e49]
                - text: 立即创建
            - button "查看模板" [ref=e50] [cursor=pointer]:
              - generic [ref=e51]:
                - img [ref=e52]
                - text: 查看模板
        - generic [ref=e58]:
          - generic [ref=e59]:
            - generic [ref=e60]: 张
            - generic [ref=e61]:
              - generic [ref=e62]: 张三
              - generic [ref=e63]: 高级前端工程师
          - generic [ref=e80]:
            - generic [ref=e81]: React
            - generic [ref=e82]: TypeScript
            - generic [ref=e83]: Node.js
            - generic [ref=e84]: Vue
            - generic [ref=e85]: 团队管理
      - generic [ref=e87]:
        - generic [ref=e88]:
          - heading "精选简历模板" [level=2] [ref=e89]
          - paragraph [ref=e90]: 4 套精心设计的专业模板，一键切换预览，挑一款最适合你的
        - generic [ref=e91]:
          - button "专业简约" [ref=e92]
          - button "现代极简" [ref=e93]
          - button "优雅经典" [ref=e94]
          - button "创意活泼" [ref=e95]
        - generic [ref=e96]:
          - generic [ref=e102]:
            - generic [ref=e104]:
              - heading "李明" [level=1] [ref=e105]
              - paragraph [ref=e106]: 高级前端工程师
              - list [ref=e107]:
                - listitem [ref=e108]:
                  - generic [ref=e109]: liming@example.com
                - listitem [ref=e110]:
                  - generic [ref=e111]: "13800138000"
                - listitem [ref=e112]:
                  - generic [ref=e113]: 北京市海淀区
                - listitem [ref=e114]:
                  - generic [ref=e115]: "28"
                - listitem [ref=e116]:
                  - generic [ref=e117]: 在职
              - list [ref=e118]:
                - listitem [ref=e119]:
                  - generic [ref=e120]: "个人网站:"
                  - generic [ref=e121]: https://liming.dev
            - generic [ref=e122]:
              - heading "专业技能" [level=2] [ref=e123]:
                - generic [ref=e125]: 专业技能
              - list [ref=e127]:
                - listitem [ref=e128]: 前端框架：Vue、React，熟悉 Nuxt、Next.js
                - listitem [ref=e129]: 开发语言：TypeScript、JavaScript(ES6+)
                - listitem [ref=e130]: UI 样式：Tailwind CSS、Sass
                - listitem [ref=e131]: 工程化：Vite、Webpack、ESLint
            - generic [ref=e132]:
              - heading "工作经验" [level=2] [ref=e133]:
                - generic [ref=e135]: 工作经验
              - generic [ref=e137]:
                - generic [ref=e138]:
                  - generic [ref=e139]: 某科技公司
                  - generic [ref=e140]: 2017.07 - 至今
                - generic [ref=e141]: 前端工程师
                - list [ref=e143]:
                  - listitem [ref=e144]: 负责公司核心产品的前端开发
                  - listitem [ref=e145]: 优化性能，首屏加载提升 40%
            - generic [ref=e146]:
              - heading "项目经历" [level=2] [ref=e147]:
                - generic [ref=e149]: 项目经历
              - generic [ref=e151]:
                - generic [ref=e152]:
                  - generic [ref=e153]: 企业中台系统
                  - generic [ref=e154]: 2020.06 - 2023.12
                - generic [ref=e155]: 前端负责人
                - list [ref=e157]:
                  - listitem [ref=e158]: 基于 Vue 3 + TypeScript 开发
                  - listitem [ref=e159]: 组件库设计，复用率提升 60%
            - generic [ref=e160]:
              - heading "教育经历" [level=2] [ref=e161]:
                - generic [ref=e163]: 教育经历
              - generic [ref=e165]:
                - generic [ref=e166]:
                  - generic [ref=e167]: 清华大学
                  - generic [ref=e168]: 2013-09 - 2017-06
                - generic [ref=e169]: 计算机科学与技术 · 本科
                - list [ref=e171]:
                  - listitem [ref=e172]: 主修课程：数据结构、算法设计、操作系统、计算机网络
                  - listitem [ref=e173]: 专业排名前 10%
          - button "使用此模板" [ref=e174] [cursor=pointer]:
            - generic [ref=e175]:
              - text: 使用此模板
              - img [ref=e176]
      - generic [ref=e179]:
        - generic [ref=e180]:
          - heading "为求职者打造的核心功能" [level=2] [ref=e181]
          - paragraph [ref=e182]: 从模板到导出，每一个细节都为提高面试通过率而设计
        - generic [ref=e183]:
          - generic [ref=e184]:
            - img [ref=e186]
            - heading "多模板选择" [level=3] [ref=e190]
            - paragraph [ref=e191]: 内置 4 套精心设计的专业模板，覆盖不同行业与岗位，一键切换。
          - generic [ref=e192]:
            - img [ref=e194]
            - heading "AI 智能润色" [level=3] [ref=e197]
            - paragraph [ref=e198]: 支持豆包、DeepSeek、OpenAI、Gemini 多供应商，AI 帮你优化措辞表达。
          - generic [ref=e199]:
            - img [ref=e201]
            - heading "语法检查" [level=3] [ref=e204]
            - paragraph [ref=e205]: 实时检测简历中的拼写与语法错误，确保每一份投递都专业无误。
          - generic [ref=e206]:
            - img [ref=e208]
            - heading "PDF 导出" [level=3] [ref=e212]
            - paragraph [ref=e213]: 一键导出高清 PDF，保留原始排版与字体，HR 端呈现一致。
          - generic [ref=e214]:
            - img [ref=e216]
            - heading "实时预览" [level=3] [ref=e219]
            - paragraph [ref=e220]: 所见即所得的编辑体验，每次修改即时反映在简历预览区。
          - generic [ref=e221]:
            - img [ref=e223]
            - heading "本地同步" [level=3] [ref=e225]
            - paragraph [ref=e226]: 数据存储在浏览器本地，无需登录账号，隐私不离开你的设备。
      - generic [ref=e233]:
        - heading "准备好开始了吗？" [level=2] [ref=e234]
        - paragraph [ref=e235]: 免费、无需注册。几分钟内打造你的专业简历。
        - button "立即开始" [ref=e237] [cursor=pointer]:
          - generic [ref=e238]:
            - text: 立即开始
            - img [ref=e239]
      - generic [ref=e242]:
        - heading "常见问题" [level=2] [ref=e244]
        - generic [ref=e245]:
          - generic [ref=e246]:
            - button "自由简历是免费的吗？" [expanded] [ref=e247]:
              - generic [ref=e248]: 自由简历是免费的吗？
              - img [ref=e250]
            - paragraph [ref=e254]: 是的，自由简历完全免费，没有任何付费功能或订阅，所有功能均可直接使用。
          - generic [ref=e255]:
            - button "我的简历数据会被上传到服务器吗？" [ref=e256]:
              - generic [ref=e257]: 我的简历数据会被上传到服务器吗？
              - img [ref=e259]
            - paragraph [ref=e261]: 不会。所有简历数据均存储在你浏览器的本地存储（localStorage）中，除非你主动导出，否则数据不会离开你的设备。
          - generic [ref=e262]:
            - button "使用 AI 润色功能需要配置什么？" [ref=e263]:
              - generic [ref=e264]: 使用 AI 润色功能需要配置什么？
              - img [ref=e266]
            - paragraph [ref=e268]: 你需要在设置中填写任一 AI 供应商的 API Key（如豆包、DeepSeek、OpenAI、Gemini）。请求会直接从你的浏览器发送到对应供应商，不经过我们的服务器。
          - generic [ref=e269]:
            - button "导出的 PDF 会有水印吗？" [ref=e270]:
              - generic [ref=e271]: 导出的 PDF 会有水印吗？
              - img [ref=e273]
            - paragraph [ref=e275]: 不会。导出的 PDF 完全无水印，排版与你在编辑器中看到的预览完全一致。
    - contentinfo [ref=e276]:
      - generic [ref=e277]:
        - generic [ref=e278]:
          - generic [ref=e279]:
            - img [ref=e281]
            - generic [ref=e284]: 自由简历
          - navigation [ref=e285]:
            - link "GitHub" [ref=e286] [cursor=pointer]:
              - /url: https://github.com
              - img [ref=e287]
              - text: GitHub
            - link "隐私" [ref=e290] [cursor=pointer]:
              - /url: "#"
            - link "条款" [ref=e291] [cursor=pointer]:
              - /url: "#"
        - paragraph [ref=e293]: © 2025 自由简历. 保留所有权利.
  - generic:
    - img
  - generic [ref=e294]:
    - button "Toggle Nuxt DevTools" [ref=e295] [cursor=pointer]:
      - img [ref=e296]
    - generic "Page load time" [ref=e299]:
      - generic [ref=e300]: "23"
      - generic [ref=e301]: ms
    - button "Toggle Component Inspector" [ref=e303] [cursor=pointer]:
      - img [ref=e304]
```

# Test source

```ts
  1   | // 模板视觉回归测试 - 自由简历项目（Task 10.14）
  2   | // 覆盖 4 套模板 snapshot 页面 + 落地页的视觉一致性
  3   | // 首次运行自动生成基线截图，第二次运行开始对比
  4   | import { test, expect } from '@playwright/test'
  5   | 
  6   | // 所有已注册模板 id（与 registry.ts 中 TEMPLATE_REGISTRY 顺序一致）
  7   | const TEMPLATE_IDS = ['professional', 'modern', 'elegant', 'creative'] as const
  8   | 
  9   | // 各模板根容器 class（用于等待渲染完成）
  10  | const TEMPLATE_ROOT_SELECTOR: Record<string, string> = {
  11  |   professional: '.professional-template',
  12  |   modern: '.modern-template',
  13  |   elegant: '.elegant-template',
  14  |   creative: '.creative-template',
  15  | }
  16  | 
  17  | // 视觉对比阈值：允许 10% 像素差异（应对字体/抗锯齿等环境差异）
  18  | const VISUAL_THRESHOLD = { maxDiffPixelRatio: 0.1 }
  19  | 
  20  | // 等待模板渲染完成：根容器可见 + 字体加载 + 网络空闲
  21  | async function waitForTemplateReady(page: import('@playwright/test').Page, templateId: string) {
  22  |   await page.waitForLoadState('networkidle')
  23  |   const rootSelector = TEMPLATE_ROOT_SELECTOR[templateId]
  24  |   await page.waitForSelector(rootSelector, { state: 'visible', timeout: 15000 })
  25  |   // 等待中文字体加载完成，避免截图时字体未就绪
  26  |   await page.evaluate(() => document.fonts.ready)
  27  |   // 给 Vue 一帧时间完成所有 DOM 更新
  28  |   await page.waitForTimeout(300)
  29  | }
  30  | 
  31  | test.describe('模板视觉回归', () => {
  32  |   for (const templateId of TEMPLATE_IDS) {
  33  |     test(`${templateId} 模板 snapshot 视觉一致`, async ({ page }) => {
  34  |       const response = await page.goto(`/snapshot/${templateId}`)
  35  |       expect(response?.status()).toBeLessThan(400)
  36  | 
  37  |       await waitForTemplateReady(page, templateId)
  38  | 
  39  |       // 截图并与基线对比（首次运行自动生成基线）
  40  |       await expect(page).toHaveScreenshot(
  41  |         `${templateId}-template.png`,
  42  |         {
  43  |           ...VISUAL_THRESHOLD,
  44  |           fullPage: true,
  45  |         }
  46  |       )
  47  |     })
  48  | 
  49  |     test(`${templateId} 模板包含关键 DOM 元素`, async ({ page }) => {
  50  |       // 降级保护：即使视觉对比因环境差异不稳定，也保证关键元素存在
  51  |       await page.goto(`/snapshot/${templateId}`)
  52  |       await waitForTemplateReady(page, templateId)
  53  | 
  54  |       const root = page.locator(TEMPLATE_ROOT_SELECTOR[templateId]).first()
  55  |       await expect(root).toBeVisible()
  56  | 
  57  |       // 模板根容器内应渲染基本内容（snapshot 用 initialResumeState，含姓名「李明」）
  58  |       const rootText = (await root.textContent()) ?? ''
  59  |       expect(rootText.trim().length).toBeGreaterThan(0)
  60  |     })
  61  |   }
  62  | })
  63  | 
  64  | test.describe('落地页视觉回归', () => {
  65  |   test.beforeEach(async ({ context }) => {
  66  |     // i18n detectBrowserLanguage 在 redirectOn: 'root' 下会读取 Accept-Language，
  67  |     // Playwright Chromium 默认 en-US 会被重定向到 /en。
  68  |     // 显式设置 i18n_redirected=zh，确保 / 渲染中文落地页，保证截图稳定。
  69  |     await context.clearCookies()
  70  |     await context.addCookies([
  71  |       {
  72  |         name: 'i18n_redirected',
  73  |         value: 'zh',
  74  |         domain: 'localhost',
  75  |         path: '/',
  76  |       },
  77  |     ])
  78  |   })
  79  | 
  80  |   test('中文落地页视觉一致', async ({ page }) => {
  81  |     await page.goto('/')
  82  |     await page.waitForLoadState('networkidle')
  83  | 
  84  |     // 等待 Hero 标题可见，确保首屏渲染完成
  85  |     await page.waitForSelector('h1', { state: 'visible', timeout: 15000 })
  86  |     await page.evaluate(() => document.fonts.ready)
  87  |     await page.waitForTimeout(300)
  88  | 
> 89  |     await expect(page).toHaveScreenshot(
      |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
  90  |       'landing.png',
  91  |       {
  92  |         ...VISUAL_THRESHOLD,
  93  |         fullPage: true,
  94  |       }
  95  |     )
  96  |   })
  97  | 
  98  |   test('落地页关键元素存在', async ({ page }) => {
  99  |     // 降级保护：视觉对比不稳定时仍保证关键元素存在
  100 |     await page.goto('/')
  101 |     await page.waitForLoadState('networkidle')
  102 |     await page.waitForSelector('h1', { state: 'visible', timeout: 15000 })
  103 | 
  104 |     // Hero 标题
  105 |     const h1 = page.locator('h1').first()
  106 |     await expect(h1).toBeVisible()
  107 | 
  108 |     // Features 锚点
  109 |     const features = page.locator('#features').first()
  110 |     await expect(features).toBeVisible()
  111 | 
  112 |     // Footer
  113 |     const footer = page.locator('footer').first()
  114 |     await expect(footer).toBeVisible()
  115 |   })
  116 | })
  117 | 
```