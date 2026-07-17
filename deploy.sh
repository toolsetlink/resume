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

BUILD_DIR="out"

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
log "构建静态站点..."
pnpm build
log "构建完成"

# 4. 校验构建产物
if [ ! -d "$BUILD_DIR" ]; then
  log "错误: 构建产物目录 $BUILD_DIR 不存在"
  exit 1
fi

# 5. 确保服务器目标目录存在
log "准备服务器目录..."
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"

# 6. 为静态路由补齐 index.html，让 nginx 尾斜杠路径正常返回
log "补齐静态路由 index.html（解决 nginx directory index 403）"
find "$BUILD_DIR" -name '*.html' -type f \
  ! -name 'index.html' ! -name '404.html' ! -name '_not-found.html' \
  -print0 | while IFS= read -r -d "" html; do
  relative_path="${html#$BUILD_DIR/}"
  route_path="${relative_path%.html}"
  mkdir -p "$BUILD_DIR/$route_path"
  cp "$html" "$BUILD_DIR/$route_path/index.html"
done

# 7. Rsync 增量同步到服务器
log "同步文件到服务器 ${SERVER_IP}..."
sshpass -p "$SERVER_PASS" rsync -avz --delete --checksum \
  --exclude='.DS_Store' \
  "$BUILD_DIR/" \
  "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

# 8. 完成
FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l | tr -d ' ')
log "部署完成！共同步 ${FILE_COUNT} 个文件"
log "站点: https://resume.toolsetlink.com"
