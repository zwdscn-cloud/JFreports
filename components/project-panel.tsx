"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Layers, 
  Search, 
  Eye, 
  Copy,
  Trash2,
  Lock,
  Unlock,
  BarChart3, 
  LineChart, 
  TrendingUp,
  Activity,
  Waves,
  Layers as NetworkIcon,
  GitBranch,
  Globe2,
  Thermometer,
  Gauge,
  Cloud,
  Type,
  Heading,
  ImageIcon,
  Video,
  Music,
  Box,
  Text,
  Grid,
  FileText
} from "lucide-react"

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

interface ProjectPanelProps {
  elements: CanvasElement[]
  selectedElement: string | null
  onElementSelect: (elementId: string) => void
  onElementFocus: (elementId: string) => void
  onElementDelete?: (elementId: string) => void
  onElementDuplicate?: (elementId: string) => void
  onElementToggleLock?: (elementId: string) => void
  onElementReorder?: (elementId: string, newIndex: number) => void
}

// 组件类型图标映射
const getComponentIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    bar: <BarChart3 className="w-4 h-4" />,
    line: <LineChart className="w-4 h-4" />,
    pie: <BarChart3 className="w-4 h-4" />,
    scatter: <BarChart3 className="w-4 h-4" />,
    funnel: <TrendingUp className="w-4 h-4" />,
    area: <Activity className="w-4 h-4" />,
    histogram: <BarChart3 className="w-4 h-4" />,
    waterfall: <Waves className="w-4 h-4" />,
    radar: <BarChart3 className="w-4 h-4" />,
    timeline: <TrendingUp className="w-4 h-4" />,
    network: <NetworkIcon className="w-4 h-4" />,
    tree: <GitBranch className="w-4 h-4" />,
    sankey: <NetworkIcon className="w-4 h-4" />,
    geomap: <Globe2 className="w-4 h-4" />,
    heatmap: <Thermometer className="w-4 h-4" />,
    gauge: <Gauge className="w-4 h-4" />,
    wordcloud: <Cloud className="w-4 h-4" />,
    text: <Type className="w-4 h-4" />,
    title: <Heading className="w-4 h-4" />,
    image: <ImageIcon className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    audio: <Music className="w-4 h-4" />,
    "3d-model": <Box className="w-4 h-4" />,
    table: <Grid className="w-4 h-4" />,
    infoTable: <FileText className="w-4 h-4" />,
  }
  return iconMap[type] || <Layers className="w-4 h-4" />
}

// 组件类型名称映射
const getComponentName = (type: string) => {
  const nameMap: Record<string, string> = {
    bar: "柱状图",
    line: "折线图",
    pie: "饼图",
    scatter: "散点图",
    funnel: "漏斗图",
    area: "面积图",
    histogram: "直方图",
    waterfall: "瀑布图",
    radar: "雷达图",
    timeline: "时序图",
    network: "关系图",
    tree: "树图",
    sankey: "桑基图",
    geomap: "地理地图",
    heatmap: "热力图",
    gauge: "仪表盘",
    wordcloud: "词云图",
    text: "文字组件",
    title: "标题组件",
    image: "图片组件",
    video: "视频组件",
    audio: "音频组件",
    "3d-model": "3D模型",
    table: "表格",
    infoTable: "信息表",
  }
  return nameMap[type] || type
}

