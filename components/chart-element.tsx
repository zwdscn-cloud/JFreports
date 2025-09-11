"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { calculateSnapPosition, calculateEvenDistribution, shouldShowDistribution, type SnapGuide } from "@/lib/snap-utils"
import { dataManager } from "@/lib/data-manager"
import { useThrottle } from "@/hooks/use-throttle"
import { getThemeById, applyThemeToChart } from "@/lib/color-themes"
import { BarChart } from "@/components/charts/bar-chart"
import { LineChart } from "@/components/charts/line-chart"
import { FunnelChart } from "@/components/charts/funnel-chart"

import { ScatterChart } from "@/components/charts/scatter-chart"
import { AreaChart } from "@/components/charts/area-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { RadarChart } from "@/components/charts/radar-chart"
import { HeatmapChart } from "@/components/charts/heatmap-chart"
import { HistogramChart } from "@/components/charts/histogram-chart"

import { SankeyChart } from "@/components/charts/sankey-chart"
import { GeoMap } from "@/components/charts/geo-map"

import { WordCloudChart } from "@/components/charts/wordcloud-chart"
import { WaterfallChart } from "@/components/charts/waterfall-chart"
import { TimelineChart } from "@/components/charts/timeline-chart"
import { NetworkChart } from "@/components/charts/network-chart"
import { TreeChart } from "@/components/charts/tree-chart"
import { GaugeChart } from "@/components/charts/gauge-chart"
import { TitleComponent } from "@/components/charts/title-component"
import { TextComponent } from "@/components/charts/text-component"

import { ImageComponent } from "@/components/charts/image-component"
import { VideoComponent } from "@/components/charts/video-component"
import { AudioComponent } from "@/components/charts/audio-component"
import { ThreeDModelComponent } from "@/components/charts"


import { Button } from "@/components/ui/button"
import { Copy, Trash2, Edit, MoreHorizontal, ArrowUpIcon, ArrowDownIcon, MoveUpIcon, MoveDownIcon, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CanvasElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  title?: string
  opacity?: number
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  animation?: boolean
  themeId?: string
  content?: string
  level?: number
  zIndex?: number // 新增：层级索引
  data?: any
  tableData?: {
    headers: string[]
    rows: string[][]
  }
  textColor?: string
  backgroundColor?: string
  imageUrl?: string
  videoUrl?: string
  audioUrl?: string
  alt?: string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  transparent?: boolean // 改为可选属性，默认为 true
  isPreviewing?: boolean // 新增：预览状态
  fontSize?: number
  fontWeight?: string
  textAlign?: string
  positionLocked?: boolean
  // 添加字体相关属性
  titleFontSize?: number
  axisFontSize?: number
  legendFontSize?: number
  tooltipFontSize?: number
  chartFontSize?: number
  titleTextColor?: string
  axisTextColor?: string
  legendTextColor?: string
  tooltipTextColor?: string
  chartTextColor?: string
}

interface ChartElementProps {
  element: CanvasElement
  isSelected: boolean
  isMultiSelected: boolean
  onSelect: (id: string, event?: React.MouseEvent, moveInfo?: { sourceId: string; deltaX: number; deltaY: number; finalX: number; finalY: number }) => void
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void
  onDelete: (id: string) => void
  onCopy: (id: string) => void
  onElementReorder: (elementId: string, newIndex: number) => void
  canvasElements: CanvasElement[]
  zoom?: number
  isViewMode?: boolean
}

