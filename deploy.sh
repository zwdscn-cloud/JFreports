#!/bin/bash

# 静态部署脚本
# 使用方法: ./deploy.sh [platform]
# 支持的平台: github, netlify, vercel, nginx

set -e

PLATFORM=${1:-"local"}
BUILD_DIR="dist"

echo "🚀 开始部署到 $PLATFORM..."

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .next
rm -rf $BUILD_DIR

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo "🔨 构建项目..."
pnpm run build

# 检查构建结果
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ 构建失败，未找到 $BUILD_DIR 目录"
    exit 1
fi

echo "✅ 构建完成！"

# 根据平台执行不同的部署逻辑
case $PLATFORM in
    "github")
        echo "📤 部署到 GitHub Pages..."
        # 这里需要配置 GitHub Pages 的部署逻辑
        echo "请手动将 $BUILD_DIR 目录内容推送到 gh-pages 分支"
        ;;
    "netlify")
        echo "📤 部署到 Netlify..."
        # 这里可以添加 Netlify CLI 的部署命令
        echo "请使用 Netlify CLI 或拖拽 $BUILD_DIR 目录到 Netlify"
        ;;
    "vercel")
        echo "📤 部署到 Vercel..."
        # 这里可以添加 Vercel CLI 的部署命令
        echo "请使用 Vercel CLI 部署"
        ;;
    "nginx")
        echo "📤 部署到 Nginx 服务器..."
        read -p "请输入服务器地址: " SERVER
        read -p "请输入部署路径 (默认: /var/www/html): " DEPLOY_PATH
        DEPLOY_PATH=${DEPLOY_PATH:-"/var/www/html"}
        
        echo "正在上传文件到 $SERVER:$DEPLOY_PATH..."
        rsync -avz --delete $BUILD_DIR/ $SERVER:$DEPLOY_PATH/
        echo "✅ 部署完成！"
        ;;
    "local")
        echo "📁 本地部署完成！"
        echo "静态文件位置: $(pwd)/$BUILD_DIR"
        echo "可以使用以下命令启动本地服务器:"
        echo "cd $BUILD_DIR && python -m http.server 8000"
        echo "或使用 npx serve $BUILD_DIR"
        ;;
    *)
        echo "❌ 不支持的平台: $PLATFORM"
        echo "支持的平台: github, netlify, vercel, nginx, local"
        exit 1
        ;;
esac

echo "🎉 部署完成！"