export function ProjectPanel({
  elements,
  selectedElement,
  onElementSelect,
  onElementFocus,
  onElementDelete,
  onElementDuplicate,
  onElementToggleLock,
  onElementReorder
}: ProjectPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null)

  // 过滤元素
  const filteredElements = useMemo(() => {
    return elements.filter(element => {
      const searchLower = searchTerm.toLowerCase()
      const elementName = element.title || getComponentName(element.type)
      const elementType = getComponentName(element.type)
      
      return (
        elementName.toLowerCase().includes(searchLower) ||
        elementType.toLowerCase().includes(searchLower) ||
        element.type.toLowerCase().includes(searchLower)
      )
    })
  }, [elements, searchTerm])

  const handleElementClick = (elementId: string) => {
    onElementSelect(elementId)
  }

  const handleElementFocus = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    onElementFocus(elementId)
  }

  const handleElementDelete = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    if (onElementDelete) {
      onElementDelete(elementId)
    }
  }

  const handleElementDuplicate = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    if (onElementDuplicate) {
      onElementDuplicate(elementId)
    }
  }

  const handleElementToggleLock = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    if (onElementToggleLock) {
      onElementToggleLock(elementId)
    }
  }

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.setData("elementId", elementId)
    setDraggedElementId(elementId)
    e.dataTransfer.effectAllowed = "move"
  }

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedElementId(null)
    setDragOverElementId(null)
  }

  // 拖拽进入
  const handleDragEnter = (e: React.DragEvent, elementId: string) => {
    e.preventDefault()
    if (draggedElementId !== elementId) {
      setDragOverElementId(elementId)
    }
  }

  // 拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverElementId(null)
  }

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  // 放置
  const handleDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault()
    const draggedElementId = e.dataTransfer.getData("elementId")
    
    if (draggedElementId && draggedElementId !== targetElementId && onElementReorder) {
      // 找到目标元素的索引
      const targetIndex = filteredElements.findIndex(el => el.id === targetElementId)
      if (targetIndex !== -1) {
        onElementReorder(draggedElementId, targetIndex)
      }
    }
    
    setDraggedElementId(null)
    setDragOverElementId(null)
  }

  return (
    <Card className="w-40 h-full flex flex-col border-l rounded-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1 text-xs">
          <Layers className="w-3 h-3" />
          项目面板
          <Badge variant="secondary" className="ml-auto text-xs">
            {elements.length}
          </Badge>
        </CardTitle>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索组件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>


      </CardHeader>

      <Separator />

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {filteredElements.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {searchTerm ? "没有找到匹配的组件" : "画布上还没有组件"}
              </div>
            ) : (
              filteredElements.map((element) => {
                const isSelected = selectedElement === element.id
                const elementName = element.title || getComponentName(element.type)
                
                return (
                  <div
                    key={element.id}
                    className={`
                      group relative p-2 rounded-none border cursor-pointer transition-all
                      ${isSelected 
                        ? "bg-primary/10 border-primary/50" 
                        : "bg-card hover:bg-accent/50 border-border hover:border-primary/30"
                      }
                      ${draggedElementId === element.id ? "opacity-50" : ""}
                      ${dragOverElementId === element.id ? "bg-primary/20 border-primary ring-2 ring-primary/50" : ""}
                    `}
                    onClick={() => handleElementClick(element.id)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, element.id)}
                    onDragEnd={handleDragEnd}
                    onDragEnter={(e) => handleDragEnter(e, element.id)}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, element.id)}
                  >
                                         {/* 组件信息 */}
                     <div className="flex items-center gap-2">
                       <div className="flex-shrink-0">
                         {getComponentIcon(element.type)}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                         <div className="font-medium text-xs truncate">
                           {elementName}
                         </div>
                         <div className="text-xs text-muted-foreground truncate">
                           {getComponentName(element.type)}
                         </div>
                       </div>
                     </div>

                                         {/* 操作按钮 */}
                     <div className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                       {onElementToggleLock && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => handleElementToggleLock(e, element.id)}
                           className={`h-5 w-5 p-0 rounded-none ${element.positionLocked ? 'text-primary' : 'text-muted-foreground'}`}
                           title={element.positionLocked ? "解锁位置" : "锁定位置"}
                         >
                           {element.positionLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                         </Button>
                       )}
                       
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={(e) => handleElementFocus(e, element.id)}
                         className="h-5 w-5 p-0 rounded-none"
                         title="定位到组件"
                       >
                         <Eye className="w-3 h-3" />
                       </Button>
                       
                       {onElementDelete && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={(e) => handleElementDelete(e, element.id)}
                           className="h-5 w-5 p-0 text-destructive hover:text-destructive rounded-none"
                           title="删除组件"
                         >
                           <Trash2 className="w-3 h-3" />
                         </Button>
                       )}
                     </div>

                    {/* 选中指示器 */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
