'use client'

import { DatePicker, Checkbox } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const FORMAT = 'YYYY.MM'
const PRESENT = '至今'

// 旧数据格式不统一，宽松解析：只要能识别出年月即可回填选择器。
const PARSE_FORMATS = [
  'YYYY.MM',
  'YYYY-MM',
  'YYYY/MM',
  'YYYY.MM.DD',
  'YYYY-MM-DD',
  'YYYY年MM月',
  'YYYY年M月',
  'YYYY.M',
  'YYYY-M',
  'YYYY',
]

function parseMonth(value?: string): Dayjs | null {
  const s = (value ?? '').trim()
  if (!s || s === PRESENT) return null
  const d = dayjs(s, PARSE_FORMATS, true)
  return d.isValid() ? d : null
}

// 把单字段 date（如 "2020.06 - 至今"）拆成起止两段，供工作/项目复用。
export function splitDateRange(value?: string): { start: string; end: string } {
  const s = (value ?? '').trim()
  if (!s) return { start: '', end: '' }
  // 优先处理「至今」整体标记，避免被拆成 "至" + "今" 两段。
  const presentMatch = s.match(/^(.*?)\s*[-–—~～至到]?\s*至今\s*$/i)
  if (presentMatch) {
    return { start: presentMatch[1].trim(), end: PRESENT }
  }
  // 然后按带空格的连接符 / 波浪线 / 中文分隔拆分，避免误伤 "2020-06" 里的短横。
  const parts = s.split(/\s+[-–—]\s+|\s*[~～至到]\s*|\s+to\s+/i)
  if (parts.length >= 2) {
    return { start: parts[0].trim(), end: parts.slice(1).join(' ').trim() }
  }
  // 兜底："2020-2023" 这类纯年份区间按裸短横拆。
  const bare = s.match(/^(\d{4})\s*-\s*(\d{4})$/)
  if (bare) return { start: bare[1], end: bare[2] }
  return { start: s, end: '' }
}

// 起止两段合并为单字段，始终输出规范格式。
export function joinDateRange(start: string, end: string): string {
  if (!start && !end) return ''
  if (start && end) return `${start} - ${end}`
  return start || end
}

interface MonthRangePickerProps {
  start: string
  end: string
  onChange: (next: { start: string; end: string }) => void
}

export function MonthRangePicker({ start, end, onChange }: MonthRangePickerProps) {
  const isPresent = end.trim() === PRESENT

  const handleStart = (d: Dayjs | null) => {
    onChange({ start: d ? d.format(FORMAT) : '', end })
  }

  const handleEnd = (d: Dayjs | null) => {
    onChange({ start, end: d ? d.format(FORMAT) : '' })
  }

  const handlePresent = (e: CheckboxChangeEvent) => {
    onChange({ start, end: e.target.checked ? PRESENT : '' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DatePicker
        picker="month"
        format={FORMAT}
        placeholder="开始年月"
        value={parseMonth(start)}
        onChange={handleStart}
        className="flex-1 min-w-[7.5rem]"
      />
      <span className="text-[hsl(var(--text-tertiary))] select-none">至</span>
      <DatePicker
        picker="month"
        format={FORMAT}
        placeholder="结束年月"
        value={parseMonth(end)}
        onChange={handleEnd}
        disabled={isPresent}
        className="flex-1 min-w-[7.5rem]"
      />
      <Checkbox checked={isPresent} onChange={handlePresent}>
        {PRESENT}
      </Checkbox>
    </div>
  )
}
