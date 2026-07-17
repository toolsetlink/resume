# 自由简历

隐私优先的在线简历编辑器。简历数据保存在浏览器本地，支持多套模板、实时预览和浏览器打印为 PDF。

## 技术栈

- Next.js 16、React 19、TypeScript
- Zustand、Ant Design、Tailwind CSS 4、TipTap
- Vitest、Playwright、pnpm

## 本地开发

```bash
pnpm install
pnpm dev
```

访问 <http://localhost:3000>。

## 检查与测试

```bash
pnpm check       # ESLint、TypeScript、单元测试
pnpm test:e2e    # Playwright E2E
pnpm build       # 生成静态站点到 out/
```

## 部署

项目使用 Next.js static export，可将 `out/` 部署到任意静态文件服务器。

仓库内的 `deploy.sh` 用于部署到 nginx：

```bash
cp .env.example .env
# 填写 .env 中的服务器配置
bash deploy.sh
```

## 目录

```text
src/app/          页面与路由
src/components/   首页、编辑器、预览和简历模板
src/stores/       Zustand 本地状态
src/shared/       类型和共享配置
tests/unit/       单元测试
tests/e2e/        浏览器测试
```
