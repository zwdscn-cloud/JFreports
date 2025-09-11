"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  TrendingUp,
  Activity,
  Layers,
  Database,
  GitBranch,
  Type,
  Heading,
  Table,
  ImageIcon,
  Video,
  Music,
  Radar,
  Thermometer,
  Box,
  Waves,
  Globe2,
  Gauge,
  Cloud,
} from "lucide-react"

interface DashboardSidebarProps {
  onChartSelect: (chartType: string) => void
  selectedChart: string | null
}

const chartCategories = [
  {
    title: "统计",
    icon: BarChart3,
    charts: [
      { id: "bar", name: "柱状图", icon: BarChart3 },
      { id: "line", name: "折线图", icon: LineChart },
      { id: "pie", name: "饼图", icon: PieChart },
      { id: "scatter", name: "散点图", icon: ScatterChart },
      { id: "funnel", name: "漏斗图", icon: TrendingUp },

      { id: "radar", name: "雷达图", icon: Radar },
              { id: "area", name: "面积图", icon: Activity },

        { id: "histogram", name: "直方图", icon: BarChart3 },
    
      { id: "waterfall", name: "瀑布图", icon: Waves },
    ],
  },
  {
    title: "时序",
    icon: TrendingUp,
    charts: [
      { id: "timeline", name: "时序图", icon: TrendingUp },
      
    ],
  },
  {
    title: "关系",
    icon: Layers,
    charts: [
      { id: "network", name: "关系图", icon: Layers },
      { id: "tree", name: "树图", icon: GitBranch },
      { id: "sankey", name: "桑基图", icon: Layers },
    ],
  },
  {
    title: "地图与专题",
    icon: Globe2,
    charts: [
      // { id: "geomap", name: "地理地图", icon: Globe2 },
      // { id: "heatmap", name: "热力图", icon: Thermometer },
      { id: "gauge", name: "仪表盘", icon: Gauge },
      { id: "wordcloud", name: "词云图", icon: Cloud },
    ],
  },
  {
    title: "文本",
    icon: Type,
    charts: [
      { id: "text", name: "文字组件", icon: Type },
      { id: "title", name: "标题组件", icon: Heading },
    ],
  },

  {
    title: "多媒体",
    icon: ImageIcon,
    charts: [
      { id: "image", name: "图片组件", icon: ImageIcon },
      { id: "video", name: "视频组件", icon: Video },
      { id: "audio", name: "音频组件", icon: Music },
      { id: "3d-model", name: "3D模型", icon: Box },

    ],
  },
]

export function DashboardSidebar({ onChartSelect, selectedChart }: DashboardSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => ["统计"])

  const handleDragStart = (e: React.DragEvent, chartId: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "chart", chartId }))
    e.dataTransfer.effectAllowed = "copy"
  }

  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryTitle) ? prev.filter((cat) => cat !== categoryTitle) : [...prev, categoryTitle],
    )
  }

  return (
    <div className="w-32 bg-card border-r border-border flex flex-col">
      {/* Sidebar Header */}
      <div className="p-2 border-b border-border">
        <h2 className="font-semibold text-xs">组件库</h2>
      </div>

      {/* Category Tabs */}
      <ScrollArea className="flex-1">
        <div className="p-1">
          {chartCategories.map((category) => (
            <div key={category.title} className="mb-2">
              {/* Category Header */}
              <Button
                variant="ghost"
                className="w-full justify-start p-1 h-auto font-medium text-xs"
                onClick={() => toggleCategory(category.title)}
              >
                <category.icon className="w-3 h-3 mr-1" />
                {category.title}
                <div
                  className={`ml-auto transition-transform ${
                    expandedCategories.includes(category.title) ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </div>
              </Button>

              {/* Category Charts */}
              {expandedCategories.includes(category.title) && (
                <div className="ml-1 mt-1">
                  {category.charts.map((chart) => (
                    <Button
                      key={chart.id}
                      variant={selectedChart === chart.id ? "secondary" : "ghost"}
                      className="w-full justify-start mb-1 h-auto p-1 cursor-grab active:cursor-grabbing"
                      onClick={() => onChartSelect(chart.id)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, chart.id)}
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
                          <chart.icon className="w-3 h-3" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-xs truncate">{chart.name}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Database className="w-3 h-3" />
          <span className="truncate">已连接</span>
        </div>
      </div>
    </div>
  )
}
