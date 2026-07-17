'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Form, Input, InputNumber, Button, Upload } from 'antd'
import { Trash2 } from 'lucide-react'
import { useResumeStore, selectActiveResume } from '@/stores/resume-store'
import type { CustomFieldType, PhotoConfig } from '@/shared/types/resume'
import { DEFAULT_PHOTO_CONFIG } from '@/shared/types/resume'

export function BasicInfoPanel() {
  const activeResume = useResumeStore(selectActiveResume)
  const activeResumeId = useResumeStore((s) => s.activeResumeId)
  const updateBasicInfo = useResumeStore((s) => s.updateBasicInfo)

  const [form] = Form.useForm()
  const [photo, setPhoto] = useState<string>('')
  const [photoConfig, setPhotoConfig] = useState<PhotoConfig>(DEFAULT_PHOTO_CONFIG)
  const [customFields, setCustomFields] = useState<CustomFieldType[]>([])

  // 只在切换简历时同步一次，避免在 useEffect 里同步 setState 触发 cascading renders。
  const lastSyncedResumeIdRef = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    if (activeResume?.basic && activeResumeId !== lastSyncedResumeIdRef.current) {
      lastSyncedResumeIdRef.current = activeResumeId
      const b = activeResume.basic
      form.setFieldsValue(b)
      setPhoto(b.photo || '')
      setPhotoConfig(b.photoConfig || DEFAULT_PHOTO_CONFIG)
      setCustomFields(b.customFields || [])
    }
  }, [activeResume, activeResumeId, form])

  const commitCustomFields = useCallback((next: CustomFieldType[]) => {
    setCustomFields(next)
    if (activeResumeId) {
      updateBasicInfo(activeResumeId, { customFields: next })
    }
  }, [activeResumeId, updateBasicInfo, setCustomFields])

  const addCustomField = useCallback(() => {
    commitCustomFields([
      ...customFields,
      { id: crypto.randomUUID(), label: '', value: '' },
    ])
  }, [customFields, commitCustomFields])

  const updateCustomField = useCallback((id: string, patch: Partial<CustomFieldType>) => {
    commitCustomFields(customFields.map(f => f.id === id ? { ...f, ...patch } : f))
  }, [customFields, commitCustomFields])

  const removeCustomField = useCallback((id: string) => {
    commitCustomFields(customFields.filter(f => f.id !== id))
  }, [customFields, commitCustomFields])

  const commit = useCallback(() => {
    if (!activeResumeId) return
    const values = form.getFieldsValue()
    updateBasicInfo(activeResumeId, { ...values, photo, photoConfig })
  }, [activeResumeId, form, photo, photoConfig, updateBasicInfo])

  // Antd 的 beforeUpload 收的是 RcFile（File 子类），直接读 reader 即可，
  // 不再需要 UploadFile.originFileObj 这一层包装。
  const handlePhotoSelect = (file: File): boolean => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPhoto(base64)
      setTimeout(() => {
        if (activeResumeId) {
          updateBasicInfo(activeResumeId, {
            ...form.getFieldsValue(),
            photo: base64,
            photoConfig,
          })
        }
      }, 0)
    }
    reader.readAsDataURL(file)
    return false
  }

  const removePhoto = () => {
    setPhoto('')
    // 直接传 photo: ''，绕开 commit 闭包里的旧 photo 值（setPhoto 后立刻调用 commit 拿到的是 stale 值）
    if (activeResumeId) {
      updateBasicInfo(activeResumeId, { photo: '', photoConfig })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-base font-medium">照片</h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-32 border rounded overflow-hidden bg-[hsl(var(--bg-base))] flex items-center justify-center">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- 用户上传的 base64 头像，next/image 在静态导出 + unoptimized 模式下没收益
              <img
                src={photo}
                className="w-full h-full object-cover"
                alt="简历照片"
              />
            ) : (
              <span className="text-xs text-[hsl(var(--text-tertiary))]">
                无照片
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Upload
              showUploadList={false}
              beforeUpload={handlePhotoSelect}
            >
              <Button>选择照片</Button>
            </Upload>
            {photo && (
              <Button onClick={removePhoto} danger>
                移除照片
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-xs text-[hsl(var(--text-secondary))]">
              宽度
            </label>
            <InputNumber
              value={photoConfig.width}
              min={50}
              max={200}
              onChange={(v) => {
                const next = { ...photoConfig, width: v || 90 }
                setPhotoConfig(next)
                if (activeResumeId) updateBasicInfo(activeResumeId, { photoConfig: next })
              }}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label className="text-xs text-[hsl(var(--text-secondary))]">
              高度
            </label>
            <InputNumber
              value={photoConfig.height}
              min={50}
              max={200}
              onChange={(v) => {
                const next = { ...photoConfig, height: v || 120 }
                setPhotoConfig(next)
                if (activeResumeId) updateBasicInfo(activeResumeId, { photoConfig: next })
              }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-medium">基本信息</h3>
        <Form form={form} layout="vertical" onBlur={commit}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="name" label="姓名">
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item name="title" label="职位">
              <Input placeholder="请输入职位" />
            </Form.Item>
            <Form.Item name="email" label="邮箱">
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item name="phone" label="电话">
              <Input placeholder="请输入电话" />
            </Form.Item>
            <Form.Item name="location" label="所在地">
              <Input placeholder="请输入所在地" />
            </Form.Item>
            <Form.Item name="age" label="年龄">
              <Input placeholder="28" />
            </Form.Item>
            <Form.Item name="birthDate" label="出生年月">
              <Input placeholder="1995-03" />
            </Form.Item>
            <Form.Item name="employementStatus" label="状态">
              <Input placeholder="在职/离职/应届" />
            </Form.Item>
          </div>
        </Form>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">自定义字段</h3>
          <Button size="small" onClick={addCustomField}>添加字段</Button>
        </div>
        {customFields.length === 0 && (
          <p className="text-xs text-[hsl(var(--text-tertiary))]">
            暂无自定义字段。例如可添加&quot;个人网站&quot;、&quot;GitHub&quot;等。
          </p>
        )}
        {customFields.map(field => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              placeholder="标签 (如:个人网站)"
              value={field.label}
              onChange={e => updateCustomField(field.id, { label: e.target.value })}
              style={{ width: 180 }}
            />
            <Input
              placeholder="值 (如:https://example.com)"
              value={field.value}
              onChange={e => updateCustomField(field.id, { value: e.target.value })}
            />
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              onClick={() => removeCustomField(field.id)}
              aria-label="删除字段"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
