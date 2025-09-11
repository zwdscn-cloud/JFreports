# JFReport BI Dashboard

一个功能强大的可视化仪表板构建工具，基于 Next.js 15 + TypeScript + Tailwind CSS 构建，提供丰富的图表组件和专业的可视化功能。

## ✨ 核心特性

### 🎨 丰富的图表支持
- **统计图表**: 柱状图、折线图、饼图、散点图、漏斗图、雷达图、面积图、直方图、瀑布图
- **时序图表**: 时序图
- **关系图表**: 关系图、树图、桑基图
- **专题图表**: 仪表盘、词云图
- **多媒体组件**: 图片、视频、音频、3D模型
- **文本组件**: 文字组件、标题组件

### 🎯 专业功能
- **拖拽式构建**: 直观的拖拽操作，轻松创建仪表板
- **智能对齐**: 磁吸对齐、网格对齐、等距分布
- **多主题系统**: 内置20+专业配色主题
- **响应式设计**: 支持多种分辨率预设
- **数据绑定**: 实时数据编辑和预览
- **撤销重做**: 完整的操作历史记录
- **导入导出**: JSON格式的项目保存和加载

### 🛠️ 技术栈
- **前端框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Geist UI
- **图表库**: ECharts + Recharts
- **UI组件**: Radix UI + Shadcn/ui
- **3D渲染**: Three.js
- **代码编辑器**: Monaco Editor

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- pnpm 8+ (推荐) 或 npm/yarn

### 安装依赖
```bash
pnpm install
# 或
npm install
# 或
yarn install
```

### 开发模式
```bash
pnpm dev
# 或
npm run dev
# 或
yarn dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
pnpm build
# 或
npm run build
# 或
yarn build
```

### 静态导出
```bash
pnpm build:static
# 或
npm run build:static
# 或
yarn build:static
```

## 📁 项目结构

```
bi-dashboard0/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页
│   └── api/               # API路由
├── components/            # React组件
│   ├── charts/            # 图表组件
│   ├── chart-data-editors/ # 数据编辑器
│   ├── ui/                # UI基础组件
│   └── *.tsx             # 主要功能组件
├── lib/                   # 工具函数和配置
│   ├── utils.ts          # 通用工具函数
│   ├── color-themes.ts   # 颜色主题配置
│   ├── chart-colors.ts   # 图表颜色管理
│   ├── data-manager.ts   # 数据管理器
│   └── snap-utils.ts     # 对齐工具
├── public/               # 静态资源
└── styles/              # 样式文件
```

## 🎮 使用指南

### 1. 创建图表
1. 从左侧组件库选择图表类型
2. 拖拽到画布中放置
3. 在右侧属性面板配置数据和样式

### 2. 编辑数据
- 双击图表进入数据编辑模式
- 支持JSON、表格等多种数据格式
- 实时预览数据变化

### 3. 样式定制
- 选择内置颜色主题或自定义配色
- 调整图表透明度、图例、网格等属性
- 设置动画效果和交互行为

### 4. 布局管理
- 使用智能对齐工具精确定位
- 多选元素进行批量操作
- 支持元素锁定和层级管理

### 5. 项目保存
- 导出为JSON文件保存项目
- 支持导入已有项目继续编辑
- 一键清空画布重新开始

## 🎨 主题系统

项目内置两个系列的主题：

### 数据分析主题 (DA系列)
- DA001 经典蓝 - 专业的商务蓝色调
- DA002 商务蓝 - 稳重的企业风格
- DA003 活力橙 - 鲜明的橙色系
- ... 共12个数据分析专用主题

### 商业品牌主题 (BB系列)
- BB001 清新薄荷 - 清新的绿色调
- BB002 深海蓝 - 深沉的海洋蓝色
- BB003 日落橙 - 温暖的日落色调
- ... 共7个品牌专用主题

## ⚙️ 配置选项

