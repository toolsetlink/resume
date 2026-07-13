<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Sandbox / restricted-environment gotchas

这些是 Codex desktop 沙箱（`sandbox_mode: workspace-write`）里实际遇到过的踩坑，仅供同环境参考。

### `next build`（Turbopack）

在禁止子进程 bind port 的沙箱里默认 Turbopack 构建会因 `binding to a port / Operation not permitted` 失败：

```
TurbopackInternalError: binding to a port
Caused by: creating new process / binding to a port / Operation not permitted (os error 1)
```

降级方案（仅用于本机或受限 CI，本地/CI/Vercel 部署仍走默认 Turbopack）：

```bash
pnpm exec next build --webpack
```

### `next dev` + Playwright

沙箱禁止任何进程 bind `0.0.0.0:3000`，dev server 直接 `EPERM: operation not permitted`。Playwright 的 `webServer.command` 也会因此启不起来，**这类 E2E 必须在沙箱外跑**（Vercel preview、本机、或 unset 沙箱）。

如果 sandbox 必须跑 e2e，可改 `playwright.config.ts` 的 `webServer.url` 指向外部已部署的 preview URL，但失去本机快速回路。

### TipTap v3 vs v2

仓库代码已迁 TipTap v3。下游编辑器扩展（如再写新 Panel）必须用 v3 API：

- **不要**单独导入 `Underline`、`Link` 这类扩展 — StarterKit 已内置
- `useEditor` 必须设 `immediatelyRender: true`（v3 默认 false，SSR 同步渲染需要 true）
- `useEditor` 自动管理 `editor.destroy()`，**不要**写手动 `useEffect(() => () => editor?.destroy(), [])` cleanup

## E2E 测试

`tests/e2e/*.spec.ts` 选择器按 Ant Design 6 的 DOM 编写（典型锚点：`.ant-form-item`、`.ant-modal`、`.ant-input`）。选择器随 UI 库升级更新，跑 Playwright 前先确认选择器与当前组件版本对齐。
