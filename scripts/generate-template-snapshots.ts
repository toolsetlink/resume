/**
 * 模板快照生成脚本 - 自由简历项目（阶段 7 Task 7.10）
 *
 * 用途：
 *   为 TEMPLATE_REGISTRY 中每个模板生成一张缩略图（600x800，3:4），保存到
 *   public/templates/thumbnails/<template-id>.png，供模板切换器展示。
 *
 * 运行方式：
 *   1. 先启动 dev server（脚本不自动启动，避免端口冲突）：
 *        pnpm dev
 *   2. 另开一个终端执行：
 *        pnpm snapshot
 *      等价于：
 *        npx tsx scripts/generate-template-snapshots.ts
 *
 * 浏览器依赖：
 *   本脚本使用 puppeteer-core（不内嵌浏览器），需本机已安装 Chrome 或 Chromium。
 *   - 优先读取环境变量 PUPPETEER_EXECUTABLE_PATH
 *   - 否则尝试 macOS 常见路径：/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
 *   - 否则尝试 /Applications/Chromium.app/Contents/MacOS/Chromium
 *   - 都找不到则打印错误并退出（退出码 1）
 *
 * 输出：
 *   public/templates/thumbnails/<template-id>.png  (600x800, deviceScaleFactor=2 高清)
 *
 * 退出码：
 *   0 = 全部成功
 *   1 = 有模板截图失败或前置条件不满足
 */

import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

// ES 模块下获取项目根目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')

// ============================================================
// 配置
// ============================================================

const DEV_SERVER_URL = 'http://localhost:3000'
const SNAPSHOT_ROUTE_PREFIX = '/snapshot'
const OUTPUT_DIR = resolve(projectRoot, 'public/templates/thumbnails')
// 视口宽度按 A4 等比设置，高度按 3:4 比例
const VIEWPORT_WIDTH = 794
const VIEWPORT_HEIGHT = 1123
const THUMBNAIL_WIDTH = 600
const THUMBNAIL_HEIGHT = 800
const DEVICE_SCALE_FACTOR = 2
const STYLE_INJECTION_WAIT_MS = 800
const NAV_TIMEOUT_MS = 30000
// 等待 #resume-preview 元素出现
const SELECTOR_RESUME_PREVIEW = '#resume-preview'

// macOS 常见浏览器路径
const CANDIDATE_BROWSER_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
]

// ============================================================
// 类型定义（与 app/components/templates/registry.ts 对齐）
// ============================================================

interface ResumeTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  layout: string
  colorScheme: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  spacing: {
    sectionGap: number
    itemGap: number
    contentPadding: number
  }
  basic: {
    layout?: 'left' | 'center' | 'right'
  }
  availableSections?: string[]
}

interface TemplateRegistryEntry {
  config: ResumeTemplate
}

// ============================================================
// 工具函数
// ============================================================

function log(msg: string): void {
  // eslint-disable-next-line no-console
  console.log(msg)
}

function logError(msg: string, err?: unknown): void {
  // eslint-disable-next-line no-console
  console.error(msg)
  if (err) {
    // eslint-disable-next-line no-console
    console.error(err instanceof Error ? err.stack || err.message : String(err))
  }
}

/**
 * 解析浏览器可执行文件路径：
 * 1) 环境变量 PUPPETEER_EXECUTABLE_PATH
 * 2) macOS 常见路径
 */
function resolveBrowserPath(): string | null {
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH
  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv
  }
  for (const p of CANDIDATE_BROWSER_PATHS) {
    if (existsSync(p)) return p
  }
  return null
}

/**
 * 探测 dev server 是否在运行。
 * 任意响应（即使 404）都算运行中；只有连接失败才算未运行。
 */
async function isDevServerRunning(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    await fetch(DEV_SERVER_URL, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timer)
    return true
  } catch {
    return false
  }
}

/**
 * 读取模板 id 列表。
 *
 * 注意：不能直接 import registry.ts，因为它内部 import 了 .vue 文件，
 * Node/tsx 无法加载 .vue。这里通过扫描 templates/ 目录下的子目录
 * （每个含 config.ts 的子目录视为一套模板）来获取模板 id。
 */
async function loadTemplateRegistry(): Promise<TemplateRegistryEntry[]> {
  const templatesDir = resolve(projectRoot, 'app/components/templates')
  const entries = await fs.readdir(templatesDir, { withFileTypes: true })
  const templateIds: string[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const configPath = resolve(templatesDir, entry.name, 'config.ts')
    if (!existsSync(configPath)) continue
    templateIds.push(entry.name)
  }
  if (templateIds.length === 0) {
    throw new Error(
      `未在 ${templatesDir} 下找到任何模板（需含 config.ts 的子目录）`
    )
  }
  // 按字母序排序，保证输出稳定
  templateIds.sort()
  return templateIds.map((id) => ({
    config: { id } as ResumeTemplate,
  }))
}

/**
 * 确保输出目录存在。
 */
