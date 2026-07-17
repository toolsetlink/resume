'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button, Input, Modal } from 'antd'
import { Plus, FolderPlus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import type { CustomItem as CustomItemType } from '@/shared/types/resume'
import { CustomItem } from './CustomItem'

export function CustomPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore((s) => s.activeResumeId)
  const importResume = useResumeStore((s) => s.importResume)

  const [newSectionName, setNewSectionName] = useState('')
  const [showNewSectionModal, setShowNewSectionModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )

  // 把 customData 用 useMemo 包住，让下面 5 个 useCallback 的依赖引用稳定。
  // 否则每次渲染 `activeResume?.customData || {}` 都会返回新对象，导致 callbacks 重建。
  const customData = useMemo(
    () => activeResume?.customData || {},
    [activeResume?.customData]
  )
  const customSectionTitles = useMemo(
    () => activeResume?.customSectionTitles || {},
    [activeResume?.customSectionTitles],
  )
  const sectionIds = Object.keys(customData)

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }, [])

  const handleAddSection = useCallback(() => {
    const name = newSectionName.trim()
    if (!name) return
    if (!activeResumeId) return

    const sectionId = uuidv4()
    const newCustomData = {
      ...customData,
      [sectionId]: [] as CustomItemType[],
    }

    importResume(activeResumeId, {
      customData: newCustomData,
      customSectionTitles: { ...customSectionTitles, [sectionId]: name },
    })
    setNewSectionName('')
    setShowNewSectionModal(false)
    setExpandedSections((prev) => new Set(prev).add(sectionId))
  }, [newSectionName, activeResumeId, customData, customSectionTitles, importResume])

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (!activeResumeId) return
      const remaining = { ...customData }
      delete remaining[sectionId]
      const remainingTitles = { ...customSectionTitles }
      delete remainingTitles[sectionId]
      importResume(activeResumeId, { customData: remaining, customSectionTitles: remainingTitles })
    },
    [activeResumeId, customData, customSectionTitles, importResume]
  )

  const handleAddItem = useCallback(
    (sectionId: string) => {
      if (!activeResumeId) return
      const newItem: CustomItemType = {
        id: uuidv4(),
        title: '',
        subtitle: '',
        dateRange: '',
        description: '',
        visible: true,
      }
      const newCustomData = {
        ...customData,
        [sectionId]: [...(customData[sectionId] || []), newItem],
      }
      importResume(activeResumeId, { customData: newCustomData })
    },
    [activeResumeId, customData, importResume]
  )

  const handleChangeItem = useCallback(
    (
      sectionId: string,
      itemId: string,
      data: Partial<CustomItemType>
    ) => {
      if (!activeResumeId) return
      const items = customData[sectionId] || []
      const newCustomData = {
        ...customData,
        [sectionId]: items.map((item) =>
          item.id === itemId ? { ...item, ...data } : item
        ),
      }
      importResume(activeResumeId, { customData: newCustomData })
    },
    [activeResumeId, customData, importResume]
  )

  const handleDeleteItem = useCallback(
    (sectionId: string, itemId: string) => {
      if (!activeResumeId) return
      const items = customData[sectionId] || []
      const newCustomData = {
        ...customData,
        [sectionId]: items.filter((item) => item.id !== itemId),
      }
      importResume(activeResumeId, { customData: newCustomData })
    },
    [activeResumeId, customData, importResume]
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">自定义模块</h3>
        <Button
          type="primary"
          size="small"
          icon={<FolderPlus className="w-4 h-4" />}
          onClick={() => setShowNewSectionModal(true)}
        >
          新建分区
        </Button>
      </div>

      {sectionIds.length === 0 && (
        <div className="text-center py-8 text-[hsl(var(--text-tertiary))]">
          暂无自定义模块，点击「新建分区」开始添加
        </div>
      )}

      <div className="space-y-4">
        {sectionIds.map((sectionId) => {
          const items = customData[sectionId] || []
          const sectionTitle = customSectionTitles[sectionId] || '未命名分区'
          const isExpanded = expandedSections.has(sectionId)

          return (
            <div
              key={sectionId}
              className="border rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 bg-[hsl(var(--bg-base))] cursor-pointer">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-medium"
                  onClick={() => toggleSection(sectionId)}
                >
                  <span
                    className={`transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  >
                    &#9654;
                  </span>
                  {sectionTitle}
                  <span className="text-xs text-[hsl(var(--text-tertiary))]">
                    ({items.length} 项)
                  </span>
                </button>
                <button
                  type="button"
                  className="text-red-400 hover:text-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSection(sectionId)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isExpanded && (
                <div className="p-3 space-y-3 border-t">
                  {items
                    .filter((item) => item.visible !== false)
                    .map((item) => (
                      <CustomItem
                        key={item.id}
                        item={item}
                        sectionId={sectionId}
                        onChange={handleChangeItem}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  <Button
                    type="dashed"
                    block
                    size="small"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => handleAddItem(sectionId)}
                  >
                    添加条目
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal
        title="新建自定义分区"
        open={showNewSectionModal}
        onOk={handleAddSection}
        onCancel={() => {
          setShowNewSectionModal(false)
          setNewSectionName('')
        }}
        okText="创建"
        cancelText="取消"
      >
        <Input
          placeholder="输入分区名称"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          onPressEnter={handleAddSection}
        />
      </Modal>
    </div>
  )
}