### 画布设置
- 分辨率: 支持多种预设分辨率 (FHD, 2K, 4K, 超宽屏等)
- 背景色: 自定义画布背景颜色
- 网格: 显示/隐藏网格辅助线
- 边距: 设置安全边距参考线

### 编辑器设置
- 缩放控制: 25%-200%缩放范围
- 视图模式: 编辑模式和预览模式切换
- 暗色主题: 支持明暗主题切换

## 🔧 开发扩展

### 添加新图表类型
1. 在 `components/charts/` 创建新图表组件
2. 在 `components/chart-data-editors/` 添加数据编辑器
3. 在 `lib/chart-colors.ts` 配置默认颜色
4. 在 `components/dashboard-sidebar.tsx` 注册到组件库

### 自定义主题
编辑 `lib/color-themes.ts` 文件添加新主题：
```typescript
{
  id: "CUSTOM001",
  name: "自定义主题",
  category: "自定义",
  colors: ["#color1", "#color2", "#color3"],
  gradients: ["linear-gradient(...)"],
  textColors: {
    axis: "#333",
    legend: "#333",
    // ...
  }
}
```

## 📊 技术特性

### 性能优化
- 虚拟滚动和懒加载
- 防抖操作处理
- 内存泄漏防护
- 响应式设计优化

### 代码质量
- TypeScript 严格模式
- 组件化架构
- 可维护的代码结构
- 完整的错误边界处理

### 用户体验
- 键盘快捷键支持 (Ctrl+Z/Y)
- 拖拽交互优化
- 实时预览反馈
- 直观的操作指引

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 🚢 部署指南

### 静态部署（推荐）
项目支持多种部署方式，推荐使用静态部署：

#### 1. 本地构建和测试
```bash
# 构建静态文件
pnpm build:static

# 在本地测试静态文件
cd dist && npx serve
# 或使用Python
cd dist && python -m http.server 8000
```

#### 2. 使用部署脚本
项目提供了便捷的部署脚本：

**Windows系统:**
```bash
deploy.bat [platform]
```

**Linux/Mac系统:**
```bash
chmod +x deploy.sh
./deploy.sh [platform]
```

支持的平台参数：
- `local` - 本地部署（默认）
- `github` - GitHub Pages
- `netlify` - Netlify
- `vercel` - Vercel
- `nginx` - Nginx服务器

#### 3. 各平台详细部署说明

**GitHub Pages:**
```bash
# 构建静态文件
pnpm build:static

# 将dist目录内容推送到gh-pages分支
# 或使用GitHub Actions自动部署
```

**Netlify:**
1. 将代码推送到GitHub/GitLab
2. 在Netlify中连接代码仓库
3. 构建命令: `pnpm build:static`
4. 发布目录: `dist`
5. 部署即可

**Vercel:**
```bash
# 安装Vercel CLI
pnpm i -g vercel

# 部署
vercel --prod
```

**Nginx服务器:**
1. 构建静态文件: `pnpm build:static`
2. 将`dist`目录上传到服务器
3. 配置Nginx指向该目录

### 服务器部署（Node.js）
如果需要服务器端渲染：
```bash
# 构建
pnpm build

# 启动生产服务器
pnpm start
```

### 环境变量配置
创建 `.env.local` 文件配置环境变量：
```env
# 基本配置
NEXT_PUBLIC_APP_NAME=JFReport
NEXT_PUBLIC_APP_VERSION=0.1.0

# API配置（如果需要）
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Docker部署
创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

构建和运行：
```bash
docker build -t jfreport-dashboard .
docker run -p 3000:3000 jfreport-dashboard
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 技术支持

如果您遇到部署问题：
1. 确保Node.js版本 ≥ 18
2. 检查控制台错误信息
3. 确认网络连接正常（用于依赖安装）
4. 查看各平台的部署文档
5. 在GitHub Issues中搜索相关问题

---

**JFReport BI Dashboard** - 让数据可视化变得简单而专业！ 📈✨
