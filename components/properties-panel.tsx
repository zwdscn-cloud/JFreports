"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { PropertyTable } from "@/components/property-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { SimpleDataEditor } from "@/components/simple-data-editor"
import { ThreeDModelEditor } from "@/components/chart-data-editors"
import { dataManager } from "@/lib/data-manager"

import { CompactColorSelector } from "@/components/chart-color-selector"
import { ColorPicker } from "@/components/ui/color-picker"
import { NumberInput } from "@/components/ui/number-input"
import { Database, X, Settings, Palette, BarChart, Text, Grid, Move, Sun, Moon, ChevronDown, ChevronRight, AlignLeft } from "lucide-react"

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
  fontSize?: number
  fontWeight?: string
  textColor?: string
  backgroundColor?: string
  textAlign?: string
  headingLevel?: string
  level?: number
  data?: any[] | { nodes: any[], links: any[] }
  tableData?: {
    headers: string[]
    rows: string[][]
  }
  infoTableData?: {
    id: string
    title: string
    content: string
  }[]
  imageUrl?: string
  videoUrl?: string
  audioUrl?: string
  alt?: string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  transparent?: boolean
  autoScroll?: boolean
  showBorder?: boolean
  headerBackgroundColor?: string
  rowBackgroundColor?: string
  // 图表字体设置
  chartFontSize?: number
  chartTextColor?: string
  axisFontSize?: number
  axisTextColor?: string
  legendFontSize?: number
  legendTextColor?: string
  titleFontSize?: number
  titleTextColor?: string
  tooltipFontSize?: number
  tooltipTextColor?: string
}

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null
  activeTheme: string
  onThemeChange: (theme: string) => void
  onElementUpdate?: (elementId: string, updates: Partial<CanvasElement>) => void
  isDarkMode?: boolean
}

