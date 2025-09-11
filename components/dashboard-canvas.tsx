"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Move, MousePointer, Hand, ArrowLeftRight, ArrowUpDown, Grid, Ruler, Monitor, Palette } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChartElement } from "@/components/chart-element"
import { calculateSnapPosition, type SnapGuide, calculateEvenDistribution, shouldShowDistribution } from "@/lib/snap-utils"
import { dataManager } from "@/lib/data-manager"
import { useTheme } from "next-themes"

// 防抖hook
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): T {
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined)
  const callbackRef = useRef(callback)
  
  // 更新回调引用
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    
    timeoutId.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay]) as T
}

interface CanvasElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  title?: string
  content?: string
  headingLevel?: string
  level?: number
  zIndex?: number
  data?: any[]
  tableData?: {
    headers: string[]
    rows: string[][]
  }
  textColor?: string
  backgroundColor?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: string
  opacity?: number
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  animation?: boolean
  themeId?: string
  imageUrl?: string
  alt?: string
  videoUrl?: string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  audioUrl?: string
  transparent?: boolean
  isPreviewing?: boolean
  positionLocked?: boolean
}

interface DashboardCanvasProps {
  elements: CanvasElement[]
  onElementsChange: (elements: CanvasElement[]) => void
  selectedChart: string | null
  selectedElement?: string | null
  onElementSelect?: (elementId: string | null) => void
  onElementUpdate?: (elementId: string, updates: Partial<CanvasElement>) => void
  onCanvasSettingsChange?: (settings: {
    width: number
    height: number
    backgroundColor: string
  }) => void
  initialCanvasSettings?: {
    width: number
    height: number
    backgroundColor: string
  }
  isViewMode?: boolean
}

interface HistoryState {
  past: CanvasElement[][]
  present: CanvasElement[]
  future: CanvasElement[][]
}

interface Resolution {
  width: number;
  height: number;
  label: string;
}

const PRESET_RESOLUTIONS: Resolution[] = [
  { width: 1920, height: 1080, label: "1920×1080 (FHD)" },
  { width: 2560, height: 1440, label: "2560×1440 (2K)" },
  { width: 3840, height: 2160, label: "3840×2160 (4K)" },
  { width: 2000, height: 2000, label: "2000×2000 (默认)" },
  { width: 3440, height: 1440, label: "3440×1440 (超宽)" },
]

const RESOLUTION_STORAGE_KEY = 'dashboard-canvas-resolution'
const CANVAS_COLOR_STORAGE_KEY = 'dashboard-canvas-background-color'

// 为不同图表类型生成默认示例数据
function generateDefaultData(chartType: string): any[] {
  switch (chartType.toLowerCase()) {
    case "bar":
      return [
        { name: "产品A", value: 120 },
        { name: "产品B", value: 200 },
        { name: "产品C", value: 150 },
        { name: "产品D", value: 180 }
      ]
    case "line":
      return [
        { name: "1月", value: 100 },
        { name: "2月", value: 150 },
        { name: "3月", value: 200 },
        { name: "4月", value: 180 },
        { name: "5月", value: 250 },
        { name: "6月", value: 300 }
      ]
    case "area":
      return [
        { name: "Q1", value: 150 },
        { name: "Q2", value: 200 },
        { name: "Q3", value: 180 },
        { name: "Q4", value: 250 }
      ]
    case "pie":
      return [
        { name: "苹果", value: 35 },
        { name: "香蕉", value: 25 },
        { name: "橙子", value: 20 },
        { name: "葡萄", value: 20 }
      ]
    case "scatter":
      return [
        { x: 10, y: 20 },
        { x: 15, y: 30 },
        { x: 20, y: 25 },
        { x: 25, y: 40 },
        { x: 30, y: 35 }
      ]
    case "radar":
      return [
        { name: "性能", value: 80 },
        { name: "质量", value: 90 },
        { name: "成本", value: 70 },
        { name: "交付", value: 85 },
        { name: "创新", value: 75 }
      ]
    case "funnel":
      return [
        { name: "访问", value: 1000 },
        { name: "咨询", value: 800 },
        { name: "订单", value: 600 },
        { name: "付款", value: 400 },
                { name: "成交", value: 200 }
      ]
    case "gauge":
      return [
        { name: "完成率", value: 75 }
      ]
    case "heatmap":
      return [
        { x: "周一", y: "上午", value: 10 },
        { x: "周一", y: "下午", value: 15 },
        { x: "周二", y: "上午", value: 12 },
        { x: "周二", y: "下午", value: 18 },
        { x: "周三", y: "上午", value: 8 },
        { x: "周三", y: "下午", value: 20 }
      ]
            case "histogram":

      return [
        { name: "0-10", value: 5 },
        { name: "10-20", value: 12 },
        { name: "20-30", value: 18 },
        { name: "30-40", value: 15 },
        { name: "40-50", value: 8 }
      ]
    
      return [
        { name: "组A", min: 10, q1: 15, median: 20, q3: 25, max: 30 },
        { name: "组B", min: 8, q1: 12, median: 18, q3: 22, max: 28 },
        { name: "组C", min: 12, q1: 18, median: 24, q3: 30, max: 36 }
      ]
    case "waterfall":
      return [
        { name: "初始值", value: 100 },
        { name: "收入", value: 50 },
        { name: "支出", value: -30 },
        { name: "投资", value: 20 },
        { name: "最终值", value: 140 }
      ]

    case "timeline":
      return [
        { name: "2023-01", value: 100 },
        { name: "2023-02", value: 120 },
        { name: "2023-03", value: 150 },
        { name: "2023-04", value: 180 }
      ]
    case "network":
      return {
        nodes: [
          { id: "1", name: "节点1", value: 100, group: "group1", size: 20 },
          { id: "2", name: "节点2", value: 80, group: "group1", size: 18 },
          { id: "3", name: "节点3", value: 60, group: "group2", size: 15 },
          { id: "4", name: "节点4", value: 40, group: "group2", size: 12 },
        ],
        links: [
          { source: "1", target: "2", value: 10, type: "strong" },
          { source: "1", target: "3", value: 8, type: "medium" },
          { source: "2", target: "4", value: 5, type: "weak" },
          { source: "3", target: "4", value: 6, type: "medium" },
        ]
      } as any
    case "tree":
      return [
        {
          id: "root",
          name: "公司组织",
          value: 1000,
          children: [
            {
              id: "dept1",
              name: "技术部",
              value: 400,
              children: [
                { id: "team1", name: "前端团队", value: 150 },
                { id: "team2", name: "后端团队", value: 200 },
                { id: "team3", name: "测试团队", value: 50 }
              ]
            },
            {
              id: "dept2",
              name: "产品部",
              value: 300,
              children: [
                { id: "team4", name: "产品设计", value: 100 },
                { id: "team5", name: "用户体验", value: 200 }
              ]
            },
            {
              id: "dept3",
              name: "运营部",
              value: 300,
              children: [
                { id: "team6", name: "市场推广", value: 150 },
                { id: "team7", name: "客户服务", value: 150 }
              ]
            }
          ]
        }
      ]
    case "sankey":
      return {
        nodes: [
          { id: "energy", name: "能源", category: "源头" },
          { id: "industry", name: "工业", category: "中间" },
          { id: "transport", name: "交通", category: "中间" },
          { id: "building", name: "建筑", category: "中间" },
          { id: "emission", name: "排放", category: "终点" }
        ],
        links: [
          { source: "energy", target: "industry", value: 100, label: "工业用能" },
          { source: "energy", target: "transport", value: 80, label: "交通用能" },
          { source: "energy", target: "building", value: 60, label: "建筑用能" },
          { source: "industry", target: "emission", value: 70, label: "工业排放" },
          { source: "transport", target: "emission", value: 60, label: "交通排放" },
          { source: "building", target: "emission", value: 40, label: "建筑排放" }
        ]
      } as any
    case "wordcloud":
      return [
        { name: "数据", value: 100 },
        { name: "分析", value: 80 },
        { name: "可视化", value: 70 },
        { name: "图表", value: 60 },
        { name: "报表", value: 50 }
      ]
    case "3d-model":
      return {
        modelUrl: "",
        environmentPreset: "studio",
        ambientIntensity: 0.3,
        ambientColor: "#ffffff",
        directionalIntensity: 0.8,
        directionalColor: "#ffffff",
        viewPresets: [],
        currentView: ""
      } as any
    default:
      return [
        { name: "数据1", value: 100 },
        { name: "数据2", value: 200 },
        { name: "数据3", value: 150 }
      ]
  }
}

