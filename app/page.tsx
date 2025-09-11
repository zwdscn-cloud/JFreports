"use client"

import { useState, useCallback, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardCanvas } from "@/components/dashboard-canvas"
import { DashboardView } from "@/components/dashboard-view"
import { PropertiesPanel } from "@/components/properties-panel"
import { ProjectPanel } from "@/components/project-panel"
import { DashboardToolbar } from "@/components/dashboard-toolbar"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { CameraStateProvider } from "@/components/camera-state-context"

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
  data?: any[] | { nodes: any[], links: any[] }
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

export default function Dashboard() {
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [activeTheme, setActiveTheme] = useState("DA001")
  const [isViewMode, setIsViewMode] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [canvasSettings, setCanvasSettings] = useState({
    width: 2000,
    height: 2000,
    backgroundColor: "#ffffff"
  })

  // 从本地存储加载画布设置
  useEffect(() => {
    const loadCanvasSettings = () => {
      try {
        // 加载背景颜色
        const storedColor = localStorage.getItem('dashboard-canvas-background-color')
        const backgroundColor = storedColor || "#ffffff"

        setCanvasSettings({
          width: 2000,
          height: 2000,
          backgroundColor
        })
      } catch (error) {
        console.warn('Failed to load canvas settings from localStorage:', error)
      }
    }

    loadCanvasSettings()
  }, [])

  // 明暗主题切换函数
  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    
    // 切换 HTML 的 class
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleElementUpdate = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    setCanvasElements((prev) => prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el)))
  }, [])

  // 稳定的元素变化处理函数，避免无限循环
  const handleElementsChange = useCallback((newElements: CanvasElement[]) => {
    setCanvasElements(newElements)
  }, [])

  const handleCanvasSettingsChange = useCallback((settings: {
    width: number
    height: number
    backgroundColor: string
  }) => {
    // 只有当设置真正改变时才更新，避免循环
    setCanvasSettings(prev => {
      if (prev.backgroundColor !== settings.backgroundColor || 
          prev.width !== settings.width || 
          prev.height !== settings.height) {
        return settings
      }
      return prev
    })
    
    // 保存背景颜色到本地存储
    try {
      localStorage.setItem('dashboard-canvas-background-color', settings.backgroundColor)
    } catch (error) {
      console.warn('Failed to save canvas settings to localStorage:', error)
    }
  }, [])

  const selectedElementData = canvasElements.find((el) => el.id === selectedElement)

  const toggleMode = useCallback(() => {
    setIsViewMode(!isViewMode)
    setSelectedChart(null)
    setSelectedElement(null)
  }, [isViewMode])

  const handleSave = useCallback((fileName?: string) => {
    try {
      const dashboardData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        activeTheme,
        canvasSettings,
        elements: canvasElements,
      }

      const dataStr = JSON.stringify(dashboardData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(dataBlob)
      
      // 使用用户提供的文件名，如果没有则使用默认文件名
      const defaultFileName = `dashboard-${new Date().toISOString().split("T")[0]}.json`
      const finalFileName = fileName ? `${fileName}.json` : defaultFileName
      link.download = finalFileName
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 清理URL对象
      URL.revokeObjectURL(link.href)

      console.log("[JF] Dashboard saved successfully:", finalFileName)
      return true
    } catch (error) {
      console.error("[JF] Error saving dashboard:", error)
      return false
    }
  }, [activeTheme, canvasSettings, canvasElements])

  const handleLoad = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const dashboardData = JSON.parse(content)

        if (dashboardData.elements && Array.isArray(dashboardData.elements)) {
          setCanvasElements(dashboardData.elements)
          if (dashboardData.activeTheme) {
            setActiveTheme(dashboardData.activeTheme)
          }
          if (dashboardData.canvasSettings) {
            setCanvasSettings(dashboardData.canvasSettings)
          }
          setSelectedElement(null)
          setSelectedChart(null)
          console.log("[JF] Dashboard loaded successfully:", dashboardData.elements.length, "elements")
        } else {
          console.error("[JF] Invalid dashboard file format")
          alert("无效的仪表板文件格式")
        }
      } catch (error) {
        console.error("[JF] Error loading dashboard:", error)
        alert("加载仪表板文件时出错")
      }
    }
    reader.readAsText(file)
  }, [])

  const handleClear = useCallback(() => {
    setCanvasElements([])
    setSelectedElement(null)
    setSelectedChart(null)
    console.log("[JF] Canvas cleared successfully")
  }, [])

  // 处理组件定位
  const handleElementFocus = useCallback((elementId: string) => {
    // 这里可以添加定位逻辑，比如滚动到组件位置或高亮显示
    console.log("[JF] Focusing on element:", elementId)
    // 可以在这里添加画布滚动或高亮逻辑
  }, [])

  // 处理组件删除
  const handleElementDelete = useCallback((elementId: string) => {
    setCanvasElements(prev => prev.filter(el => el.id !== elementId))
    if (selectedElement === elementId) {
      setSelectedElement(null)
    }
    console.log("[JF] Element deleted:", elementId)
  }, [selectedElement])

  // 处理组件复制
  const handleElementDuplicate = useCallback((elementId: string) => {
    const elementToDuplicate = canvasElements.find(el => el.id === elementId)
    if (elementToDuplicate) {
      const newElement = {
        ...elementToDuplicate,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
        title: elementToDuplicate.title ? `${elementToDuplicate.title} (副本)` : undefined
      }
      setCanvasElements(prev => [...prev, newElement])
      console.log("[JF] Element duplicated:", elementId)
    }
  }, [canvasElements])

  // 处理组件锁定/解锁
  const handleElementToggleLock = useCallback((elementId: string) => {
    setCanvasElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, positionLocked: !el.positionLocked }
        : el
    ))
    console.log("[JF] Element lock toggled:", elementId)
  }, [])

  // 处理组件重新排序（层级调整）
  const handleElementReorder = useCallback((elementId: string, newIndex: number) => {
    setCanvasElements(prev => {
      const elementIndex = prev.findIndex(el => el.id === elementId)
      if (elementIndex === -1 || elementIndex === newIndex) return prev
      
      const newElements = [...prev]
      const [movedElement] = newElements.splice(elementIndex, 1)
      newElements.splice(newIndex, 0, movedElement)
      
      // 更新zIndex以确保正确的显示层级
      return newElements.map((el, index) => ({
        ...el,
        zIndex: index + 1 // 确保zIndex从1开始递增
      }))
    })
    console.log("[JF] Element reordered:", elementId, "to index", newIndex)
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <CameraStateProvider>
          <div className="h-screen bg-background text-foreground flex flex-col">
        {/* Top Toolbar */}
        <DashboardToolbar
          activeTheme={activeTheme}
          onThemeChange={setActiveTheme}
          isViewMode={isViewMode}
          onModeToggle={toggleMode}
          onSave={handleSave}
          onLoad={handleLoad}
          onClear={handleClear}
          isDarkMode={isDarkMode}
          onDarkModeToggle={toggleDarkMode}
        />

        {/* Main Layout */}
        {isViewMode ? (
          <DashboardView 
            onEditMode={() => setIsViewMode(false)} 
            canvasElements={canvasElements}
            canvasSettings={canvasSettings}
          />
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Project Panel */}
            <ProjectPanel
              elements={canvasElements}
              selectedElement={selectedElement}
              onElementSelect={setSelectedElement}
              onElementFocus={handleElementFocus}
              onElementDelete={handleElementDelete}
              onElementDuplicate={handleElementDuplicate}
              onElementToggleLock={handleElementToggleLock}
              onElementReorder={handleElementReorder}
            />

            {/* Left Sidebar */}
            <DashboardSidebar onChartSelect={setSelectedChart} selectedChart={selectedChart} />

            {/* Main Canvas */}
            <div className="flex-1 flex">
              <DashboardCanvas
                elements={canvasElements}
                onElementsChange={handleElementsChange}
                selectedChart={selectedChart}
                selectedElement={selectedElement}
                onElementSelect={setSelectedElement}
                onElementUpdate={handleElementUpdate}
                onCanvasSettingsChange={handleCanvasSettingsChange}
                initialCanvasSettings={canvasSettings}
              />

              {/* Right Properties Panel */}
              <PropertiesPanel
                selectedElement={selectedElementData || null}
                activeTheme={activeTheme}
                onThemeChange={setActiveTheme}
                onElementUpdate={handleElementUpdate}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}
          </div>
        </CameraStateProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
