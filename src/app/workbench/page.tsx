// 静态导出 (output: 'export') 不允许动态路由段。
// 改用单一静态页 /workbench，resume id 通过 ?id= 查询参数传入。
// 客户端组件再用 useSearchParams() 拿。
import WorkbenchClient from './WorkbenchClient'

export const dynamic = 'force-static'

export default function WorkbenchPage() {
  return <WorkbenchClient />
}
