// OG 图片生成脚本
// 使用 sharp 生成 1200×630px Open Graph 图片
// 运行：npx tsx scripts/generate-og-image.ts

import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SIZES = {
  og: { width: 1200, height: 630 },
}

const BRAND_COLOR = '#1f2937'
const TEXT_COLOR = '#ffffff'
const ACCENT_COLOR = '#3b82f6'

interface OgConfig {
  title: string
  subtitle: string
  filename: string
}

const configs: OgConfig[] = [
  {
    title: '自由简历',
    subtitle: '隐私优先的在线简历编辑器 · 免费 · 无需注册',
    filename: 'og-image.png',
  },
  {
    title: 'ZiYou Resume',
    subtitle: 'Privacy-first online resume editor · Free · No registration',
    filename: 'og-image-en.png',
  },
]

async function generateOgImage(cfg: OgConfig): Promise<void> {
  const { width, height } = SIZES.og

  // Create SVG overlay with text
  const svgOverlay = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND_COLOR};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${ACCENT_COLOR};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />

      <!-- Decorative shapes -->
      <circle cx="1000" cy="100" r="300" fill="url(#accent)" opacity="0.08" />
      <circle cx="200" cy="500" r="200" fill="url(#accent)" opacity="0.06" />

      <!-- Accent line -->
      <rect x="80" y="200" width="60" height="6" rx="3" fill="url(#accent)" />

      <!-- Title -->
      <text x="80" y="310" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="${TEXT_COLOR}">
        ${cfg.title}
      </text>

      <!-- Subtitle -->
      <text x="80" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#94a3b8">
        ${cfg.subtitle}
      </text>

      <!-- URL -->
      <text x="80" y="520" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#64748b">
        resume.toolsetlink.com
      </text>
    </svg>
  `

  const outputPath = path.resolve(__dirname, '..', 'public', cfg.filename)

  await sharp(Buffer.from(svgOverlay))
    .resize(width, height)
    .png()
    .toFile(outputPath)

  console.log(`✅ Generated: ${cfg.filename} (${width}x${height})`)
}

async function main() {
  console.log('🎨 Generating OG images...\n')

  for (const cfg of configs) {
    await generateOgImage(cfg)
  }

  console.log('\n✨ Done!')
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
