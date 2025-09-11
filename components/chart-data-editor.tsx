"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NetworkEditor, type NetworkData } from "./chart-data-editors/network-editor"
import { TreeEditor, type TreeData } from "./chart-data-editors/tree-editor"
import { SankeyEditor, type SankeyData } from "./chart-data-editors/sankey-editor"
import { ThreeDModelEditor } from "./chart-data-editors"

export interface ChartDataItem {
  category?: string
  value?: number
  x?: number | string
  y?: number
  series?: string
}

export interface ChartData {
  items?: ChartDataItem[]
  network?: NetworkData
  tree?: TreeData
  sankey?: SankeyData
  threeDModel?: {
    modelUrl?: string;
    environmentPreset?: string;
    ambientIntensity?: number;
    ambientColor?: string;
    directionalIntensity?: number;
    directionalColor?: string;
  }
}

interface ChartDataEditorProps {
  chartType: string
  data: ChartDataItem[] | NetworkData | TreeData | any
  onChange: (data: ChartDataItem[] | NetworkData | TreeData | any) => void
}

export function ChartDataEditor({ chartType, data, onChange }: ChartDataEditorProps) {
  // 3D模型特殊处理
  if (chartType === "3d-model") {
    return (
      <ThreeDModelEditor 
        data={data} 
        onDataChange={onChange} 

      />
    )
  }

  // 关系图特殊处理
  if (chartType === "network") {
    const networkData = data as NetworkData
    return (
      <NetworkEditor 
        data={networkData} 
        onChange={onChange as (data: NetworkData) => void} 
      />
    )
  }

  // 树状图特殊处理
  if (chartType === "tree") {
    const treeData = data as TreeData
    return (
      <TreeEditor 
        data={treeData} 
        onChange={onChange as (data: TreeData) => void} 
      />
    )
  }

  // 桑基图特殊处理
  if (chartType === "sankey") {
    const sankeyData = data as SankeyData
    console.log("[ChartDataEditor] 桑基图数据:", sankeyData)
    return (
      <SankeyEditor 
        data={sankeyData} 
        onChange={onChange as (data: SankeyData) => void} 
      />
    )
  }

  const chartData = data as ChartDataItem[]
  
  const addNewItem = () => {
    const newData = [...chartData]
    switch (chartType) {
      case "bar":
      case "line":
        newData.push({ x: `类别${chartData.length + 1}`, y: 0 })
        break
      case "pie":
      case "funnel":
        newData.push({ category: `类别${chartData.length + 1}`, value: 0 })
        break
      case "scatter":
        newData.push({ x: 0, y: 0 })
        break

      default:
        newData.push({ category: `类别${chartData.length + 1}`, value: 0 })
    }
    onChange(newData)
  }

  const removeItem = (index: number) => {
    const newData = [...chartData]
    newData.splice(index, 1)
    onChange(newData)
  }

  const updateItem = (index: number, field: keyof ChartDataItem, value: string | number) => {
    const newData = [...chartData]
    if (field === "x" || field === "y" || field === "value") {
      newData[index] = {
        ...newData[index],
        [field]: isNaN(Number(value)) ? value : Number(value)
      }
    } else {
      newData[index] = {
        ...newData[index],
        [field]: value
      }
    }
    onChange(newData)
  }

  const renderFields = (item: ChartDataItem, index: number) => {
    switch (chartType) {
      case "bar":
      case "line":
        return (
          <>
            <div className="flex-1">
              <Label>X轴</Label>
              <Input
                value={item.x || ""}
                onChange={(e) => updateItem(index, "x", e.target.value)}
                placeholder="输入类别名称"
              />
            </div>
            <div className="flex-1">
              <Label>Y轴</Label>
              <Input
                type="number"
                value={item.y || 0}
                onChange={(e) => updateItem(index, "y", e.target.value)}
                placeholder="输入数值"
              />
            </div>
          </>
        )

      case "pie":
      case "funnel":
        return (
          <>
            <div className="flex-1">
              <Label>类别</Label>
              <Input
                value={item.category || ""}
                onChange={(e) => updateItem(index, "category", e.target.value)}
                placeholder="输入类别名称"
              />
            </div>
            <div className="flex-1">
              <Label>数值</Label>
              <Input
                type="number"
                value={item.value || 0}
                onChange={(e) => updateItem(index, "value", e.target.value)}
                placeholder="输入数值"
              />
            </div>
          </>
        )

      case "scatter":
        return (
          <>
            <div className="flex-1">
              <Label>X坐标</Label>
              <Input
                type="number"
                value={item.x || 0}
                onChange={(e) => updateItem(index, "x", e.target.value)}
                placeholder="输入X坐标"
              />
            </div>
            <div className="flex-1">
              <Label>Y坐标</Label>
              <Input
                type="number"
                value={item.y || 0}
                onChange={(e) => updateItem(index, "y", e.target.value)}
                placeholder="输入Y坐标"
              />
            </div>
          </>
        )



      default:
        return (
          <>
            <div className="flex-1">
              <Label>类别</Label>
              <Input
                value={item.category || ""}
                onChange={(e) => updateItem(index, "category", e.target.value)}
                placeholder="输入类别名称"
              />
            </div>
            <div className="flex-1">
              <Label>数值</Label>
              <Input
                type="number"
                value={item.value || 0}
                onChange={(e) => updateItem(index, "value", e.target.value)}
                placeholder="输入数值"
              />
            </div>
          </>
        )
    }
  }

  const getDataEditorTitle = () => {
    switch (chartType) {
      case "bar":
        return "柱状图数据"
      case "line":
        return "折线图数据"
      case "pie":
        return "饼图数据"
      case "funnel":
        return "漏斗图数据"
      case "scatter":
        return "散点图数据"
      case "network":
        return "关系图数据"

      default:
        return "图表数据"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{getDataEditorTitle()}</h3>
        <Button variant="outline" size="sm" onClick={addNewItem}>
          <Plus className="h-4 w-4 mr-1" />
          添加数据
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex gap-2 items-start bg-muted/50 p-3 rounded-lg">
              {renderFields(item, index)}
              <Button
                variant="ghost"
                size="icon"
                className="mt-8"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
