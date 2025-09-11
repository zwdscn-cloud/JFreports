// 统一的图表颜色主题
export const CHART_COLORS = {
  // 主要颜色方案 - 与整体页面风格一致
  primary: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
  
  // 备用颜色方案
  secondary: ["#06b6d4", "#84cc16", "#f97316", "#ec4899", "#a855f7"],
  
  // 灰度方案
  grayscale: ["#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6"],
  
  // 暖色方案
  warm: ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16"],
  
  // 冷色方案
  cool: ["#3b82f6", "#06b6d4", "#8b5cf6", "#a855f7", "#ec4899"],
}

// 默认颜色方案
export const DEFAULT_CHART_COLORS = CHART_COLORS.primary

// 根据图表类型获取颜色
export const getChartColors = (chartType: string, customColors?: string[]) => {
  if (customColors && customColors.length > 0) {
    return customColors
  }
  
  switch (chartType) {
    case "bar":
    case "line":
    case "area":
    case "pie":
    case "funnel":
    case "radar":
    case "scatter":
    case "histogram":
    case "boxplot":
    case "waterfall":
    case "timeline":
    case "combo":
    default:
      return DEFAULT_CHART_COLORS
  }
}

// 获取单个颜色
export const getChartColor = (index: number, customColors?: string[]) => {
  const colors = customColors || DEFAULT_CHART_COLORS
  return colors[index % colors.length]
}