function getStoredResolution() {
  if (typeof window === 'undefined') {
    return { width: 2000, height: 2000 } // 服务器端默认值
  }
  try {
    const stored = localStorage.getItem(RESOLUTION_STORAGE_KEY)
    if (stored) {
      const { width, height } = JSON.parse(stored)
      if (width > 0 && height > 0) {
        return { width, height }
      }
    }
  } catch (e) {
    console.error('Failed to load stored resolution:', e)
  }
  return { width: 2000, height: 2000 } // 默认值
}

function storeResolution(width: number, height: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RESOLUTION_STORAGE_KEY, JSON.stringify({ width, height }))
  } catch (e) {
    console.error('Failed to store resolution:', e)
  }
}

function getStoredCanvasColor() {
  if (typeof window === 'undefined') {
    return "#ffffff" // 服务器端默认值
  }
  try {
    const stored = localStorage.getItem(CANVAS_COLOR_STORAGE_KEY)
    if (stored) {
      return stored
    }
  } catch (error) {
    console.warn('Failed to load stored canvas color:', error)
  }
  return "#ffffff" // 默认值
}

function storeCanvasColor(color: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CANVAS_COLOR_STORAGE_KEY, color)
  } catch (error) {
    console.warn('Failed to store canvas color:', error)
  }
}

