#!/bin/bash
set -e

# ============================================
# 一键部署脚本 — 自由简历
# 用法: bash deploy.sh
# 前置条件: 安装 sshpass (brew install sshpass)
# 首次使用: 修改下方服务器配置
# ============================================

# --- 服务器配置 ---
SERVER_IP="82.156.105.87"
SERVER_USER="root"
SERVER_PASS="Sj13051570639"
SERVER_PATH="/www/wwwroot/resume.toolsetlink.com"

# --- 构建配置 ---
BUILD_DIR=".output/public"
LOG_FILE="deploy.log"

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
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 "$SERVER_USER@$SERVER_IP" "echo OK" > /dev/null 2>&1 || {
  log "错误: 无法连接 $SERVER_IP，请检查网络和配置"
  exit 1
}

# 3. 构建静态站点
log "构建项目..."
pnpm generate
log "构建完成"

# 4. 校验构建产物
if [ ! -d "$BUILD_DIR" ]; then
  log "错误: 构建产物目录 $BUILD_DIR 不存在"
  exit 1
fi

# 5. 确保服务器目标目录存在
log "准备服务器目录..."
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"

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