function ensureOutputDir(): void {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }
}

// ============================================================
// 截图核心
// ============================================================

interface ScreenshotResult {
  templateId: string
  ok: boolean
  error?: string
}

/**
 * 对单个模板截图。
 *
 * 步骤：
 *   1. 打开 dev server 的 /snapshot/<id> 路由
 *   2. 等待 #resume-preview 元素出现
 *   3. 再等 800ms 让样式注入完成
 *   4. 全页截图（PNG buffer）
 *   5. 用 sharp 缩放/裁剪到 600x800
 *   6. 写入 public/templates/thumbnails/<id>.png
 */
async function snapshotTemplate(
  browser: import('puppeteer-core').Browser,
  templateId: string,
  index: number,
  total: number
): Promise<ScreenshotResult> {
  const url = `${DEV_SERVER_URL}${SNAPSHOT_ROUTE_PREFIX}/${templateId}`
  log(`[${index}/${total}] Generating snapshot for ${templateId}... (${url})`)

  let page: import('puppeteer-core').Page | null = null
  try {
    page = await browser.newPage()
    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
    })

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: NAV_TIMEOUT_MS,
    })

    // 等待预览容器出现
    await page.waitForSelector(SELECTOR_RESUME_PREVIEW, {
      timeout: NAV_TIMEOUT_MS,
      visible: true,
    })

    // 等待样式注入完成（模板内的字体、主题色等异步样式）
    await new Promise((r) => setTimeout(r, STYLE_INJECTION_WAIT_MS))

    // 截取整个视口
    const pngBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false,
    })

    // 用 sharp 缩放/裁剪到 600x800（3:4）
    const sharp = (await import('sharp')).default
    const outputBuffer = await sharp(Buffer.from(pngBuffer))
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: 'cover',
        position: 'top',
      })
      .png()
      .toBuffer()

    const outPath = resolve(OUTPUT_DIR, `${templateId}.png`)
    await fs.writeFile(outPath, outputBuffer)

    log(`\u2713 Saved public/templates/thumbnails/${templateId}.png`)
    return { templateId, ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logError(`\u2717 Failed to snapshot ${templateId}: ${msg}`, err)
    return { templateId, ok: false, error: msg }
  } finally {
    if (page) {
      try {
        await page.close()
      } catch {
        // ignore
      }
    }
  }
}

// ============================================================
// 主流程
// ============================================================

async function main(): Promise<number> {
  // 1. 浏览器路径
  const executablePath = resolveBrowserPath()
  if (!executablePath) {
    logError(
      '[snapshot] 未找到可用的浏览器可执行文件。\n' +
        '  请设置环境变量 PUPPETEER_EXECUTABLE_PATH 指向 Chrome/Chromium 路径，\n' +
        '  或在 macOS 安装 Google Chrome / Chromium 到默认路径。'
    )
    return 1
  }

  // 2. 检查 dev server
  const running = await isDevServerRunning()
  if (!running) {
    logError(
      `[snapshot] Dev server 未运行（无法访问 ${DEV_SERVER_URL}）。\n` +
        '  请先在另一个终端执行 `pnpm dev`，等 dev server 起来后再运行 `pnpm snapshot`。'
    )
    return 1
  }

  // 3. 加载模板注册表
  let registry: TemplateRegistryEntry[]
  try {
    registry = await loadTemplateRegistry()
  } catch (err) {
    logError('[snapshot] 加载 TEMPLATE_REGISTRY 失败。', err)
    return 1
  }

  // 4. 准备输出目录
  ensureOutputDir()

  // 5. 启动浏览器
  const puppeteer = await import('puppeteer-core')
  let browser: import('puppeteer-core').Browser | null = null
  try {
    browser = await puppeteer.default.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--hide-scrollbars',
        '--force-device-scale-factor=2',
      ],
    })
  } catch (err) {
    logError('[snapshot] 启动浏览器失败。', err)
    return 1
  }

  // 6. 逐个截图
  const total = registry.length
  const results: ScreenshotResult[] = []
  try {
    for (let i = 0; i < registry.length; i++) {
      const entry = registry[i]
      if (!entry) continue
      const id = entry.config.id
      // eslint-disable-next-line no-await-in-loop
      const result = await snapshotTemplate(browser, id, i + 1, total)
      results.push(result)
    }
  } finally {
    try {
      await browser.close()
    } catch {
      // ignore
    }
    browser = null
  }

  // 7. 汇总
  const successCount = results.filter((r) => r.ok).length
  const failedCount = results.length - successCount
  log(
    `Done: ${successCount}/${total} success, ${failedCount} failed` +
      (failedCount > 0
        ? ` (${results
            .filter((r) => !r.ok)
            .map((r) => r.templateId)
            .join(', ')})`
        : '')
  )

  return failedCount > 0 ? 1 : 0
}

main()
  .then((code) => {
    process.exit(code)
  })
  .catch((err) => {
    logError('[snapshot] 未捕获的错误：', err)
    process.exit(1)
  })