export function ChartElement({
  element,
  isSelected,
  isMultiSelected = false,
  onSelect,
  onUpdate,
  onDelete,
  onCopy,
  onElementReorder,
  canvasElements,
  zoom = 100,
  isViewMode = false,
}: ChartElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>("")
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [hoveredHandle, setHoveredHandle] = useState<string>("")
  const [positionLocked, setPositionLocked] = useState(element.positionLocked || false)
  const [chartData, setChartData] = useState<any>([])
  const elementRef = useRef<HTMLDivElement>(null)
  const dragAnimationRef = useRef<number | null>(null)

  // 节流更新函数，减少状态更新频率
  const throttledUpdate = useThrottle(
    useCallback((id: string, updates: Partial<CanvasElement>) => {
      // 添加额外的检查，避免不必要的更新
      if (Object.keys(updates).length === 0) return
      onUpdate(id, updates)
    }, [onUpdate]),
    32 // 降低到约30fps，减少更新频率，提高性能
  )

  // 数据监听和同步逻辑
  useEffect(() => {
    // 优先使用 element.data
    if (element.data) {
      // 检查是否是关系图、树状图或桑基图数据（对象格式）或普通图表数据（数组格式）
      const isComplexData = (element.type === 'network' || element.type === 'tree' || element.type === 'sankey') && 
                           typeof element.data === 'object' && 
                           !Array.isArray(element.data) &&
                           (element.data as any).nodes && 
                           (element.data as any).links
      
      if (isComplexData || (Array.isArray(element.data) && element.data.length > 0)) {
        console.log("[JF] 使用 element.data:", element.id, element.data)
        setChartData(element.data)
        // 同步到数据管理器
        dataManager.bindChartToData(element.id, element.data)
      }
    } else {
      // 如果 element.data 为空，尝试从数据管理器获取
      const managerData = dataManager.getChartData(element.id)
      if (managerData) {
        // 检查是否是关系图、树状图或桑基图数据
        const isComplexData = (element.type === 'network' || element.type === 'tree' || element.type === 'sankey') && 
                             typeof managerData === 'object' && 
                             !Array.isArray(managerData) &&
                             (managerData as any).nodes && 
                             (managerData as any).links
        
        if (isComplexData || (Array.isArray(managerData) && managerData.length > 0)) {
          console.log("[JF] 从数据管理器获取数据:", element.id, managerData)
          setChartData(managerData)
        }
      }
    }
  }, [element.id, element.data, element.type])

  // 实时监听数据管理器变化
  useEffect(() => {
    const intervalId = setInterval(() => {
      const managerData = dataManager.getChartData(element.id)
      if (managerData && JSON.stringify(managerData) !== JSON.stringify(chartData)) {
        // 使用JSON比较，确保数据变化能被检测到
        console.log("[JF] 数据管理器数据变化:", element.id, "新数据:", managerData)
        setChartData(managerData)
      }
    }, 100) // 改为100ms检查一次，提高响应速度

    return () => clearInterval(intervalId)
  }, [element.id, chartData]) // 重新添加chartData依赖，确保数据变化能被检测

  // 监听 ESC 键退出预览模式
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && element?.isPreviewing) {
        onUpdate(element.id, { isPreviewing: false })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [element?.id, element?.isPreviewing, onUpdate])

  useEffect(() => {
    // 同步位置锁定状态
    if (element.positionLocked !== positionLocked) {
      setPositionLocked(element.positionLocked || false)
    }
  }, [element.positionLocked, positionLocked])

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("[JF] handleMouseDown 被调用，按钮:", e.button, "元素ID:", element?.id, "锁定状态:", positionLocked)
    // 只处理左键点击，右键点击由 handleContextMenu 处理
    if (e.button !== 0) {
      console.log("[JF] 非左键点击，忽略")
      return
    }
    
    // 在预览模式或查看模式下禁止所有操作
    if (isViewMode || element?.isPreviewing || !element?.id) return
    
    // 允许选中元素，但位置锁定时禁止拖动
    onSelect(element.id, e)
    
    // 如果位置被锁定，只选中但不开始拖动
    if (positionLocked) {
      // 不调用 preventDefault 和 stopPropagation，让右键事件能够正常触发
      return
    }
    
    e.preventDefault()
    e.stopPropagation() // Prevent canvas click from clearing selection

    setIsDragging(true)
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    })
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    console.log("[JF] handleContextMenu 被调用，按钮:", e.button, "元素ID:", element?.id, "锁定状态:", positionLocked)
    if (isViewMode || !element?.id) {
      console.log("[JF] 右键菜单被阻止：isViewMode:", isViewMode, "!element?.id:", !element?.id)
      return
    }
    console.log("[JF] 右键菜单触发:", element.id, "锁定状态:", positionLocked)
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    // 在预览模式、查看模式或位置锁定时禁止调整大小
    if (isViewMode || element?.isPreviewing || positionLocked || !element?.id) return
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    })
  }

  const handleHandleMouseEnter = (direction: string) => {
    setHoveredHandle(direction)
  }

  const handleHandleMouseLeave = () => {
    setHoveredHandle("")
  }

  useEffect(() => {
    let lastAnimationTime = 0
    const animationFrameRate = 1000 / 60 // 60fps

    const handleMouseMove = (e: MouseEvent) => {
      if ((!isDragging && !isResizing) || isViewMode || element?.isPreviewing || positionLocked || !element?.id) return

      const currentTime = performance.now()
      
      // 限制动画帧率，避免过度渲染
      if (currentTime - lastAnimationTime < animationFrameRate) {
        return
      }
      lastAnimationTime = currentTime

      if (isDragging) {
        // 取消之前的动画帧
        if (dragAnimationRef.current) {
          cancelAnimationFrame(dragAnimationRef.current)
        }
        
        // 使用 requestAnimationFrame 来确保丝滑的动画
        dragAnimationRef.current = requestAnimationFrame(() => {
          const newX = e.clientX - dragStart.x
          const newY = e.clientY - dragStart.y

          // 如果是多选状态，通知父组件移动所有选中的元素
          if (isMultiSelected) {
            const deltaX = newX - element.x
            const deltaY = newY - element.y
            const moveInfo = {
              sourceId: element.id,
              deltaX,
              deltaY,
              finalX: Math.max(0, newX),
              finalY: Math.max(0, newY)
            }
            onSelect(element.id, undefined, moveInfo)
          } else {
            // 单个元素移动 - 使用节流减少状态更新频率
            throttledUpdate(element.id, { x: Math.max(0, newX), y: Math.max(0, newY) })
          }
        })
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        let newWidth = resizeStart.width
        let newHeight = resizeStart.height
        let newX = element.x
        let newY = element.y

        switch (resizeDirection) {
          case "se": // Southeast
            newWidth = Math.max(100, resizeStart.width + deltaX)
            newHeight = Math.max(80, resizeStart.height + deltaY)
            break
          case "sw": // Southwest
            newWidth = Math.max(100, resizeStart.width - deltaX)
            newHeight = Math.max(80, resizeStart.height + deltaY)
            newX = element.x + (resizeStart.width - newWidth)
            break
          case "ne": // Northeast
            newWidth = Math.max(100, resizeStart.width + deltaX)
            newHeight = Math.max(80, resizeStart.height - deltaY)
            newY = element.y + (resizeStart.height - newHeight)
            break
          case "nw": // Northwest
            newWidth = Math.max(100, resizeStart.width - deltaX)
            newHeight = Math.max(80, resizeStart.height - deltaY)
            newX = element.x + (resizeStart.width - newWidth)
            newY = element.y + (resizeStart.height - newHeight)
            break
          case "e": // East
            newWidth = Math.max(100, resizeStart.width + deltaX)
            break
          case "w": // West
            newWidth = Math.max(100, resizeStart.width - deltaX)
            newX = element.x + (resizeStart.width - newWidth)
            break
          case "n": // North
            newHeight = Math.max(80, resizeStart.height - deltaY)
            newY = element.y + (resizeStart.height - newHeight)
            break
          case "s": // South
            newHeight = Math.max(80, resizeStart.height + deltaY)
            break
        }

        onUpdate(element.id, { x: newX, y: newY, width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      // 清理动画帧
      if (dragAnimationRef.current) {
        cancelAnimationFrame(dragAnimationRef.current)
        dragAnimationRef.current = null
      }
      
      // 恢复性能优化样式
      if (elementRef.current) {
        elementRef.current.style.willChange = 'auto'
        elementRef.current.style.pointerEvents = 'auto'
      }
      
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      // 优化性能：在拖动开始时设置 will-change
      if (elementRef.current && isDragging) {
        elementRef.current.style.willChange = 'transform'
        elementRef.current.style.pointerEvents = 'none'
      }
      
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      
      // 确保清理动画帧
      if (dragAnimationRef.current) {
        cancelAnimationFrame(dragAnimationRef.current)
        dragAnimationRef.current = null
      }
    }
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    resizeDirection,
    zoom,
    element?.id,
    element?.x,
    element?.y,
    onUpdate,
    onSelect,
    isViewMode,
    isMultiSelected,
    element
  ])

  if (!element || !element.id) {
    return null
  }

  // 转换数据格式以适配不同图表组件
  const transformDataForChart = (data: any[], chartType: string): any[] | { nodes: any[]; links: any[] } | { root: any } => {
    if (!data || data.length === 0) {
      // 返回默认数据而不是 undefined
      switch (chartType) {
        case "radar":
          return [
            { name: "指标1", value: 80 },
            { name: "指标2", value: 60 },
            { name: "指标3", value: 70 },
            { name: "指标4", value: 90 },
            { name: "指标5", value: 85 }
          ]
        case "area":
          return [
            { name: "1月", value: 100, value2: 80 },
            { name: "2月", value: 120, value2: 90 },
            { name: "3月", value: 140, value2: 110 },
            { name: "4月", value: 160, value2: 130 },
            { name: "5月", value: 180, value2: 150 }
          ]
        case "histogram":
          return [
            { name: "0-10", value: 5, frequency: 10 },
            { name: "10-20", value: 15, frequency: 20 },
            { name: "20-30", value: 25, frequency: 30 },
            { name: "30-40", value: 35, frequency: 25 },
            { name: "40-50", value: 45, frequency: 15 }
          ]


        case "waterfall":
          return [
            { name: "初始值", value: 100 },
            { name: "收入1", value: 50 },
            { name: "支出1", value: -30 },
            { name: "收入2", value: 40 },
            { name: "支出2", value: -20 },
            { name: "最终值", value: 140, isTotal: true }
          ]
        default:
          return []
      }
    }

    switch (chartType) {
      case "bar":
      case "line":
      case "area":
        // 如果数据已经是 {name, value} 格式，直接返回
        if (data[0] && data[0].name !== undefined && data[0].value !== undefined) {
          return data
        }
        // 否则转换 {x, y} 格式为 {name, value} 格式
        return data.map(item => ({
          name: item.x || item.name,
          value: item.y || item.value,
          value2: item.y2 || item.value2 || 0 // 如果有第二个值
        }))
      
      case "pie":
      case "funnel":
        // 如果数据已经是 {name, value} 格式，直接返回
        if (data[0] && data[0].name !== undefined && data[0].value !== undefined) {
          return data
        }
        // 否则转换为 {name, value} 格式
        return data.map(item => ({
          name: item.category || item.x || item.name,
          value: item.value || item.y
        }))
      
      case "scatter":
        // 散点图保持原格式
        return data
      


      case "radar":
        // 雷达图数据格式已经正确，直接返回
        return data as { name: string; value: number }[]

      case "histogram":
        // 直方图数据格式已经正确，直接返回
        return data as { name: string; value: number; frequency?: number }[]





      case "waterfall":
        // 瀑布图数据格式已经正确，直接返回
        return data as { name: string; value: number; isTotal?: boolean }[]

      case "timeline":
        // 时序图数据格式已经正确，直接返回
        return data as { name: string; value: number; value2?: number; value3?: number }[]

      case "tree":
        // 树状图数据格式已经正确，直接返回
        return data as any[]

      case "network":
        // 关系图数据格式已经是正确的，直接返回
        if (!data) {
          return {
            nodes: [
              { id: "1", name: "节点1" },
              { id: "2", name: "节点2" },
              { id: "3", name: "节点3" },
              { id: "4", name: "节点4" },
            ],
            links: [
              { source: "1", target: "2" },
              { source: "2", target: "3" },
              { source: "3", target: "4" },
              { source: "4", target: "1" },
            ],
          }
        }
        return data

      case "tree":
        // 如果没有数据，返回默认的树图数据
        if (!data || data.length === 0) {
          return [{
            name: "根节点",
            children: [
              {
                name: "分支1",
                children: [
                  { name: "叶子1", value: 100 },
                  { name: "叶子2", value: 200 },
                ],
              },
              {
                name: "分支2",
                children: [
                  { name: "叶子3", value: 300 },
                  { name: "叶子4", value: 400 },
                ],
              },
            ],
          }]
        }
        return data
      
      default:
        return data
    }
  }

  const renderChart = () => {
    const transformedData = transformDataForChart(chartData, element.type)
    
    // 获取组件的主题颜色，如果没有设置则使用默认主题
    const theme = getThemeById(element.themeId || "DA001")
    const themeColors = theme ? applyThemeToChart(theme, element.type) : undefined

    // 计算基于页面缩放的响应式字体大小
    const zoomFactor = zoom / 100
    const responsiveFontSize = (baseSize: number) => Math.max(8, Math.round(baseSize * zoomFactor))

    const baseProps = {
      title: element.title || "",
      colors: themeColors?.colors,
      textColors: themeColors?.textColors,
      transparent: element.transparent,
      showLegend: element.showLegend !== false,
      showGrid: element.showGrid !== false,
      showTooltip: element.showTooltip !== false,
      // 添加响应式字体大小
      titleFontSize: responsiveFontSize(element.titleFontSize || 16),
      axisFontSize: responsiveFontSize(element.axisFontSize || 12),
      legendFontSize: responsiveFontSize(element.legendFontSize || 12),
      tooltipFontSize: responsiveFontSize(element.tooltipFontSize || 12),
      chartFontSize: responsiveFontSize(element.chartFontSize || 12),
      // 添加字体颜色属性
      titleTextColor: element.titleTextColor,
      axisTextColor: element.axisTextColor,
      legendTextColor: element.legendTextColor,
      tooltipTextColor: element.tooltipTextColor,
      chartTextColor: element.chartTextColor,
    }

    // 根据图表类型转换数据格式
    const data = Array.isArray(transformedData) ? transformedData : []
    const networkData = element.type === "network" ? transformedData as { nodes: any[]; links: any[] } : undefined
    const treeData = element.type === "tree" ? transformedData as any[] : undefined
    const sankeyData = element.type === "sankey" ? transformedData as { nodes: any[]; links: any[] } : undefined

    console.log("[JF] Rendering component:", element.type, "with props:", baseProps, "original data:", chartData, "transformed:", transformedData)

    switch (element.type.toLowerCase()) {
      case "bar":
        return <BarChart 
          data={data} 
          title={baseProps.title}
          showLegend={baseProps.showLegend}
          showGrid={baseProps.showGrid}
          showTooltip={baseProps.showTooltip}
          transparent={baseProps.transparent}
          colors={baseProps.colors}
          textColors={baseProps.textColors}
          titleFontSize={baseProps.titleFontSize}
          titleTextColor={element.titleTextColor}
          axisFontSize={baseProps.axisFontSize}
          axisTextColor={element.axisTextColor}
          legendFontSize={baseProps.legendFontSize}
          legendTextColor={element.legendTextColor}
          tooltipFontSize={baseProps.tooltipFontSize}
          tooltipTextColor={element.tooltipTextColor}
          chartFontSize={baseProps.chartFontSize}
          chartTextColor={element.chartTextColor}
        />
      case "line":
        return <LineChart 
          {...baseProps} 
          data={data} 
        />
      case "pie":
        return <PieChart
          {...baseProps}
          data={data}
        />
      case "funnel":
        return <FunnelChart
          {...baseProps}
          data={data}
        />

      case "scatter":
        return <ScatterChart {...baseProps} data={data} />
      case "area":
      case "面积图":
        return <AreaChart {...baseProps} data={data} textColors={baseProps.textColors} />
      case "radar":
      case "雷达图":
        return <RadarChart {...baseProps} data={data} />
      case "heatmap":
        return <HeatmapChart {...baseProps} data={data} />
      case "histogram":
      case "直方图":
        return <HistogramChart {...baseProps} data={data} />

      case "timeline":
        return <TimelineChart {...baseProps} data={data} />
      case "network":
        return <NetworkChart {...baseProps} data={networkData} />
      case "tree":
        return <TreeChart {...baseProps} data={treeData} />
      case "sankey":
        console.log("[ChartElement] 桑基图数据:", sankeyData)
        return <SankeyChart {...baseProps} data={sankeyData} />
      case "geomap":
        return <GeoMap {...baseProps} />

      case "wordcloud":
        return <WordCloudChart {...baseProps} />
      case "waterfall":
      case "瀑布图":
        return <WaterfallChart {...baseProps} data={data} />
      case "gauge":
        // 仪表组件使用第一个数据项的值
        const gaugeValue = data && data.length > 0 ? data[0].value : 0
        return <GaugeChart 
          {...baseProps} 
          value={gaugeValue}
          min={0}
          max={100}
          width={element.width}
          height={element.height}
        />

      case "title":
        console.log("[JF] Rendering title component with content:", element.content, "level:", element.level)
        return (
          <TitleComponent
            key={`title-${element.id}-${element.content}-${element.level}`}
            width={element.width}
            height={element.height}
            content={element.content || "点击编辑标题"}
            headingLevel={`h${element.level || 1}`}
            fontSize={responsiveFontSize(element.fontSize || 24)}
            fontWeight={element.fontWeight}
            textAlign={element.textAlign}
            textColor={element.textColor}
            backgroundColor={element.backgroundColor}
            transparent={element.transparent}
            isViewMode={isViewMode}
            onContentChange={(content, level) => {
              console.log("[JF] Title content changed:", content, "level:", level)
              const numericLevel = Number.parseInt(level.replace("h", ""))
              onUpdate(element.id, { content, level: numericLevel })
            }}
          />
        )

      case "text":
        console.log("[JF] Rendering text component with content:", element.content)
        return (
          <TextComponent
            key={`text-${element.id}-${element.content}`}
            width={element.width}
            height={element.height}
            content={element.content || "点击编辑文本内容"}
            fontSize={responsiveFontSize(element.fontSize || 14)}
            fontWeight={element.fontWeight}
            textAlign={element.textAlign}
            textColor={element.textColor}
            backgroundColor={element.backgroundColor}
            transparent={element.transparent}
            isViewMode={isViewMode}
            onContentChange={(content) => {
              console.log("[JF] Text content changed:", content)
              onUpdate(element.id, { content })
            }}
          />
        )

      case "image":
        return (
          <ImageComponent
            width={element.width}
            height={element.height}
            imageUrl={element.imageUrl}
            alt={element.alt || "图片"}
            isViewMode={isViewMode}
            onUrlChange={(url) => onUpdate(element.id, { imageUrl: url })}
          />
        )
      case "video":
        return (
          <VideoComponent
            width={element.width}
            height={element.height}
            videoUrl={element.videoUrl}
            autoplay={element.autoplay || false}
            controls={element.controls !== false}
            muted={element.muted || false}
            isViewMode={isViewMode}
            onUrlChange={(url) => onUpdate(element.id, { videoUrl: url })}
          />
        )
      case "audio":
        return (
          <AudioComponent
            width={element.width}
            height={element.height}
            audioUrl={element.audioUrl}
            autoplay={element.autoplay || false}
            controls={element.controls !== false}
            isViewMode={isViewMode}
            onUrlChange={(url) => onUpdate(element.id, { audioUrl: url })}
          />
        )
      case "3d-model":
        return (
          <ThreeDModelComponent
            data={element.data as any}
            onDataChange={(data) => onUpdate(element.id, { data })}
            zoom={zoom}
            width={element.width}
            height={element.height}
          />
        )

      default:
        return <div className="w-full h-full bg-muted rounded flex items-center justify-center">未知组件</div>
    }
  }

  return (
    <div
      ref={elementRef}
      className={`absolute transform-gpu backface-hidden
        ${isDragging ? "transition-none z-30 shadow-2xl" : "transition-all duration-150 ease-out"}
        ${!isViewMode && !element.isPreviewing && !positionLocked ? "cursor-move" : ""} 
        ${isSelected && !isViewMode && !element.isPreviewing ? "border-2 shadow-lg" : "hover:shadow-sm"}
        ${isSelected && isMultiSelected ? "border-purple-500 bg-purple-50/10 dark:bg-purple-950/20" : ""}
        ${isSelected && !isMultiSelected ? "border-blue-500 bg-blue-50/10 dark:bg-blue-950/20" : ""}
      `}
      style={{
        left: element.x * (zoom / 100),
        top: element.y * (zoom / 100),
        width: element.width * (zoom / 100),
        height: element.height * (zoom / 100),
        willChange: isDragging ? 'transform' : 'auto',
        zIndex: element.zIndex || (isSelected ? 10 : 1),
        // 移除缩放变换，因为我们已经通过位置和尺寸来实现了缩放
        transform: 'none',
        transformOrigin: 'top left',
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Chart Content */}
      <div 
        className={`w-full h-full rounded-lg transition-all duration-300 ${
          element.type === "title" 
            ? 'border-0 bg-transparent' 
            : element.transparent 
              ? 'border-0' 
              : 'border border-white/20 bg-black/30 hover:bg-black/40 shadow-xl'
        }`}
        style={{
          opacity: element.transparent ? (element.opacity || 1) : 1
        }}
      >
        {renderChart()}
      </div>

      {/* Selection Handles - show when selected in edit mode and not in preview mode and not position locked */}
      {isSelected && !isViewMode && !element.isPreviewing && !positionLocked && (
        <>
          {/* Corner resize handles */}
          <div
            className={`absolute -top-1.5 -left-1.5 w-3 h-3 border-2 border-white rounded-sm cursor-nw-resize transition-all duration-200 shadow-sm ${
              hoveredHandle === "nw" ? "bg-blue-600 scale-125" : "bg-blue-500"
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
            onMouseEnter={() => handleHandleMouseEnter("nw")}
            onMouseLeave={handleHandleMouseLeave}
          />
          <div
            className={`absolute -top-1.5 -right-1.5 w-3 h-3 border-2 border-white rounded-sm cursor-ne-resize transition-all duration-200 shadow-sm ${
              hoveredHandle === "ne" ? "bg-blue-600 scale-125" : "bg-blue-500"
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
            onMouseEnter={() => handleHandleMouseEnter("ne")}
            onMouseLeave={handleHandleMouseLeave}
          />
          <div
            className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 border-2 border-white rounded-sm cursor-sw-resize transition-all duration-200 shadow-sm ${
              hoveredHandle === "sw" ? "bg-blue-600 scale-125" : "bg-blue-500"
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
            onMouseEnter={() => handleHandleMouseEnter("sw")}
            onMouseLeave={handleHandleMouseLeave}
          />
          <div
            className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 border-2 border-white rounded-sm cursor-se-resize transition-all duration-200 shadow-sm ${
              hoveredHandle === "se" ? "bg-blue-600 scale-125" : "bg-blue-500"
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
            onMouseEnter={() => handleHandleMouseEnter("se")}
            onMouseLeave={handleHandleMouseLeave}
          />

          {/* Edge resize handles */}
          <div
            className={`absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 border-2 border-white rounded-sm cursor-n-resize transition-all duration-200 shadow-sm ${
              hoveredHandle === "n" ? "bg-blue-600 scale-125" : "bg-blue-500"
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
            onMouseEnter={() => handleHandleMouseEnter("n")}
            onMouseLeave={handleHandleMouseLeave}
          />
          <div
            className={`absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 border-2 border-white rounded-sm cursor-s-resize transition-all duration-200 shadow-sm ${
              hoveredHandle === "s" ? "bg-blue-600 scale-125" : "bg-blue-500"
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
            onMouseEnter={() => handleHandleMouseEnter("s")}
            onMouseLeave={handleHandleMouseLeave}
          />
          <div
            className={`absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 border-2 border-white rounded-sm cursor-w-resize transition-all duration-200 shadow-sm ${
              hoveredHandle === "w" ? "bg-blue-600 scale-125" : "bg-blue-500"
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
            onMouseEnter={() => handleHandleMouseEnter("w")}
            onMouseLeave={handleHandleMouseLeave}
          />
          <div
            className={`absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 border-2 border-white rounded-sm cursor-e-resize transition-all duration-200 shadow-sm ${
              hoveredHandle === "e" ? "bg-blue-600 scale-125" : "bg-blue-500"
            }`}
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
            onMouseEnter={() => handleHandleMouseEnter("e")}
            onMouseLeave={handleHandleMouseLeave}
          />


        </>
      )}

      {/* Context menu - always show when selected, even when position locked */}
      {isSelected && !isViewMode && !element.isPreviewing && (
        <DropdownMenu open={showContextMenu} onOpenChange={setShowContextMenu} modal={false}>
          <DropdownMenuTrigger className="hidden">
            {/* 隐藏触发器，因为我们用右键点击事件来触发菜单 */}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="min-w-[160px]"
            style={{
              position: 'fixed',
              left: `${contextMenuPosition.x}px`,
              top: `${contextMenuPosition.y}px`,
            }}
          >
            <DropdownMenuItem onClick={() => onCopy(element.id)}>
              <Copy className="w-4 h-4 mr-2" />
              复制
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // 上移一层：找到当前元素的索引，然后移动到前一个位置
                const currentIndex = canvasElements.findIndex(el => el.id === element.id)
                if (currentIndex > 0) {
                  onElementReorder(element.id, currentIndex - 1)
                }
              }}
            >
              <ArrowUpIcon className="w-4 h-4 mr-2" />
              上移一层
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // 下移一层：找到当前元素的索引，然后移动到后一个位置
                const currentIndex = canvasElements.findIndex(el => el.id === element.id)
                if (currentIndex < canvasElements.length - 1) {
                  onElementReorder(element.id, currentIndex + 1)
                }
              }}
            >
              <ArrowDownIcon className="w-4 h-4 mr-2" />
              下移一层
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // 移到顶层：移动到数组的第一个位置
                onElementReorder(element.id, 0)
              }}
            >
              <MoveUpIcon className="w-4 h-4 mr-2" />
              移到顶层
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // 移到底层：移动到数组的最后一个位置
                onElementReorder(element.id, canvasElements.length - 1)
              }}
            >
              <MoveDownIcon className="w-4 h-4 mr-2" />
              移到底层
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(element.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
