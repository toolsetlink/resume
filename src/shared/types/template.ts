// 简历模板类型定义 - 自由简历项目

// 简历模板接口
export interface ResumeTemplate {
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
    itemGap: number
    contentPadding: number
  }
  basic: {
    layout?: 'left' | 'center' | 'right'
  }
}
