// 模板注册表 - 自由简历项目
// 阶段 7：注册 professional + modern + elegant + creative 共 4 套模板
import type { Component } from 'vue'
import type { ResumeTemplate } from '#shared/types/template'
import { professionalConfig } from './professional/config'
import ProfessionalTemplate from './professional/index.vue'
import { modernConfig } from './modern/config'
import ModernTemplate from './modern/index.vue'
import { elegantConfig } from './elegant/config'
import ElegantTemplate from './elegant/index.vue'
import { creativeConfig } from './creative/config'
import CreativeTemplate from './creative/index.vue'

// 模板注册项：配置 + 组件
export interface TemplateRegistryEntry {
  config: ResumeTemplate
  Component: Component
}

// 模板注册表
export const TEMPLATE_REGISTRY: TemplateRegistryEntry[] = [
  { config: professionalConfig, Component: ProfessionalTemplate },
  { config: modernConfig, Component: ModernTemplate },
  { config: elegantConfig, Component: ElegantTemplate },
  { config: creativeConfig, Component: CreativeTemplate },
]

// 所有模板配置列表
export const DEFAULT_TEMPLATES: ResumeTemplate[] = TEMPLATE_REGISTRY.map(
  (e) => e.config
)

// 根据 layout 查找模板组件
export function getTemplateComponent(layout: string): Component | null {
  return (
    TEMPLATE_REGISTRY.find((e) => e.config.layout === layout)?.Component ?? null
  )
}

// 根据 id 查找模板配置
export function getTemplateConfig(id: string): ResumeTemplate | null {
  return TEMPLATE_REGISTRY.find((e) => e.config.id === id)?.config ?? null
}

// 模板 ID → SEO URL slug 映射
export const TEMPLATE_SLUG_MAP: Record<string, string> = {
  professional: 'professional-resume',
  modern: 'modern-resume',
  elegant: 'elegant-resume',
  creative: 'creative-resume',
}

// 根据模板 ID 获取 SEO slug
export function getTemplateSlug(id: string): string {
  return TEMPLATE_SLUG_MAP[id] ?? id
}

// 根据 SEO slug 获取模板 ID
export function getTemplateIdBySlug(slug: string): string | null {
  return (
    Object.entries(TEMPLATE_SLUG_MAP).find(
      ([, v]) => v === slug
    )?.[0] ?? null
  )
}
