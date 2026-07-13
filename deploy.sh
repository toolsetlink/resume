#!/bin/bash
set -e

# 日志文件（早期定义，让 .env 缺失错误也能落盘）
LOG_FILE="${LOG_FILE:-deploy.log}"

# ============================================
# 一键部署脚本 — 自由简历
# 用法: bash deploy.sh
# 前置条件: 安装 sshpass (brew install sshpass)
# 配置:
#   - 复制 .env.example → .env，填好 SERVER_* 值
#   - .env 已 .gitignore，不会入 git
#   - 注意：原版硬编码的 SERVER_PASS 在老 commit 历史里，建议同时改真实服务器密码
# ============================================

# 加载 .env（存在则 source，不存在报错并提示复制 .env.example）
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
else
  echo "[$(date '+%H:%M:%S')] 错误: 缺少 .env — 复制 .env.example → .env 并填值" | tee -a "$LOG_FILE"
  exit 1
fi

# --- 服务器配置（必填项） ---
: "${SERVER_IP:?SERVER_IP 未设置}"
: "${SERVER_USER:?SERVER_USER 未设置}"
: "${SERVER_PASS:?SERVER_PASS 未设置}"
: "${SERVER_PATH:?SERVER_PATH 未设置}"

# --- 构建配置（按 NEXT_DEPLOY_MODE 切换输出目录） ---
# - server: Next.js 默认 next build，server bundle 到 .next/（需 Node 进程跑 next start）
# - export: next.config.ts 设 output: 'export'，静态产物到 out/（纯静态，可直接 nginx 跑）
NEXT_DEPLOY_MODE="${NEXT_DEPLOY_MODE:-server}"
case "$NEXT_DEPLOY_MODE" in
  server)  BUILD_DIR=".next"          ; BUILD_CMD="pnpm build" ;;
  export)  BUILD_DIR="out"            ; BUILD_CMD="pnpm build" ;;
  *)       echo "[$(date '+%H:%M:%S')] 错误: NEXT_DEPLOY_MODE=$NEXT_DEPLOY_MODE 不支持（只支持 server / export）"; exit 1 ;;
esac

log() {
  local msg="[$(date '+%H:%M:%S')] $1"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

# 1. 检查依赖
if ! command -v sshpass &>/dev/null; then
  log "错误: 请先安装 sshpass → brew install sshpass"
  exit 1
fi
if ! command -v rsync &>/dev/null; then
  log "错误: 未安装 rsync"
  exit 1
fi

# 2. 首次连接自动信任主机指纹
log "检查服务器连通性..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 "$SERVER_USER@$SERVER_IP" "echo OK" > /dev/null 2>&1 || {
  log "错误: 无法连接 $SERVER_IP，请检查网络和配置"
  exit 1
}

# 3. 构建
log "构建项目 (mode=$NEXT_DEPLOY_MODE, cmd=$BUILD_CMD)..."
$BUILD_CMD
log "构建完成"

# 4. 校验构建产物
if [ ! -d "$BUILD_DIR" ]; then
  log "错误: 构建产物目录 $BUILD_DIR 不存在（确认 NEXT_DEPLOY_MODE 与 next.config.ts 一致）"
  exit 1
fi

# 5. 确保服务器目标目录存在
log "准备服务器目录..."
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"

# 6a. 修补 static export 缺省路径：把每个 <locale>/<page>.html 复制成 <locale>/<page>/index.html，
#     让 nginx 在访问 /zh/dashboard/ 这类尾斜杠路径时能正确 serve 而不是返回 directory index 403。
# next-intl + next build (output: 'export') 不会自动产出这些副本，但 nginx 默认会重定向到带斜杠。
log "补 locale index.html（解决 nginx directory index 403）"
# (a) 顶层 <locale>.html → <locale>/index.html（例如 en.html → en/index.html）
for html in "$BUILD_DIR"/*.html; do
  [ -f "$html" ] || continue
  base="$(basename "$html" .html)"
  # 只对 zh/en 这种 locale 短名生效（避免污染其他页面）
  case "$base" in zh|en) ;; *) continue ;; esac
  mkdir -p "$BUILD_DIR/$base"
  cp "$html" "$BUILD_DIR/$base/index.html"
done
# (b) <locale>/<name>.html → <locale>/<name>/index.html
for locale_dir in "$BUILD_DIR"/zh "$BUILD_DIR"/en; do
  [ -d "$locale_dir" ] || continue
  find "$locale_dir" -maxdepth 1 -name '*.html' -type f -print0 | while IFS= read -r -d "" f; do
    base="$(basename "$f" .html)"
    mkdir -p "$locale_dir/$base"
    cp "$f" "$locale_dir/$base/index.html"
  done
done

# 6. Rsync 增量同步到服务器
log "同步文件到服务器 ${SERVER_IP}..."
sshpass -p "$SERVER_PASS" rsync -avz --delete --checksum \
  --exclude='.DS_Store' \
  "$BUILD_DIR/" \
  "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

# 7. 完成
FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l | tr -d ' ')
log "部署完成！共同步 ${FILE_COUNT} 个文件"
log "站点: https://resume.toolsetlink.com"
