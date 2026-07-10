import type { ComponentType } from 'react'
import type { ResumeData } from '@/shared/types/resume'
import type { ResumeTemplate } from '@/shared/types/template'

import { professionalConfig } from './professional/config'
import { ProfessionalTemplate } from './professional'
import { modernConfig } from './modern/config'
import { ModernTemplate } from './modern'
import { elegantConfig } from './elegant/config'
import { ElegantTemplate } from './elegant'
import { creativeConfig } from './creative/config'
import { CreativeTemplate } from './creative'

export interface TemplateRegistryEntry {
  config: ResumeTemplate
  Component: ComponentType<{ data: ResumeData; template: ResumeTemplate }>
}

export const TEMPLATE_REGISTRY: TemplateRegistryEntry[] = [
  { config: professionalConfig, Component: ProfessionalTemplate },
  { config: modernConfig, Component: ModernTemplate },
  { config: elegantConfig, Component: ElegantTemplate },
  { config: creativeConfig, Component: CreativeTemplate },
]

export const DEFAULT_TEMPLATES: ResumeTemplate[] = TEMPLATE_REGISTRY.map((e) => e.config)

export function getTemplateComponent(layout: string): ComponentType<{ data: ResumeData; template: ResumeTemplate }> | null {
  return TEMPLATE_REGISTRY.find((e) => e.config.layout === layout)?.Component ?? null
}

export function getTemplateConfig(id: string): ResumeTemplate | null {
  return TEMPLATE_REGISTRY.find((e) => e.config.id === id)?.config ?? null
}

export const TEMPLATE_SLUG_MAP: Record<string, string> = {
  professional: 'professional-resume',
  modern: 'modern-resume',
  elegant: 'elegant-resume',
  creative: 'creative-resume',
}

export function getTemplateSlug(id: string): string {
  return TEMPLATE_SLUG_MAP[id] ?? id
}

export function getTemplateIdBySlug(slug: string): string | null {
  return Object.entries(TEMPLATE_SLUG_MAP).find(([, v]) => v === slug)?.[0] ?? null
}