export function PropertiesPanel({
  selectedElement,
  activeTheme,
  onThemeChange,
  onElementUpdate,
  isDarkMode = false,
}: PropertiesPanelProps) {
  const [panelWidth, setPanelWidth] = useState(320)
  const [localElement, setLocalElement] = useState<CanvasElement | null>(selectedElement)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    position: false,
    color: false,
    style: false,
    appearance: false,
    font: false
  })

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const CollapsibleSection = ({ 
    sectionKey, 
    title, 
    icon: Icon, 
    children,
    className = ""
  }: { 
    sectionKey: string
    title: string
    icon: any
    children: React.ReactNode
    className?: string
  }) => {
    const isCollapsed = collapsedSections[sectionKey]
    
    return (
      <div className={`space-y-4 pt-4 border-t border-border ${className}`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center gap-2 mb-3 w-full text-left hover:bg-accent/50 rounded-md p-2 transition-all duration-200 hover:shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <Icon className="w-4 h-4" />
          <h4 className="text-xs font-semibold">{title}</h4>
        </button>
        
        {!isCollapsed && (
          <div className="space-y-4">
            {children}
          </div>
        )}
      </div>
    )
  }

  const getPropertyConfigs = useMemo(() => {
    if (!localElement) return []

    const baseProperties = [
      {
        key: 'opacity',
        label: '透明度',
        type: 'slider' as const,
        min: 0,
        max: 100,
        step: 1,
        unit: '%'
      },
      {
        key: 'width',
        label: '宽度',
        type: 'number' as const,
        step: 1,
        unit: 'px'
      },
      {
        key: 'height',
        label: '高度',
        type: 'number' as const,
        step: 1,
        unit: 'px'
      },
      {
        key: 'x',
        label: 'X坐标',
        type: 'number' as const,
        step: 1,
        unit: 'px'
      },
      {
        key: 'y',
        label: 'Y坐标',
        type: 'number' as const,
        step: 1,
        unit: 'px'
      }
    ]

    const textProperties = [
      {
        key: 'content',
        label: '内容',
        type: 'text' as const
      },
      {
        key: 'fontSize',
        label: '字体大小',
        type: 'number' as const,
        step: 1,
        unit: 'px'
      },
      {
        key: 'fontWeight',
        label: '字体粗细',
        type: 'select' as const,
        options: [
          { label: '正常', value: 'normal' },
          { label: '粗体', value: 'bold' },
          { label: '细体', value: 'lighter' }
        ]
      },
      {
        key: 'textAlign',
        label: '对齐方式',
        type: 'select' as const,
        options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' }
        ]
      },
      {
        key: 'textColor',
        label: '文字颜色',
        type: 'color' as const
      },
      {
        key: 'backgroundColor',
        label: '背景颜色',
        type: 'color' as const
      }
    ]

    const chartProperties = [
      {
        key: 'title',
        label: '图表标题',
        type: 'text' as const
      },
      {
        key: 'showLegend',
        label: '显示图例',
        type: 'switch' as const
      },
      {
        key: 'showGrid',
        label: '显示网格',
        type: 'switch' as const
      },
      {
        key: 'showTooltip',
        label: '显示提示',
        type: 'switch' as const
      },
      {
        key: 'animation',
        label: '启用动画',
        type: 'switch' as const
      }
    ]

    const mediaProperties = [
      {
        key: 'autoplay',
        label: '自动播放',
        type: 'switch' as const
      },
      {
        key: 'controls',
        label: '显示控制栏',
        type: 'switch' as const
      },
      {
        key: 'muted',
        label: '静音播放',
        type: 'switch' as const
      }
    ]

    // 根据组件类型返回不同的属性配置
    switch (localElement.type) {
      case 'text':
      case 'title':
        return [...textProperties, ...baseProperties]
      case 'image':
        return [
          { key: 'imageUrl', label: '图片地址', type: 'text' as const },
          { key: 'alt', label: '替代文本', type: 'text' as const },
          ...baseProperties
        ]
      case 'video':
        return [
          { key: 'videoUrl', label: '视频地址', type: 'text' as const },
          ...mediaProperties,
          ...baseProperties
        ]
      case 'audio':
        return [
          { key: 'audioUrl', label: '音频地址', type: 'text' as const },
          ...mediaProperties,
          ...baseProperties
        ]
      default:
        return [...chartProperties, ...baseProperties]
    }
  }, [localElement?.type])

  // 防抖计时器引用
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 同步selectedElement的变化
  useEffect(() => {
    if (selectedElement) {
      setLocalElement(selectedElement)
    }
  }, [selectedElement?.id]) // 只依赖ID，避免属性变化触发循环

  // 防抖处理函数
  const handlePropertyChange = useCallback((property: string, value: any) => {
    if (!localElement || !onElementUpdate) {
      return
    }

    // 立即更新本地状态（确保UI响应）
    const updates = { [property]: value }
    setLocalElement(prev => prev ? { ...prev, ...updates } : null)

    // 清除之前的防抖计时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // 设置新的防抖计时器
    debounceTimeoutRef.current = setTimeout(() => {
      onElementUpdate(localElement.id, updates)
    }, 300) // 300ms防抖延迟
  }, [localElement, onElementUpdate])

  // 专门用于Input组件的防抖处理函数
  const handleInputChange = useCallback((property: string, value: any) => {
    if (!localElement || !onElementUpdate) {
      return
    }

    // 立即更新本地状态（确保UI响应）
    const updates = { [property]: value }
    setLocalElement(prev => prev ? { ...prev, ...updates } : null)

    // 清除之前的防抖计时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // 设置新的防抖计时器
    debounceTimeoutRef.current = setTimeout(() => {
      onElementUpdate(localElement.id, updates)
    }, 500) // 500ms防抖延迟，给用户更多输入时间
  }, [localElement, onElementUpdate])

  // 专门用于NumberInput组件的防抖处理函数
  const handleNumberInputChange = useCallback((property: string, value: any) => {
    if (!localElement || !onElementUpdate) {
      return
    }

    // 立即更新本地状态（确保UI响应）
    const updates = { [property]: value }
    setLocalElement(prev => prev ? { ...prev, ...updates } : null)

    // 清除之前的防抖计时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // 设置新的防抖计时器
    debounceTimeoutRef.current = setTimeout(() => {
      onElementUpdate(localElement.id, updates)
    }, 300) // 300ms防抖延迟，比Input组件短一些
  }, [localElement, onElementUpdate])

  // 组件卸载时清理计时器
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])



  const getChartTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bar: "柱状图",
      line: "折线图",
              pie: "饼图",
        funnel: "漏斗图",


      scatter: "散点图",
      area: "面积图",
      timeline: "时序图",
      network: "关系图",
      tree: "树图",
      text: "文本组件",
      title: "标题组件",
      table: "表格组件",
      image: "图片组件",
      video: "视频组件",
      audio: "音频组件",
    }
    return labels[type] || "组件"
  }

  return (
    <div className="bg-card border-l-2 border-primary/20 flex flex-col shadow-lg" style={{ width: panelWidth }}>
      {/* Panel Header */}
      <div className="h-12 border-b-2 border-primary/20 flex items-center justify-between px-4 bg-primary/5">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-xs">属性面板</h3>
          {selectedElement && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {getChartTypeLabel(selectedElement.type)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            
          </Button>
          <Button variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Panel Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {selectedElement ? (
            <Tabs defaultValue="style" className="w-full">
              <TabsList className="grid w-full grid-cols-3 shadow-md">
                <TabsTrigger value="style" className="text-xs">
                  <Palette className="w-3 h-3 mr-1" />
                  样式
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  {selectedElement.type === "text" ||
                  selectedElement.type === "title" ||
                  selectedElement.type === "table" ||
                  selectedElement.type === "image" ||
                  selectedElement.type === "video" ||
                  selectedElement.type === "audio"
                    ? "内容"
                    : "数据"}
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  设置
                </TabsTrigger>
              </TabsList>

              <TabsContent value="style" className="space-y-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="transparent" className="text-xs font-medium">透明背景</Label>
                  <Switch 
                    id="transparent" 
                    checked={localElement?.transparent || false}
                    onCheckedChange={(checked) => handlePropertyChange("transparent", checked)}
                  />
                </div>

                {/* 图表字体设置 - 移到最上面 */}
                {!["text", "title", "image", "video", "audio"].includes(selectedElement.type) && (
                  <CollapsibleSection sectionKey="font" title="字体设置" icon={AlignLeft} className="border-2 border-primary/20 bg-primary/5 rounded-lg p-2">
                    {/* 标题字体设置 */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-medium text-muted-foreground">标题字体</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="title-font-size" className="text-xs">字体大小</Label>
                          <NumberInput
                            id="title-font-size"
                            value={localElement?.titleFontSize || 16}
                            onChange={(value) => handleNumberInputChange("titleFontSize", value)}
                            className="mt-1"
                          />
                        </div>
                        <ColorPicker
                          id="title-text-color"
                          label="字体颜色"
                          value={localElement?.titleTextColor || "#333333"}
                          onChange={(color) => handlePropertyChange("titleTextColor", color)}
                        />
                      </div>
                    </div>

                    {/* 坐标轴字体设置 */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-medium text-muted-foreground">坐标轴字体</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="axis-font-size" className="text-xs">字体大小</Label>
                          <NumberInput
                            id="axis-font-size"
                            value={localElement?.axisFontSize || 12}
                            onChange={(value) => handleNumberInputChange("axisFontSize", value)}
                            className="mt-1"
                            min={8}
                            max={24}
                          />
                        </div>
                        <ColorPicker
                          id="axis-text-color"
                          label="字体颜色"
                          value={localElement?.axisTextColor || "#333333"}
                          onChange={(color) => handlePropertyChange("axisTextColor", color)}
                        />
                      </div>
                    </div>

                    {/* 图例字体设置 */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-medium text-muted-foreground">图例字体</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="legend-font-size" className="text-xs">字体大小</Label>
                          <NumberInput
                            id="legend-font-size"
                            value={localElement?.legendFontSize || 12}
                            onChange={(value) => handleNumberInputChange("legendFontSize", value)}
                            className="mt-1"
                            min={8}
                            max={24}
                          />
                        </div>
                        <ColorPicker
                          id="legend-text-color"
                          label="字体颜色"
                          value={localElement?.legendTextColor || "#333333"}
                          onChange={(color) => handlePropertyChange("legendTextColor", color)}
                        />
                      </div>
                    </div>

                    {/* 提示框字体设置 */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-medium text-muted-foreground">提示框字体</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="tooltip-font-size" className="text-xs">字体大小</Label>
                          <NumberInput
                            id="tooltip-font-size"
                            value={localElement?.tooltipFontSize || 12}
                            onChange={(value) => handleNumberInputChange("tooltipFontSize", value)}
                            className="mt-1"
                            min={8}
                            max={24}
                          />
                        </div>
                        <ColorPicker
                          id="tooltip-text-color"
                          label="字体颜色"
                          value={localElement?.tooltipTextColor || "#333333"}
                          onChange={(color) => handlePropertyChange("tooltipTextColor", color)}
                        />
                      </div>
                    </div>

                    {/* 全局字体设置 */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-medium text-muted-foreground">全局字体</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="chart-font-size" className="text-xs">字体大小</Label>
                          <NumberInput
                            id="chart-font-size"
                            value={localElement?.chartFontSize || 12}
                            onChange={(value) => handleNumberInputChange("chartFontSize", value)}
                            className="mt-1"
                            min={8}
                            max={24}
                          />
                        </div>
                        <ColorPicker
                          id="chart-text-color"
                          label="字体颜色"
                          value={localElement?.chartTextColor || "#333333"}
                          onChange={(color) => handlePropertyChange("chartTextColor", color)}
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* Property Table */}
                <CollapsibleSection sectionKey="appearance" title="外观设置" icon={Text}>
                  <PropertyTable
                    properties={getPropertyConfigs}
                    values={localElement || {}}
                    onChange={handlePropertyChange}
                  />

                                        {["text", "title", "image", "video", "audio"].includes(selectedElement.type) && (
                    <>
                      <ColorPicker
                        id="text-color"
                        label="文字颜色"
                        value={localElement?.textColor || "#000000"}
                        onChange={(color) => {
                          console.log("[JF] Text color input changed:", color)
                          handlePropertyChange("textColor", color)
                        }}
                      />

                      <ColorPicker
                        id="bg-color"
                        label="背景颜色"
                        value={localElement?.backgroundColor || "#ffffff"}
                        onChange={(color) => {
                          console.log("[JF] Background color input changed:", color)
                          handlePropertyChange("backgroundColor", color)
                        }}
                      />

                      {selectedElement.type === "title" && (
                        <div>
                                                      <Label htmlFor="heading-level" className="text-xs">标题级别</Label>
                          <Select
                            value={String(localElement?.level || 1)}
                            onValueChange={(value) => {
                              console.log("[JF] Heading level changed:", value)
                              handlePropertyChange("level", Number.parseInt(value))
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="选择标题级别" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">H1 - 最大标题</SelectItem>
                              <SelectItem value="2">H2 - 二级标题</SelectItem>
                              <SelectItem value="3">H3 - 三级标题</SelectItem>
                              <SelectItem value="4">H4 - 四级标题</SelectItem>
                              <SelectItem value="5">H5 - 五级标题</SelectItem>
                              <SelectItem value="6">H6 - 六级标题</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {(selectedElement.type === "text" || selectedElement.type === "title") && (
                        <>
                          <div>
                            <Label htmlFor="font-size" className="text-xs">字体大小</Label>
                            <NumberInput
                              id="font-size"
                              value={localElement?.fontSize || 16}
                              onChange={(value) => {
                                console.log("[JF] Font size changed:", value)
                                handleNumberInputChange("fontSize", value)
                              }}
                              className="mt-1"
                              min={8}
                              max={72}
                            />
                          </div>

                          <div>
                            <Label htmlFor="font-weight" className="text-xs">字体粗细</Label>
                            <Select
                              value={localElement?.fontWeight || "normal"}
                              onValueChange={(value) => {
                                console.log("[JF] Font weight changed:", value)
                                handlePropertyChange("fontWeight", value)
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="选择字体粗细" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">正常</SelectItem>
                                <SelectItem value="bold">粗体</SelectItem>
                                <SelectItem value="lighter">细体</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="text-align" className="text-xs">文字对齐</Label>
                            <Select
                              value={localElement?.textAlign || "left"}
                              onValueChange={(value) => {
                                console.log("[JF] Text align changed:", value)
                                handlePropertyChange("textAlign", value)
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="选择对齐方式" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">左对齐</SelectItem>
                                <SelectItem value="center">居中</SelectItem>
                                <SelectItem value="right">右对齐</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {selectedElement.type === "image" && (
                        <div>
                          <Label htmlFor="image-alt" className="text-xs">替代文本</Label>
                          <Input
                            id="image-alt"
                            placeholder="输入图片描述..."
                            value={localElement?.alt || ""}
                            onChange={(e) => {
                              console.log("[JF] Image alt changed:", e.target.value)
                              handleInputChange("alt", e.target.value)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleInputChange("alt", e.currentTarget.value)
                              }
                            }}
                            className="mt-1"
                          />
                        </div>
                      )}

                      {selectedElement.type === "video" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="video-autoplay" className="text-xs">
                              自动播放
                            </Label>
                            <Switch
                              id="video-autoplay"
                              checked={localElement?.autoplay || false}
                              onCheckedChange={(checked) => handlePropertyChange("autoplay", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="video-controls" className="text-xs">
                              显示控制栏
                            </Label>
                            <Switch
                              id="video-controls"
                              checked={localElement?.controls !== false}
                              onCheckedChange={(checked) => handlePropertyChange("controls", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="video-muted" className="text-xs">
                              静音播放
                            </Label>
                            <Switch
                              id="video-muted"
                              checked={localElement?.muted || false}
                              onCheckedChange={(checked) => handlePropertyChange("muted", checked)}
                            />
                          </div>
                        </div>
                      )}

                      {selectedElement.type === "audio" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="audio-autoplay" className="text-xs">
                              自动播放
                            </Label>
                            <Switch
                              id="audio-autoplay"
                              checked={localElement?.autoplay || false}
                              onCheckedChange={(checked) => handlePropertyChange("autoplay", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="audio-controls" className="text-xs">
                              显示控制栏
                            </Label>
                            <Switch
                              id="audio-controls"
                              checked={localElement?.controls !== false}
                              onCheckedChange={(checked) => handlePropertyChange("controls", checked)}
                            />
                          </div>
                        </div>
                      )}

                      {/* 信息表样式设置 */}
                      {selectedElement.type === "info-table" && (
                        <CollapsibleSection sectionKey="info-table-style" title="信息表样式" icon={Grid} className="border-2 border-blue-200 bg-blue-50/50 rounded-lg p-2">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="info-table-font-size" className="text-xs">字体大小</Label>
                              <NumberInput
                                id="info-table-font-size"
                                value={localElement?.fontSize || 12}
                                onChange={(value) => {
                                  console.log("[JF] Info table font size changed:", value)
                                  handleNumberInputChange("fontSize", value)
                                }}
                                className="mt-1"
                                min={8}
                                max={24}
                              />
                            </div>

                            <ColorPicker
                              id="info-table-text-color"
                              label="字体颜色"
                              value={localElement?.textColor || "#000000"}
                              onChange={(color) => {
                                console.log("[JF] Info table text color changed:", color)
                                handlePropertyChange("textColor", color)
                              }}
                            />

                            <ColorPicker
                              id="info-table-bg-color"
                              label="整体背景色"
                              value={localElement?.backgroundColor || "#ffffff"}
                              onChange={(color) => {
                                console.log("[JF] Info table background color changed:", color)
                                handlePropertyChange("backgroundColor", color)
                              }}
                            />

                            <ColorPicker
                              id="info-table-header-bg-color"
                              label="表头背景色"
                              value={localElement?.headerBackgroundColor || "#f3f4f6"}
                              onChange={(color) => {
                                console.log("[JF] Info table header background color changed:", color)
                                handlePropertyChange("headerBackgroundColor", color)
                              }}
                            />

                            <ColorPicker
                              id="info-table-row-bg-color"
                              label="行背景色"
                              value={localElement?.rowBackgroundColor || "#ffffff"}
                              onChange={(color) => {
                                console.log("[JF] Info table row background color changed:", color)
                                handlePropertyChange("rowBackgroundColor", color)
                              }}
                            />

                            <div className="flex items-center justify-between">
                              <Label htmlFor="show-border" className="text-xs">显示边框</Label>
                              <Switch
                                id="show-border"
                                checked={localElement?.showBorder !== false}
                                onCheckedChange={(checked) => {
                                  console.log("[JF] Show border changed:", checked)
                                  handlePropertyChange("showBorder", checked)
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="auto-scroll" className="text-xs">自动滚动</Label>
                              <Switch
                                id="auto-scroll"
                                checked={localElement?.autoScroll || false}
                                onCheckedChange={(checked) => {
                                  console.log("[JF] Auto scroll changed:", checked)
                                  handlePropertyChange("autoScroll", checked)
                                }}
                              />
                            </div>


                          </div>
                        </CollapsibleSection>
                      )}
                    </>
                  )}

                  {!["text", "title", "image", "video", "audio", "3d"].includes(selectedElement.type) && (
                    <div>
                      <Label htmlFor="chart-title" className="text-xs">图表标题</Label>
                      <Input
                        id="chart-title"
                        placeholder="输入图表标题"
                        className="mt-1"
                        value={localElement?.title || ""}
                        onChange={(e) => {
                          console.log("[JF] Chart title changed:", e.target.value)
                          handleInputChange("title", e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleInputChange("title", e.currentTarget.value)
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* 透明度设置 */}
                  <div>
                                            <Label className="text-xs">透明度 ({Math.round(localElement?.opacity || 100)}%)</Label>
                    <Slider
                      value={[localElement?.opacity || 100]}
                      max={100}
                      step={1}
                      className="mt-2"
                      onValueChange={(value) => handlePropertyChange("opacity", value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* 图表配色选择 */}
                {!["text", "title", "image", "video", "audio", "3d"].includes(selectedElement.type) && (
                  <CollapsibleSection sectionKey="color" title="图表配色" icon={Palette} className="border-2 border-blue-200 bg-blue-50/50 rounded-lg p-2">
                    <CompactColorSelector
                      activeTheme={localElement?.themeId || activeTheme}
                      onThemeChange={(themeId) => {
                        console.log("[JF] Chart theme changed:", themeId)
                        handlePropertyChange("themeId", themeId)
                      }}
                    />
                  </CollapsibleSection>
                )}

                {/* 图表样式设置 */}
                {!["text", "title", "image", "video", "audio", "3d"].includes(selectedElement.type) && (
                  <CollapsibleSection sectionKey="style" title="图表样式" icon={BarChart}>
                    {(selectedElement.type === "bar" || selectedElement.type === "line") && (
                      <div>
                        <Label htmlFor="chart-style" className="text-xs">图表风格</Label>
                        <Select defaultValue="default">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="选择风格" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">默认</SelectItem>
                            <SelectItem value="rounded">圆角</SelectItem>
                            <SelectItem value="gradient">渐变</SelectItem>
                            <SelectItem value="shadow">阴影</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedElement.type === "pie" && (
                      <div>
                        <Label htmlFor="pie-style" className="text-xs">饼图类型</Label>
                        <Select defaultValue="donut">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pie">饼图</SelectItem>
                            <SelectItem value="donut">环形图</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CollapsibleSection>
                )}

                {/* Position & Size - 移到最下面 */}
                <CollapsibleSection sectionKey="position" title="位置与尺寸" icon={Move} className="border-2 border-green-200 bg-green-50/50 rounded-lg p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                                              <Label htmlFor="width" className="text-xs">宽度</Label>
                      <NumberInput
                        id="width"
                        value={localElement?.width || 400}
                        onChange={(value) => handleNumberInputChange("width", value)}
                        className="mt-1"
                        min={50}
                        max={20000}
                      />
                    </div>
                    <div>
                                              <Label htmlFor="height" className="text-xs">高度</Label>
                      <NumberInput
                        id="height"
                        value={localElement?.height || 300}
                        onChange={(value) => handleNumberInputChange("height", value)}
                        className="mt-1"
                        min={50}
                        max={20000}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                                              <Label htmlFor="x-pos" className="text-xs">X坐标</Label>
                      <NumberInput
                        id="x-pos"
                        value={localElement?.x || 0}
                        onChange={(value) => handleNumberInputChange("x", value)}
                        className="mt-1"
                        min={0}
                        max={20000}
                      />
                    </div>
                    <div>
                                              <Label htmlFor="y-pos" className="text-xs">Y坐标</Label>
                      <NumberInput
                        id="y-pos"
                        value={localElement?.y || 0}
                        onChange={(value) => handleNumberInputChange("y", value)}
                        className="mt-1"
                        min={0}
                        max={20000}
                      />
                    </div>
                  </div>
                </CollapsibleSection>
              </TabsContent>

              <TabsContent value="data" className="space-y-4 mt-4">
                {selectedElement.type === "title" && (
                  <div>
                    <Label htmlFor="title-content" className="text-xs">标题内容</Label>
                    <Input
                      id="title-content"
                      placeholder="输入标题内容..."
                      value={localElement?.content || ""}
                      onChange={(e) => {
                        console.log("[JF] Title content changed:", e.target.value)
                        handleInputChange("content", e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleInputChange("content", e.currentTarget.value)
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                )}

                {selectedElement.type === "text" && (
                  <div>
                    <Label htmlFor="text-content" className="text-xs">文本内容</Label>
                    <Textarea
                      id="text-content"
                      placeholder="输入文本内容..."
                      value={localElement?.content || ""}
                      onChange={(e) => {
                        console.log("[JF] Text content changed:", e.target.value)
                        handlePropertyChange("content", e.target.value)
                      }}
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                )}

                {selectedElement.type === "table" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs">表格内容</Label>
                      <p className="text-xs text-muted-foreground mb-2">在表格组件中直接编辑内容，或在此处添加行列</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const currentData = localElement?.tableData || { headers: ["列1", "列2"], rows: [["", ""]] }
                            const newData = {
                              ...currentData,
                              rows: [...currentData.rows, new Array(currentData.headers.length).fill("")],
                            }
                            console.log("[JF] Adding table row:", newData)
                            handlePropertyChange("tableData", newData)
                          }}
                        >
                          添加行
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const currentData = localElement?.tableData || { headers: ["列1", "列2"], rows: [["", ""]] }
                            const newData = {
                              headers: [...currentData.headers, `列${currentData.headers.length + 1}`],
                              rows: currentData.rows.map((row) => [...row, ""]),
                            }
                            console.log("[JF] Adding table column:", newData)
                            handlePropertyChange("tableData", newData)
                          }}
                        >
                          添加列
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedElement.type === "image" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image-url" className="text-xs">图片URL</Label>
                      <Input
                        id="image-url"
                        placeholder="输入图片URL地址..."
                        value={localElement?.imageUrl || ""}
                        onChange={(e) => {
                          console.log("[JF] Image URL changed:", e.target.value)
                          handleInputChange("imageUrl", e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleInputChange("imageUrl", e.currentTarget.value)
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                                                <Label htmlFor="image-alt" className="text-xs">替代文本</Label>
                      <Input
                        id="image-alt"
                        placeholder="输入图片描述..."
                        value={localElement?.alt || ""}
                        onChange={(e) => {
                          console.log("[JF] Image alt changed:", e.target.value)
                          handleInputChange("alt", e.target.value)
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {selectedElement.type === "video" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="video-url" className="text-xs">视频URL</Label>
                      <Input
                        id="video-url"
                        placeholder="输入视频URL地址..."
                        value={localElement?.videoUrl || ""}
                        onChange={(e) => {
                          console.log("[JF] Video URL changed:", e.target.value)
                          handleInputChange("videoUrl", e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleInputChange("videoUrl", e.currentTarget.value)
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="video-autoplay" className="text-xs">
                          自动播放
                        </Label>
                        <Switch
                          id="video-autoplay"
                          checked={localElement?.autoplay || false}
                          onCheckedChange={(checked) => handlePropertyChange("autoplay", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="video-controls" className="text-xs">
                          显示控制栏
                        </Label>
                        <Switch
                          id="video-controls"
                          checked={localElement?.controls !== false}
                          onCheckedChange={(checked) => handlePropertyChange("controls", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="video-muted" className="text-xs">
                          静音播放
                        </Label>
                        <Switch
                          id="video-muted"
                          checked={localElement?.muted || false}
                          onCheckedChange={(checked) => handlePropertyChange("muted", checked)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedElement.type === "audio" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="audio-url" className="text-xs">音频URL</Label>
                      <Input
                        id="audio-url"
                        placeholder="输入音频URL地址..."
                        value={localElement?.audioUrl || ""}
                        onChange={(e) => {
                          console.log("[JF] Audio URL changed:", e.target.value)
                          handleInputChange("audioUrl", e.target.value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleInputChange("audioUrl", e.currentTarget.value)
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="audio-autoplay" className="text-xs">
                          自动播放
                        </Label>
                        <Switch
                          id="audio-autoplay"
                          checked={localElement?.autoplay || false}
                          onCheckedChange={(checked) => handlePropertyChange("autoplay", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="audio-controls" className="text-xs">
                          显示控制栏
                        </Label>
                        <Switch
                          id="audio-controls"
                          checked={localElement?.controls !== false}
                          onCheckedChange={(checked) => handlePropertyChange("controls", checked)}
                        />
                      </div>
                    </div>
                  </div>
                )}





                {selectedElement.type === "3d-model" && (
                  <div className="max-h-[calc(100vh-200px)] overflow-auto">
                    <ThreeDModelEditor
                      data={selectedElement.data as any || {}}
                      onDataChange={(data) => {
                        console.log("3D Model data updated:", data)
                        // 立即更新本地状态
                        if (localElement) {
                          setLocalElement({ ...localElement, data })
                        }
                        // 更新数据管理器
                        dataManager.bindChartToData(selectedElement.id, data)
                        // 通知父组件更新
                        if (onElementUpdate && selectedElement) {
                          onElementUpdate(selectedElement.id, { data })
                        }
                      }}

                    />
                  </div>
                )}

                {!["text", "title", "image", "video", "audio", "info-table", "3d-model"].includes(selectedElement.type) && (
                  <div className="max-h-[calc(100vh-200px)] overflow-auto">
                    <SimpleDataEditor
                      data={selectedElement.data || []}
                      onChange={(data) => {
                        console.log("Data binding updated:", data)
                        // 立即更新本地状态
                        if (localElement) {
                          setLocalElement({ ...localElement, data })
                        }
                        // 更新数据管理器
                        dataManager.bindChartToData(selectedElement.id, data)
                        // 通知父组件更新
                        if (onElementUpdate && selectedElement) {
                          onElementUpdate(selectedElement.id, { data })
                        }
                      }}
                      chartType={selectedElement.type}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}


              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4" />
                    <h4 className="text-xs font-medium">显示设置</h4>
                  </div>

                  <div className="space-y-4">
                    {!["text", "title", "image", "video", "audio", "3d"].includes(selectedElement.type) && (
                      <>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-legend" className="text-xs">
                            显示图例
                          </Label>
                          <Switch
                            id="show-legend"
                            checked={localElement?.showLegend !== false}
                            onCheckedChange={(checked) => handlePropertyChange("showLegend", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-grid" className="text-xs">
                            显示网格
                          </Label>
                          <Switch
                            id="show-grid"
                            checked={localElement?.showGrid !== false}
                            onCheckedChange={(checked) => handlePropertyChange("showGrid", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="animation" className="text-xs">
                            启用动画
                          </Label>
                          <Switch
                            id="animation"
                            checked={localElement?.animation !== false}
                            onCheckedChange={(checked) => handlePropertyChange("animation", checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-tooltip" className="text-xs">
                            显示提示框
                          </Label>
                          <Switch
                            id="show-tooltip"
                            checked={localElement?.showTooltip !== false}
                            onCheckedChange={(checked) => handlePropertyChange("showTooltip", checked)}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="responsive" className="text-xs">
                        响应式布局
                      </Label>
                      <Switch id="responsive" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="transparent" className="text-xs">
                        背景透明模式
                      </Label>
                      <Switch 
                        id="transparent" 
                        checked={localElement?.transparent || false}
                        onCheckedChange={(checked) => handlePropertyChange("transparent", checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                {!["text", "title", "image", "video", "audio"].includes(selectedElement.type) && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Grid className="w-4 h-4" />
                      <h4 className="text-xs font-medium">高级设置</h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="animation-duration" className="text-xs">动画时长 (ms)</Label>
                        <Input id="animation-duration" type="number" defaultValue="1000" className="mt-1" />
                      </div>

                      <div>
                        <Label htmlFor="border-radius" className="text-xs">圆角半径 (px)</Label>
                        <Input id="border-radius" type="number" defaultValue="4" className="mt-1" />
                      </div>

                      <div>
                        <Label htmlFor="shadow" className="text-xs">阴影强度</Label>
                        <Slider defaultValue={[20]} max={100} step={1} className="mt-2" />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            /* No Selection State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">未选择组件</p>
              <p className="text-xs text-muted-foreground">点击画布中的组件来编辑属性</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
