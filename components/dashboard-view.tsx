"use client"

import { ChartElement } from "@/components/chart-element"

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

interface DashboardViewProps {
  onEditMode: () => void
  canvasElements: CanvasElement[]
  canvasSettings?: {
    width: number
    height: number
    backgroundColor: string
  }
}

export function DashboardView({ onEditMode, canvasElements, canvasSettings }: DashboardViewProps) {
  return (
    <div className="h-full bg-background overflow-hidden">
      {canvasElements.length > 0 ? (
        <div className="w-full h-full bg-background relative">
          <div 
            className="relative w-full h-full overflow-auto"
            style={{
              minHeight: canvasSettings?.height || 2000,
              minWidth: canvasSettings?.width || 2000,
              backgroundColor: canvasSettings?.backgroundColor || "#ffffff"
            }}
          >
            {canvasElements.map((element) => (
              <ChartElement
                key={element.id}
                element={element}
                isSelected={false}
                isMultiSelected={false}
                onSelect={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
                onCopy={() => {}}
                onElementReorder={() => {}}
                canvasElements={canvasElements}
                isViewMode={true}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">暂无图表</h3>
            <p className="text-muted-foreground">请先在编辑模式下创建图表</p>
          </div>
        </div>
      )}
    </div>
  )
}
