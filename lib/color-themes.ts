export interface ColorTheme {
  id: string
  name: string
  category: string
  colors: string[]
  gradients?: string[]
  // 新增文字颜色配置
  textColors?: {
    axis?: string        // 坐标轴文字颜色
    legend?: string      // 图例文字颜色
    tooltip?: string     // 提示框文字颜色
    title?: string       // 标题文字颜色
    label?: string       // 标签文字颜色
  }
}

export const colorThemes: ColorTheme[] = [
  // DA Series - Data Analytics Themes
  {
    id: "DA001",
    name: "经典蓝",
    category: "数据分析",
    colors: ["#00BFFF", "#1E90FF", "#4169E1", "#6495ED", "#87CEEB"],
    gradients: ["linear-gradient(135deg, #00BFFF 0%, #4169E1 100%)"],
    textColors: {
      axis: "#333333",
      legend: "#333333",
      tooltip: "#333333",
      title: "#333333",
      label: "#333333"
    }
  },
  {
    id: "DA002",
    name: "商务蓝",
    category: "数据分析",
    colors: ["#4169E1", "#6495ED", "#87CEEB", "#B0C4DE", "#E6F3FF"],
    gradients: ["linear-gradient(135deg, #4169E1 0%, #87CEEB 100%)"],
    textColors: {
      axis: "#2C3E50",
      legend: "#2C3E50",
      tooltip: "#2C3E50",
      title: "#2C3E50",
      label: "#2C3E50"
    }
  },
  {
    id: "DA003",
    name: "活力橙",
    category: "数据分析",
    colors: ["#FF4500", "#FF6347", "#FF7F50", "#FFA500", "#FFD700"],
    gradients: ["linear-gradient(135deg, #FF4500 0%, #FFA500 100%)"],
    textColors: {
      axis: "#8B4513",
      legend: "#8B4513",
      tooltip: "#8B4513",
      title: "#8B4513",
      label: "#8B4513"
    }
  },
  {
    id: "DA004",
    name: "自然绿",
    category: "数据分析",
    colors: ["#32CD32", "#00FF32", "#7FFF00", "#ADFF2F", "#98FB98"],
    gradients: ["linear-gradient(135deg, #32CD32 0%, #7FFF00 100%)"],
  },
  {
    id: "DA005",
    name: "优雅紫",
    category: "数据分析",
    colors: ["#9370DB", "#BA55D3", "#DA70D6", "#DDA0DD", "#E6E6FA"],
    gradients: ["linear-gradient(135deg, #9370DB 0%, #DA70D6 100%)"],
  },
  {
    id: "DA006",
    name: "现代灰",
    category: "数据分析",
    colors: ["#00FFFF", "#40E0D0", "#48D1CC", "#7FFFD4", "#AFEEEE"],
    gradients: ["linear-gradient(135deg, #00FFFF 0%, #48D1CC 100%)"],
  },
  {
    id: "DA007",
    name: "科技青",
    category: "数据分析",
    colors: ["#00CED1", "#00FFFF", "#40E0D0", "#7FFFD4", "#B0E0E6"],
    gradients: ["linear-gradient(135deg, #00CED1 0%, #40E0D0 100%)"],
  },
  {
    id: "DA008",
    name: "温暖红",
    category: "数据分析",
    colors: ["#FF1493", "#FF6347", "#FF4500", "#FF69B4", "#FFB6C1"],
    gradients: ["linear-gradient(135deg, #FF1493 0%, #FF6347 100%)"],
  },
  {
    id: "DA009",
    name: "深空蓝",
    category: "数据分析",
    colors: ["#191970", "#000080", "#0000CD", "#0000FF", "#4169E1"],
    gradients: ["linear-gradient(135deg, #191970 0%, #0000CD 100%)"],
  },
  {
    id: "DA010",
    name: "翡翠绿",
    category: "数据分析",
    colors: ["#228B22", "#32CD32", "#00FF00", "#7CFC00", "#ADFF2F"],
    gradients: ["linear-gradient(135deg, #228B22 0%, #32CD32 100%)"],
  },
  {
    id: "DA011",
    name: "玫瑰金",
    category: "数据分析",
    colors: ["#FFB6C1", "#FFC0CB", "#FF69B4", "#FF1493", "#DC143C"],
    gradients: ["linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)"],
  },
  {
    id: "DA012",
    name: "极光紫",
    category: "数据分析",
    colors: ["#8A2BE2", "#9370DB", "#BA55D3", "#DA70D6", "#DDA0DD"],
    gradients: ["linear-gradient(135deg, #8A2BE2 0%, #BA55D3 100%)"],
  },

  // BB Series - Business Branding Themes
  {
    id: "BB001",
    name: "清新薄荷",
    category: "商业品牌",
    colors: ["#00FA9A", "#00FF7F", "#7FFFD4", "#AFEEEE", "#E0FFFF"],
    gradients: ["linear-gradient(135deg, #00FA9A 0%, #7FFFD4 100%)"],
  },
  {
    id: "BB002",
    name: "深海蓝",
    category: "商业品牌",
    colors: ["#1E90FF", "#00BFFF", "#87CEEB", "#B0E0E6", "#E0F6FF"],
    gradients: ["linear-gradient(135deg, #1E90FF 0%, #87CEEB 100%)"],
  },
  {
    id: "BB003",
    name: "日落橙",
    category: "商业品牌",
    colors: ["#FF4500", "#FF6347", "#FFA500", "#FFD700", "#FFFF00"],
    gradients: ["linear-gradient(135deg, #FF4500 0%, #FFA500 100%)"],
  },
  {
    id: "BB004",
    name: "珊瑚粉",
    category: "商业品牌",
    colors: ["#FF7F50", "#FA8072", "#E9967A", "#F08080", "#CD5C5C"],
    gradients: ["linear-gradient(135deg, #FF7F50 0%, #FA8072 100%)"],
  },
  {
    id: "BB005",
    name: "森林绿",
    category: "商业品牌",
    colors: ["#228B22", "#32CD32", "#90EE90", "#98FB98", "#F0FFF0"],
    gradients: ["linear-gradient(135deg, #228B22 0%, #90EE90 100%)"],
  },
  {
    id: "BB006",
    name: "海洋蓝",
    category: "商业品牌",
    colors: ["#4682B4", "#5F9EA0", "#20B2AA", "#48D1CC", "#40E0D0"],
    gradients: ["linear-gradient(135deg, #4682B4 0%, #20B2AA 100%)"],
  },
  {
    id: "BB007",
    name: "香槟金",
    category: "商业品牌",
    colors: ["#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F", "#F4A460"],
    gradients: ["linear-gradient(135deg, #F5DEB3 0%, #DEB887 100%)"],
  },
]

export const getThemeById = (id: string): ColorTheme | undefined => {
  return colorThemes.find((theme) => theme.id === id)
}

export const getThemesByCategory = (category: string): ColorTheme[] => {
  return colorThemes.filter((theme) => theme.category === category)
}

export const applyThemeToChart = (theme: ColorTheme, chartType: string) => {
  const baseColors = (() => {
    switch (chartType) {
      case "bar":
      case "line":
      case "waterfall":
      case "histogram":
        return theme.colors.slice(0, 3) // Use first 3 colors for multi-series
      case "pie":
      case "funnel":
        return theme.colors // Use all colors for segments
      case "combo":
        return [theme.colors[0], theme.colors[2]] // Use contrasting colors
      default:
        return theme.colors.slice(0, 2)
    }
  })()

  return {
    colors: baseColors,
    gradients: theme.gradients,
    textColors: theme.textColors || {
      axis: "#333333",
      legend: "#333333", 
      tooltip: "#333333",
      title: "#333333",
      label: "#333333"
    }
  }
}