export function DashboardCanvas({ elements, onElementsChange, selectedChart, selectedElement: externalSelectedElement, onElementSelect, onCanvasSettingsChange, initialCanvasSettings, isViewMode = false }: DashboardCanvasProps) {
  const [zoom, setZoom] = useState(100)
  const [tool, setTool] = useState("select")
  const [canvasWidth, setCanvasWidth] = useState(2000)
  const [canvasHeight, setCanvasHeight] = useState(2000)
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState("#ffffff")
  const [isUserCustomizedBackground, setIsUserCustomizedBackground] = useState(false)
  const { theme } = useTheme()
  
  useEffect(() => {
    // 优先使用本地存储的分辨率设置
    const storedResolution = getStoredResolution()
    setCanvasWidth(storedResolution.width)
    setCanvasHeight(storedResolution.height)
    
    // 检查用户是否手动设置过背景色
    const hasUserCustomized = localStorage.getItem('user-customized-canvas-background') === 'true'
    setIsUserCustomizedBackground(hasUserCustomized)
    
    // 使用初始设置或本地存储的背景颜色
    if (initialCanvasSettings?.backgroundColor) {
      setCanvasBackgroundColor(initialCanvasSettings.backgroundColor)
      setIsUserCustomizedBackground(true)
      localStorage.setItem('user-customized-canvas-background', 'true')
    } else if (hasUserCustomized) {
      // 用户之前手动设置过，使用存储的颜色
      const storedColor = getStoredCanvasColor()
      setCanvasBackgroundColor(storedColor)
    } else {
      // 用户没有手动设置过，根据主题设置默认颜色
      const defaultColor = theme === 'dark' ? '#1a1a1a' : '#ffffff'
      setCanvasBackgroundColor(defaultColor)
    }
    
    // 延迟调整缩放比例，确保容器已经渲染
    setTimeout(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40
        const containerHeight = containerRef.current.clientHeight - 40
        const widthRatio = (containerWidth / storedResolution.width) * 100
        const heightRatio = (containerHeight / storedResolution.height) * 100
        const fitRatio = Math.min(widthRatio, heightRatio)
        const newZoom = isViewMode ? Math.max(25, fitRatio) : Math.max(25, Math.min(fitRatio, 100))
        setZoom(newZoom)
      }
    }, 100)
  }, []) // 只在组件挂载时执行一次

  // 使用ref来存储最新的回调函数，避免依赖项变化
  const onCanvasSettingsChangeRef = useRef(onCanvasSettingsChange)
  const onElementsChangeRef = useRef(onElementsChange)
  
  // 更新回调引用
  useEffect(() => {
    onCanvasSettingsChangeRef.current = onCanvasSettingsChange
    onElementsChangeRef.current = onElementsChange
  }, [onCanvasSettingsChange, onElementsChange])

  const notifyCanvasSettingsChangeStable = useCallback(() => {
    if (onCanvasSettingsChangeRef.current) {
      onCanvasSettingsChangeRef.current({
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: canvasBackgroundColor
      })
    }
  }, [canvasWidth, canvasHeight, canvasBackgroundColor])



  // 使用ref来跟踪是否已经初始化，避免在初始化时触发回调
  const hasInitialized = useRef(false)

  // 当画布设置改变时通知父组件（仅在初始化后）
  useEffect(() => {
    if (hasInitialized.current) {
      notifyCanvasSettingsChangeStable()
    }
  }, [canvasWidth, canvasHeight, canvasBackgroundColor])

  const [showResolutionDialog, setShowResolutionDialog] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const colorChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // 使用 useCallback 优化颜色变化处理函数，添加防抖机制
  const handleColorChange = useCallback((newColor: string) => {
    setCanvasBackgroundColor(newColor)
    storeCanvasColor(newColor)
    setIsUserCustomizedBackground(true)
    localStorage.setItem('user-customized-canvas-background', 'true')
    
    // 清除之前的定时器
    if (colorChangeTimeoutRef.current) {
      clearTimeout(colorChangeTimeoutRef.current)
    }
    
    // 使用 setTimeout 防抖，避免过于频繁的父组件通知
    colorChangeTimeoutRef.current = setTimeout(() => {
      if (hasInitialized.current && onCanvasSettingsChangeRef.current) {
        onCanvasSettingsChangeRef.current({
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: newColor
        })
      }
    }, 100) // 100ms 防抖延迟
  }, [canvasWidth, canvasHeight])



  // 监听主题变化，自动调整背景色（仅当用户没有手动设置时）
  useEffect(() => {
    if (!isUserCustomizedBackground && theme) {
      const defaultColor = theme === 'dark' ? '#1a1a1a' : '#ffffff'
      setCanvasBackgroundColor(defaultColor)
      
      // 通知父组件背景色变化
      if (hasInitialized.current && onCanvasSettingsChangeRef.current) {
        onCanvasSettingsChangeRef.current({
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: defaultColor
        })
      }
    }
  }, [theme, isUserCustomizedBackground])

  // 标记初始化完成
  useEffect(() => {
    hasInitialized.current = true
    
    // 清理函数，确保组件卸载时清除定时器
    return () => {
      if (colorChangeTimeoutRef.current) {
        clearTimeout(colorChangeTimeoutRef.current)
      }
    }
  }, [])

  // 监听initialCanvasSettings的变化，但只在初始化完成后
  useEffect(() => {
    if (hasInitialized.current && initialCanvasSettings?.backgroundColor) {
      setCanvasBackgroundColor(initialCanvasSettings.backgroundColor)
    }
  }, [initialCanvasSettings])

  // 更新分辨率的函数
  const updateResolution = useCallback((width: number, height: number) => {
    setCanvasWidth(width)
    setCanvasHeight(height)
    storeResolution(width, height)
    
    // 自动调整缩放比例以适应新的分辨率
    setTimeout(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40
        const containerHeight = containerRef.current.clientHeight - 40
        const widthRatio = (containerWidth / width) * 100
        const heightRatio = (containerHeight / height) * 100
        const fitRatio = Math.min(widthRatio, heightRatio)
        const newZoom = isViewMode ? Math.max(25, fitRatio) : Math.max(25, Math.min(fitRatio, 100))
        setZoom(newZoom)
      }
      
      if (hasInitialized.current) {
        notifyCanvasSettingsChangeStable()
      }
    }, 0)
  }, [notifyCanvasSettingsChangeStable, isViewMode])

  // 监听容器大小变化，自动调整缩放
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40
        const containerHeight = containerRef.current.clientHeight - 40
        const widthRatio = (containerWidth / canvasWidth) * 100
        const heightRatio = (containerHeight / canvasHeight) * 100
        const fitRatio = Math.min(widthRatio, heightRatio)
        const newZoom = isViewMode ? Math.max(25, fitRatio) : Math.max(25, Math.min(fitRatio, 100))
        setZoom(newZoom)
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [canvasWidth, canvasHeight, isViewMode])

  // 查看模式切换时自动调整缩放
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40
      const containerHeight = containerRef.current.clientHeight - 40
      const widthRatio = (containerWidth / canvasWidth) * 100
      const heightRatio = (containerHeight / canvasHeight) * 100
      const fitRatio = Math.min(widthRatio, heightRatio)
      const newZoom = isViewMode ? Math.max(25, fitRatio) : Math.max(25, Math.min(fitRatio, 100))
      setZoom(newZoom)
    }
  }, [isViewMode, canvasWidth, canvasHeight])
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: elements,
    future: []
  })

  // 撤销操作
  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev
      
      const newPast = prev.past.slice(0, -1)
      const newPresent = prev.past[prev.past.length - 1]
      const newFuture = [prev.present, ...prev.future]

      onElementsChangeRef.current(newPresent)
      
      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      }
    })
  }, [])

  // 重做操作
  const handleRedo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev
      
      const newPast = [...prev.past, prev.present]
      const newPresent = prev.future[0]
      const newFuture = prev.future.slice(1)

      onElementsChangeRef.current(newPresent)
      
      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      }
    })
  }, [])

  // 当外部 elements 变化时，更新 history.present
  useEffect(() => {
    // 只有当 elements 真正改变时才更新历史记录
    setHistory(prev => {
      if (JSON.stringify(prev.present) !== JSON.stringify(elements)) {
        return {
          ...prev,
          present: elements
        }
      }
      return prev
    })
  }, [elements])

  // 添加键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

  // 防抖的历史记录更新
  const debouncedAddToHistory = useDebounce((newElements: CanvasElement[]) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: newElements,
      future: []
    }))
  }, 100) // 100ms防抖

  // 添加新的历史记录
  const addToHistory = useCallback((newElements: CanvasElement[]) => {
    // 立即更新元素
    onElementsChangeRef.current(newElements)
    // 防抖更新历史记录
    debouncedAddToHistory(newElements)
  }, []) // 移除依赖，避免循环
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  // 同步外部选择状态
  useEffect(() => {
    if (externalSelectedElement !== undefined) {
      setSelectedElement(externalSelectedElement)
      if (externalSelectedElement) {
        setSelectedElements([externalSelectedElement])
      } else {
        setSelectedElements([])
      }
    }
  }, [externalSelectedElement])
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 })
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 })
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  const [showGrid, setShowGrid] = useState(false) // 默认不显示网格，让用户手动开启
  const [showMargins, setShowMargins] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [marginSize, setMarginSize] = useState(20)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => {
    if (isViewMode) {
      // 查看模式：允许更大的缩放范围
      setZoom((prev) => Math.min(prev + 10, 200))
    } else {
      // 编辑模式：限制缩放范围
      setZoom((prev) => Math.min(prev + 10, 100))
    }
  }
  const handleZoomOut = () => {
    if (isViewMode) {
      // 查看模式：允许更小的缩放
      setZoom((prev) => Math.max(prev - 10, 25))
    } else {
      // 编辑模式：限制最小缩放
      setZoom((prev) => Math.max(prev - 10, 25))
    }
  }
  const handleResetZoom = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40
      const containerHeight = containerRef.current.clientHeight - 40
      const widthRatio = (containerWidth / canvasWidth) * 100
      const heightRatio = (containerHeight / canvasHeight) * 100
      const fitRatio = Math.min(widthRatio, heightRatio)
      const newZoom = isViewMode ? Math.max(25, fitRatio) : Math.max(25, Math.min(fitRatio, 100))
      setZoom(newZoom)
    }
    setCanvasOffset({ x: 0, y: 0 })
  }, [canvasWidth, canvasHeight, isViewMode])

  const createChartElement = useCallback(
    (chartType: string, x: number, y: number) => {
      const baseElement: CanvasElement = {
        id: `chart-${Math.random().toString(36).substr(2, 9)}`,
        type: chartType,
        x: Math.max(0, x - 240), // Center the chart with new width
        y: Math.max(0, y - 135), // Center the chart with new height
        width: 480, // 16:9 aspect ratio width
        height: 270, // 16:9 aspect ratio height
        opacity: 100,
        showLegend: true,
        showGrid: false, // 默认不显示网格
        showTooltip: true,
        animation: true,
        transparent: true, // 默认设置为透明模式
        backgroundColor: 'transparent', // 默认背景透明
        isPreviewing: false, // 默认不处于预览状态

      }

      let newElement: CanvasElement = { ...baseElement }

      switch (chartType) {
        case "title":
          newElement = {
            ...baseElement,
            content: "标题内容",
            headingLevel: "h1",
            textColor: "#ffffff", // Changed to white text
            backgroundColor: "transparent",
            fontSize: 32,
            fontWeight: "bold",
            textAlign: "center",
            width: 480,
            height: 120,
          }
          break

        case "text":
          newElement = {
            ...baseElement,
            content: "文本内容",
            textColor: "#000000",
            backgroundColor: "#ffffff",
            fontSize: 14,
            fontWeight: "normal",
            textAlign: "left",
            width: 400,
            height: 200,
          }
          break

        case "image":
          newElement = {
            ...baseElement,
            imageUrl: "",
            alt: "图片",
            width: 480,
            height: 270,
          }
          break
        case "video":
          newElement = {
            ...baseElement,
            videoUrl: "",
            autoplay: false,
            controls: true,
            muted: false,
            width: 640, // Keep video at standard 16:9 resolution
            height: 360,
          }
          break
        case "audio":
          newElement = {
            ...baseElement,
            audioUrl: "",
            autoplay: false,
            controls: true,
            width: 480,
            height: 120,
          }
          break

        default:
          // 为图表类型生成默认示例数据
          const defaultData = generateDefaultData(chartType)
          newElement = {
            ...baseElement,
            title: `${getChartTypeLabel(chartType)}`,
            data: defaultData,
          }
          // 将初始数据绑定到数据管理器
          dataManager.bindChartToData(newElement.id, defaultData)
      }

      addToHistory([...elements, newElement])
      setSelectedElement(newElement.id)
      onElementSelect?.(newElement.id)
    },
    [elements, addToHistory, onElementSelect],
  )

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as HTMLElement).closest("[data-canvas-background]")) {
        setSelectedElement(null)
        onElementSelect?.(null)
      }
    },
    [onElementSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"

    try {
      const data = e.dataTransfer.getData("application/json")
      if (data) {
        const parsedData = JSON.parse(data)
        if (parsedData.type === "chart" && parsedData.chartId) {
          setIsDragOver(true)
        }
      }
    } catch {
      setIsDragOver(false)
    }
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter((prev) => prev + 1)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter <= 0) {
        setIsDragOver(false)
        return 0
      }
      return newCounter
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragOver(false)
      setDragCounter(0)

      try {
        const dataString = e.dataTransfer.getData("application/json")
        if (!dataString) {
          console.log("[JF] No drag data found")
          return
        }

        const data = JSON.parse(dataString)
        console.log("[JF] Drop data:", data)

        if (data.type === "chart") {
          const rect = canvasRef.current?.getBoundingClientRect()
          if (!rect) {
            console.log("[JF] Canvas rect not found")
            return
          }

          const x = (e.clientX - rect.left - canvasOffset.x) / (zoom / 100)
          const y = (e.clientY - rect.top - canvasOffset.y) / (zoom / 100)

          console.log("[JF] Creating chart at position:", { x, y })
          createChartElement(data.chartId.toLowerCase(), x, y)
        } else {
          console.log("[JF] Invalid drop data format")
        }
      } catch (error) {
        console.error("[JF] Error parsing drop data:", error)
      }
    },
    [zoom, canvasOffset, createChartElement],
  )

  const handleElementSelect = useCallback(
    (id: string, event?: React.MouseEvent, moveInfo?: { sourceId: string; deltaX: number; deltaY: number; finalX: number; finalY: number }) => {
      try {
        if (moveInfo) {
          // 处理多选拖拽
          const updatedElements = elements.map(el => {
            if (selectedElements.includes(el.id)) {
              if (el.id === moveInfo.sourceId) {
                return {
                  ...el,
                  x: moveInfo.finalX,
                  y: moveInfo.finalY
                }
              } else {
                return {
                  ...el,
                  x: Math.max(0, el.x + moveInfo.deltaX),
                  y: Math.max(0, el.y + moveInfo.deltaY)
                }
              }
            }
            return el
          })
          onElementsChangeRef.current(updatedElements)
        } else if (event?.shiftKey) {
          // Multi-select mode
          setSelectedElements(prev => {
            const newSelection = prev.includes(id) 
              ? prev.filter(elementId => elementId !== id)
              : [...prev, id]
            return newSelection
          })
          setSelectedElement(id)
          onElementSelect?.(id)
        } else {
          // Single select mode
          setSelectedElements([id])
          setSelectedElement(id)
          onElementSelect?.(id)
        }
      } catch (error) {
        console.error('Error in handleElementSelect:', error)
      }
    },
    [onElementSelect, elements, selectedElements, onElementsChange],
  )

  const handleDistributeElements = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      if (selectedElements.length < 3) return

      const selectedElementObjects = elements.filter(el => selectedElements.includes(el.id))
      const { positions, guides } = calculateEvenDistribution(selectedElementObjects, direction)

      // Update positions
      onElementsChangeRef.current(elements.map(el => {
        const newPos = positions.find((_, index) => selectedElementObjects[index].id === el.id)
        return newPos ? { ...el, x: newPos.x, y: newPos.y } : el
      }))

      // Show distribution guides
      setSnapGuides(guides)
    },
    [elements, selectedElements, onElementsChange],
  )

  // 防抖的拖动更新引用
  const dragUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastDragUpdateRef = useRef<{ elements: CanvasElement[]; timestamp: number } | null>(null)

  const handleElementMove = useCallback(
    (id: string, x: number, y: number) => {
      const element = elements.find((el) => el.id === id)
      if (!element) return

      // 如果是多选，计算所有选中元素的相对位置
      const selectedIds = selectedElements.length > 0 ? selectedElements : [id]
      const selectedElementsData = selectedIds.map(id => {
        const el = elements.find(e => e.id === id)
        return el ? {
          ...el,
          offsetX: el.x - element.x,
          offsetY: el.y - element.y
        } : null
      }).filter((el): el is NonNullable<typeof el> => el !== null)

      // 始终进行磁吸，包括画布边缘磁吸
      const snapResult = calculateSnapPosition(
        { ...element, x, y },
        elements.filter(el => !selectedIds.includes(el.id)), // 排除选中的元素
        canvasWidth,
        canvasHeight,
        {
          snapThreshold: 8,
          showCenterGuides: true,
          showEdgeGuides: true,
          showDistributionGuides: true,
          showSpacingGuides: true,
          showGridGuides: showGrid,
          gridSize: 20,
          marginGuides: true,
          marginSize: 20,
          canvasEdgeSnap: true, // 启用画布边缘磁吸
          canvasEdgeThreshold: 15
        }
      )

      // Update snap guides
      setSnapGuides(snapResult.guides)

      // 计算新的元素位置
      const updatedElements = elements.map((el) => {
        if (!selectedIds.includes(el.id)) return el
        
        const selectedData = selectedElementsData.find(sed => sed.id === el.id)
        if (!selectedData) return el

        return {
          ...el,
          x: snapResult.x + selectedData.offsetX,
          y: snapResult.y + selectedData.offsetY
        }
      })

      // 立即更新UI（确保拖动流畅）
      // 但使用防抖来减少属性面板的更新频率
      
      // 清除之前的防抖计时器
      if (dragUpdateTimeoutRef.current) {
        clearTimeout(dragUpdateTimeoutRef.current)
      }

      // 存储最后一次更新，用于防抖结束后的最终更新
      lastDragUpdateRef.current = {
        elements: updatedElements,
        timestamp: Date.now()
      }

      // 设置防抖计时器，拖动停止后100ms再更新属性面板
      dragUpdateTimeoutRef.current = setTimeout(() => {
        if (lastDragUpdateRef.current) {
          onElementsChangeRef.current(lastDragUpdateRef.current.elements)
          lastDragUpdateRef.current = null
        }
      }, 100)
    },
    [elements, selectedElements, canvasWidth, canvasHeight, showGrid],
  )

  const handleElementResize = useCallback(
    (id: string, width: number, height: number) => {
      onElementsChangeRef.current(elements.map((el) => (el.id === id ? { ...el, width, height } : el)))
    },
    [elements],
  )

  const handleElementDelete = useCallback(
    (id: string) => {
      const newElements = elements.filter((el) => el.id !== id)
      addToHistory(newElements)
      if (selectedElement === id) {
        setSelectedElement(null)
        onElementSelect?.(null)
      }
    },
    [elements, addToHistory, selectedElement, onElementSelect],
  )

  const handleElementDuplicate = useCallback(
    (id: string) => {
      const element = elements.find((el) => el.id === id)
      if (!element) return

      const newElement: CanvasElement = {
        ...element,
        id: `chart-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
      }

      onElementsChangeRef.current([...elements, newElement])
      setSelectedElement(newElement.id)
      onElementSelect?.(newElement.id)
    },
    [elements, onElementSelect],
  )

  const handleElementUpdate = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      // 检查是否有实际变化
      const element = elements.find(el => el.id === id)
      if (!element) return
      
      const hasChanges = Object.keys(updates).some(key => 
        element[key as keyof CanvasElement] !== updates[key as keyof CanvasElement]
      )
      
      if (!hasChanges) {
        return // 没有变化，不更新
      }
      
      const newElements = elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
      addToHistory(newElements)
    },
    [elements, addToHistory],
  )

  const handleElementCopy = useCallback(
    (id: string) => {
      const element = elements.find((el) => el.id === id)
      if (!element) return

      const newElement: CanvasElement = {
        ...element,
        id: `chart-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20,
      }

      onElementsChangeRef.current([...elements, newElement])
      setSelectedElement(newElement.id)
      onElementSelect?.(newElement.id)
    },
    [elements, onElementSelect],
  )

  // 处理组件重新排序（层级调整）
  const handleElementReorder = useCallback((elementId: string, newIndex: number) => {
    const elementIndex = elements.findIndex(el => el.id === elementId)
    if (elementIndex === -1 || elementIndex === newIndex) return
    
    const newElements = [...elements]
    const [movedElement] = newElements.splice(elementIndex, 1)
    newElements.splice(newIndex, 0, movedElement)
    
    // 更新zIndex以确保正确的显示层级
    // 注意：数组顺序与zIndex相反 - 数组末尾的元素应该具有更高的zIndex
    const updatedElements = newElements.map((el, index) => ({
      ...el,
      zIndex: newElements.length - index // 确保zIndex从高到低，数组末尾元素zIndex最大
    }))
    
    onElementsChangeRef.current(updatedElements)
    console.log("[JF] Element reordered:", elementId, "to index", newIndex, "new zIndex:", newElements.length - newIndex)
  }, [elements])

  const [isDraggingSelection, setIsDraggingSelection] = useState(false)
  const [dragSelectionStart, setDragSelectionStart] = useState({ x: 0, y: 0 })
  const [dragStartPositions, setDragStartPositions] = useState<{ [key: string]: { x: number, y: number } }>({})
  const [dragStartMousePosition, setDragStartMousePosition] = useState({ x: 0, y: 0 })

  const getCanvasCoordinates = useCallback((e: React.MouseEvent): { x: number, y: number } | null => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null

    // 缓存计算结果，避免重复计算
    const scale = zoom / 100
    const clientX = e.clientX
    const clientY = e.clientY
    
    if (isViewMode) {
      // 查看模式：优化计算，减少除法运算
      const scaleReciprocal = 1 / scale
      const transformedX = (clientX - rect.left) * scaleReciprocal - canvasOffset.x * scaleReciprocal
      const transformedY = (clientY - rect.top) * scaleReciprocal - canvasOffset.y * scaleReciprocal
      
      return {
        x: transformedX,
        y: transformedY
      }
    } else {
      // 编辑模式：优化计算
      const scaleReciprocal = 1 / scale
      return {
        x: (clientX - rect.left) * scaleReciprocal,
        y: (clientY - rect.top) * scaleReciprocal
      }
    }
  }, [canvasOffset.x, canvasOffset.y, zoom, isViewMode])

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // 只处理左键点击

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const { x, y } = coords

    // 检查是否点击在任何元素内（不仅仅是已选中的元素）
    const clickedElement = elements.find(element => 
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    )

    if (clickedElement) {
      // 如果点击了元素，先选中该元素
      if (!selectedElements.includes(clickedElement.id)) {
        setSelectedElements([clickedElement.id])
        setSelectedElement(clickedElement.id)
        onElementSelect?.(clickedElement.id)
      }
      
      // 检查是否有任何选中的元素被锁定
      const hasLockedElement = selectedElements.some(id => {
        const element = elements.find(el => el.id === id)
        return element?.positionLocked
      })
      
      if (hasLockedElement) {
        console.log("[JF] 检测到锁定的元素，禁止拖动")
        return
      }
      
      // 开始拖动选中的元素
      e.stopPropagation()
      setIsDraggingSelection(true)
      setDragStartMousePosition({ x, y })
      
      // 记录所有选中元素的初始位置
      const positions = selectedElements.reduce((acc, id) => {
        const element = elements.find(el => el.id === id)
        if (element) {
          acc[id] = { x: element.x, y: element.y }
        }
        return acc
      }, {} as { [key: string]: { x: number, y: number } })
      setDragStartPositions(positions)
    } else if (tool === "select") {
      // 点击在空白区域，开始框选
      if (!e.shiftKey) {
        setSelectedElements([])
        setSelectedElement(null)
        onElementSelect?.(null)
      }
      setIsSelecting(true)
      setSelectionStart({ x, y })
      setSelectionEnd({ x, y })
    } else if (tool === "pan") {
      setIsPanning(true)
      if (isViewMode) {
        // 查看模式：需要考虑缩放
        const scale = zoom / 100
        setPanStart({ 
          x: e.clientX - canvasOffset.x / scale, 
          y: e.clientY - canvasOffset.y / scale 
        })
      } else {
        // 编辑模式：简单的坐标计算
        setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
      }
    }
  }

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const { x, y } = coords

    if (isDraggingSelection && selectedElements.length > 0) {
      e.stopPropagation()
      
      // 检查是否有任何选中的元素被锁定
      const hasLockedElement = selectedElements.some(id => {
        const element = elements.find(el => el.id === id)
        return element?.positionLocked
      })
      
      if (hasLockedElement) {
        console.log("[JF] 拖动过程中检测到锁定的元素，停止拖动")
        setIsDraggingSelection(false)
        return
      }
      
      // 计算拖动偏移量
      const deltaX = x - dragStartMousePosition.x
      const deltaY = y - dragStartMousePosition.y

      // 更新所有选中元素的位置，保持它们的相对位置
      const updatedElements = elements.map(el => {
        if (selectedElements.includes(el.id)) {
          const startPos = dragStartPositions[el.id]
          if (startPos) {
            // 应用偏移量，同时考虑对齐和边界
            const newX = Math.max(0, startPos.x + deltaX)
            const newY = Math.max(0, startPos.y + deltaY)
            return {
              ...el,
              x: newX,
              y: newY
            }
          }
        }
        return el
      })

      onElementsChangeRef.current(updatedElements)
    } else if (isSelecting) {
      setSelectionEnd({ x, y })

      // 计算选中的元素
      const selectionBounds = {
        left: Math.min(selectionStart.x, x),
        right: Math.max(selectionStart.x, x),
        top: Math.min(selectionStart.y, y),
        bottom: Math.max(selectionStart.y, y),
      }

      const selectedIds = elements.filter(element => {
        const elementBounds = {
          left: element.x,
          right: element.x + element.width,
          top: element.y,
          bottom: element.y + element.height
        }
        
        // 检查是否有交集
        return !(
          elementBounds.left > selectionBounds.right ||
          elementBounds.right < selectionBounds.left ||
          elementBounds.top > selectionBounds.bottom ||
          elementBounds.bottom < selectionBounds.top
        )
      }).map(el => el.id)

      setSelectedElements(prev => {
        // 如果按住Shift键，保留之前的选择
        if (e.shiftKey) {
          return Array.from(new Set([...prev, ...selectedIds]))
        }
        return selectedIds
      })

      if (selectedIds.length > 0) {
        setSelectedElement(selectedIds[selectedIds.length - 1])
      }
    } else if (isPanning && tool === "pan") {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }, [
    isDraggingSelection,
    isSelecting,
    isPanning,
    tool,
    elements,
    selectedElements,
    dragSelectionStart,
    selectionStart,
    panStart,
    getCanvasCoordinates
  ])

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      if (isSelecting || isDraggingSelection) {
        e.stopPropagation()
      }
      setIsSelecting(false)
      setIsDraggingSelection(false)
    }
    setIsPanning(false)
  }, [isSelecting, isDraggingSelection])

  const getChartTypeLabel = (type: string) => {
    // 统一处理类型名称
    const normalizedType = type.toLowerCase()
    
    const labels: Record<string, string> = {
      // 基础图表
      bar: "柱状图",
      line: "折线图",
      pie: "饼图",
      funnel: "漏斗图",

      scatter: "散点图",
      
      // 新增支持的图表
      area: "面积图",
      "面积图": "面积图",
      radar: "雷达图",
      "雷达图": "雷达图",
              histogram: "直方图",
        "直方图": "直方图",

      
      
      waterfall: "瀑布图",
      "瀑布图": "瀑布图",
      
      // 其他图表
      heatmap: "热力图",
      timeline: "时序图",
      network: "关系图",
      tree: "树图",
      sankey: "桑基图",
      geomap: "地理地图",
      gauge: "仪表盘",
      wordcloud: "词云图",
      
      // 多媒体组件
      image: "图片组件",
      video: "视频组件",
      audio: "音频组件",
    }
    return labels[normalizedType] || "图表"
  }

  return (
    <div className="flex-1 flex flex-col bg-muted/20">
      <Dialog open={showResolutionDialog} onOpenChange={setShowResolutionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>设置画布分辨率</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={`${canvasWidth}x${canvasHeight}`}
              onValueChange={(value) => {
                const [width, height] = value.split("x").map(Number)
                updateResolution(width, height)
                setShowResolutionDialog(false)
              }}
            >
              {PRESET_RESOLUTIONS.map((resolution) => (
                <div key={resolution.label} className="flex items-center space-x-2">
                  <RadioGroupItem value={`${resolution.width}x${resolution.height}`} id={resolution.label} />
                  <Label htmlFor={resolution.label}>{resolution.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-10 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={history.past.length === 0}
            title="撤销XXX (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={history.future.length === 0}
            title="重做XXX (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-2" />

          <Button variant={tool === "select" ? "default" : "ghost"} size="sm" onClick={() => setTool("select")}>
            <MousePointer className="w-4 h-4" />
          </Button>
          <Button variant={tool === "pan" ? "default" : "ghost"} size="sm" onClick={() => setTool("pan")}>
            <Hand className="w-4 h-4" />
          </Button>
          <Button variant={tool === "move" ? "default" : "ghost"} size="sm" onClick={() => setTool("move")}>
            <Move className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-2" />

          <Button
            variant={showGrid ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            title="显示网格"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={showMargins ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowMargins(!showMargins)}
            title="显示边距参考线"
          >
            <Ruler className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsUserCustomizedBackground(false)
              localStorage.removeItem('user-customized-canvas-background')
              const defaultColor = theme === 'dark' ? '#1a1a1a' : '#ffffff'
              setCanvasBackgroundColor(defaultColor)
              storeCanvasColor(defaultColor)
              if (hasInitialized.current && onCanvasSettingsChangeRef.current) {
                onCanvasSettingsChangeRef.current({
                  width: canvasWidth,
                  height: canvasHeight,
                  backgroundColor: defaultColor
                })
              }
            }}
            title="重置背景色跟随主题"
            className={isUserCustomizedBackground ? "text-orange-500" : "text-muted-foreground"}
          >
            <Palette className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-2" />

          {selectedElements.length >= 3 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDistributeElements('horizontal')}
                title="水平等距分布"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDistributeElements('vertical')}
                title="垂直等距分布"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <div className="h-4 w-px bg-border mx-2" />
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm min-w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetZoom}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center" 
        ref={containerRef}
      >
        <div
          className={`relative ${isViewMode ? '' : 'shadow-xl'}`}
          style={{
            width: `${canvasWidth * (zoom / 100)}px`,
            height: `${canvasHeight * (zoom / 100)}px`,
            maxWidth: isViewMode ? 'none' : '100%',
            maxHeight: isViewMode ? 'none' : '100%',
            backgroundColor: canvasBackgroundColor,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          title={`画布背景色: ${canvasBackgroundColor}`}
        >
          <div
            ref={canvasRef}
            className={`absolute inset-0 cursor-crosshair transition-colors ${
              isDragOver ? "bg-blue-50 dark:bg-blue-950/20" : ""
            }`}
            style={{
              transform: isViewMode ? 
                `scale(${zoom / 100}) translate(${canvasOffset.x / (zoom / 100)}px, ${canvasOffset.y / (zoom / 100)}px)` : 
                'none',
              transformOrigin: "0 0",
              backgroundColor: 'transparent',
            }}
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onContextMenu={(e) => {
              // 只有在没有选中元素时才阻止默认右键菜单
              if (selectedElements.length === 0) {
                e.preventDefault()
              }
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
          {/* Grid */}
          {showGrid && (
            <div
              data-canvas-background
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
                backgroundPosition: '0 0',
                backgroundColor: 'transparent',
                opacity: 0.3,
                zIndex: 1
              }}
            />
          )}

          {/* Margin Guidelines */}
          {showMargins && (
            <>
              {/* Left Margin */}
              <div
                className="absolute top-0 bottom-0 border-r border-dashed border-blue-400/30 pointer-events-none"
                style={{ left: marginSize }}
              />
              {/* Right Margin */}
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-blue-400/30 pointer-events-none"
                style={{ right: marginSize }}
              />
              {/* Top Margin */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-blue-400/30 pointer-events-none"
                style={{ top: marginSize }}
              />
              {/* Bottom Margin */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-blue-400/30 pointer-events-none"
                style={{ bottom: marginSize }}
              />
            </>
          )}

            {elements.map((element) => (
              <ChartElement
                key={element.id}
                element={element}
                isSelected={selectedElements.includes(element.id)}
                isMultiSelected={selectedElements.length > 1}
                onSelect={handleElementSelect}
                onUpdate={handleElementUpdate}
                onDelete={handleElementDelete}
                onCopy={handleElementCopy}
                onElementReorder={handleElementReorder}
                canvasElements={elements}
                zoom={zoom}
              />
            ))}

            {elements.length === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-muted-foreground">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MousePointer className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium mb-2">开始创建图表</p>
                  <p className="text-sm">从左侧拖拽图表类型到画布创建图表</p>
                </div>
              </div>
            )}

            {isDragOver && (
              <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50/10 dark:bg-blue-950/10 pointer-events-none flex items-center justify-center z-50">
                <div className="bg-blue-600 dark:bg-blue-400 text-white dark:text-black px-4 py-2 rounded-lg text-lg font-medium shadow-lg">
                  释放鼠标以添加图表
                </div>
              </div>
            )}

            {/* Selection Box */}
            {isSelecting && (
              <>
                {/* Selection Area */}
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50"
                  style={{
                    left: Math.min(selectionStart.x, selectionEnd.x),
                    top: Math.min(selectionStart.y, selectionEnd.y),
                    width: Math.abs(selectionEnd.x - selectionStart.x),
                    height: Math.abs(selectionEnd.y - selectionStart.y),
                  }}
                />
                {/* Selection Measurements */}
                <div
                  className="absolute bg-blue-500 text-white text-xs px-1 rounded pointer-events-none z-50"
                  style={{
                    left: Math.min(selectionStart.x, selectionEnd.x),
                    top: Math.min(selectionStart.y, selectionEnd.y) - 20,
                  }}
                >
                  {Math.round(Math.abs(selectionEnd.x - selectionStart.x))} × {Math.round(Math.abs(selectionEnd.y - selectionStart.y))}
                </div>
                {/* Selection Guidelines */}
                <div
                  className="absolute border-l border-dashed border-blue-500/50 pointer-events-none z-50"
                  style={{
                    left: selectionEnd.x,
                    top: Math.min(selectionStart.y, selectionEnd.y),
                    height: Math.abs(selectionEnd.y - selectionStart.y),
                  }}
                />
                <div
                  className="absolute border-t border-dashed border-blue-500/50 pointer-events-none z-50"
                  style={{
                    left: Math.min(selectionStart.x, selectionEnd.x),
                    top: selectionEnd.y,
                    width: Math.abs(selectionEnd.x - selectionStart.x),
                  }}
                />
              </>
            )}

            {/* Snap Guides */}
            {snapGuides.map((guide, index) => (
              <div
                key={index}
                className="absolute pointer-events-none z-40"
                style={{
                  ...(guide.type === 'horizontal' && {
                    left: 0,
                    top: guide.position,
                    width: '100%',
                    height: '1px',
                    backgroundColor: guide.color || '#ff4444',
                    boxShadow: '0 0 2px rgba(255, 68, 68, 0.5)',
                    opacity: 0.8,
                  }),
                  ...(guide.type === 'vertical' && {
                    top: 0,
                    left: guide.position,
                    height: '100%',
                    width: '1px',
                    backgroundColor: guide.color || '#ff4444',
                    boxShadow: '0 0 2px rgba(255, 68, 68, 0.5)',
                    opacity: 0.8,
                  }),
                }}
              >
                {/* Guide Label */}
                <div
                  className="absolute bg-background text-xs px-1 rounded shadow"
                  style={{
                    ...(guide.type === 'horizontal' && {
                      top: '-8px',
                      left: '4px',
                      transform: 'translateY(-100%)',
                    }),
                    ...(guide.type === 'vertical' && {
                      left: '4px',
                      top: '4px',
                    }),
                  }}
                >
                  {Math.round(guide.position)}px
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-8 bg-card border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>画布: {canvasWidth} × {canvasHeight}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowResolutionDialog(true)}
          >
            <Monitor className="w-3 h-3 mr-1" />
            修改分辨率
          </Button>
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                <Palette className="w-3 h-3 mr-1" />
                画布颜色
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3">
              <div className="space-y-3">
                <Label className="text-xs font-medium">画布背景颜色</Label>
                <div className="grid grid-cols-6 gap-1">
                  {[
                    "#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6", "#ced4da", "#adb5bd",
                    "#6c757d", "#495057", "#343a40", "#212529", "#000000", "#f1f3f4",
                    "#e8f5e8", "#fff3cd", "#f8d7da", "#d1ecf1", "#d4edda", "#ffeaa7"
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                       e.preventDefault()
                       e.stopPropagation()
                       handleColorChange(color)
                     }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={canvasBackgroundColor}
                    onChange={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleColorChange(e.target.value)
                    }}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={canvasBackgroundColor}
                    onChange={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleColorChange(e.target.value)
                    }}
                    placeholder="#ffffff"
                    className="text-xs"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <span>网格: 20px | 元素: {elements.length}</span>
      </div>
    </div>
  )
}
