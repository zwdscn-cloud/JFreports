@echo off
setlocal enabledelayedexpansion

REM 静态部署脚本 (Windows版本)
REM 使用方法: deploy.bat [platform]
REM 支持的平台: github, netlify, vercel, nginx, local

set PLATFORM=%1
if "%PLATFORM%"=="" set PLATFORM=local
set BUILD_DIR=dist

echo 🚀 开始部署到 %PLATFORM%...

REM 清理之前的构建
echo 🧹 清理之前的构建...
if exist .next rmdir /s /q .next
if exist %BUILD_DIR% rmdir /s /q %BUILD_DIR%

REM 安装依赖
echo 📦 安装依赖...
pnpm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    exit /b 1
)

REM 构建项目
echo 🔨 构建项目...
pnpm run build
if errorlevel 1 (
    echo ❌ 构建失败
    exit /b 1
)

REM 检查构建结果
if not exist "%BUILD_DIR%" (
    echo ❌ 构建失败，未找到 %BUILD_DIR% 目录
    exit /b 1
)

echo ✅ 构建完成！

REM 根据平台执行不同的部署逻辑
if "%PLATFORM%"=="github" (
    echo 📤 部署到 GitHub Pages...
    echo 请手动将 %BUILD_DIR% 目录内容推送到 gh-pages 分支
) else if "%PLATFORM%"=="netlify" (
    echo 📤 部署到 Netlify...
    echo 请使用 Netlify CLI 或拖拽 %BUILD_DIR% 目录到 Netlify
) else if "%PLATFORM%"=="vercel" (
    echo 📤 部署到 Vercel...
    echo 请使用 Vercel CLI 部署
) else if "%PLATFORM%"=="nginx" (
    echo 📤 部署到 Nginx 服务器...
    set /p SERVER="请输入服务器地址: "
    set /p DEPLOY_PATH="请输入部署路径 (默认: /var/www/html): "
    if "%DEPLOY_PATH%"=="" set DEPLOY_PATH=/var/www/html
    echo 正在上传文件到 %SERVER%:%DEPLOY_PATH%...
    REM 这里需要安装 rsync 或使用其他工具
    echo 请手动上传 %BUILD_DIR% 目录到服务器
) else if "%PLATFORM%"=="local" (
    echo 📁 本地部署完成！
    echo 静态文件位置: %CD%\%BUILD_DIR%
    echo 可以使用以下命令启动本地服务器:
    echo cd %BUILD_DIR% ^&^& python -m http.server 8000
    echo 或使用 npx serve %BUILD_DIR%
) else (
    echo ❌ 不支持的平台: %PLATFORM%
    echo 支持的平台: github, netlify, vercel, nginx, local
    exit /b 1
)

echo 🎉 部署完成！
pause
