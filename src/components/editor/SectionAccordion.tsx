'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button, Tooltip, Switch, Select } from 'antd'
import { GripVertical, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import messages from '@/messages/zh.json'
import { ComponentType } from 'react'
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MenuSection } from '@/shared/types/resume'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'

import { BasicInfoPanel } from '@/components/editor/basic/BasicInfoPanel'
import { EducationPanel } from '@/components/editor/education/EducationPanel'
import { ExperiencePanel } from '@/components/editor/experience/ExperiencePanel'
import { ProjectPanel } from '@/components/editor/projects/ProjectPanel'
import { CertificatesPanel } from '@/components/editor/certificates/CertificatesPanel'
import { SkillPanel } from '@/components/editor/skills/SkillPanel'
import { SelfEvaluationPanel } from '@/components/editor/self-evaluation/SelfEvaluationPanel'
import { CustomPanel } from '@/components/editor/custom/CustomPanel'

const panelMap: Record<string, ComponentType> = {
  basic: BasicInfoPanel, education: EducationPanel, experience: ExperiencePanel,
  projects: ProjectPanel, certificates: CertificatesPanel, skills: SkillPanel,
  selfEvaluation: SelfEvaluationPanel, custom: CustomPanel,
}

function SortableCard({ section, index, total, expandedIds, onToggle, onMoveUp, onMoveDown, onToggleSection, showRegionControl, onRegionChange }: {
  section: MenuSection
  index: number
  total: number
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onToggleSection: (id: string, enabled: boolean) => void
  showRegionControl: boolean
  onRegionChange: (id: string, region: 'main' | 'sidebar') => void
}) {
  const t = messages
  const isBasic = section.id === 'basic'
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id, disabled: isBasic })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const Panel = panelMap[section.id]
  const isExpanded = expandedIds.has(section.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`section-card rounded-lg border overflow-hidden transition-colors ${
        isExpanded
          ? 'border-[hsl(var(--border-hover))] bg-[hsl(var(--bg-card))] shadow-sm'
          : 'border-[hsl(var(--border-default))] bg-[hsl(var(--bg-card))] hover:border-[hsl(var(--border-hover))]'
      }`}
    >
      <div
        className={`relative flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
          isExpanded ? 'bg-[hsl(var(--bg-subtle))]' : 'hover:bg-[hsl(var(--bg-subtle))]'
        }`}
        onClick={() => onToggle(section.id)}
      >
        {isExpanded && (
          <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[hsl(var(--brand))]" />
        )}
        {isBasic ? <span className="w-4" /> : <Tooltip title={t.editor.dragToSort}>
          <span {...attributes} {...listeners} className="cursor-grab opacity-50 hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
          </span>
        </Tooltip>}
        <span className="text-base shrink-0" aria-hidden>{section.icon}</span>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate text-[hsl(var(--text-primary))]">{section.title}</span>
          {!section.enabled && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg-canvas))] text-[hsl(var(--text-tertiary))]">
              {t.editor.hidden}
            </span>
          )}
        </div>
        {!isBasic && <><Tooltip title={t.editor.moveUp}><Button type="text" size="small" disabled={index === 0} onClick={e => { e.stopPropagation(); onMoveUp(section.id) }} icon={<ChevronUp className="w-4 h-4" />} /></Tooltip>
        <Tooltip title={t.editor.moveDown}><Button type="text" size="small" disabled={index === total - 1} onClick={e => { e.stopPropagation(); onMoveDown(section.id) }} icon={<ChevronDown className="w-4 h-4" />} /></Tooltip>
        <Tooltip title={t.editor.toggleVisibility}><Switch size="small" checked={section.enabled} onChange={checked => onToggleSection(section.id, checked)} onClick={(_, e) => e.stopPropagation()} /></Tooltip></>}
        <ChevronDown className={`w-4 h-4 text-[hsl(var(--text-tertiary))] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
      <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-[hsl(var(--border-default))]">
            {showRegionControl && !isBasic && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--border-default))] text-xs text-[hsl(var(--text-secondary))]">
                <span>模板位置</span>
                <Select
                  size="small"
                  value={section.region || 'main'}
                  onChange={(region) => onRegionChange(section.id, region)}
                  onClick={(event) => event.stopPropagation()}
                  options={[{ value: 'main', label: '主栏' }, { value: 'sidebar', label: '侧栏' }]}
                  style={{ width: 104 }}
                />
              </div>
            )}
            {Panel ? <Panel /> : (
              <div className="text-center text-[hsl(var(--text-tertiary))] py-6 text-sm">
                该模块暂无可编辑内容
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SectionAccordion() {
  const t = messages
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore(s => s.activeResumeId)
  const updateMenuSections = useResumeStore(s => s.updateMenuSections)
  const toggleMenuSection = useResumeStore(s => s.toggleMenuSection)
  const moveMenuSection = useResumeStore(s => s.moveMenuSection)

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['basic']))
  const [showGuide, setShowGuide] = useState(true)

  const sections = useMemo(() => {
    if (!activeResume) return []
    return [...activeResume.menuSections].sort((a, b) => a.order - b.order)
  }, [activeResume])
  const showRegionControl = activeResume?.templateId === 'modern' || activeResume?.templateId === 'creative'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!activeResumeId || !over || active.id === over.id) return
    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)
    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }))
    updateMenuSections(activeResumeId, reordered)
  }, [activeResumeId, sections, updateMenuSections])

  const handleMove = useCallback((sectionId: string, direction: 'up' | 'down') => {
    if (!activeResumeId) return
    moveMenuSection(activeResumeId, sectionId, direction)
  }, [activeResumeId, moveMenuSection])

  const handleRegionChange = useCallback((sectionId: string, region: 'main' | 'sidebar') => {
    if (!activeResumeId) return
    updateMenuSections(activeResumeId, sections.map((section) => section.id === sectionId ? { ...section, region } : section))
  }, [activeResumeId, sections, updateMenuSections])

  // SortableCard 透传 Switch.onChange(checked) 进来，第二个参数是新的 enabled 值。
  // 这里走 toggleMenuSection 是按 store 里的当前值取反，没有用 enabled 入参——保留
  // 现状避免双源切换，参数留着是为了接 SortableCard 的接口形状。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggle = useCallback((sectionId: string, enabled: boolean) => {
    if (!activeResumeId) return
    toggleMenuSection(activeResumeId, sectionId)
  }, [activeResumeId, toggleMenuSection])

  return (
    <div className="w-full flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-medium text-[hsl(var(--text-secondary))]">{t.editor.modules}</h2>
        {showGuide && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-md bg-[hsl(var(--brand)/0.08)] border border-[hsl(var(--brand)/0.2)] text-xs text-[hsl(var(--text-secondary))]">
            <Lightbulb className="w-4 h-4 text-[hsl(var(--brand))] flex-shrink-0" />
            <span className="flex-1">{t.editor.guideTip}</span>
            <Button type="text" size="small" onClick={() => setShowGuide(false)}>{t.editor.gotIt}</Button>
          </div>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="px-2 pb-3 space-y-2">
            {sections.map((section, index) => (
              <SortableCard
                key={section.id}
                section={section}
                index={index}
                total={sections.length}
                expandedIds={expandedIds}
                onToggle={toggleExpand}
                onMoveUp={id => handleMove(id, 'up')}
                onMoveDown={id => handleMove(id, 'down')}
                onToggleSection={handleToggle}
                showRegionControl={showRegionControl}
                onRegionChange={handleRegionChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
